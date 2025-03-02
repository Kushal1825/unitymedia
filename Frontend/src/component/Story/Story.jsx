import { useState, useEffect, useContext } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSwipeable } from 'react-swipeable';
import './story.css';
import ApiContext from '../../utils/ApiContext';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

// Updated storiesData based on the database response


const StoriesPage = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [storiesData,setStoriesData]= useState([]);
  const {API_URL,token} = useContext(ApiContext);
  const [selectedStory,setSelectedStory]= useState(null);
  const navigate = useNavigate();

  const fetchStories = async()=>{
    try{
      const response = await axios.get(`${API_URL}/api/story/get/my/followings`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
  
      if(response.data.success){
        // console.log(response.data.data);
        
        setStoriesData(response.data.data);
      }
    }catch(error){
      console.log(error);
      
    }
  }

  useEffect(()=>{
    fetchStories();
  },[])

  const currentStories = storiesData[currentUserIndex]?.stories || [];
  const currentStory = currentStories[currentStoryIndex];

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    trackMouse: true
  });

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isOpen, currentStoryIndex, currentUserIndex]);

  const handleOpenStory = (userIndex) => {
    navigate(`/story/${userIndex}`)
    setCurrentUserIndex(userIndex);
    setCurrentStoryIndex(0);
    // setIsOpen(true);
  };

  const handleNext = () => {
    setProgress(0);
    if (currentStoryIndex < currentStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < storiesData.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(storiesData[currentUserIndex - 1].stories.length - 1);
    }
  };

  return (
    <div className="stories-container">
      <div className="stories-list">
        {storiesData.map((user, index) => (
          <UserStory
            key={user.user}
            user={user}
            onClick={() => handleOpenStory(index)}
          />
        ))}
      </div>

      {isOpen && (
        <div className="story-viewer" {...handlers}>
          <div className="progress-bars">
            {currentStories.map((_, i) => (
              <div key={i} className="progress-bar">
                <div 
                  className={`progress ${i === currentStoryIndex ? 'active' : ''}`}
                  style={{ width: i === currentStoryIndex ? `${progress}%` : i < currentStoryIndex ? '100%' : '0' }}
                />
              </div>
            ))}
          </div>

          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <FiX />
          </button>

          {currentStory && (
            <div className="story-content">
              
              <div className='story-box'>
              <div className='progress-bar'>
                <div className='progress'>

                </div>
              </div>
              <div className='user-info flex'>
              <img src={currentStory.Author?.avatar?.url || "/images/user.png"} className='UserProfile'/>
              <p>{currentStory.Author?.username}</p>
              </div>
              <div className='story-images'>
              <img src={currentStory.media_url} alt="story" />
                </div>  
                <div className='action-part'>
                  <button>
                    Like
                  </button>
                </div>
              </div>
              
            </div>
          )}

          <div className="navigation">
            <button className="nav-btn left" onClick={handlePrev}>
              <FiChevronLeft />
            </button>
            <button className="nav-btn right" onClick={handleNext}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UserStory = ({ user, onClick }) => {
  const avatarUrl = user.stories[0]?.Author?.avatar?.url || "/images/user.png"; // Placeholder for avatar
  const username = user.stories[0]?.Author?.username || 'Unknown User';

  return (
    <div className="user-story" onClick={onClick}>
      <div className="story-ring">
        <img src={avatarUrl} alt={username} />
      </div>
      {/* <span>{username}</span> */}
    </div>
  );
};

export default StoriesPage;
