import React, { useEffect, useRef, useState } from "react";
import "./player.css";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { toast } from "react-toastify";
import { useTranslation } from "../languages/provider";

const Player = ({ show, hidePlayer, src, surah_name, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const { language } = useTranslation();

  useEffect(() => {
    if (isPlaying && surah_name) {
      document.title = surah_name;
    } else {
      document.title = title;
    }
  }, [isPlaying, surah_name, title]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
      if (progressRef.current) {
        progressRef.current.value = (audio.currentTime / audio.duration) * 100;
      }
    };

    const handleLoadedData = () => {
      setDuration(audio.duration);
      setLoaded(false);
      updateProgress();
    };

    const handleLoadStart = () => {
      setLoaded(true);
      setCurrentTime(0);
      setDuration(0);
      if (progressRef.current) {
        progressRef.current.value = 0;
      }
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.pause();
      setIsPlaying(false);
    };

    // Listen for pause events from external controls (e.g., notification tray)
    const handlePauseFromExternal = () => {
      setIsPlaying(false);
    };
    // Listen for play events from external controls (e.g., notification tray)
    const handlePlayFromExternal = () => {
      setIsPlaying(true);
    };
    // Add event listeners
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePauseFromExternal);
    audio.addEventListener("play", handlePlayFromExternal);

    // Clean up event listeners
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePauseFromExternal);
      audio.removeEventListener("play", handlePlayFromExternal);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (show && src) {
      audio.src = src;
      audio.load();
      setIsPlaying(true);
      audio
        .play()
        .catch((error) => console.error("Play was interrupted:", error));
    } else if (!show) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      audio.src = "";
    }
  }, [show, src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio
        .play()
        .catch((error) => console.error("Play was interrupted:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const progress = e.target.value;
    audio.currentTime = (progress / 100) * audio.duration;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleDownload = async () => {
    const audioUrl = audioRef?.current?.src;
    if (!audioUrl) return;
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error("CORS issue or network error");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${surah_name || "audio"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // If there's a CORS error, set the link directly to the audio URL
      const link = document.createElement("a");
      link.setAttribute("target", "_blank");
      link.href = audioUrl;
      link.download = `${surah_name || "audio"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show a message if needed
      toast.info(
        language === "ar"
          ? "الملف غير متوفر للتحميل، تم استخدام الرابط المباشر"
          : "File not available for download, using direct link"
      );
    }
  };

  return (
    <div
      className={
        show
          ? "quran-player d-flex flex-column justify-content-center align-items-center active"
          : "quran-player d-flex flex-column justify-content-center align-items-center"
      }
    >
      <div className="text-center surah-name">
        {surah_name && `✧ ${surah_name} ✧`}
      </div>
      <audio
        ref={audioRef}
        className="d-none"
        preload="auto"
        onLoadedData={() => setLoaded(false)}
      ></audio>
      <div className="player-controls">
        {loaded ? (
          <div className="dot-spinner">
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
          </div>
        ) : (
          <div className="d-flex flex-row justify-content-center align-items-center gap-2">
            <button
              className="btn btn-gold text-primary p-0"
              onClick={togglePlayPause}
            >
              {isPlaying ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
            </button>
            <button
              className="btn btn-gold text-primary p-0"
              onClick={handleVolumeToggle}
            >
              {isMuted ? <VolumeOffOutlinedIcon /> : <VolumeUpOutlinedIcon />}
            </button>
          </div>
        )}
        <span className="current-time mt-1">{formatTime(currentTime)}</span>
        <input
          type="range"
          id="range"
          className={loaded ? "w-100 bar mt-1 pe-none" : "w-100 bar mt-1"}
          ref={progressRef}
          onChange={handleProgressChange}
          min="0"
          max="100"
        />
        <span className="duration">
          {loaded ? "-:-" : formatTime(duration)}
        </span>
        <div className="buttons">
          {!loaded && (
            <button
              className="btn btn-gold text-primary p-0"
              onClick={handleDownload}
            >
              <DownloadOutlinedIcon />
            </button>
          )}
          <button
            className="btn btn-gold text-danger p-0"
            onClick={() => {
              const restoreDocumentTitle = localStorage.getItem("pageTitle");
              document.title = restoreDocumentTitle
                ? restoreDocumentTitle
                : "دين الله";
              hidePlayer();
            }}
          >
            <CloseOutlinedIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
