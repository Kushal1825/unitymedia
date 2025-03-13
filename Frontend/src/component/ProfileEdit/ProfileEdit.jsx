import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./profileedit.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext";
import ApiContext from "../../utils/ApiContext";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingButton from "../LoadingButton/LoadingButton";
// import { BlockedUser } from "../../../../backend/src/controller/user.controller";
const ProfileEdit = () => {
  const { dark, navbarActive } = useDarkMode();

  const [activeSection, setActiveSection] = useState("edit-profile");
  const { profile } = useContext(ApiContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const { API_URL, token, fetchProfile } = useContext(ApiContext);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    cPassword: "",
  });

  const [closeFriends, setCloseFriend] = useState([]);

  const fetchCloseFriends = async()=>{
    try {
      const res= await axios.get(`${API_URL}/api/user/list/closeFriend`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      // console.log(res.data.data);
      

      if(res.data.success){
        setCloseFriend(res.data.data);
      }else{

      }
    } catch (error) {
      console.log(error);
      
    }
  };

  const handleChange = async (type, value) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/api/user/notification-settings`,
        { [type]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if(res.data.success){
        toast.success("Update Successfully");
        await fetchProfile(token);
      }else{
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedList = async()=>{
    try {
      const res= await axios.get(`${API_URL}/api/user/block/list`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      // console.log(res.data.data);
      

      if(res.data.success){
        setBlockedList(res.data.data);
      }else{

      }
    } catch (error) {
      console.log(error);
      
    }
  }


 const handleBlockList = async(id)=>{
    try {
        const res = await axios.patch(`${API_URL}/api/user/unblock/${id}`,{},{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        if(res.data.success){
          toast.success(res.data.message);
        }
      
    } catch (error) {
      console.log(error);
      
    }finally{
      await fetchBlockedList();
    }
  }

  const handleCloseFriend=async(id,isCloseFriend)=>{
    try {
      if(!isCloseFriend){
        const res = await axios.patch(`${API_URL}/api/user/closeFriend/add/${id}`,{},{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        if(res.data.success){
          toast.success(res.data.message);
        }
      }
      else{
        
        const res = await axios.patch(`${API_URL}/api/user/closeFriend/remove/${id}`,{},{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        if(res.data.success){
          toast.success(res.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      
    }finally{
      await fetchCloseFriends();
    }
  }
  const [blockedList,setBlockedList]=useState([]);
  const [userProfileData, setUserProfiledata] = useState(null);

  useEffect(() => {
    if (profile) {
      fetchCloseFriends();
      fetchBlockedList();
      setUserProfile(profile);
      setUserProfiledata({
        username: profile?.username,
        fullName: profile?.fullName,
        bio: profile?.bio,
      });
    }
  }, [profile]);

  const handlePrivacySetting = async () => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/user/update-privacy`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Profile update successfully");
        fetchProfile(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      userProfileData.username.trim() === "" &&
      userProfileData.fullName.trim() === ""
    ) {
      setLoading(false);
      toast.error("Username and Full Name require");
      return;
    }
    console.log("check2");

    const isUserProfileUpdate =
      userProfileData.username !== userProfile.username ||
      userProfileData.fullName !== userProfile.fullName ||
      userProfileData.bio !== userProfile.bio;
    if (isUserProfileUpdate) {
      console.log("check3");

      try {
        const res = await axios.patch(
          `${API_URL}/api/user/update-profile`,
          userProfileData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          fetchProfile(token);
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Profie updated successfully");
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (!file) return;

    setLoading(true);
    // setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.patch(
        `${API_URL}/api/user/update-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        fetchProfile(token);
      }
      toast.success("Profile Picture updated Successfully");
    } catch (err) {
      // setError("Failed to upload profile picture. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (section) => {
    setActiveSection(section);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const matchNewandcPassword =
        passwordData.newPassword === passwordData.cPassword;
      const checkNewandoldisnotsame =
        passwordData.newPassword !== passwordData.oldPassword;
      const checkPasswordIsNotEmpty = passwordData.newPassword.trim() !== "";
      if (
        matchNewandcPassword &&
        checkNewandoldisnotsame &&
        checkPasswordIsNotEmpty
      ) {
        const res = await axios.patch(
          `${API_URL}/api/user/change-password`,
          passwordData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          toast.success(res.data.message);
          setPasswordData({
            oldPassword: "",
            newPassword: "",
            cPassword: "",
          });
        } else {
          toast.error(res.data.message);
        }
      } else {
        if (matchNewandcPassword)
          toast.error("new password and confirm password unmatched");
        else if (checkNewandoldisnotsame)
          toast.error("New and Old password are same");
        else {
          toast.error("All field required");
        }
      }
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  };


  const isActive = (section) => activeSection === section;

  return (
    <section
      className={`profileedit-section ${dark ? "setdark" : ""} ${
        navbarActive ? "compromise" : ""
      }`}
    >
      <div className="container">
        <div className="row flex">
          <div className="option">
            <div className="content">
              <ul className={`${dark ? "setdark" : ""}`}>
                {[
                  {
                    id: "edit-profile",
                    label: "Edit Profile",
                    icon: "fa-circle-user",
                  },
                  {
                    id: "notification",
                    label: "Notification",
                    icon: "fa-bell",
                  },
                  {
                    id: "account-privacy",
                    label: "Account Privacy",
                    icon: "fa-lock",
                  },
                  {
                    id: "close-friends",
                    label: "Close Friends",
                    icon: "fa-star-of-david",
                  },
                  { id: "blocked", label: "Blocked", icon: "fa-ban" },
                  {
                    id: "security",
                    label: "Password and Security",
                    icon: "fa-shield-halved",
                  },
                  {
                    id: "personal-details",
                    label: "Personal Details",
                    icon: "fa-id-badge",
                  },
                ].map(({ id, label, icon }) => (
                  <li
                    key={id}
                    className={`flex ${isActive(id) ? "active" : ""}`}
                    onClick={() => handleContentClick(id)}
                  >
                    <i className={`fa-solid ${icon}`}></i>
                    <p>{label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="setting">
            <div className="content">
              <div
                className={`edit-profile ${dark ? "setdark" : ""} ${
                  isActive("edit-profile") ? "active" : ""
                }`}
              >
                <div className="content">
                  <div className="heading">
                    <h3>Edit Profile</h3>
                  </div>
                  <form action="#" onSubmit={handleProfileUpdate}>
                    <ul>
                      <li className={`flex ${dark ? "setdark" : ""}`}>
                        <label htmlFor="profile-photo" className="image-box">
                          {" "}
                          <img
                            src={userProfile?.avatar?.url || "/images/user.png"}
                            alt="Profile"
                          />
                        </label>
                        <input
                          type="file"
                          hidden
                          name="upload-profile"
                          id="profile-photo"
                          disabled={loading}
                          accept="image/*" // Accept only image files
                          onChange={handleFileUpload} // Handle file input changes
                        />
                        <div className="details">
                          <div className="flex">
                            <label for="username">Username:</label>
                            <input
                              type="text"
                              placeholder="username"
                              id="username"
                              onChange={(e) =>
                                setUserProfiledata((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }))
                              }
                              value={userProfileData?.username}
                            />
                          </div>
                          <div className="flex">
                            <label for="fullName">FullName:</label>
                            <input
                              type="text"
                              placeholder="full name"
                              id="fullName"
                              onChange={(e) =>
                                setUserProfiledata((prev) => ({
                                  ...prev,
                                  fullName: e.target.value,
                                }))
                              }
                              value={userProfileData?.fullName}
                            />
                          </div>
                        </div>
                      </li>
                      <li>
                        <h4>Bio</h4>
                      </li>
                      <li>
                        <textarea
                          name=""
                          placeholder="bio"
                          rows={2}
                          value={userProfileData?.bio}
                          onChange={(e) =>
                            setUserProfiledata((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          cols={80}
                          className={`${dark ? "setdark" : ""}`}
                        ></textarea>
                      </li>
                      <li>
                        {loading && <LoadingButton isDarkMode={dark}/>}

                        {!loading && <button type="submit">SAVE</button>}
                      </li>
                    </ul>
                  </form>
                </div>
              </div>
              <div
                className={`notification ${dark ? "setdark" : ""} ${
                  isActive("notification") ? "active" : ""
                }`}
              >
                <div className="content">
                  <div className="heading">
                    <h3>push notifications</h3>
                  </div>
                  <form action="#">
                    <ul>
                      <li>
                        <h4>Likes</h4>
                        <div className="box flex">
                          <input
                            type="radio"
                            id="likes-everyone"
                            name="like-check"
                            onClick={()=>handleChange("like","all")}
                            checked={
                              userProfile?.notificationSettings?.like === "all"
                                ? true
                                : false
                            }
                          />
                          <label htmlFor="likes-everyone">on</label>
                        </div>
                        <div className="box flex">
                          <input
                            type="radio"
                            id="likes-off"
                            name="like-check"
                            onClick={()=>handleChange("like","off")}
                            checked={
                              userProfile?.notificationSettings?.like === "off"
                                ? true
                                : false
                            }
                          />
                          <label htmlFor="likes-off">off</label>
                        </div>
                      </li>
                      <li>
                        <h4>Comment</h4>

                        <div className="box flex">
                          <input
                            type="radio"
                            name="comment-check"
                            onClick={()=>handleChange("comment","all")}
                            checked={
                              userProfile?.notificationSettings?.comment === "all"
                                ? true
                                : false
                            }
                          />
                          <label htmlFor="">on</label>
                        </div>
                        <div className="box flex">
                          <input
                            type="radio"
                            name="comment-check"
                            checked={
                              userProfile?.notificationSettings?.comment === "off"
                                ? true
                                : false
                            }
                            onClick={()=>handleChange("comment","off")}
                          />
                          <label htmlFor="">off</label>
                        </div>
                      </li>
                      <li>
                        <h4>Follow</h4>

                        <div className="box flex">
                          <input
                            type="radio"
                            checked={
                              userProfile?.notificationSettings?.follow === "all"
                                ? true
                                : false
                            }
                            onClick={()=>handleChange("follow","all")}
                          />
                          <label htmlFor="">on</label>
                        </div>
                        <div className="box flex">
                          <input
                            type="radio"
                            checked={
                              userProfile?.notificationSettings?.follow === "off"
                                ? true
                                : false
                            }
                            onClick={()=>handleChange("follow","off")}
                          />
                          <label htmlFor="">off</label>
                        </div>
                      </li>
                    </ul>
                  </form>
                </div>
              </div>
              <div
                className={`account-privacy ${dark ? "setdark" : ""} ${
                  isActive("account-privacy") ? "active" : ""
                }`}
              >
                <div className="content">
                  <div className="heading">
                    <h3>account privacy</h3>
                  </div>
                  <div className="box flex">
                    <div className="content">
                      <h4>private account</h4>
                      <p>
                        When your account is public, your profile and posts can
                        be seen by anyone, on or off unity, even if they don't
                        have an unity account. When your account is private,
                        only the followers you approve can see what you share,
                        including your photos or videos on hashtag and location
                        pages, and your followers and following lists. Certain
                        info on your profile, like your profile picture and
                        username, is visible to everyone on and off unity.
                      </p>
                      <NavLink>Learn more</NavLink>
                      <input
                        type="checkbox"
                        name=""
                        onChange={handlePrivacySetting}
                        checked={userProfile?.is_private}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`close-friends ${dark ? "setdark" : ""} ${
                  isActive("close-friends") ? "active" : ""
                }`}
              >
                <div className="content">
                  <form action="">
                    <div className="heading">
                      <h3>Close Friends</h3>
                      <div className="search-box flex">
                        <input
                          type="search"
                          name=""
                          placeholder="Search user for close friend...."
                          className={`${dark ? "setdark" : ""}`}
                        />
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </div>
                    </div>
                    <div className="data">
                      <ul>
                        {closeFriends.map((user) => (
                          <li key={user._id}>
                            <div className="person flex">
                              <div className="image-box">
                                <img src={user?.avatar?.url || "/images/user.png"} alt={user?.username} />
                              </div>
                              <div className="detail flex">
                                <div className="message flex">
                                  <p>{user?.username}</p>

                                  {/* <span>{user.relation}</span> */}
                                </div>
                                <input type="checkbox" onChange={()=>handleCloseFriend(user?._id,user?.isCloseFriend)} checked={user?.isCloseFriend} />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </form>
                </div>
              </div>
              <div
                className={`block ${dark ? "setdark" : ""} ${
                  isActive("blocked") ? "active" : ""
                }`}
              >
                <div className="content">
                  <div className="heading">
                    <h3>Blocked Accounts</h3>
                    <p>You can block people anytime from their profiles.</p>
                  </div>
                  <div className="data">
                    <ul>
                      {blockedList.map((user) => (
                        <li key={user._id}>
                          <div className="person flex">
                            <div className="image-box">
                              <img src={user?.avatar?.url} alt={user?.username} />
                            </div>
                            <div className="detail flex">
                              <div className="message flex">
                                <p>
                                {user?.username}
                                </p>
                              </div>
                              <div className="btn flex">
                                <button onClick={()=>handleBlockList(user._id)}>unblock</button>
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
                className={`security ${dark ? "setdark" : ""} ${
                  isActive("security") ? "active" : ""
                }`}
              >
                <div className="content">
                  <div className="heading">
                    <h3>Password and security</h3>
                    <p>
                      Manage your passwords, login preferences and recovery
                      methods.
                    </p>
                  </div>
                  <div className={`form-container`}>
                    <form onSubmit={handleChangePassword}>
                      <h4>Change Password</h4>
                      <ul className={`${dark ? "setdark" : ""}`}>
                        <li>
                          <input
                            type="password"
                            className={`${dark ? "setdark" : ""}`}
                            id="old-password"
                            value={passwordData.oldPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                oldPassword: e.target.value,
                              }))
                            }
                            placeholder="Old Password"
                          />
                        </li>
                        <li>
                          <input
                            type="password"
                            className={`${dark ? "setdark" : ""}`}
                            id="new-password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            placeholder="New Password"
                          />
                        </li>
                        <li>
                          <input
                            type="password"
                            className={`${dark ? "setdark" : ""}`}
                            id="confirm-password"
                            value={passwordData.cPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                cPassword: e.target.value,
                              }))
                            }
                            placeholder="Confirm Password"
                          />
                        </li>
                        <li className="flex">
                          {
                            loading && <LoadingButton isDarkMode={dark}/>
                          }
                          {/* <NavLink to="/forgate">forgate password?</NavLink>{" "} */}
                          {
                            !loading && 
                            <button>Submit</button>

                          }
                        </li>
                      </ul>
                    </form>
                  </div>
                </div>
              </div>
              <div
                className={`personal-details ${dark ? "setdark" : ""} ${
                  isActive("personal-details") ? "active" : ""
                }`}
              >
                <div className="content">
                  <div className="heading">
                    <h3>personal details</h3>
                  </div>
                  <form action="#">
                    <div className={`contact-info ${dark ? "setdark" : ""}`}>
                      <div className="contact-container">
                        <label
                          className={`contact-input ${dark ? "setdark" : ""}`}
                        >
                          <span>Email ID:</span>
                          <input
                            type="email"
                            value={userProfile?.email}
                            // onChange={(e) => setEmail(e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileEdit;
