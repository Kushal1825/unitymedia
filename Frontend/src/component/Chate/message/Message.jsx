import React from "react";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext.jsx";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

const Message = ({ message, ownMessage }) => {
  const { dark } = useDarkMode();

  if (ownMessage) {
    // console.log(message);
    
    return (
      <li className="flex ownMessage">
        <div className={`message flex ${dark ? "setdark" : ""}`}>
          <p>{message?.content} <span className={`${message.seen?"seen":"Hellow"}`}><IoCheckmarkDoneSharp/></span></p>
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
