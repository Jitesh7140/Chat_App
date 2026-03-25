import React, { useEffect, useRef, useState } from "react";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/themeStore";
import { useChatStore } from "../../store/chatStore";
import { isToday, isYesterday, format, formatISO } from "date-fns";
import whatsAppImage from "../../images/whatsapp_image.png";

const isValidate = (date) => {
  return date instanceof Date && !isNaN(date);
};

const ChatWindow = ({ SelectedContect, setSelectedContect }) => {
  const [message, setMessage] = useState("");
  const [showEnojiPicker, setEnojiPicker] = useState(false);
  const [showfileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedfile, setselectedFile] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const {
    messages,
    loading,
    sendMessage,
    recevieMessage,
    fetchMassages,
    fetchConversation,
    conversation,
    isUserTyping,
    startTyping,
    stopTyping,
    isUserOnline,
    getUserLastSeen,
    cleanUp,
    deleteMessage,
    addReaction,
  } = useChatStore();

  // get online status
  const online = isUserOnline(SelectedContect?._id);
  const lastSeen = getUserLastSeen(SelectedContect?._id);
  const isTyping = isUserTyping(SelectedContect?._id);

  useEffect(() => {
    if (SelectedContect?._id && conversation?.data?.length > 0) {
      const conversatio = conversation?.data?.find((conv) =>
        conv.participants.some((p) => p._id === SelectedContect?._id),
      );
      if (conversatio._id) {
        fetchMassages(conversatio._id);
      }
    }
  }, [SelectedContect, conversation]);

  useEffect(() => {
    fetchConversation();
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  useEffect(() => {
    if (message && SelectedContect) {
      startTyping(SelectedContect?._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(SelectedContect?._id);
      }, 2000);
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, SelectedContect, startTyping, stopTyping]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setselectedFile(file);
      setShowFileMenu(false);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!SelectedContect) return;
    setFilePreview(null);
    try {
      const formData = new FormData();
      formData.append("senderId", user?._id);
      formData.append("receiverId", SelectedContect?._id);

      const status = online ? "delivered" : "sent";
      formData.append("messageStatus", status);

      if (message.trim()) {
        formData.append("content", message);
      }
      if (selectedfile) {
        formData.append("media", selectedfile, selectedfile.name);
      }

      if (!selectedfile || !message.trim()) return;

      await sendMessage(formData);
      setMessage("");
      setselectedFile(null);
      setFilePreview(null);
      setShowFileMenu(false);
    } catch (error) {
      console.log("fail to send msg", error);
    }
  };

  const renderDateSeprator = (date) => {
    if (!isValidate(date)) return null;

    let dateString;
    if (isToday(date)) {
      dateString = "Today";
    } else if (isYesterday(date)) {
      dateString = "Yesterday";
    } else {
      dateString = format(date, "EEEE , MMM  d");
    }

    return (
      <div className="flex justify-center my-4">
        <span
          className={`px-4 py-2 rounded-full text-sm ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"}`}
        >
          {dateString}
        </span>
      </div>
    );
  };

  // group msg
  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((acc, message) => {
        if (!message.createdAt) return acc;
        const date = new Date(message.createdAt);
        if (isValidate(date)) {
          const dateString = format(date, "yyyy-MM-dd");
          if (!acc[dateString]) {
            acc[dateString] = [];
          }
          acc[dateString].push(message);
        } else {
          console.log("Invalid date for message", message);
        }
        return acc;
      }, {})
    : {};

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  if (!SelectedContect) {
    return (
      <div className="flex-1 flex-col flex items-center justify-center mx-auto h-screen text-center">
        <div className="max-w-md">
          <img src={whatsAppImage} alt="chatApp" className="w-full h-auto" />

          <h2
            className={`text-3xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            Select Conversation to start chatting
          </h2>
          <p
            className={`  ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6 `}
          >
            Choose a contact from the list on the left Side
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ">
       
    </div>
  );
};

export default ChatWindow;
