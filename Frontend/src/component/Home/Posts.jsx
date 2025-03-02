import React, { useContext, useEffect, useState } from "react";
import { useDarkMode } from "../DarkModeContext/DarkModeContext";

import "./home.css";
import { format } from "timeago.js";
import { useLocation, useNavigate } from "react-router-dom";
import ApiContext from "../../utils/ApiContext.jsx";
import axios from "axios";
const Posts = ({ data,fetchPost }) => {
  const { dark } = useDarkMode();
  const [Postdata,setPostData]=useState(data);
  const [post, setPost] = useState(data);
  const { API_URL, token } = useContext(ApiContext);

  const [comment, setComment] = useState("");

  const fetchData= async ()=>{
    const response = await axios.get(`${API_URL}/api/post/p/${data._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.data) {
      setPostData((prev) => ({ ...response.data.data }));
      // console.log(postdata);
    }
  }

  const likeHandler = async () => {
    try {
      await axios.get(`${API_URL}/api/like/post/${data._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchData();
    } catch (error) {
      // console.log(error);
    }
  };

  const commentPost = async (e) => {
    try {
      e.preventDefault(); // Corrected method name

      console.log(comment);

      if (comment.length > 1) {
        const response = await axios.post(
          `${API_URL}/api/comment/post/${data._id}`,
          { content: comment },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh comments after successful post

        setComment(""); // Clear input field
      }
    } catch (error) {
      console.error("Error posting comment:", error); // Add error handling
    }
  };
  const navigate = useNavigate();
  const location = useLocation();

  const openPost = (id) => {
    navigate(`/p/${id}`, { state: { background: location } });
  };

  return (
    <>
      <div className="posts">
        <div className={`content ${dark ? "setdark" : ""}`}>
          <div className="person1">
            <div className={`content ${dark ? "setdark" : ""}`}>
              <div className="user flex">
                <div className="image-box">
                  <img
                    src={`${Postdata.author.avatar.url}` || "./images/user.png"}
                    alt=""
                  />
                </div>
                <div className="details flex">
                  <ul>
                    <li className="flex" style={{cursor:"pointer"}} onClick={()=>navigate("/"+Postdata.author.username)}>
                      <h4>{Postdata.author.username}</h4>
                    </li>
                    <li>
                      <span>{format(Postdata.createdAt)}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="media">
                <img src={`${Postdata.image}`} alt="" />
              </div>

              <div className="reaction">
                <ul className="flex">
                  {Postdata.isLike ? (
                    <li className="isLiked" onClick={likeHandler}>
                      <i className="fa-solid fa-heart"></i>
                    </li>
                  ) : (
                    <li onClick={likeHandler}>
                      <i className="fa-regular fa-heart"></i>
                    </li>
                  )}

                  <li
                    className="flex"
                    onClick={() => openPost(Postdata._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fa-regular fa-comment"></i>
                  </li>
                </ul>
                <div className="likes-count">
                  <span>{Postdata.likes} likes</span>
                </div>
                <div className="caption">
                  <p>{Postdata.caption}</p>
                </div>
                <div className="add-comment">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment((prev) => e.target.value)}
                    className={`comment-box ${dark ? "setdark" : ""}`}
                    placeholder="Add a comment..."
                  />
                  <button
                    disabled={comment.length === 0}
                    onClick={(e) => {
                      // Prevents modal from closing
                      commentPost(e); // Calls the comment function
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Posts;
