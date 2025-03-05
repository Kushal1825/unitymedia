import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import toast from "react-hot-toast";
import axios from "axios";
import ApiContext from "../../utils/ApiContext.jsx";
import Message from "./message/Message.jsx";
import MessageInput from "./messageInput/MessageInput.jsx";
import { useSocket } from "../../context/SocketContext.jsx";

const PersonalChates = ({ selectedConversation,setConversation }) => {
  const { dark } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const { API_URL, token, profile } = useContext(ApiContext);
  // console.log(selectedConversation);
  const {socket} = useSocket();
  const messageEndRef = useRef();
  const currentUser = profile;

  useEffect(()=>{
    socket.on('newMessage',(message)=>{
      
      if(message.sender===selectedConversation.userId){
        console.log(message.conversationId,selectedConversation.id);
        setMessages((prevMessages)=>[...prevMessages,message]);
      }      
      setConversation(prevConvs =>{
        const updatedConversations = prevConvs.map(conversation=>{

          if(conversation._id == message.conversationId){
            
            return {
              ...conversation,
              lastMessage:{
                content:message?.content,
                sender:message.senderId
              }
            }
          }
          return conversation;
        })
        return updatedConversations;
      })

    });

    return () => socket.off('newMessage');
  },[socket]);

  useEffect(()=>{
    const lastMessageIsfromOtherUser=messages.length && messages[messages.length-1].sender._id!==currentUser._id
    if(lastMessageIsfromOtherUser){
      socket.emit("markMessagesAsSeen",{
        conversationId:selectedConversation.id,
        userId:selectedConversation.userId
      })
    }
    
    socket.on('messagesSeen',({conversationId})=>{

      
      if(selectedConversation.id === conversationId){
        setMessages(prev=> {
          const updatedMessages = prev.map(message=>{
            if(!message.seen){
              return {
                ...message,
                seen:true,
              }
            }
            return message
          })
          return updatedMessages;
        })
      }
    })
  },[socket,messages,selectedConversation])

  useEffect(()=>{
    messageEndRef.current?.scrollIntoView({ behavior: "smooth",block:"end" });
  },[socket,messages]);


  const sendMessageHandler = async (message) => {
    try {
      const res = await axios.post(`${API_URL}/api/message/send`, {
        message: message,
        recipientId: selectedConversation.userId,
      },{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if(res.data.success){
        setMessages(prev=>[...prev,res.data.data]);
        setConversation(prevConvs =>{
          const updatedConversations = prevConvs.map(conversation=>{

            if(conversation._id == selectedConversation.id){
              
              return {
                ...conversation,
                lastMessage:{
                  content:message,
                  sender:res?.data?.data?.sender
                }
              }
            }
            return conversation;
          })
          return updatedConversations;
        })

      }
    } catch (error) {
      
      toast.error("Error:", error.message);
    }
  };

  const getMessage = async () => {
    setIsLoading(true);
    setMessages([]);


    try {
      if (selectedConversation.mock) return;
      
      const res = await axios.get(
        `${API_URL}/api/message/get/${selectedConversation?.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setMessages((prev) => res.data.data);
        // console.log(res.data.data);

        // toast.success("message fetch successfully");
      }
    } catch (error) {
      toast.error("Error :", error.messages);
    }finally{
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getMessage();
  }, [selectedConversation]);

  return (
    <>
      <div className={`chate ${dark?"dark":""}`}>
        <div className="content">
          <div className={`user-info flex ${dark ? "setdark" : ""}`}>
            <div className="profile flex">
              <div className="image-box">
                <img
                  src={selectedConversation?.userProfilePic || "/images/user.png"}
                  alt="Krunal"
                />
              </div>
              <ul>
                <li>
                  <h4>{selectedConversation?.username}</h4>
                </li>
              </ul>
            </div>
          </div>
          <div className="chates-list">
            <div className="content ">
              {isLoading && (
                <div className="message-skeleton-container">
                  {Array(4)
                    .fill("")
                    .map((_, index) => (
                      <div
                        className={`message-skeleton ${
                          index % 2 === 0 ? "sent" : "received"
                        }`}
                        key={index}
                      >
                        <div className="text"></div>
                      </div>
                    ))}
                </div>
              )}
              <ul>
                {!isLoading &&
                  messages.map((message) => (
                    <div className="flex flex-col"
                    style={{height:"100%",overflowY:"auto"}}
                      ref={messages.length-1 === messages.indexOf(message) ? messageEndRef : null}
                    >
                      <Message
                        key={message._id}
                        message={message}
                        ownMessage={currentUser?._id === message?.sender?._id || currentUser?._id === message?.sender }
                      />
                    </div>
                  ))}
              </ul>
            </div>
          </div>
          <MessageInput onMessageSend={sendMessageHandler} />
        </div>
      </div>
    </>
  );
};
export default PersonalChates;
