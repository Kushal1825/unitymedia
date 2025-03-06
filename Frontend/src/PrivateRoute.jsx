import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./component/Header/Header.jsx";
import Navbar from "./component/NavBar/Navbar.jsx";
import ApiContext from "./utils/ApiContext.jsx";
const PrivateRoute = () => {
  const [isLogin, setIsLogin] = useState(false); 
  const navigate = useNavigate();
  const location=useLocation();
  const { token } = useContext(ApiContext);

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  };
  

  const checkAuthentication = async() => {
      // Validate the token by calling an API endpoint
      const token = getCookie('refreshToken');
      if(token){
        setIsLogin(true);
        navigate(location)
      }
      else{
        setIsLogin(false);
      }
  };

  

  useEffect(() => {
    checkAuthentication();
  }, [navigate]); // Re-run if fetchProfile or navigate changes


  if (isLogin === null) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  return isLogin ? (
    <>
      <Header />
      <Navbar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;