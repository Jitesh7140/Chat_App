import { format } from "date-fns";
import { useRef, useState } from "react";
import {
  FaCheck,
  FaCheckDouble,
  FaPlus,
  FaRegCopy,
  FaSmile,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import useOutSideClick from "../../hooks/useOutSideClick";
import EmojiPicker from "emoji-picker-react";
import { RxCross2 } from "react-icons/rx";
import { FaRegTrashAlt } from "react-icons/fa";

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const optionRef = useRef(null);

  const emojiPickerRef = useRef(null);
  const reactionMenuRef = useRef(null);

  const isUserMessage = message.sender._id === currentUser?.user?._id;

  const bubbleClass = isUserMessage
    ? `chat-end m-[15px]`
    : `chat-start m-[15px]`;

  const bubbleContentClass = isUserMessage
    ? `chat-bubble md:max-w-[50%] min-w-[130px] ${theme === "dark" ? "bg-[#144d38] text-white " : "bg-[#d9fdd3] text-black"}`
    : `chat-bubble md:max-w-[50%] min-w-[130px] ${theme === "dark" ? "bg-[#144d38] text-white " : "bg-[#d9fdd3] text-black"} `;

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleReact = (emoji) => {
    onReact(message._id, emoji);
    setShowEnojiPicker(false);
    setShowReactions(false);
  };

  useOutSideClick(emojiPickerRef, () => {
    if (showEnojiPicker) setShowEnojiPicker(false);
  });
  useOutSideClick(reactionMenuRef, () => {
    if (showReactions) setShowReactions(false);
  });
  useOutSideClick(optionRef, () => {
    if (showOptions) setShowOptions(false);
  });

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
                alt="chat-attachment"
                // Click karne par preview khulega
                onClick={() => setIsPreviewOpen(true)}
                className="rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
              />
              {message.content && <p className="mt-2">{message.content}</p>}
            </div>
          )}
        </div>

        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-999 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setIsPreviewOpen(false)} // Bahar click karne par band
          >
            {/* Cross Button */}
            <button
              className="absolute top-5 right-5 text-white text-3xl hover:text-gray-300 z-1000"
              onClick={() => setIsPreviewOpen(false)}
            >
              <RxCross2 />
            </button>

            {/* Full Image */}
            <img
              src={message.imageOrVideoUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl scale-in-center"
              onClick={(e) => e.stopPropagation()} // Image pe click karne se band NA ho
            />
          </div>
        )}

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

        <div className="absolute top-1 -right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={() => {
              setShowOptions((prev) => !prev);
            }}
            className={`p-3 left-1 rounded-full ${theme === "dark" ? "  text-gray-100" : " text-gray-700"}`}
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
          <div
            className={`absolute -top-10 ${isUserMessage ? "right-0" : "left-36"} flex items-center bg-gray-800 border border-gray-700 rounded-full px-2 py-1 gap-1 shadow-2xl z-50 animate-in fade-in zoom-in duration-200`}
          >
            {quickReactions.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleReact(emoji)}
                className="hover:scale-150 transition-transform p-1 text-lg"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setShowEnojiPicker(true)}
              className="ml-1 p-1 hover:bg-gray-700 rounded-full"
            >
              <FaPlus size={12} className="text-gray-400" />
            </button>
          </div>
        )}
        {showEnojiPicker && (
          <div ref={emojiPickerRef} className="absolute left-0   mb-6 z-50">
            <div className="relative ">
              <EmojiPicker
                ref={emojiPickerRef}
                onEmojiClick={(emojiObject) => handleReact(emojiObject.emoji)}
                theme={theme}
              />
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEnojiPicker(false);
                }}
              >
                <RxCross2 />
              </button>
            </div>
          </div>
        )}

        {/* {console.log("reaction", message.reaction)} */}
        {message.reaction && message.reaction.length > 0 && (
          <div className="absolute -bottom-6 left-0 flex gap-1">
            {message.reaction.map((reaction, index) => (
              <span
                key={index}
                className="bg-gray-700 px-1 py-0.5 rounded-full text-lg z-10"
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}

        {showOptions && (
          <div
            ref={optionRef}
            className={`absolute top-8 right-1 z-101 w-36 rounded-xl shadow-lg py-2 text-sm ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}`}
          >
            <button
              onClick={() => {
                if (message.contentType === "text") {
                  navigator.clipboard.writeText(message.content);
                }
                setShowOptions(false);
              }}
              className="flex items-center w-full px-4 py-2 gap-3 rounded-lg"
            >
              <FaRegCopy size={14} />
              <span>Copy</span>
            </button>

            {isUserMessage && (
              <button
                onClick={() => {
                  deleteMessage(message._id);
                  setShowOptions(false);
                }}
                className="flex items-center w-full px-4 py-2 gap-3 rounded-lg text-red-600"
              >
                <FaRegTrashAlt className="text-red-600" size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
