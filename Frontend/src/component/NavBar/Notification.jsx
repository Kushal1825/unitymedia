import axios from "axios";
import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApiContext from "../../utils/ApiContext";
import toast from "react-hot-toast";

const Notification = ({ notification,fetchNotification }) => {
  const nevigate = useNavigate();
  const {API_URL,token}= useContext(ApiContext);

  const acceptRequestHandler = async(id)=>{
   try {
    const response= await axios.post(`${API_URL}/api/follow/request/${id}/accept`,{},{
       headers:{
         Authorization:`Bearer ${token}`
       }
     });
 
     if(response.data.success){
       toast.success(response.data.message);
       await fetchNotification();
     }
     else{
       toast.error(response.data.message);
       await fetchNotification();
     }
   } catch (error) {
    console.log(error);
    
   }
  }

  if (notification.notification_type == "comment") {
    return (
      <div className="comment flex">
        <div className="image-box">
          <img
            src={notification?.sender?.avatar?.url || "images/user.png"}
            alt={notification?.sender?.avatar}
          />
        </div>
        <div className="detail flex">
          <div className="message flex">
            <p onClick={() => nevigate(`/${notification.sender.username}`)}>
              {notification?.sender?.username}</p>
            <span>Comment on your post.</span>
          </div>

          <div className="image-box">
            <img src={notification?.post?.image} alt="story photo" />
          </div>
        </div>
      </div>
    );
  } else if (notification.notification_type == "like") {
    return (
      <div className="like flex">
        <div className="image-box">
          <img
            src={notification?.sender?.avatar?.url || "images/user.png"}
            alt={notification?.sender?.avatar}
          />
        </div>
        <div className="detail flex">
          <div className="message flex">
            <p onClick={() => nevigate(`/${notification.sender.username}`)}>
              {notification?.sender?.username}
            </p>

            <span>{"Like Your post" || "Like your story"}</span>
          </div>

          <div className="image-box">
            <img src={notification?.post?.image} alt="story photo" />
          </div>
        </div>
      </div>
    );
  } else if (notification.notification_type == "follow") {
    return (
      <div className="follow flex">
        <div className="image-box">
          <img
            src={notification?.sender?.avatar?.url || "images/user.png"}
            alt={notification?.sender?.avatar}
          />
        </div>
        <div className="detail flex">
          <div className="message flex">
            <p onClick={() => nevigate(`/${notification.sender.username}`)}>
              {notification?.sender?.username}
            </p>
            <span>starting following you.</span>
          </div>

          <div className="btn flex">
            <button>follow</button>
            {/* <button>delete</button> */}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="following flex">
        <div className="image-box">
          <img
            src={notification?.sender?.avatar?.url || "images/user.png"}
            alt={notification?.sender?.avatar}
          />
        </div>
        <div className="detail flex">
          <div className="message flex">
            <p>{notification?.sender?.username}</p>

            <span>Send the follow request</span>
          </div>

          <div className="btn flex">
            <button onClick={()=>acceptRequestHandler(notification.sender._id)}>confirm</button>
            <button>cancel</button>
          </div>
        </div>
      </div>
    );
  }
};

export default Notification;
