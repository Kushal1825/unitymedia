import react, { useContext, useState } from "react";
import "./header.css";
import { NavLink } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
// import { useProfile } from "../../utils/ProfileContext.jsx";
import { MdOutlineDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";

import { CiSearch } from "react-icons/ci";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import ApiContext from "../../utils/ApiContext.jsx";
const Header = () => {
  const {
    dark,
    enableDarkMode,
    disableDarkMode,
  } = useDarkMode();


  const handleModeChange = (val) => {

    if (val) {
      console.log(val);
      
      enableDarkMode(); // Enable dark mode when the checkbox is checked
    } else {
      console.log(val);
      
      disableDarkMode(); // Disable dark mode when the checkbox is unchecked
    }
  };
  const navigate=useNavigate();

  const { profile } = useContext(ApiContext);
  // fetchProfile();
  // console.log(profile);

  return (
    <>
      <section className={`header-section ${dark ? "setdark" : ""}`}>
        <div className="container">
          <div className="row flex">
            <div className="logo">
              <NavLink to={`/`} className="flex">
                <div className="image-box">
                  <img src="../../../images/logo2.png" alt="" />
                </div>
                <h1 className={`${dark ? "setdark" : ""}`}>unity</h1>
              </NavLink>
            </div>
            

            <div className="user">
              <div className="content flex">
                {/* <div className="minview notification">
                <CiSearch/>
                </div> */}
                <div className="minview chat" onClick={()=>{navigate('/chates')}}>
                <IoChatbubbleEllipsesOutline/>
                </div>
                {/* <div className="minview search" onClick={()=>{}}>
                <IoMdNotificationsOutline/>
                </div> */}
                <div className="dark-mode flex">
                  
                  {dark?<button className={`theme-changer ${dark?"dark":""}`} onClick={()=>handleModeChange(false)}>
                    <CiLight />
                    </button>:
                    <button className={`theme-changer`} onClick={()=>handleModeChange(true)}>
                      <MdOutlineDarkMode />
                    </button>
                    }
                </div>
                <div className="image-box">
                  <NavLink to={`/profile`}>
                    <img
                      src={`${profile?.avatar.url}` || "/images/user.png"}
                      alt=""
                    />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Header;
