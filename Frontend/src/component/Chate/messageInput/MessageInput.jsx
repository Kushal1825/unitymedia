import React, { useContext, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { FiSend, FiSmile } from "react-icons/fi";
import "./MessageInput.css";
import toast from "react-hot-toast";
import axios from "axios";
import ApiContext from "../../../utils/ApiContext.jsx";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext.jsx";

const MessageInput = ({onMessageSend}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const {API_URL,token}= useContext(ApiContext);
  const {dark}=useDarkMode();

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendMessage = async(e) => {
    e.preventDefault();
    
    
    if (message.trim()) {
      // console.log(message);
      await onMessageSend(message);
      // console.log(message);
      
      setMessage("");
    }else return;
  };

  return (
    <form className={`message-input-container ${dark?"dark":""}`} onSubmit={handleSendMessage}>
      <div className="emoji-picker">
        <FiSmile onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
        {showEmojiPicker && (
          <div className="emoji-dropdown">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        className={`${dark?"dark":""}`}
        onChange={(e) => setMessage(e.target.value)}
        autoComplete={false}
      />
      <button className="send-button">
        <FiSend />
      </button>
    </form>
  );
};

export default MessageInput;
