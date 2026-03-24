import io from "socket.io-client";
import useUserStore from "../store/useUserStore.js";

let socket = null;

export const intializeSocket = () => {
    if(socket){
        return socket;
    }
    const user = useUserStore()
    const backendURL = import.meta.env.VITE_API_URL;


    socket = io(backendURL,{
        withCredentials: true,
        transports: ["websocket", "polling"], 
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        
    });

    //connection event
    socket.on("connect" , ()=>{
        console.log("socket Connected")
        socket.emit("user_connect" , user._id)
    })

    socket.on("connect_error" , (error)=>{
        console.log("socket connection error", error)
    })

    //disconnection event
    socket.on("disconnect" , (reason)=>{
        console.log("socket disconnected" , reason)
    }) 

    return socket;
}

export const getSocket = () => {
    if(!socket){
       return  intializeSocket();
    }
    return socket;
}

export const disconnectSocket = () => {
    if(socket){
        socket.disconnect();
        socket = null;
    }
}