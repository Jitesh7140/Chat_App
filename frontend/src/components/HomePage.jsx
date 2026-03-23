import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";
import ChatList from "../pages/chatSection/chatList";
import useLayoutStore from "../store/layoutStore";
import {getAllUsers} from "../services/user.Service"

function HomePage() {
  const SelectedContect = useLayoutStore((state) => state.SelectedContect);
  const [AllUsers,setAllUsers] = useState([]);

  const getAllUser = async()=>{
    try {
      const response = await getAllUsers()
      if(response.status === 'success'){
        setAllUsers(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    getAllUser();
  },[])

  console.log(AllUsers)



  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatList />
      </motion.div>
    </Layout>
  );
}

export default HomePage;
