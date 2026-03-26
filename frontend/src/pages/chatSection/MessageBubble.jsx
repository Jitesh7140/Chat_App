import { format } from "date-fns";
import { useRef, useState } from "react";
import { FaCheck, FaCheckDouble, FaSmile } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

const MessageBubble = ({
  message,
  theme,
  currentUser,
  onReact,
  deleteMessage,
}) => {
  console.log("message", message);

  const [showEnojiPicker, setShowEnojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const messageRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const optionRef = useRef(null);

  const emojiPickerRef = useRef(null);
  const reactionMenuRef = useRef(null);

  const isUserMessage = message.sender._id === currentUser?.user?._id;

  const bubbleClass = isUserMessage ? `chat-end` : `chat-start`;

  const bubbleContentClass = isUserMessage
    ? `chat-bubble md:max-w-[50%] min-w-[130px] ${theme === "dark" ? "bg-[#144d38] text-white " : "bg-[#d9fdd3] text-black"}`
    : `chat-bubble md:max-w-[50%] min-w-[130px] ${theme === "dark" ? "bg-[#144d38] text-white " : "bg-[#d9fdd3] text-black"} `;

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleReact = (emoji) => {
    onReact(message._id, emoji);
    setShowEnojiPicker(false);
    setShowReactions(false);
  };

  if (message === 0) return;

  return (
    <div className={`chat ${bubbleClass}`}>
      <div className={`${bubbleContentClass} relative group `} ref={messageRef}>
        <div className="flex justify-center gap-2">
          {message.contentType === "text" && (
            <p className="mr-2">{message.content}</p>
          )}
          {message.contentType === "image" && (
            <div>
              <img
                src={message.imageOrVideoUrl}
                alt="image/video"
                className="rounded-lg max-w-xs"
              />
              <p className="mt-2">{message.content}</p>
            </div>
          )}
        </div>

        <div className="self-end flex justify-end items-center gap-1 text-xs opacity-60 mt-2 ml-2">
          <span>{format(new Date(message.createdAt), "HH:mm")}</span>

          {isUserMessage && (
            <>
              {message.messageStatus === "sent" && <FaCheck size={12} />}
              {message.messageStatus === "delivered" && (
                <FaCheckDouble size={12} />
              )}
              {message.messageStatus === "read" && (
                <FaCheckDouble size={12} className="text-blue-500" />
              )}
            </>
          )}
        </div>

        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={() => {
              setShowOptions((prev) => !prev);
            }}
            className={`p-1 rounded-full ${theme === "dark" ? "  text-gray-200" : " text-gray-700"}`}
          >
            <HiDotsVertical />
          </button>
        </div>

        <div
          className={`absolute ${isUserMessage ? "-left-10" : "-right-10"} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-20`}
        >
          <button
            className={`p-2 rounded-full ${theme === "dark" ? "text-gray-300 hover:bg-gray-900" : "text-white hover:bg-gray-100"} shadow-lg`}
            onClick={() => {
              setShowReactions(!showReactions);
            }}
          >
            <FaSmile
              className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
            />
          </button>
        </div>

        {showReactions && (
            
        )}

      </div>
    </div>
  );
};

export default MessageBubble;
