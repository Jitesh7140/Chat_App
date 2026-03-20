const { Server } = require("socket.io");
const User = require("../models/user");
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
    socket.io("send_message",async (messageIds , senderId)=>{
        try{

            await Message.updateMany(
                {_id:{$in:messageIds}},
                {$set:{messageStatus:"read"}}
            )
             
            const senderSocketId = onlineUser.get(senderId);
            if(senderSocketId){
                 messageIds.forEach(messageId => {
                    io.to(senderSocketId).emit('message_status_update',{
                        messageId,
                        messageStatus:"read"
                    })
                    
                 });
            }

        }catch(error){
            console.log('error in send_message' , error)
        }
    })

    // handle typing start event and auto stop 3s
    socket.io('typing_start' , ({conversationId , receiverId})=>{
        if(!userId || !conversationId || !receiverId) return;

        if(!typingUsers.has(userId)) typingUsers.set(userId , {});

        const userTyping = typingUsers.get(userId);

        userTyping[conversationId] = true;
        // clear any exiting timeout
        if(userTyping[`${conversationId}_timeout`]){
            clearTimeout(userTyping[`${conversationId}_timeout`])
        }

        // auto-stop after 3s 
        userTyping[`${conversationId}_timeout`] = setTimeout(()=>{
            userTyping[conversationId] = false;
            socket.to(receiverId).emit('user_typing', {
                userId,
                conversationId,
                isTyping:false
            })
        },3000);

        // notifying typing start to receiver
        socket.to(receiverId).emit('user_typing' , {
            userId,
            conversationId,
            isTyping:true
        })
    })

    // handle stop 
    socket.on('typing_stop' , ({conversationId , receiverId})=>{
        if(!userId || !conversationId || !receiverId) return;

        if(typingUsers.has(userId)){
            const userTyping = typingUsers.get(userId);
            userTyping[conversationId] = false;

           if(userTyping[`${conversationId}_timeout`]){
            clearTimeout(userTyping[`${conversationId}_timeout`])
            delete userTyping[`${conversationId}_timeout`];
           }

           socket.to(receiverId).emit('user_typing' , {
            userId,
            conversationId,
            isTyping:false
           })


           // Add or update reaction on message 
           socket.on('add_reaction' , async({messageId , emoji , userId , reactionUserId})=>{
            try{
                const message = await Message.findById(messageId);
                if(!message) return;

                const existingReaction = message.reactions.findById(
                  (r) => r.user.tostring() === reactionUserId 
                )

                if(existingReaction > -1){
                    const existing = message.reactions(existingReaction)
                    if(existing.emoji === emoji){
                      // remove same reaction
                      message.reactions.splice(existingReaction , 1);

                    }else{
                      // update reaction
                      message.reactions[existingReaction].emoji = emoji;
                    }
                }else{
                    message.reactions.push({senderId , reaction});
                }

                await message.save();

                // notify all participants in conversation
                const conversationId = message.conversationId;
                io.to(conversationId).emit('message_reaction_update' , {
                    messageId,
                    reactions:message.reactions
                })

            }catch(error){
                console.log('error in add_reaction' , error)
            }
           })



        }
    }) 





  });
};
