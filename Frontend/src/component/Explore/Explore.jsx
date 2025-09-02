import React, { useContext, useEffect, useState } from "react";
import "./explore.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext.jsx";
import ApiContext from "../../utils/ApiContext.jsx";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FcLike } from 'react-icons/fc';
import { FaCommentDots } from 'react-icons/fa';

const Explore = () => {
  const { dark, navbarActive } = useDarkMode();
  const { API_URL, token } = useContext(ApiContext);
  const [exploredata, setExploreData] = useState([]);
  const nevigate = useNavigate();
  const fetchData = async () => {
    const response = await axios.get(`${API_URL}/api/post/explore`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log(response.data.data);

    if (response.data.data) {
      setExploreData((prev) => response.data.data);
      // console.log(exploredata);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);


  const navigate = useNavigate();
  const location = useLocation();

  const openPost = (id) => {
    navigate(`/p/${id}`, { state: { background: location } });
  };


  return (
    <section
      className={`explore-section ${dark ? "setdark" : ""} ${
        navbarActive ? "compromise" : ""
      }`}
    >
      <div className="container">
        <div className="row">
          <div className={`box`}>
            {exploredata.map((data) => (
              <div
                className={`image-box ${dark ? "setdark" : ""}`}
                key={data._id}
                onClick={()=>openPost(data._id)} style={{ cursor: "pointer" }}
              >
                <div className="image">
                  <img src={data?.image} alt={data.name} />
                  <div className="details flex">
                    <span><FcLike/> {data.likes}</span>
                    <span><FaCommentDots/> {data.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Explore;
