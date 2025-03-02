import React, { useContext, useEffect, useState } from "react";
import { format } from "timeago.js";
import "./viewpost.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import { NavLink } from "react-router-dom";
import axios from "axios";
import ApiContext from "../../utils/ApiContext.jsx";
const Comments = ({data}) => {
  const { dark } = useDarkMode();
  
  const [comment,setComment]=useState(data);
  // console.log(data);
  
  const {API_URL,token}= useContext(ApiContext);

  
  const likeHandler = async() => {
    const isLike = comment.isLiked;
    setComment({ ...comment, isLiked: !isLike });
    

    try {
      await axios.get(`${API_URL}/api/like/comment/${comment._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    } catch (error) {
      console.log(error);
    }
  };
  
  
  return (
    <>
      <div className="content flex">
        <div className="image-box">
          <img src={`${comment?.author?.avatar?.url}`|| "/images/user.png"} alt={comment?.author?.username} />
        </div>
        <div className="details flex">
          <ul>
            <li className="flex">
            <NavLink to={`/${comment?.author?.username}`}>
                    <h4>{comment?.author?.username}</h4>
                  </NavLink>
            </li>
            <li>
              <p>
                {comment.content}
                {comment.username}
              </p>
            </li>
          </ul>
          {comment.isLiked ? (
            <span className="isLiked" onClick={likeHandler}>
              <i className="fa-solid fa-heart"></i>
            </span>
          ) : (
            <span onClick={likeHandler}>
              <i className="fa-regular fa-heart"></i>
            </span>
          )}
        </div>
      </div>
    </>
  );
};
export default Comments;
