import React, { useState, useEffect } from "react";
import { useTranslation } from "../../../../components/languages/provider";
import "./radio.css"; // Ensure this CSS file is updated
import { Typography, CircularProgress } from "@mui/material";
import radioImage from "./images/radio.jpg";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Qiblah = ({ src, audioName, isPlaying }) => {
  const { language } = useTranslation();
  const [radios, setRadios] = useState([]);
  const [activeRadioId, setActiveRadioId] = useState(null);
  const [currentRadio, setCurrentRadio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRadiosGrid, setShowRadiosGrid] = useState(true);

  useEffect(() => {
    // Fetch the radios data from the API
    fetch("https://mp3quran.net/api/v3/radios")
      .then((response) => response.json())
      .then((data) => {
        if (data.radios) {
          // Filter out radios with IDs from 109040 to 109059
          const filteredRadios = data.radios.filter(
            (radio) => radio.id < 109040 || radio.id > 109059
          );
          setRadios(filteredRadios);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching radios data:", error);
        setLoading(false);
      });
  }, []);

  const handleRadioClick = (radio) => {
    if (radio) {
      // Set the audio source
      src(radio.url); // Ensure the correct property is used
      audioName(language === "ar" ? "الراديو" : "Radio");
      // Update the active radio
      setActiveRadioId(radio.id);
      setCurrentRadio(radio);
      setShowRadiosGrid(false); // Hide radios grid and show the playing screen
    }
  };

  const handleBackClick = () => {
    setShowRadiosGrid(true); // Show radios grid again
  };

  return (
    <div className="radio-container">
      {isPlaying && currentRadio && !showRadiosGrid && (
        <div className="current-radio-screen">
          <div className="overlay">
            <div className="header">
              <button className="back-button" onClick={handleBackClick}>
                <ArrowBackIcon style={{ color: "red" }} />
              </button>
              <Typography variant="h6" className="current-radio-name">
                {currentRadio.name}
              </Typography>
            </div>
            <div className="equalizer">
              <span className="equalizer-bar"></span>
              <span className="equalizer-bar"></span>
              <span className="equalizer-bar"></span>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : (
        (!isPlaying || showRadiosGrid) && (
          <div className="radios-grid">
            {radios.map((radio) => (
              <div
                key={radio.id}
                className={`radio-card ${
                  isPlaying && radio.id === activeRadioId ? "active" : ""
                }`}
                onClick={() => handleRadioClick(radio)}
              >
                <div className="radio-image-container">
                  {isPlaying && radio.id === activeRadioId && (
                    <div className="playing-indicator">
                      <span className="equalizer-bar"></span>
                      <span className="equalizer-bar"></span>
                      <span className="equalizer-bar"></span>
                    </div>
                  )}
                  <img
                    src={radioImage}
                    alt={radio.name}
                    className="radio-image"
                  />
                </div>
                <Typography
                  variant="subtitle1"
                  className="radio-name text-primary p-2 text-center"
                >
                  {radio.name}
                </Typography>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Qiblah;
