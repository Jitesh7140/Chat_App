import io from "socket.io-client";
import useUserStore from "../store/useUserStore.js"; // Aapka Zustand store

let socket = null;

export const intializeSocket = () => {
    if (socket) {
        return socket;
    } 

    const { user } = useUserStore.getState(); 
    
    if (!user.user?._id) {
        console.error("Socket initialization failed: No user found in store.");
        return null;
    }

    console.log("Current State in Service:", user);

    const backendURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    socket = io(backendURL, {
        withCredentials: true,
        transports: ["websocket", "polling"], 
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // connection event
    socket.on("connect", () => {
        console.log("socket Connected ✅" );
        // User ID bhej rahe hain connection par
        socket.emit("user_connect", user.user._id);
    });

    socket.on("connect_error", (error) => {
        console.log("socket connection error ❌", error);
    });

    // disconnection event
    socket.on("disconnect", (reason) => {
        console.log("socket disconnected ⚠️", reason);
    }); 

    return socket;
}

export const getSocket = () => {
    // Agar socket nahi hai, toh initialize karo
    if (!socket) {
        return intializeSocket();
    }
    return socket;
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket Manual Disconnect");
    }
}