import { useContext, useEffect, useState } from "react";
import "./profile.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import ApiContext from "../../utils/ApiContext.jsx";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import axios from "axios";
const Profile = () => {
  const { dark, navbarActive } = useDarkMode();
  const [storyupload, setstoryupload] = useState(false);
  const [title, settitle] = useState();
  const [btntxt, setbtntxt] = useState();
  const [followerList,setFollowerList]=useState([]);
  const [followingList,setFollowingList]=useState([]);

  const handlestoryclose = () => {
    setstoryupload(false);
  };

  const { API_URL, profile, token } = useContext(ApiContext);
  // console.log(profile);

  const [userProfile, setUserProfile] = useState(null);
  const [userPost, setUserPost] = useState([]);

  
  const navigate = useNavigate();
  const location = useLocation();

  
  const openPost = (id) => {
    navigate(`/p/${id}`, { state: { background: location } });
  };
  
  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/user/profile/${profile?.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(response.data.data);

      if (response.data.data) {
        setUserProfile((prev) => ({ ...response.data.data[0] }));
        // console.log(userProfile);
      }

      const postResponse = await axios.get(
        `${API_URL}/api/post/u/${profile.username}` ,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(postResponse.data.data);

      if (response.data.data) {
        setUserPost((prev) => postResponse.data.data);
        // console.log(userPost);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFollowers = async () =>{
    try {
      const res = await axios.get(`${API_URL}/api/follow/list/following/${profile?.username}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if(res.data.success){
        console.log(res.data.data);
        
        setFollowerList(res.data.data);
        
      }
      
    } catch (error) {
    
    }
  }

  const getFollowings = async() =>{
    try {
      const res = await axios.get(`${API_URL}/api/follow/list/follower/${profile?.username}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if(res.data.success){
        console.log(res.data.data)
        setFollowingList(res.data.data);
        
      }
      
    } catch (error) {
    
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);


  return (
    <>
      <section
        className={`profile-section ${dark ? "setdark" : ""} ${
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
                <button onClick={handlestoryclose}>
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
                      <div className="detail">
                      <div className="image-box">
                        <img src={userProfile?.avatar?.url  || '/images/user.png'} alt="" />
                      </div>
                      <div className="name">
                        <h3>
                          {userProfile?.username}
                          {/* <i className="fa-regular fa-square-check"></i> */}
                        </h3>
                        <h4>{userProfile?.fullName}</h4>
                      </div>
                      <NavLink
                        to={`/profileedit`}                        
                        className={({ isActive }) =>
                          `flex ${isActive ? "active" : ""} ${
                            dark ? "setdark" : ""
                          } ${navbarActive ? "slide" : ""}`
                        }
                      >
                        <i className="fa-solid fa-gear"></i>
                        
                      </NavLink>
                      </div>
                      <div>
                      <p>{userProfile?.bio}</p>
                      </div>

                    </div>
                  </div>
                  <div className="box flex">
                    <ul className="flex">
                      <li>
                        <span>{userProfile?.postCount}</span>
                        <NavLink className={` ${dark ? "setdark" : ""}`}>
                        
                          posts
                        </NavLink>
                      </li>
                      <li onClick={getFollowers}>
                        <span>{userProfile?.followingCount}</span>
                        <NavLink
                          className={` ${dark ? "setdark" : ""}`}
                          onClick={() => {
                            settitle("Following");
                            setbtntxt("following");
                            setstoryupload(true);
                          }}
                        >
                          Following
                        </NavLink>
                      </li>
                      <li onClick={getFollowings}>
                        <span>{userProfile?.followerCount}</span>
                        <NavLink
                          className={` ${dark ? "setdark" : ""}`}
                          onClick={() => {
                            settitle("Followers");
                            setbtntxt("remove");
                            setstoryupload(true);
                          }}
                        >
                          Followers
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="details">
                <div className={`heading ${dark ? "setdark" : ""}`}>
                  <h4> <BsFillGrid3X3GapFill /> Posts</h4>
                </div>
                <div className={`content ${dark ? "setdark" : ""}`}>
                  {userPost.length !== 0 ? (
                    <div className="post">
                      <div className={`content ${dark ? "setdark" : ""}`}>
                        <ul className="flex">
                          {userPost.map((user) => (
                            <li key={user?._id} className="flex">
                              <div className="image-box"
                               onClick={()=>openPost(user._id)} style={{ cursor: "pointer" }}
                              >
                                <img src={user?.image} alt={user?.name} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="blank-post flex">
                      <ul className="flex mview">
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li className="flex">
                          <NavLink to="/post">Add Post</NavLink>
                        </li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Profile;
