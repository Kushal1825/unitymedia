import React from "react";
import "./Checkmark.css";

const Checkmark = ({ status }) => {
  return (
    <div className={`checkmark ${status}`}>
      <span className="check one">✔</span>
      <span className="check two">✔</span>
    </div>
  );
};

export default Checkmark;
