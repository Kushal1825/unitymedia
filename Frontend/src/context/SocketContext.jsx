import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import ApiContext from "../utils/ApiContext";


const SocketContext = createContext();

export const useSocket = ()=>{
  return useContext(SocketContext);
}



export const SocketContextProvider = ({ children }) => {
  const [onlineUsers,setOnlineUser]= useState([]);
  const [socket, setSocket] = useState(null);
  const { profile } = useContext(ApiContext);
  useEffect(() => {
    const socket = io("https://unitymedia-backend.onrender.com", {  //"https://unitymedia-backend.onrender.com"
      query: {
        userId: profile?._id,
      },
    });
    setSocket(socket);

    socket.on("getOnlineUsers",(users)=>{
      setOnlineUser(users);
    })
    
    return () => socket && socket.close();
    
  }, [profile?._id]);
  // console.log(onlineUsers,"Online users");
  return (
    <SocketContext.Provider value={{socket,onlineUsers}}>{children}</SocketContext.Provider>
  );
};
