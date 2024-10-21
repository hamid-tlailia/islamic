import React from "react";
import "./loader.css";
import logo from "../images/logo.png";

const Loader = () => {
  return (
    <div className="loader-content">
      <div class="loader-container">
        <div class="loader">
          <div class="spinner"></div>
          <img src={logo} alt="Loading..." />
        </div>
      </div>
    </div>
  );
};

export default Loader;
