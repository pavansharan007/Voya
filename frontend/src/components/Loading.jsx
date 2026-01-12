import React from "react";
import './Spinner.css'
const DualSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        {/* The Breathing Glow */}
        <div className="breathing-glow"></div>
        
        {/* The Liquid Spinner */}
        <div className="main-spinner"></div>
      </div>

      {/* The Blinking Text */}
      <div className="loading-status">
        <span className="blinking-text">Loading</span>
        <div className="breathing-underline"></div>
      </div>
    </div>
  );
};

export default DualSpinner;
