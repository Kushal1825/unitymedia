import React, { useEffect } from 'react';
import './App.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './component/Header/Header.jsx';
import Navbar from './component/NavBar/Navbar.jsx';
import { useDarkMode } from './component/DarkModeContext/DarkModeContext.jsx';
import ViewPost from './component/ViewPost/ViewPost.jsx';
import { Toaster } from 'react-hot-toast'
const App=()=> {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state?.background || location;

  useEffect(() => {

  }, [location, background]);

  return (
    <>
    <Toaster position='top-right'/>
    {/* Render background content (like Home, Explore, etc.) */}
    <Outlet />

    {/* If the modal is open, show ViewPost */}
    {location.pathname === "/p/:id"&&(
      <ViewPost
        onClose={() => navigate(-1)} 
      />
    )}
  </>

  );
}

export default App;
