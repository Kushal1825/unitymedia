import React, { useContext, useState } from 'react'
import "../signup.css"
import { useDarkMode } from '../../../DarkModeContext/DarkModeContext.jsx';
import axios from 'axios';
import ApiContext from '../../../../utils/ApiContext.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../../../LoadingButton/LoadingButton.jsx';

const VerifyEmail = ({username}) => {
  const { dark } = useDarkMode();
  const [isLoading,setIsLoading]= useState(false);
  const [emaildata,setEmaildata]= useState({
    username:username,
    otp:""
  });
  const navigate=useNavigate();
  console.log(username);
  const {API_URL}= useContext(ApiContext);

  const verifyHandler=async(e)=>{
    e.preventDefault();
    setIsLoading(false);

    try {
      const response= await axios.post(`${API_URL}/api/user/verify-user`,emaildata);

      if(response.data.success){
        toast.success("Email verify successfully");
        navigate("/login");
      }else{
        toast.error(response.data.message);
      }
      
    } catch (error) {
      
    }finally{
      setIsLoading(true);
    }
    
  }
  return (
    <>
      <section className="signup-section">
        <div className="container flex">
          <div className="row">
          <div className="heading flex">
                  <div className="image-box">
                    <img src="../../../images/logo2.png" alt="" />
                    
                  </div>
                  <h1>unity</h1>
                  <p>
                    Welcome to Unity ,  VerifyYour Email
                  </p>
                </div>
            <div className="content">
              <form onSubmit={verifyHandler}>
                
                
                <div className="input-box">
                  {/* <label htmlFor="password">Password</label> */}
                  <input
                    type="text"
                    value={emaildata.otp}
                    autoComplete={false}
                    onChange={(e) =>
                      setEmaildata(prev=>({...prev,otp:e.target.value}))
                    }
                    placeholder="Enter Otp"
                    required
                    className={`${dark ? "setdark" : ""}`}
                  />
                </div>
                  

                <div className="btn flex">
                    {
                      isLoading &&
                      <LoadingButton isDarkMode={dark} />
                    }
                    {
                      !isLoading &&
                      <button>Verify Otp</button>
                    }
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default VerifyEmail
