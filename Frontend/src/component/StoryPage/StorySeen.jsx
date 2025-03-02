import React, { useContext, useEffect, useState } from "react";
import "./StorySeen.css";
import { NavLink, useNavigate, useParams } from "react-router-dom";
// import formate from 'time-ago';
import { format } from "timeago.js";
import ApiContext from "../../utils/ApiContext";
import { FaPause, FaPlay } from "react-icons/fa";
import axios from "axios";

const StorySeen = () => {
  const { id } = useParams();
  // console.log(id);

  // const [currentStory,setCurrentStory]=useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(Number(id));
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [lastUserStory, setLastUserStory] = useState(currentUserIndex - 1);
  const [nextUserStory, setNextUserStory] = useState(currentUserIndex + 1);
  const navigate = useNavigate();
  const [Storydata, setStoryData] = useState([]);
  const [progress, setProgress] = useState(0);
  const { API_URL, token } = useContext(ApiContext);

  useEffect(() => {
    fetchStories();
  }, []);

  const currentStories = Storydata[currentUserIndex]?.stories || [];
  const currentStory = currentStories[currentStoryIndex];
  const [isPause,setIsPause]=useState(false);
  const [isLoading,setIsLoading]=useState(true);

  useEffect(() => {
    if (Storydata.length > 0) {
      // Only start timer when Storydata is available
      
      const timer = setInterval(() => {
        
        if(!isPause){
          setProgress((prev) => {
            if (prev >= 100) {
              handleNext();
              return 0;
            }
            return prev + 1;
          });
        }
        }, 50);
        return () => clearInterval(timer);

    }
  }, [currentStoryIndex, currentUserIndex, Storydata,isPause]);

  const handleNext = () => {
    if (!Storydata.length || !currentStories.length) {
        console.warn("Storydata or currentStories is empty.");
        return;
    }

    setProgress(0);

    if (currentStoryIndex < currentStories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1);
    } else if (currentUserIndex < Storydata.length - 1) {
        setCurrentUserIndex((prev) => prev + 1);
        setLastUserStory((prev) => prev + 1);
        setNextUserStory((prev) => prev + 1);
        setCurrentStoryIndex(0);
    } else {
        // console.log("End of stories:", { currentStoryIndex, currentUserIndex });
        navigate("/");
    }
};

  const fetchStories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/story/get/my/followings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // console.log(response.data.data);

        setStoryData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const likeHandler = async (id) => {
    console.log(id);
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1);
      setNextUserStory((prev) => prev - 1);
      setLastUserStory((prev) => prev - 1);
      // console.log(currentUserIndex);
      setCurrentStoryIndex(Storydata[currentUserIndex - 1]?.stories.length - 1);
    }
  };

  return (
    <section className="story-seen">
      <div className="container">
        <div className="prev-div">
          {lastUserStory >= 0 && (
            <>
              <img
                src={Storydata[lastUserStory]?.stories[0]?.media_url}
                alt=""
              />
              <div className="user-profile">
                <img
                  src={
                    Storydata[lastUserStory]?.stories[0]?.Author?.avatar?.url ||
                    "/images/user.png"
                  }
                  alt=""
                />
                <p>{Storydata[lastUserStory]?.stories[0]?.Author?.username}</p>
                <p className="time">
                  {format(Storydata[lastUserStory]?.stories[0]?.createdAt)}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="current-div">
          <div className="left-arrow" onClick={handlePrev}>
            <svg
              aria-label="Previous"
              class="x1lliihq x1n2onr6 xq3z1fi"
              fill="currentColor"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
            >
              <title>Previous</title>
              <path d="M12.005.503a11.5 11.5 0 1 0 11.5 11.5 11.513 11.513 0 0 0-11.5-11.5Zm2.207 15.294a1 1 0 1 1-1.416 1.412l-4.5-4.51a1 1 0 0 1 .002-1.415l4.5-4.489a1 1 0 0 1 1.412 1.416l-3.792 3.783Z"></path>
            </svg>
          </div>
          <div className="main-div">
            <div className="progress-container">
              {
                Storydata[currentUserIndex]?.stories?.map((val,i)=>{
                  return(
                  <div className={`progress-bar ${currentStoryIndex > i ? "completed":""} ${currentStoryIndex === i ? "active" : "" }`}>
                    <div className="progress" style={{width: i === currentStoryIndex ? `${progress}%` : i < currentStoryIndex ? '100%' : '0'}}></div>
                  </div>
                )}
                )
              }
            </div>
            <div className="play-pause-handler">
             <button onClick={()=>setIsPause(prev=>!prev)}>
              {isPause ? <FaPause/> :<FaPlay/>}
             </button>
            </div>
            <div className="user-info">
              <img
                src={
                  Storydata[currentUserIndex]?.stories[0]?.Author?.avatar
                    ?.url || "/images/user.png"
                }
              />
              <p>{Storydata[currentUserIndex]?.stories[0]?.Author?.username}</p>
            </div>
            <div className="story-container">
            {isLoading && <div className="story-skeleton"></div>}
            {isLoading && <div className="spinner"></div>}
              <img
              className={` ${isLoading ? "hidden" : "visible"}`}
                src={
                  Storydata[currentUserIndex]?.stories[currentStoryIndex]
                    ?.media_url
                }
                onLoad={()=>setIsLoading(false)}
                alt=""
              />
            </div>
            <div className="handler">
              <li
                onClick={() =>
                  likeHandler(
                    Storydata[currentUserIndex]?.stories[currentStoryIndex]._id
                  )
                }
              >
                <i className="fa-regular fa-heart"></i>
              </li>
            </div>
          </div>
          <div className="right-arrow" onClick={handleNext}>
            <svg
              aria-label="Next"
              class="x1lliihq x1n2onr6 xq3z1fi"
              fill="currentColor"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
            >
              <title>Next</title>
              <path d="M12.005.503a11.5 11.5 0 1 0 11.5 11.5 11.513 11.513 0 0 0-11.5-11.5Zm3.707 12.22-4.5 4.488A1 1 0 0 1 9.8 15.795l3.792-3.783L9.798 8.21a1 1 0 1 1 1.416-1.412l4.5 4.511a1 1 0 0 1-.002 1.414Z"></path>
            </svg>
          </div>
        </div>
        <div className="next-div">
          {nextUserStory < Storydata.length && (
            <>
              <img
                src={Storydata[nextUserStory]?.stories[0]?.media_url}
                alt=""
              />
              <div className="user-profile">
                <img
                  src={
                    Storydata[nextUserStory]?.stories[0]?.Author?.avatar?.url ||
                    "/images/user.png"
                  }
                  alt=""
                />
                <p>{Storydata[nextUserStory]?.stories[0]?.Author?.username}</p>
                <p className="time">
                  {format(Storydata[nextUserStory]?.stories[0]?.createdAt)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="company-logo">
        <NavLink to={"/"}>
          <img src="/images/logo2.png" alt="Unity" />
          <span>Unity</span>
        </NavLink>
      </div>
      <div className="cls-btn">
        <NavLink to={"/"}>
          <svg
            aria-label="Close"
            class="x1lliihq x1n2onr6 x9bdzbf"
            fill="#ffffff"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>Close</title>
            <polyline
              fill="none"
              points="20.643 3.357 12 12 3.353 20.647"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
            ></polyline>
            <line
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              x1="20.649"
              x2="3.354"
              y1="20.649"
              y2="3.354"
            ></line>
          </svg>
        </NavLink>
      </div>
    </section>
  );
};

export default StorySeen;
