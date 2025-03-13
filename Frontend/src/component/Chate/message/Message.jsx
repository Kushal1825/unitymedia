import React, { useState } from "react";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext.jsx";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";

const Message = ({ message, ownMessage,onUnsend }) => {
  const { dark } = useDarkMode();
  const [showOptions, setShowOptions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message?.content);
    setMenuOpen(false);
  };

  if (ownMessage) {
    // console.log(message);
    
    return (
      <li className="flex ownMessage"
      onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => {setShowOptions(false); setMenuOpen(false)}}
        >
      <div className="message flex">
          <div className="handler">
          {showOptions && (
          <div className="options-container">
            <button
              className="options-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <BsThreeDotsVertical />
            </button>
            {menuOpen && (
              <div className="dropdown-menu show">
                <button onClick={() => onUnsend(message._id)}>Unsend</button>
                <button onClick={handleCopy}>Copy</button>
              </div>
            )}
          </div>
        )}
          </div>
        <p>{message?.content}</p>
        <span className={`${message.seen ? "seen" : "Hellow"}`}>
          <IoCheckmarkDoneSharp />
        </span>
        
      </div>
    </li>
    );
  } else {
    return (
      <li className="flex">
        <div className="image-box">
          <img
            src={message?.sender?.avatar?.url || "/images/user.png"}
            alt=""
          />
        </div>
        <div className={`message flex ${dark ? "setdark" : ""}`}>
          <p>{message?.content}</p>
        </div>
      </li>
    );
  }
};

export default Message;
