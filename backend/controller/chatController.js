const { response } = require("../utils/responseHandller");
const { uploadfiletocloudinary } = require("../config/imageCloud");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

exports.sendMassage = async (req, res, next) => {
  try {
    const { senderID, receiverID, content, massageStatus } = req.body;
    const file = req.file;

    //create conversation
    const participents = [senderID, receiverID].sort();
    const conversation = await Conversation.findOne({
      participants: participents,
    });

    if (!conversation) {
      conversation = new Conversation({
        participents,
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
      imageOrVideoUrl = uploadfile?.secure_url;
      contentType = file.mimetype.startsWith("image") ? "image" : "video";
    } else if (content?.trim()) {
      contentType = "text";
    } else {
      response(res, 400, "No content or file provided");
    }

    const message = new Message({
      conversationID: conversation._id,
      sender: senderID,
      receiver: receiverID,
      content,
      massageStatus,
      imageOrVideoUrl,
      contentType,
    });
    await message.save();
    if (message?.content) {
      conversation.lastMessage = message._id;
    }
    await conversation.save();

    const populatemessage = await Message.findById(message._id)
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    response(res, 200, "Message sent successfully", populatemessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all conversation
exports.getConversation = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const conversation = await Conversation.find({
      participants: userId,
    }).populate("participants", "username profilePic lastSeen isOnline").populate({path:"lastMessage",populate:{
        path:"sender receiver",
        select:"username profilePic" 
    }}).sort({updatedAt:-1})

    response(res, 200, "Conversation fetched successfully", conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
