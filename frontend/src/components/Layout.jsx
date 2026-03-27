import { useEffect, useState } from "react";
import useLayoutStore from "../store/layoutStore";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import SideBar from "./SideBar";
import ChatWindow from "../pages/chatSection/ChatWindow";

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

      <div
        className={`flex-1 flex overflow-hidden ${isMobile ? "flex-col" : ""}`}
      >
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
              className={`${isMobile ? "w-full" : "w-2/9"} h-full border-r border-gray-200`}
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

      {isMobile && <SideBar />}

      {isThemeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <div
            className="absolute inset-0 bg-black/60   transition-opacity"
            onClick={toggleThemeDialog}
          ></div>

          {/* Dialog Box */}
          <div className="relative bg-white dark:bg-[#232d36] w-full max-w-sm p-6 rounded-2xl shadow-2xl transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
              Choose a theme
            </h2>

            <div className="flex flex-col gap-3">
              {/* Light Theme Option */}
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                  theme === "light"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-orange-500 text-xl">☀️</span>
                  <span className="font-medium dark:text-gray-200">
                    Light Mode
                  </span>
                </div>
                {theme === "light" && (
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                )}
              </button>

              {/* Dark Theme Option */}
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                  theme === "dark"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 text-xl">🌙</span>
                  <span className="font-medium dark:text-gray-200">
                    Dark Mode
                  </span>
                </div>
                {theme === "dark" && (
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                )}
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={toggleThemeDialog}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors shadow-md"
              >
                OK
              </button>
            </div>
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
