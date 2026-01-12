// Player.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./player.css";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import { toast } from "react-toastify";
import { useTranslation } from "../languages/provider";

const Player = ({ show, hidePlayer, src, surah_name, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // ✅ loader flag (true = show spinner)
  const [loaded, setLoaded] = useState(false);

  // ✅ minimized: only floating icon
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const { language } = useTranslation();

  // ✅ resume key
  const resumeKey = useMemo(() => {
    const base = src || "";
    const name = surah_name || "";
    return `player_resume::${name}::${base}`;
  }, [src, surah_name]);

  const saveThrottleRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (isPlaying && surah_name) document.title = surah_name;
    else document.title = title;
  }, [isPlaying, surah_name, title]);

  // -------------------- audio listeners --------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);

      if (
        progressRef.current &&
        isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        progressRef.current.value = (audio.currentTime / audio.duration) * 100;
      }

      // ✅ resume save (every ~2s)
      const now = Date.now();
      if (!isLiveStream && isFinite(audio.duration) && audio.duration > 0) {
        if (now - saveThrottleRef.current > 2000) {
          saveThrottleRef.current = now;
          localStorage.setItem(
            resumeKey,
            JSON.stringify({
              t: Math.floor(audio.currentTime),
              d: Math.floor(audio.duration),
              at: now,
            })
          );
        }
      }
    };

    // ✅ NOTE: loadeddata fires early; DON'T hide loader here
    const handleLoadedData = () => {
      setDuration(audio.duration);

      const live = isNaN(audio.duration) || !isFinite(audio.duration);
      setIsLiveStream(live);

      // ✅ Resume seek (only for normal files)
      if (!live && isFinite(audio.duration) && audio.duration > 0) {
        try {
          const saved = localStorage.getItem(resumeKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            const savedT = Number(parsed?.t ?? 0);

            if (savedT > 3 && savedT < audio.duration - 2) {
              audio.currentTime = savedT;
              setCurrentTime(savedT);
              if (progressRef.current) {
                progressRef.current.value = (savedT / audio.duration) * 100;
              }
            }
          }
        } catch {}
      }

      updateProgress();
    };

    const handleLoadStart = () => {
      setLoaded(true); // ✅ show loader on first load
      setCurrentTime(0);
      setDuration(0);
      setIsLiveStream(false);
      if (progressRef.current) progressRef.current.value = 0;
    };

    const handleWaiting = () => setLoaded(true);

    // ✅ “actually ready to play” events
    const handleCanPlay = () => setLoaded(false);
    const handlePlaying = () => setLoaded(false);

    // ✅ seek events (progress bar)
    const handleSeeking = () => {
      // show loader while seeking if not live
      if (!isLiveStream) setLoaded(true);
    };
    const handleSeeked = () => setLoaded(false);

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.pause();
      setIsPlaying(false);
      setLoaded(false);
      try {
        localStorage.removeItem(resumeKey);
      } catch {}
    };

    const handlePauseExternal = () => setIsPlaying(false);
    const handlePlayExternal = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("waiting", handleWaiting);

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);

    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("seeked", handleSeeked);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePauseExternal);
    audio.addEventListener("play", handlePlayExternal);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("waiting", handleWaiting);

      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);

      audio.removeEventListener("seeking", handleSeeking);
      audio.removeEventListener("seeked", handleSeeked);

      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePauseExternal);
      audio.removeEventListener("play", handlePlayExternal);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resumeKey, isLiveStream]);

  // -------------------- load/unload src --------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (show && src) {
      setLoaded(true); // ✅ show loader immediately when opening player

      audio.src = src;

      // ✅ Force audible defaults
      audio.muted = isMuted;
      audio.volume = 1;

      audio.load();
      setIsPlaying(true);

      // play may be blocked
      audio.play().catch((err) => {
        console.warn("Autoplay blocked:", err);
        setIsPlaying(false);
        // keep loader off if blocked (no buffering happening)
        setLoaded(false);
      });
    } else if (!show) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setLoaded(false);
      audio.src = "";
      setIsMinimized(false);
    }
    // eslint-disable-next-line
  }, [show, src]);

  // keep audio muted in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    // show loader while starting (until canplay/playing)
    setLoaded(true);

    audio.muted = isMuted;
    if (audio.volume === 0) audio.volume = 1;

    audio.play().catch((err) => {
      console.warn("Play blocked:", err);
      setIsPlaying(false);
      setLoaded(false);
    });
  };

  const handleVolumeToggle = () => setIsMuted((m) => !m);

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;

    const progress = Number(e.target.value);

    // ✅ show loader immediately on seek
    setLoaded(true);

    const nextTime = (progress / 100) * audio.duration;

    // requestAnimationFrame prevents some mobile glitching
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      audio.currentTime = nextTime;
    });
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "-:-";
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
    } catch {
      const link = document.createElement("a");
      link.setAttribute("target", "_blank");
      link.href = audioUrl;
      link.download = `${surah_name || "audio"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.info(
        language === "ar"
          ? "الملف غير متوفر للتحميل، تم استخدام الرابط المباشر"
          : "File not available for download, using direct link"
      );
    }
  };

  const handleClosePlayer = () => {
    const restoreDocumentTitle = localStorage.getItem("pageTitle");
    document.title = restoreDocumentTitle ? restoreDocumentTitle : "دين الله";

    setIsMinimized(false);
    hidePlayer();
  };

  const minimize = () => setIsMinimized(true);
  const expand = () => setIsMinimized(false);

  const showFab = show && isMinimized;

  return (
    <>
      {/* ✅ Floating music icon when minimized */}
      {showFab && (
        <button
          className="player-fab"
          onClick={expand}
          aria-label="Open player"
          title={language === "ar" ? "فتح المشغل" : "Open player"}
        >
          <MusicNoteOutlinedIcon />
        </button>
      )}

      <div
        className={`quran-player ${show ? "active" : ""} ${
          isMinimized ? "min" : ""
        }`}
      >
        {/* IMPORTANT: audio must stay mounted always */}
        <audio ref={audioRef} className="d-none" preload="auto" playsInline />

        {/* Full UI hidden when minimized */}
        {!isMinimized && (
          <div className="player-shell">
            <div className="player-top">
              <div className="player-titleWrap">
                <span className={`player-badge ${isLiveStream ? "live" : ""}`}>
                  {isLiveStream
                    ? language === "ar"
                      ? "مباشر"
                      : "Live"
                    : language === "ar"
                    ? "تشغيل"
                    : "Playing"}
                  {isLiveStream && <span className="record-dot" />}
                </span>

                <div className="player-title" title={surah_name || ""}>
                  {surah_name ? `✧ ${surah_name} ✧` : ""}
                </div>
              </div>

              <div className="player-actions">
                <button
                  className="pbtn"
                  onClick={minimize}
                  aria-label="Minimize"
                  title={language === "ar" ? "تصغير" : "Minimize"}
                >
                  <ExpandMoreOutlinedIcon />
                </button>

                {!loaded && !isLiveStream && (
                  <button
                    className="pbtn"
                    onClick={handleDownload}
                    aria-label="Download"
                    title={language === "ar" ? "تحميل" : "Download"}
                  >
                    <DownloadOutlinedIcon />
                  </button>
                )}

                <button
                  className="pbtn danger"
                  onClick={handleClosePlayer}
                  aria-label="Close"
                  title={language === "ar" ? "إغلاق" : "Close"}
                >
                  <CloseOutlinedIcon />
                </button>
              </div>
            </div>

            <div className="player-mid">
              <div className="player-leftControls">
                {loaded ? (
                  <div className="dot-spinner" aria-label="Loading">
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
                  <>
                    <button
                      className="pbtn main"
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <PauseOutlinedIcon />
                      ) : (
                        <PlayArrowOutlinedIcon />
                      )}
                    </button>

                    <button
                      className="pbtn"
                      onClick={handleVolumeToggle}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeOffOutlinedIcon />
                      ) : (
                        <VolumeUpOutlinedIcon />
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="player-progress">
                <div className="time-row">
                  <span className="time">{formatTime(currentTime)}</span>
                  <span className="time">
                    {isLiveStream
                      ? "-:-"
                      : loaded
                      ? "-:-"
                      : formatTime(duration)}
                  </span>
                </div>

                <input
                  type="range"
                  className={`bar ${loaded || isLiveStream ? "pe-none" : ""}`}
                  ref={progressRef}
                  // ✅ onInput works better on mobile (continuous)
                  onInput={handleProgressChange}
                  // ✅ keep onChange too (desktop / fallback)
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                  defaultValue="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Player;
