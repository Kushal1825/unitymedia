import React, { useContext, useEffect, useState } from "react";
import "./home.css";
import { useDarkMode } from "../DarkModeContext/DarkModeContext";
import ApiContext from "../../utils/ApiContext";
import axios from "axios";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import SuggestionSkeleton from "./suggestionSkeleton/SuggestionSkeleton";
const Suggestion = () => {
  const { dark } = useDarkMode();
  const { API_URL, token } = useContext(ApiContext);
  const [users, setUsers] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(true);

  const fetchSuggestionList = async () => {
    try {
      setSuggestionLoading(true);
      const response = await axios.get(`${API_URL}/api/user/suggest/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.data) {
        setUsers((prev) => [...response.data.data]);
        // console.log(...users);
        setSuggestionLoading(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const followHandler = async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/follow/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      if (response.data.success) {
        await fetchSuggestionList();
      }
      // console.log(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchSuggestionList();
  }, []);

  return (
    <>
      <div className={`suggestion ${dark ? "setdark" : ""} `}>
        <div className={`heading ${dark ? "setdark" : ""}`}>
          <h4>Suggestions For you</h4>
        </div>
        <div className={`content ${dark ? "setdark" : ""}`}>
          {suggestionLoading && (<>
            <SuggestionSkeleton />
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </>
            )}
          {!suggestionLoading && (
            <ul>
              {users.map((user) => (
                <li key={user._id} className={`${dark ? "setdark" : ""}`}>
                  <div className="person flex">
                    <div className="image-box">
                      <img
                        src={user.avatar.url || "./images/user.png"}
                        alt={user.name}
                      />
                    </div>
                    <div className="detail flex">
                      <NavLink to={`/${user.username}`}>
                        <h4 className={`${dark ? "setdark" : ""}`}>
                          {user.username}
                        </h4>
                        <p>{user?.fullName}</p>
                      </NavLink>
                      <button onClick={() => followHandler(user._id)}>
                        Follow
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
export default Suggestion;
