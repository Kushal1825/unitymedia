import React, { useContext, useEffect, useState } from "react";
import "./viewprofile.css";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext";
import ApiContext from "../../utils/ApiContext";
import axios from "axios";
import toast from "react-hot-toast";
const ViewProfile = () => {
  const { dark, navbarActive } = useDarkMode();
  const [storyupload, setstoryupload] = useState(false);
  const [title, settitle] = useState();
  const [btntxt, setbtntxt] = useState();
  // const [followStatus, setFollowStatus] = useState("follow");
  const { username } = useParams();
  const { profile, API_URL, token } = useContext(ApiContext);
  const [isLoading,setIsLoading] = useState(false);
  const [followerList,setFollowerList]=useState([]);
  const [followingList,setFollowingList]=useState([]);
  // const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [userPost, setUserPost] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const openPost = (id) => {
    navigate(`/p/${id}`, { state: { background: location } });
  };

  const fetchUserProfile = async () => {
   
   try {
     const response = await axios.get(
       `${API_URL}/api/user/profile/${username}`,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );
 
    //  console.log(response.data.data[0]);
     setProfileData((prev) => response.data.data[0]);
 
    //  console.log(response.data.data[0].is_private);
    setIsLoading(false);
 
     if (
       (response.data.data[0].is_private && response.data.data[0].isFollow) ||
       response.data.data[0].is_private === false
     ) {
      //  console.log("Content deliver");

 
       const postResponse = await axios.get(
         `${API_URL}/api/post/u/${response.data.data[0].username}`,
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );
      //  console.log(postResponse.data.data);
 
       if (response.data.data) {
         setUserPost((prev) => postResponse.data.data);
        //  console.log(userPost);
       }
     }
   } catch (error) {
    
   }finally{
    setIsLoading(false);
   }
  };

  const getFollowers = async () =>{
    try {
      const res = await axios.get(`${API_URL}/api/follow/list/following/${username}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if(res.data.success){
        // console.log(res.data.data);
        
        setFollowerList(res.data.data);
        
      }
      
    } catch (error) {
    
    }
  }

  const getFollowings = async() =>{
    try {
      const res = await axios.get(`${API_URL}/api/follow/list/follower/${username}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if(res.data.success){
        // console.log(res.data.data)
        setFollowingList(res.data.data);
        
      }
      
    } catch (error) {
    
    }
  }


  useEffect(() => {
    if (profile?.username === username) {
      navigate("/profile"); // Redirect to profile if it's the user's own page
    } else {
      setIsLoading(true);
      fetchUserProfile();
    }
  }, [profile?.username, username, navigate]);

  const followHandler = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/follow/${profileData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchUserProfile();
      }else{
        toast.error(response.data.message)
      }
      // console.log(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };
  const blockHandler = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/user/block/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      }else{
        toast.error(response.data.message)
      }
      // console.log(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handlestoryclose = () => {
    setstoryupload(false);
  };



  return (
    <>
    {isLoading && 
    <div className="loader-container">
      <div className="spinner"></div>
    </div>}
    {
      !isLoading ? profileData ? (
        <section
        className={`viewprofile-section ${dark ? "setdark" : ""} ${
          navbarActive ? "compromise" : ""
        }`}
      >

        
        <div
          className={`popup-box flex ${storyupload ? "active" : ""} `}
          onClick={handlestoryclose}
        >
          <div
            className={`content flex ${dark ? "setdark" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`heading flex ${dark ? "setdark" : ""}`}>
              <h4>{title}</h4>
              <div className="btn">
                <button  onClick={handlestoryclose}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <form action="">
              <div className="search-box flex">
                <input
                  type="search"
                  name=""
                  id=""
                  placeholder="Search user for message...."
                  className={`${dark ? "setdark" : ""}`}
                />
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
            </form>

            <div className={`data ${dark ? "setdark" : ""}`}>
              <ul>
              {(title==="Following"?followerList:followingList).map((user) => (
                  <li key={user._id} className={`${dark ? "setdark" : ""}`}>
                    <div className={`person flex`}>
                      <div className="image-box">
                        <img src={user?.avatar?.url || "/images/user.png"} alt={user?.username} />
                      </div>
                      <div className="detail">
                        <h4>{user?.username}</h4>
                      </div>
                      <div className="btn">
                        <button>{btntxt}</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className={`content flex ${dark ? "setdark" : ""}`}>
              <div className={`intro ${dark ? "setdark" : ""}`}>
                <div className="content flex">
                  <div className="box">
                    <div className="content flex">
                      <div className="image-box">
                        <img
                          src={
                            `${profileData?.avatar?.url}` || "images/user.png"
                          }
                          alt=""
                        />
                      </div>
                      <div className="name">
                        <h3>
                          {profileData?.username}
                          {/* <i className="fa-regular fa-square-check"></i> */}
                        </h3>
                        <h4>{profileData?.fullName}</h4>

                        <button onClick={followHandler} className={`${dark?"dark-mode":""}`}>
                          {profileData.isFollow?"Following":profileData.hasFollowReqest?"Requested":"Follow"}
                        </button>
                        <button onClick={blockHandler} className={`${dark?"dark-mode":""}`}>
                        Block
                          {/* {profileData.isFollow?"Following":profileData.hasFollowReqest?"Requested":"Follow"} */}
                        </button>
                      </div>
                      <div className="account-status">
                        {/* <p><i className="fa-solid fa-lock"></i>Private Account</p>
                <p><i className="fa-solid fa-unlock-keyhole"></i>public Account</p> */}
                      </div>
                      <p>{profileData?.bio}</p>
                    </div>
                  </div>
                  <div className="box flex">
                    <ul className="flex">
                      <li>
                        <span>{profileData?.postCount}</span>
                        <NavLink className={` ${dark ? "setdark" : ""}`}>
                          posts
                        </NavLink>
                      </li>
                      <li onClick={()=>{
                        if((profileData?.is_private && profileData?.isFollow) || profileData?.is_private===false){
                          getFollowers();
                        }
                        }}>
                        <span>{profileData?.followingCount}</span>
                        <NavLink
                          className={` ${dark ? "setdark" : ""}`}
                          onClick={() => {
                            if((profileData?.is_private && profileData?.isFollow) || profileData?.is_private===false){
                              settitle("Following");
                              setbtntxt("Following");
                              setstoryupload(true);
                            }
                          }}
                        >
                          following
                        </NavLink>
                      </li>
                      <li onClick={()=>{
                        if((profileData?.is_private && profileData?.isFollow) || profileData?.is_private===false){
                          getFollowings()
                        }
                        }}>
                        <span>{profileData?.followerCount}</span>
                        <NavLink
                          className={` ${dark ? "setdark" : ""}`}
                          onClick={() => {
                            if((profileData?.is_private && profileData?.isFollow) || profileData?.is_private===false){
                              settitle("Follower");
                              setbtntxt("remove");
                              setstoryupload(true);
                            }
                          }}
                        >
                          followers
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="details">
                <div className={`heading ${dark ? "setdark" : ""}`}>
                  <h4>post</h4>
                </div>
                <div className={`content ${dark ? "setdark" : ""}`}>
                  {
                     (profileData?.is_private && profileData?.isFollow) || profileData?.is_private===false ? (
                      profileData.postCount>0?(
                        <div className="post">
                        <div className={`content ${dark ? "setdark" : ""}`}>
                          <ul className="flex">
                            {userPost.map((post) => (
                              <li key={post?._id} className="flex">
                                <div
                                  className="image-box"
                                  onClick={() => openPost(post._id)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <img src={post?.image} alt={post?.name} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      ):(<div className="blank-post flex">
                        <ul className="flex">
                          <div className="no-posts-container">
                            <div className="camera-icon">
                              <i className="far fa-camera"></i>
                            </div>
                            <div className="no-posts-text">
                              <h2>No Posts Yet</h2>
                              <p className="no-posts-subtext">
                                When you share photos or videos, they'll appear
                                here.
                              </p>
                            </div>
                          </div>
                        </ul>
                      </div>)
                      
                    ) : (
                      <div className="private-account-container">
                        <div className="lock-icon">
                          <i className="fas fa-lock"></i>
                        </div>
                        <div className="private-account-text">
                          <h2>This Account is Private</h2>
                          <p className="private-account-subtext">
                            Follow this account to see their photos and videos.
                          </p>
                        </div>
                        <button className="follow-button" onclick="handleFollow()">
                          Follow
                        </button>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      ):<div>
        <h3>Given User Name is Not avilable</h3>
      </div>:"" 
    }
      
    </>
  );
};
export default ViewProfile;
