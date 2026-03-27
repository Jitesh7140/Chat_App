import React, { useEffect, useRef, useState } from "react";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/themeStore";
import { useChatStore } from "../../store/chatStore";
import { isToday, isYesterday, format, formatISO } from "date-fns";
import whatsAppImage from "../../images/whatsapp_image.png";
import {
  FaArrowLeft,
  FaEllipsisH,
  FaEllipsisV,
  FaFile,
  FaImage,
  FaPaperPlane,
  FaPaperclip,
  FaSmile,
  FaTimes,
  FaVideo,
} from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";

const isValidate = (date) => {
  return date instanceof Date && !isNaN(date);
};

const ChatWindow = ({ SelectedContect, setSelectedContect }) => {
  const [message, setMessage] = useState("");
  const [showEnojiPicker, setShowEnojiPicker] = useState(false);
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
  // console.log("user: " , user.user?._id)
  // console.log("contect: " , SelectedContect?._id)

  const handleSendMessage = async () => {
    if (!SelectedContect) return;

     
    if (!message.trim() && !selectedfile) return;

    try {
      const formData = new FormData();
      formData.append("senderID", user.user?._id);
      formData.append("receiverID", SelectedContect?._id);

      const status = online ? "delivered" : "sent";
      formData.append("messageStatus", status);

      // Text content add karo agar hai toh
      if (message.trim()) {
        formData.append("content", message);
      }

      // File add karo agar hai toh
      if (selectedfile) {
        formData.append("media", selectedfile, selectedfile.name);
      }

      // API Call
      await sendMessage(formData);

      // Success ke baad saari states reset karo
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

  // console.log("selected contect:", SelectedContect);

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
    <div className="flex-1 h-screen w-full flex flex-col">
      <div
        className={`p-4 flex items-center  ${theme === "dark" ? "bg-[#303430] text-white" : "bg-[rgb(239,242,245)] text-gray-600 "} `}
      >
        <button
          className="mr-2 cursor-pointer focus:outline-none"
          onClick={() => setSelectedContect(null)}
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>

        <img
          src={SelectedContect?.profilePic}
          alt="userProfile Pic"
          className="w-10 h-10 rounded-full ring-2"
        />

        <div className="ml-3  grow ">
          <h2 className="font-semibold text-start">
            {SelectedContect?.username}
          </h2>

          {isTyping ? (
            <div>Typing....</div>
          ) : (
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {online
                ? "Online"
                : lastSeen
                  ? `Last Seen ${format(new Date(lastSeen), "HH:mm")}`
                  : "Offline"}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4 ">
          <button className="focus:outline-none ">
            <FaVideo className="h-5 w-5" />
          </button>
          <button className="focus:outline-none ">
            <FaEllipsisV className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`flex-1 p-4 overflow-y-auto ${theme === "dark" ? "bg-[#191A1A]" : "bg-[rgb(240,242,245)]"}`}
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <React.Fragment key={date}>
            {renderDateSeprator(new Date(date))}
            {msgs
              .filter(
                (msg) =>
                  msg.conversation === SelectedContect?.conversation?._id,
              )
              .map((msg) => (
                <MessageBubble
                  key={msg._id || msg.tempId}
                  message={msg}
                  theme={theme}
                  currentUser={user}
                  onReact={handleReaction}
                  deleteMessage={deleteMessage}
                />
              ))}
          </React.Fragment>
        ))}
        <div ref={messageEndRef} />
      </div>

      {filePreview && (
        <div className="relative p-2">
          <img
            src={filePreview}
            alt="filePreview"
            className="w-80 object-cover rounded shadow-lg mx-auto"
          />
          <button
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 "
            onClick={() => {
              setselectedFile(null);
              setFilePreview(null);
            }}
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        className={`p-4 ${theme === "dark" ? "bg-[#303430]" : "bg-white"} flex items-center space-x-2 relative`}
      >
        <button
          className="focus:outline-none"
          onClick={() => {
            setShowEnojiPicker(!showEnojiPicker);
          }}
        >
          <FaSmile
            className={`h-6 w-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          />
        </button>

        {showEnojiPicker && (
          <div ref={emojiPickerRef} className="absolute left-6 bottom-16 z-50">
            <EmojiPicker
              onEmojiClick={(emojiObject) => {
                setMessage((pre) => pre + emojiObject.emoji);
                setShowEnojiPicker(false);
              }}
              theme={theme}
            />
          </div>
        )}

        <div className="relative">
          <button
            className="focus:outline-none"
            onClick={() => {
              setShowFileMenu(!showfileMenu);
            }}
          >
            <FaPaperclip
              className={`h-6 w-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mt-2`}
            />
          </button>

          {showfileMenu && (
            <div
              className={`absolute bottom-full left-0 mb-2 ${theme === "dark" ? "bg-gray-700" : "bg-white-700"} rounded-lg shadow-lg`}
            >
              <input
                accept="image/*,video/*"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                className={`flex items-center px-4 py-2 w-full transition-colors ${theme === "dark" ? "hover:bg-gray-500" : "bg-gray-100"}`}
                // onClick={() => fileInputRef.current.click()}
              >
                <FaImage className="mr-2 h-6 w-6" /> Image/Video
              </button>

              <button
                className={`flex items-center px-4 py-2 w-full transition-colors ${theme === "dark" ? "hover:bg-gray-500" : "bg-gray-100"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaFile className="mr-2 h-6 w-6" /> Documents
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          value={message}
          placeholder="Type a message"
          className={`grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} className="focus:outline-none">
          <FaPaperPlane className="w-6 h-6 text-green-500" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
