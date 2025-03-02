import React, { useContext, useState } from 'react';
import './post.css';
import { useDarkMode } from "../DarkModeContext/DarkModeContext";
import axios from "axios";
import ApiContext from '../../utils/ApiContext.jsx';
import toast from 'react-hot-toast';

const Post = () => {
    const { dark, navbarActive } = useDarkMode();
    const [image, setImage] = useState(null);
    const [imageData,setImageData] =useState(null);
    const [isLoading,setIsLoading]=useState(false);
    const [caption, setCaption] = useState("");
    const [isDragging, setIsDragging] = useState(false); // Add dragging state
    const {API_URL,token}=useContext(ApiContext);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageData(file);  // Store the actual File object for upload
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);  // Set Data URL for preview
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file && file.type.startsWith('image/')) {
                setImageData(file);  // Store the actual File object
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImage(e.target.result);  // Set Data URL for preview
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true); // Set dragging state
    };

    const handleDragLeave = (event) => { // Add drag leave handler
        event.preventDefault();
        setIsDragging(false);
    };

    const handleUpload = async () => {
        try {
            // Add your upload logic here
            // console.log('Uploading:', { imageData, caption });
            setIsLoading(true);
            // Example upload logic:
            const formData = new FormData();
            formData.append('image', imageData);
            formData.append('caption', caption);
            const response = await axios.post(`${API_URL}/api/post/create`, formData,{
                headers:{
                    Authorization:`Bearer ${token}`,
                    "Content-Type":"multipart/form-data"
                }
            });

            // console.log(response.data.data);
            if(response.data.success){

                toast.success(response.data.message);
                setImage(null);
                setCaption("");
            }else{
                toast.error(response.data.message);
            }
            
            
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading post');
        }finally{
            setIsLoading(false);
        }
    };


    return (
        <section className={`postupload-section ${dark ? 'setdark' : ''} ${navbarActive ? 'compromise' : ""}`}>
        <div 
            className={`post-upload-container ${isDragging ? 'dragging' : ''}`} 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {image ? (
                <div className="image-preview">
                    <img src={image} alt="Preview" />
                </div>
            ) : (
                <label className={`upload-box ${isDragging ? 'drag-active' : ''}`}>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        hidden 
                    />
                    <p>Drag & Drop or Click to Upload</p>
                </label>
            )}
            <textarea
                className="caption-input"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
            />
            
            {/* Add Upload Button */}
            {image && (
                <button 
                    className={`upload-button ${dark ? 'dark-button' : ''}`}
                    onClick={handleUpload}
                >
                    Upload Post
                </button>
            )}
        </div>
    </section>
    );
}

export default Post;