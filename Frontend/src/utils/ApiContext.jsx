import axios from "axios";
import React, { createContext, useState, useEffect } from "react";


const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const API_URL ="https://unitymedia-backend.onrender.com";
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState(null); 
  
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  };

  useEffect(() => {
    const refreshToken = getCookie("refreshToken");
    // console.log(refreshToken);
    

    if (refreshToken && refreshToken !== token) {
      setToken(refreshToken);
    }
  }); 
  


  useEffect(() => {

    if (token) {
      fetchProfile(token);
    }
  }, [token]); 

  // Function to fetch and store user profile
  const fetchProfile = async (authToken) => {
    try {

      const response = await axios.get(`${API_URL}/api/user/c/user`, {
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      // console.log("Profile fetched:", response.data.data);
      if(response?.data?.success)
      {
        setProfile(response.data.data);
        fetchUserDetails(response?.data?.data?.username)
      }else{

      }
    } catch (error) {
      console.log("Error fetching profile:", error);

      if(error.response?.status === 403){
        clearCookiesAndLogout();
      }
    }
  };
  const fetchUserDetails=async(username)=>{
    try {
      const res = await axios.get(
        `${API_URL}/api/user/profile/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setProfile((prev) => ({ ...res.data.data[0] }));
        // console.log(userProfile);
      }
    } catch (error) {
      console.log("Error fetching Profile:",error);
      
    }
  }

  const clearCookiesAndLogout = () => {
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setToken(""); // Clear state
    setProfile(null);
    window.location.href = "/login";
  };

  return (
    <ApiContext.Provider
      value={{
        API_URL,
        token,
        setToken,
        profile,
        fetchProfile,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;