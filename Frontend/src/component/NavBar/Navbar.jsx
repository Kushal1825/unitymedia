import React, { useContext, useEffect, useState } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import Notification from "./Notification.jsx";
import axios from "axios";
import ApiContext from "../../utils/ApiContext.jsx";
import { MdLogout } from "react-icons/md";
import toast from "react-hot-toast";
// import { ProfileProvider, useProfile } from "../../utils/ProfileContext.jsx";
function Navbar() {
  // dark mode code start
  const { dark, handleNavbarToggle, text, navbarActive, setNavbarActive } =
    useDarkMode();
  // dark mode code end
  const [slide, setSlide] = useState(false);
  const [settingpanel, setSettingPanel] = useState(false);
  const [notification, setNotification] = useState(false);

  const [search, setSearch] = useState(false);
  const {API_URL,token}= useContext(ApiContext);
  const [searchQuery,setSearchQuery]=useState("");
  const [searchUser,setSearchUser]=useState([]);

  const navigate = useNavigate();

  const [notificationsdata, setNotificationsdata] = useState([]);

  const fetchNotification=async()=>{
    const response = await axios.get(`${API_URL}/api/notification/my`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });

    // console.log(response.data.data);

    setNotificationsdata(prev=>response.data.data);
    
  }

  const searchHandler = async ()=>{
    try {
      const response = await axios.get(`${API_URL}/api/user/search/${searchQuery}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      // ma(response.data.data);
      setSearchUser(prev=>response?.data?.data)
      
    } catch (error) {
      console.log(error);
      
    }
  };

  const handleLogout = async()=>{
    try {
      const response = await axios.post(`${API_URL}/api/user/logout`,{},{
        headers:{
          Authorization:`Bearer ${token}`
        },
        withCredentials:true,
      });

      if(response.data.success){
        toast.success("Logout successfully");
        navigate("/login");
      }else{
        toast.error(response.data.message)
      }
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    if (searchQuery.trim() === '') {
      setSearchUser([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      searchHandler();
    }, 1000);

    return () => clearTimeout(debounceTimer);

  },[searchQuery])

  useEffect(()=>{
    fetchNotification();
  },[])

  const handlesearch = () => {
    setSlide(true);
    setSearch(true);
    setSettingPanel(false);
    setNotification(false);
  };

  const handleSetting = () => {
    setSlide(true);
    setSettingPanel(true);
    setSearch(false);
    setNotification(false);
  };

  const handlenotification = () => {
    setSlide(true);
    setNotification(true);
    setSearch(false);
    setSettingPanel(false);
  };

  const handleslideclose = () => {
    setSlide(false);
    setSearch(false);
    setSettingPanel(false);
    setNotification(false);
  };

  return (
    <>
      <section
        className={`Navbar-section ${navbarActive ? "slide" : ""} ${
          dark ? "setdark" : ""
        }`}
      >
        <div className="container">
          <div className="row">
            <div
              className={`slide-page  ${dark ? "setdark" : ""} ${
                slide ? "slideDeactive" : ""
              }`}
            >
              <div
                className={`notification-panel ${dark ? "setdark" : ""} ${
                  notification ? "notificationActive" : ""
                }`}
              >
                <div className="heading flex">
                  <h3>Notification</h3>
                  <button onClick={handleslideclose}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div className="content">
                  <ul>
                    {notificationsdata.map((notification) => (
                      <li key={notification._id}>
                        <Notification fetchNotification={fetchNotification}  notification={notification} />
                      </li>
                    ))}
                  </ul>
                  {notificationsdata.length>0?"":"No notification Yet"}
                </div>
              </div>
              <div
                className={`search-panel ${dark ? "setdark" : ""} ${
                  search ? "searchActive" : ""
                }`}
              >
                <div className="heading flex">
                  <h3>search</h3>
                  <button onClick={handleslideclose}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                  <form action="">
                    <div className="search-box flex">
                      <input
                        type="search"
                        name=""
                        id=""
                        value={searchQuery}
                        onChange={(e)=>setSearchQuery(prev=>e.target.value)}
                        placeholder="Search user for message...."
                        className={`${dark === "true" ? "setdark" : ""}`}
                      />
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                  </form>
                </div>
                <div className="content">
                  <ul>
                    {searchUser.map((user) => (
                      <li key={user?._id}>
                        <div className="person flex">
                          <div className="image-box">
                            <img src={user?.avatar?.url || "/images/user.png"} alt={user?.username} />
                          </div>
                          <div className="detail flex">
                            <div className="message flex">

                              <p onClick={()=>navigate(`/${user?.username}`)}>{user?.username}</p>

                              {/* <span>{user.relation}</span> */}
                            </div>

                           
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div
              className={`box ${dark ? "setdark" : ""} ${
                navbarActive ? "slide" : ""
              }`}
            >
              <div className="content">
                <div
                  className={`main-menu ${dark ? "setdark" : ""} ${
                    navbarActive ? "slide" : ""
                  }`}
                >
                  
                  <ul>
                    <li>
                      <NavLink
                        to={`/home`}
                        onClick={() => setNavbarActive(false)}
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            dark ? "setdark" : ""
                          } ${navbarActive ? "slide" : ""}`
                        }
                      >
                        <i className="fa-solid fa-house"></i> <p>Home</p>
                      </NavLink>
                    </li>
                    <li>
                      <span
                        onClick={handlesearch}
                        className={`flex ${dark ? "setdark" : ""} ${
                          navbarActive ? "slide" : ""
                        }`}
                      >
                        {" "}
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <p>Search</p>
                      </span>
                    </li>
                    <li>
                      <NavLink
                        to={`/explore`}
                        onClick={() => setNavbarActive(false)}
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            dark ? "setdark" : ""
                          } ${navbarActive ? "slide" : ""}`
                        }
                      >
                        <i className="fa-solid fa-hurricane"></i>
                        <p>Explore</p>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to={`/chates`}
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            dark ? "setdark" : ""
                          } ${navbarActive ? "slide" : ""}`
                        }
                      >
                        <i className="fa-solid fa-comments"></i> <p>Chate</p>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={`/post`}
                        onClick={() => setNavbarActive(false)}
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            dark ? "setdark" : ""
                          } ${navbarActive ? "slide" : ""}`
                        }
                      >
                        <i className="fa-solid fa-circle-plus"></i>{" "}
                        <p>Create</p>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={`/profile`}
                        onClick={() => setNavbarActive(false)}
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            navbarActive ? "slide" : ""
                          } ${dark ? "setdark" : ""}`
                        }
                      >
                        <i className="fa-solid fa-address-card"></i>
                        <p>Profile</p>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={`/profileedit`}
                        onClick={() => setNavbarActive(false)}
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            dark ? "setdark" : ""
                          } ${navbarActive ? "slide" : ""}`
                        }
                      >
                        <i className="fa-solid fa-gear"></i>
                        <p>Setting</p>
                      </NavLink>
                    </li>

                    <li>
                      <span
                        onClick={handlenotification}
                        className={`flex ${dark ? "setdark" : ""} ${
                          navbarActive ? "slide" : ""
                        }`}
                      >
                        <i className="fa-solid fa-bell"></i> <p>Notification</p>
                      </span>
                    </li>
                    <li>
                      <span
                        onClick={handleLogout}
                        className={`flex ${dark ? "setdark" : ""} logout  ${
                          navbarActive ? "slide" : ""
                        }`}
                      >
                        <div><MdLogout /> </div> <p>Logout</p>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Navbar;
