import React, { useContext, useEffect, useState } from "react";
import "./Chate.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import PersonalChates from "./PersonalChate.jsx";
import ApiContext from "../../utils/ApiContext.jsx";
import axios from "axios";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import Checkmark from "../../utils/checkMarkSeen.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { RiChatVoiceAiFill } from "react-icons/ri";
const Chate = () => {
  const { dark, navbarActive, setNavbarActive } = useDarkMode();

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversation, setConversation] = useState([]);
  const { API_URL, token, profile } = useContext(ApiContext);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchText, setSearchText] = useState("");
  const {socket,onlineUsers}= useSocket();

  const getConversation = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/message/get/conversation`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        // console.log(res.data.data);
        setConversation(res.data.data);

        setLoadingConversations(false);

        // toast.success("data fetch successfully");
      } else {
        // toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Error", error.message, "error");
    }
  };

  const searchHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get(`${API_URL}/api/user/profile/${searchText}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const searchUser = res?.data?.data[0];
      // console.log(searchUser);

      if (res.data.success) {
        const messagingYourSelf = searchUser?._id == profile?._id;
        if (messagingYourSelf) {
          toast.error("You cannot message your self");
        }
        else{

          const conversationAlreadyExists = conversation.find(
            (conversation) =>
              conversation.participants[0]?._id === searchUser?._id
          );
          if (conversationAlreadyExists) {
            setSelectedConversation({
              id: conversationAlreadyExists._id,
              userId: searchUser._id,
              username: searchUser.username,
              userProfilePic: searchUser?.avatar?.url,
            });
          } else {
            const mockConversation = {
              mock: true,
              lastMessage: {
                content: "",
                sender: "",
              },
              _id: Date.now(),
              participants: [
                {
                  _id: searchUser._id,
                  username: searchUser.username,
                  avatar: searchUser?.avatar,
                },
              ],
            };
  
            setConversation((prev) => [...prev, mockConversation]);
        }
          
        }
      } else {
        toast.error("User is not exists");
      }

    } catch (error) {
      console.log(error);

      // toast.error("Error:",error.response.data.message);
    } finally {
      setSearchText("");
    }
  };

useEffect(()=>{
  socket?.on("messagesSeen",({conversationId})=>{
    setConversation(prev=>{
      const updateConversation = prev.map((conversation)=>{

        if(conversation._id === conversationId){
          // console.log("Hellw2");
          
          return{
            ...conversation,
            lastMessage:{
              ...conversation.lastMessage,
              seen:true
            }
          };
        }
        return conversation;
      })
      return updateConversation;
    })
  })
},[socket,setConversation])
  useEffect(() => {
    getConversation();
    setNavbarActive(true);
  }, []);
  return (
    <>
      <section
        className={`Chate-section ${dark ? "setdark" : ""} ${
          navbarActive ? "compromise" : ""
        }`}
      >
        <div className="container">
          <div className="row flex">
            <div className={`user ${dark?"dark":""}`}>
              <div className="content">
                <div className="heading">
                  <h3>Messages</h3>
                  <form onSubmit={searchHandler}>
                    <div className="search-box flex">
                      <input
                        type="search"
                        name=""
                        value={searchText}
                        onChange={(e) =>
                          setSearchText((prev) => e.target.value)
                        }
                        placeholder="Search user for message...."
                        className={`${dark ? "setdark" : ""}`}
                      />
                      <button>
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </button>
                    </div>
                  </form>
                </div>
                {loadingConversations && (
                  <div className="conversation-skeleton">
                    {Array(6)
                      .fill("")
                      .map((_, index) => (
                        <div className="skeleton-item" key={index}>
                          <div className="avatar"></div>
                          <div className="text">
                            <div className="name"></div>
                            <div className="message"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <div className="users-list">
                  <div className="content">
                    {!loadingConversations &&
                      conversation.map((conversation) => (
                        <div
                          key={conversation?._id}
                          className={`person flex ${dark ? "setdark" : ""}`}
                          onClick={() =>
                            setSelectedConversation((prev) => ({
                              id: conversation?._id,
                              username: conversation?.participants[0].username,
                              userId: conversation?.participants[0]._id,
                              userProfilePic:
                                conversation?.participants[0]?.avatar?.url,
                              mock: conversation?.mock,
                            }))
                          }
                        >
                          <div className={`image ${onlineUsers.includes(conversation.participants[0]._id)? "isOnline":""} ${dark?"dark":""}`}>
                            <img
                              src={
                                conversation.participants[0]?.avatar?.url ||
                                "/images/user.png"
                              }
                              alt={conversation?.name}
                            />
                          </div>
                          <ul>
                            <li className="flex">
                              <h4>{conversation.participants[0].username}</h4>
                              {/* <span>{conversation.createdAt}</span> */}
                            </li>
                            <li>
                              <p>
                                {profile?._id ==
                                conversation?.lastMessage?.sender ? (
                                  <div className={`${conversation?.lastMessage?.seen ? "seen":""}`}><IoCheckmarkDoneSharp /></div>
                                ) : (
                                  ""
                                )}
                                {conversation?.lastMessage?.content.length > 20
                                  ? conversation?.lastMessage?.content.substring(
                                      0,
                                      20
                                    ) + "..."
                                  : conversation?.lastMessage?.content}
                              </p>
                            </li>
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {!selectedConversation ? (
              <div className={`no-conversation-container ${dark?"dark":""}`}>
                <div className="icon"><RiChatVoiceAiFill /></div>
                <h2>Select a conversation</h2>
                <p>
                  And start The Messaging
                </p>
              </div>
            ) : (
              <PersonalChates
                selectedConversation={selectedConversation}
                setConversation={setConversation}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};
export default Chate;
