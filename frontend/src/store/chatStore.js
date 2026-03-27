import { create } from "zustand";
import axiosInstance from "../services/url.Service";
import { getSocket } from "../services/chat.Service";
import useUserStore from "../store/useUserStore";

export const useChatStore = create((set, get) => ({
  conversation: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),

  //socket event setup
  initsocketListners: () => {
    const socket = getSocket();
    if (!socket) {
      console.log("Socket not found, retrying...");
      return;
    } // ✅ Sabse pehle purane listeners hatao (Clean up)
    socket.off("message_reaction_update");
    socket.off("receive_message");

    //remove exixting listerners to prevent duplicate
    socket.off("receive_message");
    socket.off("user_typing");
    socket.off("user_status");
    socket.off("message_send");
    socket.off("message_error");
    socket.off("message_deleted");

    //receive message
    socket.on("receive_message", (message) => {
      const { currentConversation } = get();

      // Backend se 'conversation' aa raha hai, fetchMessages use 'conversationID'
      // Isliye hum dono handle karenge
      const incomingConvId = message.conversation?._id || message.conversation;

      if (currentConversation === incomingConvId) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    });

    //confirm message dilivery
    socket.on("message_send", (message) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message?._id ? { ...msg } : msg,
        ),
      }));
    });

    // update msg status
    socket.on("message_status_update", ({ messageId, messageStatus }) => {
      console.log("message status update", messageId, messageStatus);
      set((state) => ({
        messages: state.messages.map((msg) => {
          if (msg._id === messageId) {
            return { ...msg, messageStatus };
          } else {
            return msg;
          }
        }),
      }));
    });

    // reaction update listener
    socket.on("message_reaction_update", ({ messageId, reaction }) => {
      // console.log("REACTION RECEIVED!", messageId, reaction); // Ye ab chalega
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reaction: reaction } : msg,
        ),
      }));
    });

    // delete msg from local state
    socket.on("message_deleted", ({ deletedmessageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedmessageId),
      }));
    });

    // message sending error
    socket.on("message_error", (error) => {
      console.log("message error", error);
    });

    // listner for typing user
    socket.on("user_typing", ({ userId, conversationId, isTyping }) => {
      set((state) => {
        const newtypingUsers = new Map(state.typingUsers);

        if (!newtypingUsers.has(conversationId)) {
          newtypingUsers.set(conversationId, new Set());
        }

        const typingSet = newtypingUsers.get(conversationId);
        if (isTyping) {
          typingSet.add(userId);
        } else {
          typingSet.delete(userId);
        }
        return { typingUsers: newtypingUsers };
      });
    });

    //track online users
    socket.on("user_status", ({ userId, isOnline, lastSeen }) => {
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUsers);

        newOnlineUsers.set(userId, { isOnline, lastSeen });
        return { onlineUsers: newOnlineUsers };
      });
    });

    // emit status check for all users online
    const { conversation } = get();
    if (conversation?.data?.length > 0) {
      conversation.data?.forEach((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id !== get().currentUser._id,
        );
        if (otherUser?._id) {
          socket.emit("get_user_status", otherUser._id, (status) => {
            set((state) => {
              const newOnlineUsers = new Map(state.onlineUsers);
              newOnlineUsers.set(state.userID, {
                isOnline: state.isOnline,
                lastSeen: state.lastSeen,
              });
              return { onlineUsers: newOnlineUsers };
            });
          });
        }
      });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  fetchConversation: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("chats/getConversation");

      set({ conversation: data, loading: false });
      get().initsocketListners();
      return data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      return null;
    }
  },

  //fetch message for conversation
  fetchMassages: async (conversationID) => {
    if (!conversationID) return;
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get(
        `chats/getConversation/${conversationID}/messages`,
      );

      const messageArray = data.data || data || [];

      set({
        messages: messageArray,
        loading: false,
        currentConversation: conversationID,
      });

      //mark unread msg as read
      const { markMessageAsRead } = get();
      markMessageAsRead();

      return messageArray;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      return [];
    }
  },

  //  send msg in real time

  sendMessage: async (formData) => {
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");
    const content = formData.get("content");
    const media = formData.get("media");
    const messageStatus = formData.get("messageStatus");

    const socket = getSocket();
    const { conversation } = get();
    let conversationId = null;
    if (conversation?.data > 0) {
      const conversatio = conversation.data.find(
        (conv) =>
          conv.participants.some((p) => p._id === senderId) &&
          conv.participants.some((p) => p._id === receiverId),
      );
      if (conversatio) {
        conversationId = conversatio._id;
        set({ currentConversation: conversationId });
      }
    }

    // temp message before actual response
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: senderId },
      receiver: { _id: receiverId },
      conversation: conversationId,
      imageOrVideoUrl:
        media && typeof media !== "string" ? URL.createObjectURL(media) : null,
      content: content,
      contentType: media
        ? media.type.startsWith("image/")
          ? "image"
          : "video"
        : "text",
      createdAt: new Date().toISOString(),
      messageStatus: messageStatus,
    };

    // add temp message to state
    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const { data } = await axiosInstance.post("chats/sendMessage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const messageData = data.data || data;

      // replace temp msg with actual msg from server
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? messageData : msg,
        ),
      }));

      return messageData;
    } catch (error) {
      console.log("error in sending msg", error);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...msg, messageStatus: "failed" } : msg,
        ),
        error: error?.response?.data?.message || error?.message,
      }));
      throw error;
    }

    if (!socket) return;
  },

  recevieMessage: (message) => {
    if (!message) return;

    const { currentConversation, currentUser, messages } = get();

    const messageExists = messages.some((msg) => msg._id === message._id);
    if (messageExists) return;

    if (message.conversation === currentConversation) {
      set((state) => ({
        message: [...state.message, message],
      }));

      //   automatic mark as read
      if (message.receiver?._id === currentUser?._id) {
        get().markMessageAsRead();
      }
    }

    //update conversation and
    set((state) => {
      const updateConversation = state.conversation?.data?.map((conv) => {
        if (conv._id === message.conversation) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount:
              message?.receiver?._id === currentUser?._id
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount || 0,
          };
        }
        return conv;
      });
      return {
        conversation: {
          ...state.conversation,
          data: updateConversation,
        },
      };
    });
  },

  // mark as read
  markMessageAsRead: async () => {
    const { messages, currentUser } = get();
    if (!messages.length || !currentUser) return;

    const unreadIds = messages
      .filter(
        (msg) =>
          msg.messageStatus === "read" &&
          msg.receiver?._id === currentUser?._id,
      )
      .map((msg) => msg._id)
      .filter(Boolean);

    if (unreadIds.length === 0) return;
    try {
      const { data } = await axiosInstance.put("chats/message/read", {
        messageIds: unreadIds,
      });

      set((state) => ({
        messages: state.messages.map((msg) => {
          if (unreadIds.includes(msg._id)) {
            return { ...msg, messageStatus: "read" };
          }
          return msg;
        }),
      }));

      const socket = getSocket();
      if (socket) {
        socket.emit("message_read", {
          messageIds: unreadIds,
          senderId: messages[0]?.sender?.id,
        });
      }
    } catch (error) {
      console.log("error in markMessageAsRead", error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/chats/message/${messageId}`);

      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));

      return true;
    } catch (error) {
      console.log("error in deleteMessage", error);
      set({ error: error.response?.data?.message || error.message });
      return false;
    }
  },

  // add reaction
  addReaction: async (messageId, emoji) => {
    const socket = getSocket();
    const user = useUserStore.getState().user?.user; // Sahi path check karein

    // console.log("Emitting with:", { messageId, emoji, userId: user?._id });

    if (socket && user?._id) {
      socket.emit("add_reaction", {
        messageId,
        emoji,
        userId: user._id, // Backend 'userId' expect kar raha hai (destructuring check karein)
        reactionUserId: user._id,
      });
    } else {
      console.log("Socket ya User missing hai!");
    }
  },

  startTyping: (receiverId) => {
    const { currentConversation } = get();
    const socket = getSocket();
    if (socket && currentConversation && receiverId) {
      socket.emit("typing_start", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  stopTyping: (receiverId) => {
    const { currentConversation } = get();
    const socket = getSocket();
    if (socket && currentConversation && receiverId) {
      socket.emit("typing_stop", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  isUserTyping: (userId) => {
    const { typingUsers, currentConversation } = get();
    if (!currentConversation || typingUsers.has(currentConversation) || !userId)
      return false;
    const typingSet = typingUsers.get(currentConversation);
    return typingSet?.has(userId);
  },

  isUserOnline: (userId) => {
    if (!userId) return null;

    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.isOnline || false;
  },

  getUserLastSeen: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.lastSeen || null;
  },

  cleanUp: () => {
    set({
      conversation: [],
      messages: [],
      currentConversation: null,
      onlineUsers: new Map(),
      typingUsers: new Map(),
    });
  },
}));
