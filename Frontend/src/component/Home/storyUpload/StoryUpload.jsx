import React, { useState,useRef, useContext } from "react";
import "./StoryUpload.css";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext.jsx";
import axios from "axios";
import LoadingButton from "../../LoadingButton/LoadingButton.jsx";
import ApiContext from "../../../utils/ApiContext.jsx";
import toast from "react-hot-toast";

const StoryUpload = () => {
  const [image, setImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [storyType, setStoryType] = useState('false');
  const [imagedata,setImagedata]=useState(null);
  const [isLoading,setIsLoading]=useState(false);
  const {dark} = useDarkMode();
  const {API_URL,token,profile}=useContext(ApiContext)
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      setImagedata(file);
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleUpload = async() => {
    // Add your upload logic here
    setIsLoading(true);
    // console.log('Uploading:', { imagedata, storyType });
    // Reset after upload

    try {
      const formData = new FormData();
      formData.append('image', imagedata);
      formData.append('isCloseFriend', storyType);
      const res= await axios.post(`${API_URL}/api/story/create`,formData,{
        headers:{
          Authorization:`Bearer ${token}`,
           "Content-Type":"multipart/form-data"
        }
      });

      if(res.data.success){
        toast.success(res.data.message);
        setImage(null);
        fileInputRef.current.value = '';
      }else{
        toast.error(res.data.message);
      }

    } catch (error) {
      console.log(error);
      
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="story-upload-container">
      <h2>Upload Story</h2>
      
      <div className="story-type-toggle">
        <button
          className={storyType === 'true' ? 'active' : ''}
          onClick={() => setStoryType('true')}
        >
          Close Friend
        </button>
        <button
          className={storyType === 'false' ? 'active' : ''}
          onClick={() => setStoryType('false')}
        >
          All Friend
        </button>
      </div>

      <div 
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleInputChange}
          hidden
        />
        
        {!image ? (
          <div className="upload-instructions">
            <p>Drag and drop your photo here</p>
            <p>or click to browse</p>
          </div>
        ) : (
          <img src={image} alt="Preview" className="image-preview" />
        )}
      </div>

      {(image && !isLoading) && (
        <button className="upload-button" onClick={handleUpload}>
          Upload Story
        </button>
      )}
      {
        isLoading && (
          <LoadingButton className="upload-button" isDarkMode={dark} />
        )
      }
    </div>
  );
};

export default StoryUpload;
