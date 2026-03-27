import React, { useState } from "react";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { FaComment, FaMoon, FaQuestionCircle, FaSearch, FaSignOutAlt, FaSun, FaUser } from "react-icons/fa";
import  {logoutUser}  from "../../services/user.Service";
import { toast } from "react-toastify";

const setting = () => {
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);

  const { theme } = useThemeStore();
  const { user, clearUser } = useUserStore();
  // console.log("user", user.user.profilePic);

  const toggleThemeDialog = () => {
    setIsThemeDialogOpen(!isThemeDialogOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUser();
      toast.success("user logged out successfully");
    } catch (error) {
      console.error("falied", error);
    }
  };

  return (
    <Layout
      isThemeDialogOpen={isThemeDialogOpen}
      toggleThemeDialog={toggleThemeDialog}
    >
      <div
        className={`flex h-screen ${theme === "dark" ? "bg-[rgb(17,27,33)] text-white" : "bg-white text-black"}`}
      >
        <div
          className={`w-[400px] border-r ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}
        >
          <div className="p-4 ">
            <h1 className="text-xl font-semibold mb-4">Settings</h1>

            <div className="relative mb-4 ">
              <FaSearch className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Setting"
                className={`w-full ${theme === "dark" ? "bg-[#202c33] text-white " : "bg-gray-200 text-black"} border-none pl-10 placeholderbg-[#202c33] rounded p-2`}
              />
            </div>

            <div
              className={`flex items-center gap-4 p-3 ${theme === "dark" ? "hover:bg-[#202c33] " : "hover:bg-gray-100"} rounded-lg cursor-pointer mb-4`}
            >
              <img
                src={user.user.profilePic}
                alt="profilePic"
                className="w-14 h-14 rounded-full"
              />
              <div className="">
                <h2 className="font-semibold">{user.user.username}</h2>
                <p className="text-sm text-gray-400">{user?.about}</p>
              </div>
            </div>

            {/* menu items */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto">
              <div className="space-y-1">
                {[
                  { icon: FaUser, lable: "Account", href: "/userProfile" },
                  { icon: FaComment, lable: "Chats", href: "/" },
                  { icon: FaQuestionCircle, lable: "Help", href: "/help" },
                ].map((item) => (
                  <Link
                    to={item.href}
                    key={item.lable}
                    className={`w-full flex items-center gap-3 p-2 rounded ${theme === "dark" ? "text-white hover:bg-[#202c33]" : "text-black hover:bg-gray-100"}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <div
                      className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"} w-full p-4`}
                    >
                      {item.lable}
                    </div>
                  </Link>
                ))}

                  {/* theme btn */}
                  <button onClick={toggleThemeDialog} className={`w-full gap-3 flex items-center rounded ${theme === "dark" ? "text-white hover:bg-[#202c33]" : "text-black hover:bg-gray-100"}`} >
                    {theme === 'dark' ? (
                      <FaMoon className="h-5 w-5" />
                    ) : (
                      <FaSun className="h-5 w-5" />
                    )}
                    <div
                      className={`flex   text-start border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"} w-full p-4`}
                    >
                      Theme
                      <span className="ml-auto text-sm text-gray-400" >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </span>
                    </div>
                  </button> 
              </div>

              <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 p-4 rounded text-red-500 ${theme === "dark" ? "text-white hover:bg-[#202c33]" : "text-black hover:bg-gray-100"} mt-10 md:mt-36`} >
                <FaSignOutAlt className="h-5 w-5" />LogOut
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default setting;
