import React, { useContext, useState } from "react";
import axios from "axios";
import { FaLock, FaUnlock } from "react-icons/fa"; // Importing block/unblock icons
import ApiContext from "../../utils/ApiContext";
import toast from "react-hot-toast";

const BlockUnblockButton = ({ userId, isBlocked, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const {API_URL,token}=useContext(ApiContext);
  

  const handleToggleBlock = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/user/admin/toggleblock/${userId}`,{},{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if (response?.data?.success) {
        onStatusChange(!isBlocked);
        toast.success(response?.data?.message)
      }
    } catch (error) {
      // console.error("Error toggling user block status:", error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggleBlock}
      disabled={loading}
      style={{
        padding: "10px 15px",
        color: isBlocked ? "green" : "red",
        // color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        opacity: loading ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      {loading ? (
        "Processing..."
      ) : isBlocked ? (
        <>
          <FaUnlock style={{ marginRight: "8px" }} /> Unblock User
        </>
      ) : (
        <>
          <FaLock style={{ marginRight: "8px" }} /> Block User
        </>
      )}
    </button>
  );
};

export default BlockUnblockButton;
