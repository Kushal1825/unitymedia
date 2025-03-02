import react, { useContext, useState } from "react";
import "./header.css";
import { NavLink } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
// import { useProfile } from "../../utils/ProfileContext.jsx";
import ApiContext from "../../utils/ApiContext.jsx";
const Header = () => {
  const {
    dark,
    enableDarkMode,
    disableDarkMode,
    handleNavbarToggle,
    text,
    navbarActive,
  } = useDarkMode();

  const handleModeChange = (e) => {
    if (e.target.checked) {
      enableDarkMode(); // Enable dark mode when the checkbox is checked
    } else {
      disableDarkMode(); // Disable dark mode when the checkbox is unchecked
    }
  };

  const { profile } = useContext(ApiContext);
  // fetchProfile();
  // console.log(profile);

  return (
    <>
      <section className={`header-section ${dark ? "setdark" : ""}`}>
        <div className="container">
          <div className="row flex">
            <div className="logo">
              <NavLink to={`/home`} className="flex">
                <div className="image-box">
                  <img src="../../../images/logo2.png" alt="" />
                </div>
                <h1 className={`${dark ? "setdark" : ""}`}>unity</h1>
              </NavLink>
            </div>

            <div className="user">
              <div className="content flex">
                <div className="dark-mode flex">
                  <p>{dark ? "Dark Theme" : "Light Theme"}</p>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={dark} // Checked state is based on `dark`
                      onChange={handleModeChange} // Handle the mode change
                    />
                    <span className="slider round"></span>
                  </label>
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
