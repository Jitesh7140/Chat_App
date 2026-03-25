import { useEffect, useState } from "react";
import useLayoutStore from "../store/layoutStore";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import SideBar from "./SideBar";
import ChatWindow from "../pages/chatSection/ChatWindow"

const Layout = ({
  children,
  isThemeDialogOpen,
  toggleThemeDialog,
  isStatusPreviewOpen,
  isStatusPreviewContent,
}) => {
  const SelectedContect = useLayoutStore((state) => state.SelectedContect);
  const setSelectedContect = useLayoutStore(
    (state) => state.setSelectedContect,
  );
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-[#111b21] text-white" : "bg-white text-black"} flex relative`}
    >
      {!isMobile && <SideBar />}

      <div className={`flex-1 flex overflow-hidden ${isMobile ? "flex-col" : ""}`}>
  <AnimatePresence initial={false} mode="popLayout">
    {/* --- CHAT LIST SECTION --- */}
    {/* Mobile par tabhi dikhao jab koi contact select NA HO. Desktop par hamesha dikhao. */}
    {(!isMobile || !SelectedContect) && (
      <motion.div
        key="chatlist"
        initial={isMobile ? { x: -300, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`${isMobile ? "w-full" : "w-2/5"} h-full border-r border-gray-200`}
      >
        {children}
      </motion.div>
    )}

    {/* --- CHAT WINDOW SECTION --- */}
    {/* Mobile par tabhi dikhao jab contact select HO. Desktop par hamesha dikhao. */}
    {(!isMobile || SelectedContect) && (
      <motion.div
        key="chatWindow"
        initial={isMobile ? { x: 300, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        exit={isMobile ? { x: 300, opacity: 0 } : { opacity: 0 }}
        transition={{ type: "tween", duration: 0.3 }}
        className="flex-1 h-full"
      >
        <ChatWindow 
          SelectedContect={SelectedContect} 
          setSelectedContect={setSelectedContect} 
          isMobile={isMobile} 
        />
      </motion.div>
    )}
  </AnimatePresence>
</div>

      {isMobile && <SideBar/>}

      {isThemeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white dark:bg-[#111b21] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Choose a theme</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-4 py-2 rounded-lg ${theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                Dark
              </button>
            </div>
            <button
              onClick={toggleThemeDialog}
              className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Close
            </button>
          </div>
        </div> 
      )}

      {isStatusPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white dark:bg-[#111b21] p-6 rounded-lg shadow-lg">
            {isStatusPreviewContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
