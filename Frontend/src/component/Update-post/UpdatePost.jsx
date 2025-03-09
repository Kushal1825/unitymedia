import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./PostUpdate.css";
import ApiContext from "../../utils/ApiContext";
import toast from "react-hot-toast";

const PostUpdate = ({ post, onClose,setPostData }) => {
  const [caption, setCaption] = useState("");
  const { API_URL, token } = useContext(ApiContext);

  useEffect(() => {
    if (post?.caption) {
      setCaption(post.caption);
    }
  }, [post]); // Runs when `post` changes

  const handleSave = async () => {
    try {
      const res = await axios.patch(`${API_URL}/api/post/update/${post._id}`,
        { caption:caption },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setPostData(res.data.data[0]);
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("error:", error.message);
      console.log(error);
    }
  };

  return (
    <div className="post-update-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <div className="image-container">
          <img src={post?.image} alt="Post" />
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Update your caption..."
        />
        <div className="buttons">
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostUpdate;
