import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/loginPages/Login";
import HomePage from "./components/HomePage";
import Status from "./pages/statusPages/Status";
import Setting from "./pages/settingPages/setting";
import { ProtectedRoute, PublicRoute } from "./protected";
import useUserStore from "./store/useUserStore";
import { useEffect } from "react";
import { disconnectSocket, intializeSocket } from "./services/chat.Service";
import { disconnect } from "mongoose";

function App() {
  const {user} = useUserStore();

  useEffect(()=>{
    if(user?._id){
      const socket = intializeSocket();
    }
    return ()=>{
      disconnectSocket()
    }
  },[user])

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/userProfile" element={<HomePage />} />
            <Route path="/status" element={<Status />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
