import react, { useContext, useEffect, useState } from "react";
import "./home.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import Suggestion from "./Suggestion";
import Posts from "./Posts";
import ApiContext from "../../utils/ApiContext.jsx";
import axios from "axios";
import PostSkeleton from "./postskeleton/PostSkeleton.jsx";
import StoryUpload from "./storyUpload/StoryUpload.jsx";
import Story from "../Story/Story.jsx";
// import StoryViewer from "../StoryView/StoryView.jsx";
const Home = () => {
  
  const { dark, navbarActive } = useDarkMode();
  const { API_URL, token,profile } = useContext(ApiContext);
  const [postIds, setPostIds] = useState([]);
  const navigate=useNavigate();
  const [posts, setPosts] = useState([]);
  const [postLoading,setPostLoading]=useState(true);
  const [followingStory,setFollowingStory]= useState([])

  // const [storyupload, setStoryUpload] = useState(false);

  const fetchStories = async()=>{
    try{
      const response = await axios.get(`${API_URL}/api/story/get/my/followings`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      if(response.data.success){
        // console.log(response.data.data);
        
        setFollowingStory(response.data.data);
      }
    }catch(error){
      console.log(error);
      
    }

  }

  const fetchPost = async () => {
    try {
      
      const response = await axios.post(
        `${API_URL}/api/post/random-post`,
        { postIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log(response.data.data.posts);
      
      if (response.data.data) {
        setPosts((prev) => response.data.data.post);
        setPostIds(response.data.data.postIds);
        setPostLoading(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchStories();
  }, []);

  

  const [storyupload, setstoryupload] = useState(false);
  const handlestoryupload = () => {
    navigate("/u/story")
    // setstoryupload(true);
  };
  const handlestoryclose = () => {
    setstoryupload(false);
  };

//  let users=[];

  return (
    <>
      <section
        className={`Home-section ${dark ? "setdark" : ""} ${
          navbarActive ? "compromise" : ""
        }`}
      >
        <div
          className={`story-upload flex ${storyupload ? "active" : ""} `}
          onClick={handlestoryclose}
        >
          <div
            className={`content ${dark ? "setdark" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="heading">
              <h4>Create new story</h4>
            </div>
            <div className="details">
              <form action="#">
                <div className="input-box">
                  <label htmlFor="post">
                    <i className="fa-solid fa-image"></i>
                  </label>
                  <input type="file" hidden id="post" />
                </div>
                <p>Drag photos here</p>
                <div className="btn flex">
                  <button>close friends</button>
                  <button>your stories</button>
                </div>
              </form>
            </div>
            {/* <StoryUpload/> */}
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className={`box ${dark ? "setdark" : ""}`}>
              <div className="content flex">
                <div className="main-contant">
                  <div className="story flex">
                    <div className="story-box own" onClick={handlestoryupload}>
                      <div className="border">
                        <div className="image-box">
                          <img src={`${profile?.avatar.url}` || "./images/user.png"} alt="" />
                        </div>
                        <i className="fa-solid fa-circle-plus"></i>
                      </div>
                    </div>
                    <Story/>
                    {/* <StoryViewer usersStories={followingStory} /> */}
                  </div>

                  {
                    postLoading &&
                    <>
                    <PostSkeleton/>
                    <PostSkeleton/>
                    
                    </>
                  }

                  {!postLoading &&
                    posts.map(post=>{
                      // console.log(posts.length);
                      
                      return(
                        <Posts key={post._id}  data={post} fetchPost={fetchPost}/>
  
                      ) 
                    })

                  }

                  
                </div>
                <Suggestion />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Home;
