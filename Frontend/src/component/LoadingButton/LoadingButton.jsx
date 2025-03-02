import React from "react";
import "./LoadingButton.css";

const LoadingButton = ({ isDarkMode,className }) => {
  return (
    <button className={`loading-btn ${className} ${isDarkMode ? "dark-mode" : ""}`} disabled>
      <span className="spinner"></span>
    </button>
  );
};

export default LoadingButton;
