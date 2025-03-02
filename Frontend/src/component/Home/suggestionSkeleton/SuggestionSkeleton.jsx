import React from "react";
import "./SuggestionSkeleton.css";

const SuggestionSkeleton = () => {
  return (
    <div className="suggestion-skeleton">
      <div className="skeleton avatar"></div>
      <div className="skeleton info">
        <div className="skeleton name"></div>
        <div className="skeleton username"></div>
      </div>
      <div className="skeleton button"></div>
    </div>
  );
};

export default SuggestionSkeleton;
