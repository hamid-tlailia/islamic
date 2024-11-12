import React, { useState, useEffect } from "react";
import { useTranslation } from "../../../../components/languages/provider";
import "./radio.css"; // Ensure this CSS file is updated
import { Typography, Skeleton } from "@mui/material";
import radioImage from "./images/radio.jpg";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const Radio = ({ src, audioName, isPlaying, toTop }) => {
  const { language } = useTranslation();
  const [radios, setRadios] = useState([]);
  const [filteredRadios, setFilteredRadios] = useState([]); // For search
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [showSearch, setShowSearch] = useState(false); // Whether to show search input
  const [activeRadioId, setActiveRadioId] = useState(null);
  const [currentRadio, setCurrentRadio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRadiosGrid, setShowRadiosGrid] = useState(true);
  const [searchResultMessage, setSearchResultMessage] = useState("");

  useEffect(() => {
    // Fetch the radios data from the API
    fetch("https://mp3quran.net/api/v3/radios")
      .then((response) => response.json())
      .then((data) => {
        if (data.radios) {
          // Only include radios with specified IDs
          const allowedRadioIds = [
            1, 2, 3, 10, 11, 14, 17, 18, 26, 30, 33, 48, 52, 53, 58, 63, 69, 79,
            105, 108, 109, 110, 113, 114, 115, 116, 117, 123, 21114, 21116,
            21117, 307, 10902, 10903, 10904, 10906, 10907, 109061,
          ];
          const filteredRadiosData = data.radios.filter((radio) =>
            allowedRadioIds.includes(radio.id)
          );
          setRadios(filteredRadiosData);
          setFilteredRadios(filteredRadiosData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching radios data:", error);
        setLoading(false);
      });
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRadios(radios);
      setSearchResultMessage("");
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = radios.filter((radio) =>
        radio.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
      if (filtered.length > 0) {
        setFilteredRadios(filtered);
        setSearchResultMessage("");
      } else {
        setSearchResultMessage(
          language === "ar"
            ? "عذرًا، لا يوجد راديو بهذا الاسم"
            : "Sorry, no radio found with this name"
        );
        setFilteredRadios([]); // Clear the filtered list if no match is found
      }
    }
    // eslint-disable-next-line
  }, [searchTerm, radios]);

  // Scroll to the currently playing radio when the grid is shown
  useEffect(() => {
    if (!loading && showRadiosGrid && isPlaying && activeRadioId) {
      const element = document.getElementById(`radio-${activeRadioId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [loading, showRadiosGrid, isPlaying, activeRadioId]);

  // Back to last playing
  const backToLastPlayedAudio = () => {
    if (!loading && isPlaying) {
      const lastPlayed = localStorage.getItem("playingRadio");
      const element = document.getElementById(lastPlayed);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("active");
        setActiveRadioId(parseInt(lastPlayed.replace("radio-", "")));
      }
    }
  };

  useEffect(() => {
    backToLastPlayedAudio();
    // eslint-disable-next-line
  }, [loading]);

  // Scroll to top when opening full-screen div
  useEffect(() => {
    if (!showRadiosGrid) {
      // Scroll radio container to top
      toTop();
    } else {
      const lastPlayed = localStorage.getItem("playingRadio");
      const element = document.getElementById(lastPlayed);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("active");
        setActiveRadioId(parseInt(lastPlayed.replace("radio-", "")));
      }
    }
    // eslint-disable-next-line
  }, [showRadiosGrid]);

  const handleRadioClick = (radio) => {
    if (radio) {
      // Set the audio source
      src(radio.url); // Ensure the correct property is used
      audioName(language === "ar" ? "الراديو" : "Radio");
      // Update the active radio
      setActiveRadioId(radio.id);
      setCurrentRadio(radio);
      setShowRadiosGrid(false); // Hide radios grid and show the playing screen
      localStorage.setItem("playingRadio", `radio-${radio.id}`);
      toTop();
      setShowSearch(false);
      setSearchTerm("");
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
        <div className="radios-grid">
          {Array.from(new Array(15)).map((_, index) => (
            <div key={index} className="sketlon-card">
              <div className="radio-image-container">
                <Skeleton variant="rectangular" className="radio-image" />
              </div>
              <Skeleton variant="text" className="radio-name" />
            </div>
          ))}
        </div>
      ) : (
        (!isPlaying || showRadiosGrid) && (
          <>
            <div className="search-container">
              {!showSearch ? (
                <button
                  className="search-icon-button"
                  onClick={() => setShowSearch(true)}
                >
                  <SearchIcon />
                </button>
              ) : (
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder={
                      language === "ar" ? "ابحث عن راديو" : "Search for radio"
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button
                    className="close-search-button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchTerm("");
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>
            {searchResultMessage !== "" && (
              <div className="alert alert-danger w-100 my-3">
                {searchResultMessage}{" "}
              </div>
            )}
            <div className="radios-grid">
              {filteredRadios.map((radio) => (
                <div
                  key={radio.id}
                  id={`radio-${radio.id}`}
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
          </>
        )
      )}
    </div>
  );
};

export default Radio;
