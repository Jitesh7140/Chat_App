import { useState } from "react";
import useLayoutStore from "../../store/layoutStore";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { FaPlus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import formatTimestamp from "../../utils/formatTime";

const ChatList = ({ contacts }) => {
  const SelectedContect = useLayoutStore((state) => state.SelectedContect);
  const setSelectedContect = useLayoutStore(
    (state) => state.setSelectedContect,
  );
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [search, setSearch] = useState("");
  const users = contacts?.userwithconversation || [];

  const filteredContacts = users.filter((contact) =>
     contact?.username?.toLowerCase().includes(search.toLowerCase()) 
      
  );

  // console.log(" users: ", users);
  // console.log("filter contacts: ", filteredContacts);
  return (
    <div
      className={`w-full border-r h-screen ${theme === "dark" ? "bg-[rgb(17,27,33)] border-gray-200" : "bg-white border-gray-200"}`}
    >
      <div
        className={`p-4 flex justify-between items-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}
      >
        <h1 className="text-xl font-bold">Chats</h1>
        <button className="focus:outline-none p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
          <FaPlus className="w-6 h-6" />
        </button>
      </div>

      <div className="p-2">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === "dark" ? "bg-[rgb(17,27,33)] text-white" : "bg-white text-black"}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact._id}
            onClick={() => setSelectedContect(contact)}
            className={`p-3 flex items-center cursor-pointer ${
              SelectedContect?._id === contact._id
                ? theme === "dark"
                  ? "bg-gray-700"
                  : "bg-gray-200"
                : theme === "dark"
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
            }`}
          >
           <img src={contact?.profilePic} alt="userProfile" className="w-10 h-10 rounded-full" />
            <div className="flex-1 ml-3 ">
              <div className="flex justify-between items-baseline">
              <h2 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {contact?.username}
              </h2>
              {contact?.conversation && (
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}>
                  {formatTimestamp(contact?.conversation?.lastMessage?.createdAt)}
                  </span>
              )} 
              <div className="flex justify-between items-baseline">
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-400"} truncate`}>
                  {contact?.conversation?.lastMessage?.message || "0"}
                </p>
                {contact?.conversation?.unreadCount > 0 && contact?.conversation?.lastMessage?.receiver === user?._id && (
                  <span className={`text-xs ${theme === "dark" ? "text-white" : "text-black"} bg-green-500 rounded-full px-2 py-1`}>
                    {contact?.conversation?.unreadCount || "0"}
                  </span>
                )}
              </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
