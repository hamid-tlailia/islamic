import { getJSON, TTL } from "../../../../lib/apiClient";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../../../../components/languages/provider";
import "./radio.css";
import { Typography, Skeleton } from "@mui/material";

import radioImage from "./images/radio.avif";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import RadioOutlinedIcon from "@mui/icons-material/RadioOutlined";
import GraphicEqOutlinedIcon from "@mui/icons-material/GraphicEqOutlined";

const Radio = ({ src, audioName, isPlaying, toTop }) => {
  const { language } = useTranslation();

  const [radios, setRadios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [activeRadioId, setActiveRadioId] = useState(null);
  const [currentRadio, setCurrentRadio] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showRadiosGrid, setShowRadiosGrid] = useState(true);
  const [searchResultMessage, setSearchResultMessage] = useState("");

  // Fetch radios
  useEffect(() => {
    getJSON("https://mp3quran.net/api/v3/radios", { ttl: TTL.LONG })
      .then((data) => {
        if (data.radios) {
          const allowedRadioIds = [
            1, 2, 3, 10, 11, 14, 17, 18, 26, 30, 33, 48, 52, 53, 58, 63, 69, 79,
            105, 108, 109, 110, 113, 114, 115, 116, 117, 123, 21114, 21116,
            21117, 307, 10902, 10903, 10904, 10906, 10907, 109061,
          ];

          const filtered = data.radios.filter((r) =>
            allowedRadioIds.includes(r.id)
          );
          setRadios(filtered);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching radios data:", error);
        setLoading(false);
      });
  }, []);

  // Filter radios by search (memo)
  const filteredRadios = useMemo(() => {
    if (!searchTerm.trim()) {
      setSearchResultMessage("");
      return radios;
    }

    const q = searchTerm.toLowerCase().trim();
    const filtered = radios.filter((radio) =>
      radio.name.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      setSearchResultMessage(
        language === "ar"
          ? "عذرًا، لا يوجد راديو بهذا الاسم"
          : "Sorry, no radio found with this name"
      );
    } else {
      setSearchResultMessage("");
    }
    return filtered;
    // eslint-disable-next-line
  }, [searchTerm, radios, language]);

  // Scroll to current playing in grid
  useEffect(() => {
    if (!loading && showRadiosGrid && isPlaying && activeRadioId) {
      const el = document.getElementById(`radio-${activeRadioId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, showRadiosGrid, isPlaying, activeRadioId]);

  // Back to last playing
  const backToLastPlayedAudio = () => {
    if (!loading && isPlaying) {
      const lastPlayed = localStorage.getItem("playingRadio");
      const el = document.getElementById(lastPlayed);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("active");
        setActiveRadioId(parseInt(lastPlayed.replace("radio-", ""), 10));
      }
    }
  };

  useEffect(() => {
    backToLastPlayedAudio();
    // eslint-disable-next-line
  }, [loading]);

  // Scroll to top when full-screen opens
  useEffect(() => {
    if (!showRadiosGrid) {
      toTop();
    } else {
      const lastPlayed = localStorage.getItem("playingRadio");
      const el = document.getElementById(lastPlayed);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("active");
        setActiveRadioId(parseInt(lastPlayed.replace("radio-", ""), 10));
      }
    }
    // eslint-disable-next-line
  }, [showRadiosGrid]);

  const handleRadioClick = (radio) => {
    if (!radio) return;

    src(radio.url);
    audioName(language === "ar" ? "الراديو" : "Radio");

    setActiveRadioId(radio.id);
    setCurrentRadio(radio);

    setShowRadiosGrid(false);
    localStorage.setItem("playingRadio", `radio-${radio.id}`);

    toTop();
    setShowSearch(false);
    setSearchTerm("");
  };

  const handleBackClick = () => {
    setShowRadiosGrid(true);
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <div className="radio-container" dir={dir}>
      {/* NOW PLAYING SCREEN */}
      {isPlaying && currentRadio && !showRadiosGrid && (
        <div className="nowPlayingScreen">
          <div className="npTopbar">
            <button
              className="npBackBtn"
              onClick={handleBackClick}
              aria-label="Back"
            >
              <ArrowBackIcon />
            </button>

            <div className="npTitleWrap">
              <span className="npBadge">
                <RadioOutlinedIcon fontSize="small" />
                {language === "ar" ? "يعمل الآن" : "Now Playing"}
              </span>
              <Typography variant="h6" className="npName">
                {currentRadio.name}
              </Typography>
            </div>
          </div>

          <div className="npCenter">
            <div className="npCard">
              <div className="npDiscWrap">
                <div className="npDiscGlow" />
                <img className="npDisc" src={radioImage} alt="radio" />
                <div className="npDiscDot" />
              </div>

              <div className="npEq">
                <span className="npEqBar" />
                <span className="npEqBar" />
                <span className="npEqBar" />
                <span className="npEqBar" />
                <span className="npEqBar" />
              </div>

              <div className="npHint">
                <GraphicEqOutlinedIcon fontSize="small" />
                <span>
                  {language === "ar"
                    ? "يمكنك الرجوع للقائمة لتغيير المحطة"
                    : "Go back to change station"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIST SCREEN */}
      {loading ? (
        <div className="radiosWrap">
          <div className="radioTopbar">
            <div className="radioTopbarTitle">
              <RadioOutlinedIcon />
              <span>{language === "ar" ? "الراديو" : "Radio"}</span>
            </div>

            <div className="radioTopbarRight">
              <div className="radioSearchFake" />
            </div>
          </div>

          <div className="radios-grid">
            {Array.from(new Array(16)).map((_, index) => (
              <div key={index} className="radio-card skel">
                <div className="radio-image-container">
                  <Skeleton variant="rectangular" className="radio-image" />
                </div>
                <div className="radio-skel-text">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="70%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        (!isPlaying || showRadiosGrid) && (
          <div className="radiosWrap">
            {/* Sticky topbar */}
            <div className="radioTopbar">
              <div className="radioTopbarTitle">
                <RadioOutlinedIcon />
                <span>{language === "ar" ? "الراديو" : "Radio"}</span>
              </div>

              <div className="radioTopbarRight">
                {!showSearch ? (
                  <button
                    className="topbarIconBtn"
                    onClick={() => setShowSearch(true)}
                    aria-label="open search"
                  >
                    <SearchIcon />
                  </button>
                ) : (
                  <div className="topbarSearch">
                    <input
                      type="text"
                      placeholder={
                        language === "ar"
                          ? "ابحث عن راديو..."
                          : "Search radio..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="topbarSearchInput"
                    />
                    <button
                      className="topbarIconBtn danger"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchTerm("");
                      }}
                      aria-label="close search"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result message */}
            {searchResultMessage !== "" && (
              <div className="radioAlert">{searchResultMessage}</div>
            )}

            {/* Grid */}
            <div className="radios-grid">
              {filteredRadios.map((radio) => {
                const active = isPlaying && radio.id === activeRadioId;
                return (
                  <div
                    key={radio.id}
                    id={`radio-${radio.id}`}
                    className={`radio-card ${active ? "active" : ""}`}
                    onClick={() => handleRadioClick(radio)}
                  >
                    <div className="radio-image-container">
                      <img
                        src={radioImage}
                        alt={radio.name}
                        className="radio-image real"
                      />

                      {active && (
                        <div className="radioNowBadge">
                          <span className="miniEq">
                            <i />
                            <i />
                            <i />
                          </span>
                          {language === "ar" ? "يعمل الآن" : "LIVE"}
                        </div>
                      )}
                    </div>

                    <Typography variant="subtitle1" className="radio-name">
                      {radio.name}
                    </Typography>
                  </div>
                );
              })}
            </div>

            {/* Mini footer hint */}
            {isPlaying && (
              <div className="radioMiniHint">
                {language === "ar"
                  ? "اضغط على المحطة لتشغيلها، أو ارجع للمحطة الحالية تلقائيًا"
                  : "Tap a station to play, you can always return to the current one"}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Radio;
