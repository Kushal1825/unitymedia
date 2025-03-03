import React from "react";
import "./PostSkeleton.css";
import { useDarkMode } from "../../DarkModeContext/DarkModeContext.jsx";

const PostSkeleton = () => {
  const { dark } = useDarkMode();

  return (
    <div className={`post-skeleton ${dark ? "dark" : ""}`}>
      <div className="skeleton header">
        <div className="skeleton avatar"></div>
        <div className="skeleton name"></div>
      </div>
      <div className="skeleton image"></div>
      <div className="skeleton caption"></div>
      <div className="skeleton actions"></div>
    </div>
  );
};

export default PostSkeleton;
