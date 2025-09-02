import  { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext";
import "./login.css";
import axios from "axios";
// import ApiContext from "../../../utils/ApiContext.jsx";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../../utils/ApiContext";
import toast from "react-hot-toast";
import LoadingButton from "../../LoadingButton/LoadingButton";
const Login = () => {
  const { dark } = useDarkMode();
  const navigate = useNavigate();
  const [isLoading,setIsLoading]= useState(false); 

  const [logindata, setLogindata] = useState({
    email: "",
    password: "",
  });
  const {API_URL,setToken} = useContext(ApiContext)

  const saveTokenToCookie = async (token) => {
    const cookieName = "refreshToken";
    const expiryDays =11;
    const date = new Date();
    date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  
    // Set the cookie
    document.cookie = `${cookieName}=${token};expires=${date.toUTCString()};path=/;secure;SameSite=Strict`;
    console.log("Token saved to cookie");
    
  };
  
  // Example usage

  const loginHandler = async(e)=>{
    e.preventDefault();
    setIsLoading(true);
    // console.log(API_URL);
    try {
      const response = await axios.post(`${API_URL}/api/user/login`,logindata);
      if(response.data.success){
        toast.success(response.data.message)
        await saveTokenToCookie(response.data.data.refreshToken);
        setToken(response?.data?.data?.refreshToken)
        
        setIsLoading(false);
        navigate("/");
      }
      else{
        toast.error(response.data.message)
      }
      
    } catch (error) {
      
    }finally{
      setIsLoading(false);
    }
  }

  return (
    <>
      <section className="login-section dark-mode">
        <div className="container flex">
          <div className="row">
            <div className="heading flex">
              <div className="image-box">
                <img src="../../../images/logo2.png" alt="" />
              </div>
              <h1>Login</h1>
              {/* <p>Welcome Back.</p> */}
            </div>
            <div className="content">
              <form onSubmit={loginHandler}>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="Username or Email Address"
                    required
                    value={logindata.email}
                    onChange={(e) =>
                      setLogindata((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={`${dark ? "setdark" : ""}`}
                  />
                </div>

                <div className="input-box">
                  <input
                    type="password"
                    value={logindata.password}
                    onChange={(e) =>
                      setLogindata((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Password"
                    required
                    className={`${dark ? "setdark" : ""}`}
                  />
                </div>

                <div className="checkbox">
                  
                      <label className="remember-me">
                        <input type="checkbox" />
                        Remember Me
                      </label>
                    <ul className="flex">
                    <li className="forget-password">
                      {" "}
                      <NavLink to="/forgate">Forgot Password?</NavLink>{" "}
                    </li>
                  </ul>
                </div>
                <div className="btn flex">
                  {
                    isLoading && 
                    <LoadingButton isDarkMode={dark}/>
                  }
                  {
                    !isLoading &&
                    <button>LOGIN</button>

                  }
                </div>
              </form>
              <p>
                Don't have an Account
                <NavLink to="/signup">Create New !</NavLink>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Login;
