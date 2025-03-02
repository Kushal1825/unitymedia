import React, { useContext, useEffect, useState } from "react";
import { format } from "timeago.js";
import "./viewpost.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import Comments from "./Comments";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ApiContext from "../../utils/ApiContext.jsx";
import axios from "axios";
const ViewPost = () => {
  const { dark } = useDarkMode();
  const { API_URL, token } = useContext(ApiContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [postdata, setPostData] = useState(null);
  const [commentData, setCommentData] = useState([]);
  const [comment, setComment] = useState(null);

  const fetchData = async () => {
    const response = await axios.get(`${API_URL}/api/post/p/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.data) {
      setPostData((prev) => ({ ...response.data.data }));
      // console.log(postdata);
    }

    const commentResponse = await axios.get(
      `${API_URL}/api/comment/post/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log(commentResponse.data.data);

    if (commentResponse.data.data) {
      setCommentData((prev) => commentResponse.data.data);
      // console.log(commentData);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  const likeHandler = async () => {
    try {
      await axios.get(`${API_URL}/api/like/post/${id}`, {
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

      // console.log(comment);

      if (comment.length > 1) {
        const response = await axios.post(
          `${API_URL}/api/comment/post/${id}`,
          { content: comment },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        
          await fetchData(); // Refresh comments after successful post
        

        setComment(""); // Clear input field
      }
    } catch (error) {
      console.error("Error posting comment:", error); // Add error handling
    }
  };

  return (
    <section className="viewpost-section">
      {/* Clicking this closes the modal */}
      <div className="container" onClick={handleClose}>
        <div className="row flex">
          <div
            className={`main-box flex ${dark ? "setdark" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Post Content */}
            <div className="box post">
              <div className="content">
                <div className="image-box">
                  <img src={`${postdata?.image}`} alt="" />
                </div>
              </div>
            </div>

            {/* Post Details */}
            <div className="box detail">
              <div className="content">
                {/* User Info */}
                <div className="user flex">
                  <div className="image-box">
                    <img
                      src={
                        `${postdata?.author?.avatar?.url}` || "/images/user.png"
                      }
                      alt=""
                    />
                  </div>
                  <div className="details flex">
                    <ul>
                      <li className="flex">
                        <NavLink to={`/${postdata?.author?.username}`}>
                          <h4>{postdata?.author?.username}</h4>
                        </NavLink>
                      </li>
                      <li>
                        <span>{format(postdata?.createdAt)}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="comments">
                  {commentData.length == 0 ? (
                    <>No comment Yet</>
                  ) : (
                    commentData.map((comment) => {
                      // console.log(comment);

                      return <Comments key={comment._id} data={comment} />;
                    })
                  )}
                </div>

                {/* Reactions (Likes, Comments) */}
                <div className="reaction">
                  <ul className="flex">
                    <li
                      className={postdata?.isLike ? "isLiked" : ""}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal close
                        likeHandler();
                      }}
                    >
                      <i
                        className={`fa-${
                          postdata?.isLike ? "solid" : "regular"
                        } fa-heart`}
                      ></i>
                    </li>

                    <li className="flex" onClick={(e) => e.stopPropagation()}>
                      <i className="fa-regular fa-comment"></i>
                    </li>
                  </ul>
                  <div className="likes-count">
                    <span>{postdata?.likes} likes</span>
                  </div>
                  <div className="caption">
                    <p>{postdata?.caption}</p>
                  </div>

                  {/* Add Comment Section */}
                  <div
                    className="add-comment"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      className={`comment-box ${dark ? "setdark" : ""}`}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents modal from closing
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
      </div>
    </section>
  );
};

export default ViewPost;
