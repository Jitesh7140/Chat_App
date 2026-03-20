const { Server } = require("socket.io");
const User = require("../models/users");
const Message = require("../models/message");

// map to store online users -> userID , soketid
const onlineUser = new Map();

//Map to track typing -> userID -> [conversation]: boolean
const typingUsers = new Map();

const initializeSoket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },

    pingTimeout: 6000,
  });

  io.on("connection", (socket) => {
    console.log("user connected", socket.id);
    let userId = null;

    // handle user connection and mark them online in db
    socket.on("user_login", async (connectingUserId) => {
      try {
        userId = connectingUserId;
        onlineUser.set(userId, socket.id);
        socket.join(userId);

        //update user in db
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // broadcast to all users that this user is online
        io.emit("user_online", { userId, isOnline: true });
      } catch (error) {
        console.log(error);
      }
    });

    //Return online status of request user
    socket.on("get_user_status", (requestUserId, callback) => {
      const isOnline = onlineUser.has(requestUserId);
      callback({
        userId: requestUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });

    // froward msg to reciver
    socket.on("send_message", async (messageIds, senderId) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { messageStatus: "read" } },
        );

        const senderSocketId = onlineUser.get(senderId);
        if (senderSocketId) {
          messageIds.forEach((messageId) => {
            io.to(senderSocketId).emit("message_status_update", {
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {
        console.log("error in send_message", error);
      }
    });

    // handle typing start event and auto stop 3s
    socket.on("typing_start", ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (!typingUsers.has(userId)) typingUsers.set(userId, {});

      const userTyping = typingUsers.get(userId);

      userTyping[conversationId] = true;
      // clear any exiting timeout
      if (userTyping[`${conversationId}_timeout`]) {
        clearTimeout(userTyping[`${conversationId}_timeout`]);
      }

      // auto-stop after 3s
      userTyping[`${conversationId}_timeout`] = setTimeout(() => {
        userTyping[conversationId] = false;
        socket.to(receiverId).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
        });
      }, 3000);

      // notifying typing start to receiver
      socket.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: true,
      });
    });

    // handle stop
    socket.on("typing_stop", ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (typingUsers.has(userId)) {
        const userTyping = typingUsers.get(userId);
        userTyping[conversationId] = false;

        if (userTyping[`${conversationId}_timeout`]) {
          clearTimeout(userTyping[`${conversationId}_timeout`]);
          delete userTyping[`${conversationId}_timeout`];
        }

        socket.to(receiverId).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
        });
      }
    });

    // Add or update reaction on message
    socket.on(
      "add_reaction",
      async ({ messageId, emoji, userId, reactionUserId }) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) return;

          const existingReaction = message.reactions.findById(
            (r) => r.user.tostring() === reactionUserId,
          );

          if (existingReaction > -1) {
            const existing = message.reactions(existingReaction);
            if (existing.emoji === emoji) {
              // remove same reaction
              message.reactions.splice(existingReaction, 1);
            } else {
              // update reaction
              message.reactions[existingReaction].emoji = emoji;
            }
          } else {
            message.reactions.push({ user: reactionUserId, emoji });
          }

          await message.save();

          const populatemessage = await Message.findById(message._id)
            .populate("sender", "username profilePic")
            .populate("receiver", "username profilePic")
            .populate("reactions.user", "username");

          const reactionUpdated = {
            messageId,
            reactions: populatemessage.reactions,
          };

          const senderSocket = onlineUser.get(
            populatemessage.sender._id.tostring(),
          );
          const receiverSocket = onlineUser.get(
            message.receiver?._id.tostring(),
          );

          if (senderSocket) {
            io.to(senderSocket).emit(
              "message_reaction_update",
              reactionUpdated,
            );
          }

          if (receiverSocket) {
            io.to(receiverSocket).emit(
              "message_reaction_update",
              reactionUpdated,
            );
          }
        } catch (error) {
          console.log("error in add_reaction", error);
        }
      },
    );
    
    // handle disconnect
    const handleDisconnect = async () => {
      if (!userId) return;

      try {
        onlineUser.delete(userId);

        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys().forEach((key) => {
            if (key.endsWith("_timeout")) clearTimeout(userTyping[key]);
          });

          typingUsers.delete(userId);
        }

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user_status", {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.leave(userId);
        console.log("user with user id disconnecting", userId);
      } catch (error) {
        console.log("error in handleDisconnect", error);
      }
    }; 
    socket.on("disconnect", handleDisconnect);
    
  });


  //attaced the online user map for external use
  io.socketUsermap = onlineUser;

  return io;
};

module.exports = initializeSoket;
