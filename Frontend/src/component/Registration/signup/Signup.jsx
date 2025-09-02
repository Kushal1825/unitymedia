import react, { useContext, useState } from "react";
import "./signup.css";
import { NavLink } from "react-router-dom";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext.jsx";
import VerifyEmail from "./verifyEmail/VerifyEmail.jsx"
import toast from 'react-hot-toast'
import axios from "axios";
import ApiContext from "../../../utils/ApiContext.jsx";
import LoadingButton from "../../LoadingButton/LoadingButton.jsx";
const Signup = () => {
  const { dark } = useDarkMode();

  const [isVerifySection,setisVerifySection]=useState(false)
  const {API_URL}= useContext(ApiContext)
  const [isLoading,setIsLoading]= useState(false);
  const [signupdata, setSignupdata] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    cPassword:"",
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if(signupdata.password==signupdata.cPassword){
      console.log("Password verify");
      try {
        const response = await axios.post(`${API_URL}/api/user/signup`,signupdata);

        if(response.data.success){
          toast.success("Otp send to your Email");
          setisVerifySection(prev=>!prev)
          
        }else{
          toast.error(response.data.message)
        }
        
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
      finally{
        setIsLoading(false);
      }
      // toast.success("register successfully");
    }else{
      toast.error("Password and Confirm Password Unmatch")
    }

    
  };
  if(!isVerifySection){
    return (
      <>
      
        <section className="signup-section">
          <div className="container flex">
            <div className="row">
            <div className="heading flex">
                    <div className="image-box">
                      <img src="../../../images/logo2.png" alt="" />
                      
                    </div>
                    
                    <h1>
                        Sign up 
                    </h1>
                  </div>
              <div className="content">
                <form onSubmit={submitHandler}>
                  <div className="input-box">
                    {/* <label htmlFor="text">Username</label> */}
                    <input
                      type="text"
                      placeholder="Username"
                      value={signupdata.username}
                      autoComplete={false}
                      onChange={(e) =>
                        setSignupdata((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                      className={`${dark ? "setdark" : ""}`}
                    />
                  </div>
                  <div className="input-box">
                    {/* <label htmlFor="text">full name</label> */}
                    <input
                      type="text"
                      value={signupdata.fullName}
                      placeholder="Full Name"
                      autoComplete={false}
                      onChange={(e) =>
                        setSignupdata((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      required
                      className={`${dark ? "setdark" : ""}`}
                    />
                  </div>
                  <div className="input-box">
                    {/* <label htmlFor="text">Email</label> */}
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupdata.email}
                      autoComplete={false}
                      onChange={(e) =>
                        setSignupdata((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className={`${dark ? "setdark" : ""}`}
                    />
                  </div>
                  <div className="input-box">
                    {/* <label htmlFor="password">Password</label> */}
                    <input
                      type="password"
                      value={signupdata.password}
                      autoComplete={false}
                      onChange={(e) =>
                        setSignupdata((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Password"
                      required
                      className={`${dark ? "setdark" : ""}`}
                    />
                  </div>
                  <div className="input-box">
                    {/* <label htmlFor="password">confirm Password</label> */}
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={signupdata.cPassword}
                      autoComplete={false}
                      onChange={e=>setSignupdata(prev=>({
                        ...prev,
                        cPassword:e.target.value
                      }))}
                      
                      required
                      className={`${dark ? "setdark" : ""}`}
                    />
                  </div>
                  <div className="checkbox flex">
                    <label className="remember-me">
                        <input type="checkbox" />
                        I accept Term and Condition
                      </label>
                    <p className="haveAccount">
                      
                      <NavLink to="/login">Already Have An Account ?</NavLink>
                    </p>
                  </div>
  
                  <div className="btn flex">
                    {
                      isLoading && 
                      <LoadingButton isDarkMode={dark}/>
                    }
                    {
                      !isLoading &&
                      <button>Signup</button>
                    }
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }else{
    return(
      <>
      <VerifyEmail username={signupdata.username}/>
      
      </>
    )
  }
};
export default Signup;
