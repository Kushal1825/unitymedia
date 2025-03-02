import React, { useContext, useState } from "react";
import "./forgate.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext";
import axios from "axios";
import ApiContext from "../../utils/ApiContext";
import toast from "react-hot-toast";
import LoadingButton from "../LoadingButton/LoadingButton";
import { useNavigate } from "react-router-dom";
const Forgate = () => {
  const { dark } = useDarkMode();
  const { API_URL } = useContext(ApiContext);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    token: "",
    newPassword: "",
    cPassword: "",
  });
  const navigate = useNavigate();
  const [activeOtp, setActiveOtp] = useState(false);
  const [newPasswordactive, setnewPasswordactive] = useState(false);

  const handleEmailOtp = async () => {
    setIsLoading(true);
    try {
      const EmailisNotEmpty = forgotPasswordData.email.trim() !== "";
      if (EmailisNotEmpty) {
        const res = await axios.post(
          `${API_URL}/api/user/forget-password`,
          forgotPasswordData
        );
        if (res.data.success) {
          toast.success(res.data.message);
          setActiveOtp(true);
        } else {
          toast.error(res.data.message);
        }
      } else {
        toast.error("Please Enter the username or Email");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () =>{
    setIsLoading(true);
    try {
      const TokenIsNotEmpty = forgotPasswordData.token.trim() !== "";
      const verifyTokensize = forgotPasswordData.token.trim().length == 6;
      console.log(verifyTokensize);
      
      if (TokenIsNotEmpty && verifyTokensize) {
        const res = await axios.post(
          `${API_URL}/api/user/verify-reset-token/${forgotPasswordData.token}`,
          forgotPasswordData
        );
        
        if (res.data.success) {
          toast.success(res.data.message);
          setnewPasswordactive(true);
        } else {
          toast.error(res.data.message);
        }
      } else {
        if(TokenIsNotEmpty)
        toast.error("Please Enter the Verification Code");
        if(verifyTokensize)
          toast.error("Token size must be six digit");
      }
    } catch (error) {
      
    }finally{
      setIsLoading(false);
    }
  }

  const handleUpdatePassword = async()=>{
    setIsLoading(true);
    try {
      const checkEmptiness = forgotPasswordData.newPassword.trim() !== "" && forgotPasswordData.cPassword.trim() !== "";
      console.log(forgotPasswordData.newPassword,forgotPasswordData.cPassword);
      console.log(checkEmptiness);
      
      
      const compareNewAndConfirmPassword = forgotPasswordData.newPassword.trim() === forgotPasswordData.cPassword.trim();
      
      
      if (checkEmptiness && compareNewAndConfirmPassword) {
        const res = await axios.post(
          `${API_URL}/api/user/reset-password`,
          forgotPasswordData
        );
        
        if (res.data.success) {
          toast.success(res.data.message);
          setnewPasswordactive(true);
          navigate("/login");
        } else {
          toast.error(res.data.message);
        }
      } else {
        if(!checkEmptiness)
        toast.error("All Field required");
        if(!compareNewAndConfirmPassword)
          toast.error("New Password and ConfirmPassword unmatch");
      }
    } catch (error) {
      
    }finally{
      setIsLoading(false);
    }
  }
  return (
    <section className="forgate-section">
      <div className="container">
        <div className="row flex">
          <div className="box">
            <div className="heading flex">
              <div className="image-box">
                <img src="../../../images/logo2.png" alt="" />
              </div>
              <h1>unity</h1>
              <p>Welcome to Unity, Forgate your password</p>
            </div>
            <div action="#">
              {!activeOtp && !newPasswordactive ? (
                <div className="email-box ">
                  <input
                    type="email"
                    placeholder="Email"
                    value={forgotPasswordData.email}
                    onChange={(e) =>
                      setForgotPasswordData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    id="emailid"
                  />
                  <div className="btn">
                    {
                      isLoading &&
                      <LoadingButton isDarkMode={dark}/>
                    }
                    {
                      !isLoading &&
                      <button onClick={handleEmailOtp}>get otp</button>
                    }
                  </div>
                </div>
              ) : (
                ""
              )}

              {activeOtp && !newPasswordactive ? (
                <div className="otp-box">
                  <input type="text" max={6}
                  value={forgotPasswordData.token}
                  onChange={(e) =>
                    setForgotPasswordData((prev) => ({
                      ...prev,
                      token: e.target.value,
                    }))
                  }
                  placeholder="OTP" />
                  <div className="btn flex">
                    <p>resend otp</p>
                    {
                      isLoading &&
                      <LoadingButton isDarkMode={dark}/>
                    }
                    {
                      !isLoading &&
                      <button onClick={handleOtpVerification}>Verify OTP</button>
                    }

                  </div>
                </div>
              ) : (
                ""
              )}

              {newPasswordactive && (
                <div className="input-box">
                  <input type="password"
                  value={forgotPasswordData.newPassword}
                  onChange={(e) =>
                    setForgotPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="new password" />
                  <input
                    type="password"
                    max={6}
                    value={forgotPasswordData.cPassword}
                    onChange={(e) =>
                      setForgotPasswordData((prev) => ({
                        ...prev,
                        cPassword: e.target.value,
                      }))
                    }
                    placeholder="confirm password"
                  />
                  <div className="btn">
                  {
                      isLoading &&
                      <LoadingButton isDarkMode={dark}/>
                    }
                    {
                      !isLoading &&
                      <button onClick={handleUpdatePassword}>Update Password</button>
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Forgate;
