const response = require("../utils/responseHandller");
const { uploadfiletocloudinary } = require("../config/imageCloud");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

exports.sendMessage = async (req, res, next) => {
  try {
    const { senderID, receiverID, content, messageStatus } = req.body;
    const file = req.file;

    

    const participants = [senderID, receiverID].sort();

    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants,
      });
      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;
 

    if (file) {
      const uploadfile = await uploadfiletocloudinary(file);
      if (!uploadfile?.secure_url) {
        return res.status(400).json({ message: "file upload failed" });
      }
      imageOrVideoUrl = uploadfile.secure_url;
      contentType = file.mimetype.startsWith("image") ? "image" : "video";
    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "No content or file provided");
    }

    const message = new Message({
      conversation: conversation._id, // ✅ correct
      sender: senderID,
      receiver: receiverID,
      content,
      messageStatus,
      imageOrVideoUrl,
      contentType,
    });

    await message.save();

    if (message?.content) {
      conversation.lastMessage = message._id;
    }
    conversation.unreadCount += 1;

    await conversation.save();

    // ... message save hone ke baad
    const populatemessage = await Message.findById(message._id)
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    if (req.socketUserMap && req.io) {
      const rID = receiverID.toString();
      const receiverSocketId = req.socketUserMap.get(rID);

      if (receiverSocketId) {
        // Status update before emitting
        populatemessage.messageStatus = "delivered";
        await Message.updateOne(
          { _id: message._id },
          { messageStatus: "delivered" },
        );

        req.io.to(receiverSocketId).emit("receive_message", populatemessage);
      }
    }

    // Send final populated message to sender
    response(res, 200, "Message sent", populatemessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all conversation
exports.getConversation = async (req, res, next) => {
  const userId = req.user.userID;

  if (!userId) {
    return response(res, 400, "userID not found");
  }

  try {
    let conversation = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profilePic lastSeen isOnline")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "username profilePic",
        },
      })
      .sort({ updatedAt: -1 });

    response(res, 200, "Conversation fetched successfully", conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get message on specific conversation
exports.getMessages = async (req, res, next) => {
  const { conversationID } = req.params;
  const userId = req.user.userID;
  try {
    const conversation = await Conversation.findById(conversationID);
    // console.log("conversation: ", conversation);
    if (!conversation) {
      return response(res, 400, "Conversation not found in db");
    }

    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return response(res, 403, "Unauthorized to see this chat");
    }

    const messages = await Message.find({
      conversation: conversationID, // ✅ correct
    })
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: conversationID, // ✅
        receiver: userId,
        messageStatus: { $in: ["sent", "delivered"] },
      },
      {
        messageStatus: "seen",
      },
    );

    conversation.unreadCount = 0;
    await conversation.save();

    // console.log("message:", messages);

    return response(res, 200, "Messages retrived successfully", messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//mark as read
exports.markAsRead = async (req, res, next) => {
  const { messageIds } = req.params;
  const userId = req.user.userID;

  try {
    //get relevent message
    let messages = await Message.find({
      _id: { $in: messageIds },
      receiver: userId,
      massageStatus: { $in: ["sent", "delivered"] },
    });

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: userId,
      },
      {
        $set: { massageStatus: "seen" },
      },
    );

    //notify to sender
    if (req.socketUserMap && req.io) {
      //broadcast to all connecting users
      for (const message of messages) {
        const senderSocketId = req.socketUserMap.get(message.sender.toString());
        if (senderSocketId) {
          const updatedMessage = {
            _id: message._id,
            messageStatus: "read",
          };

          req.io.to(senderSocketId).emit("message_read", updatedMessage);
          await message.save();
        }
      }
    }

    response(res, 200, "Messages marked as read successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete msg
exports.deleteMessage = async (req, res, next) => {
  const { messageID } = req.params;
  const userId = req.user.userID;

  try {
    const message = await Message.findById(messageID);
    if (!message) {
      return response(res, 404, "Message not found");
    }
    if (message.sender.toString() != userId) {
      return response(res, 403, "Unauthorized to delete this message");
    }
    await Message.deleteOne({ _id: messageID });

    //emit soket event
    if (req.socketUserMap && req.io) {
      const receiverSocketId = req.socketUserMap.get(
        message.receiver.toString(),
      );
      if (receiverSocketId) {
        req.io.to(receiverSocketId).emit("message_deleted", messageID);
      }
    }

    response(res, 200, "Message deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
