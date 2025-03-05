import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const API_URL = "https://unitymedia-backend.vercel.app/src"; 
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
      });

      // console.log("Profile fetched:", response.data.data);
      setProfile(response.data.data);
    } catch (error) {
      console.log("Error fetching profile:", error);
    }
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