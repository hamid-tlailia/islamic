// Header.jsx
import React, { useEffect, useRef, useState } from "react";
import "./header.css";
import logo from "../images/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined as HomeOutlinedIcon,
  WidgetsOutlined as WidgetsOutlinedIcon,
  CloseOutlined as CloseOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  ManageSearchOutlined as ManageSearchOutlinedIcon,
} from "@mui/icons-material";
import ApiOutlinedIcon from "@mui/icons-material/ApiOutlined";
import { Select, Option } from "@mui/joy";
import { useTranslation } from "../languages/provider";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import BrightnessAutoOutlinedIcon from "@mui/icons-material/BrightnessAutoOutlined";
import FilterBAndWOutlinedIcon from "@mui/icons-material/FilterBAndWOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import RingVolumeOutlinedIcon from "@mui/icons-material/RingVolumeOutlined";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "emailjs-com";
import { loadFontTheme } from "../../styles/fonts";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Button, FormControl, FormLabel, CircularProgress } from "@mui/joy";
import DOMPurify from "dompurify";
import { useMediaQuery } from "@mui/material";

const Header = ({ onNavClick, visibility, size }) => {
  const { changeLanguage, translations, language } = useTranslation();

  const [darkSwitched, setDarkSwitched] = useState(false);
  const [open, setOpen] = useState(false);
  const [textSize, setTextSize] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isNetworkWeak, setIsNetworkWeak] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputDirection, setInputDirection] = useState("rtl");
  const [fontTheme, setFontTheme] = useState("");
  const [activeClass, setActiveClass] = useState("");

  // ✅ drawer state to hide header while mobile nav is open
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // form data
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    // Optional: lets the reporter be answered. Blank falls back to the
    // site's own address so the template's reply-to is never empty.
    email: "",
  });

  const mobileHeader = useRef(null);
  const isBigScreen = useMediaQuery("(min-width:500px)");

  // Define classes to check (excluding dark-mode/light-mode)
  const classesToCheck = ["light-filter", "brightness", "image", "sky"];

  // -------------------- NOTCH DRAG (RESPONSIVE) --------------------
  const notchRef = useRef(null);

  // store ratios 0..1 so it scales with screen
  const [, setNotchRatio] = useState({ x: 1, y: 0.5 }); // ✅ default: middle-right
  const ratioRef = useRef({ x: 1, y: 0.5 });

  // render pixels
  const [notchNavPosition, setNotchNavPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const positionRef = useRef({ x: 0, y: 0 });

  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef(null);

  // margins
  const EDGE_MARGIN = 12; // left/right safe space
  const TOP_MARGIN = 16; // keep notch away from top
  const BOTTOM_MARGIN = 16; // keep notch away from bottom

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  const getBounds = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const w = notchRef.current?.offsetWidth || 0;
    const h = notchRef.current?.offsetHeight || 0;

    const minX = EDGE_MARGIN;
    const maxX = Math.max(EDGE_MARGIN, vw - w - EDGE_MARGIN);

    const minY = TOP_MARGIN;
    const maxY = Math.max(TOP_MARGIN, vh - h - BOTTOM_MARGIN);

    return { minX, maxX, minY, maxY };
  };

  const ratioToPx = (ratio) => {
    const { minX, maxX, minY, maxY } = getBounds();
    const x = minX + ratio.x * (maxX - minX);
    const y = minY + ratio.y * (maxY - minY);
    return { x, y };
  };

  const pxToRatio = (px) => {
    const { minX, maxX, minY, maxY } = getBounds();

    const safeX = clamp(px.x, minX, maxX);
    const safeY = clamp(px.y, minY, maxY);

    const rx = maxX === minX ? 0 : (safeX - minX) / (maxX - minX);
    const ry = maxY === minY ? 0 : (safeY - minY) / (maxY - minY);

    return { x: clamp(rx, 0, 1), y: clamp(ry, 0, 1) };
  };

  const applyRatio = (ratio) => {
    const px = ratioToPx(ratio);
    setNotchNavPosition(px);
    positionRef.current = px;

    setNotchRatio(ratio);
    ratioRef.current = ratio;
  };

  const updatePositionPx = (newX, newY) => {
    const { minX, maxX, minY, maxY } = getBounds();

    const constrainedX = clamp(newX, minX, maxX);
    const constrainedY = clamp(newY, minY, maxY);

    const px = { x: constrainedX, y: constrainedY };
    setNotchNavPosition(px);
    positionRef.current = px;

    const nextRatio = pxToRatio(px);
    setNotchRatio(nextRatio);
    ratioRef.current = nextRatio;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    dragStartPos.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() =>
      updatePositionPx(newX, newY),
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;

    // ✅ save ratio (not pixels)
    localStorage.setItem("notchNavRatio", JSON.stringify(ratioRef.current));

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    const touch = e.touches[0];

    dragStartPos.current = {
      x: touch.clientX - positionRef.current.x,
      y: touch.clientY - positionRef.current.y,
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - dragStartPos.current.x;
    const newY = touch.clientY - dragStartPos.current.y;

    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() =>
      updatePositionPx(newX, newY),
    );
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;

    // ✅ save ratio (not pixels)
    localStorage.setItem("notchNavRatio", JSON.stringify(ratioRef.current));

    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line
  }, []);

  /*
   * The dock steps aside while the reader is going down the page.
   *
   * It floats over the text, and on a phone that is most of the width of a
   * line — so on a long adhkar or tafsir page it sits on top of the very
   * thing being read. Scrolling down tucks it out to the nearest side edge;
   * scrolling back up, or returning near the top, brings it back. It never
   * moves while it is being dragged, and the thresholds are wide enough that
   * the small jitter of a finger resting on the screen does not toggle it.
   */
  const [notchTucked, setNotchTucked] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let queued = false;

    const settle = () => {
      queued = false;
      const y = window.scrollY;
      const delta = y - last;

      if (isDraggingRef.current) {
        last = y;
        return;
      }

      if (y < 120) setNotchTucked(false);
      else if (delta > 8) setNotchTucked(true);
      else if (delta < -8) setNotchTucked(false);

      last = y;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(settle);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Out through whichever edge it is already closest to. */
  const tuckDirection =
    notchNavPosition.x + 26 > window.innerWidth / 2 ? "1" : "-1";

  // -------------------- THEME --------------------
  const setTheme = (e) => {
    const body = document.body;
    body.classList.remove("dark-mode", "light-mode", ...classesToCheck);

    setActiveClass("");
    localStorage.removeItem("bodyClass");

    if (e.target.checked) {
      body.classList.add("dark-mode");
      setDarkSwitched(true);
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.add("light-mode");
      setDarkSwitched(false);
      localStorage.setItem("theme", "light");
    }
  };

  // Init theme + bg + font + notch position (ratio)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const body = document.body;

    if (savedTheme === "dark") {
      body.classList.add("dark-mode");
      setDarkSwitched(true);
    } else {
      body.classList.add("light-mode");
      setDarkSwitched(false);
    }

    const savedBodyClass = localStorage.getItem("bodyClass");
    if (savedBodyClass && classesToCheck.includes(savedBodyClass)) {
      body.classList.remove(...classesToCheck);
      body.classList.add(savedBodyClass);
      setActiveClass(savedBodyClass);
    } else {
      body.classList.remove(...classesToCheck);
      setActiveClass("");
    }

    const savedFontTheme = localStorage.getItem("fontTheme");
    if (savedFontTheme) {
      setFontTheme(savedFontTheme);
      body.classList.add(savedFontTheme);
    } else {
      setFontTheme("font-default");
      body.classList.add("font-default");
      localStorage.setItem("fontTheme", "font-default");
    }

    // ✅ load notch ratio
    const savedRatio = localStorage.getItem("notchNavRatio");
    if (savedRatio) {
      try {
        const parsed = JSON.parse(savedRatio);
        ratioRef.current = {
          x: typeof parsed.x === "number" ? clamp(parsed.x, 0, 1) : 1,
          y: typeof parsed.y === "number" ? clamp(parsed.y, 0, 1) : 0.5,
        };
      } catch {
        ratioRef.current = { x: 1, y: 0.5 };
      }
    } else {
      // default: middle-right
      ratioRef.current = { x: 1, y: 0.5 };
    }
    // eslint-disable-next-line
  }, []);

  // ✅ apply ratio after mount + on resize
  useEffect(() => {
    const raf = requestAnimationFrame(() => applyRatio(ratioRef.current));

    const onResize = () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => {
        applyRatio(ratioRef.current);
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // Apply font theme
  useEffect(() => {
    const body = document.body;

    const allFontClasses = [
      "font-default",
      "font-arial",
      "font-times",
      "font-courier",
      "font-scheherazade",
      "font-amiri",
      "font-lateef",
      "font-modern",
      "font-noto-arabic",
      "font-uthmanic",
      "font-roboto",
      "font-georgia",
      "font-tahoma",
      "font-verdana",
      "font-calibri",
      "font-trebuchet",
    ];

    body.classList.remove(...allFontClasses);
    if (fontTheme) {
      body.classList.add(fontTheme);
      // Webfonts are bundled but split per theme; fetch this one's chunk.
      loadFontTheme(fontTheme);
    }
  }, [fontTheme]);

  // background toggling
  const updatedBodyStyle = (event, className) => {
    const body = document.body;
    const bodyClasses = Array.from(body.classList);

    if (bodyClasses.includes(className)) {
      body.classList.remove(className);
      setActiveClass("");
      localStorage.removeItem("bodyClass");
    } else {
      body.classList.remove(...classesToCheck);
      body.classList.add(className);
      setActiveClass(className);
      localStorage.setItem("bodyClass", className);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") body.classList.add("dark-mode");
    else body.classList.add("light-mode");
  };

  // -------------------- MOBILE NAV OPEN/CLOSE --------------------
  const showNavbar = (e) => {
    e?.stopPropagation?.();
    if (mobileHeader.current) mobileHeader.current.classList.add("active");
    setIsMobileNavOpen(true);
  };

  const closeNavbar = (e) => {
    e?.stopPropagation?.();
    if (mobileHeader.current) mobileHeader.current.classList.remove("active");
    setIsMobileNavOpen(false);
  };

  // -------------------- NETWORK --------------------
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    const updateNetworkStrength = () => {
      if ("connection" in navigator) {
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;

        const effectiveType = connection.effectiveType;
        const weakConnections = ["slow-2g", "2g"];
        setIsNetworkWeak(weakConnections.includes(effectiveType));

        connection.addEventListener("change", updateNetworkStrength);
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    updateOnlineStatus();
    updateNetworkStrength();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);

      if ("connection" in navigator) {
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        connection.removeEventListener("change", updateNetworkStrength);
      }
    };
  }, []);

  useEffect(() => {
    if (isNetworkWeak) {
      toast.warn(
        language === "ar"
          ? "شبكة الإنترنت ضعيفة."
          : "Your network connection is weak.",
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: true,
          draggable: true,
        },
      );
    } else {
      toast.dismiss();
    }
  }, [isNetworkWeak, language]);

  // -------------------- LINKS --------------------
  const handleNavItemClick = (e) => {
    onNavClick?.(e);
    if (isMobileNavOpen) closeNavbar(e);
  };

  const renderNavLinks = () => (
    <>
      <li className="nav-item">
        <NavLink className="nav-link" to="/" onClick={handleNavItemClick}>
          <HomeOutlinedIcon className="mx-1" /> {translations.home}
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink
          className="nav-link"
          to="/categories"
          onClick={handleNavItemClick}
        >
          <ChecklistRtlOutlinedIcon className="mx-1" />{" "}
          {translations.categories}
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className="nav-link" to="/about" onClick={handleNavItemClick}>
          <PersonSearchOutlinedIcon className="mx-1" /> {translations.about}
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink
          className="nav-link"
          to="/api-docs"
          onClick={handleNavItemClick}
        >
          <ApiOutlinedIcon className="mx-1" /> {translations.APIdocs}
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink
          className="nav-link"
          to="/contact"
          onClick={handleNavItemClick}
        >
          <RingVolumeOutlinedIcon className="mx-1" /> {translations.contact}
        </NavLink>
      </li>
    </>
  );

  // -------------------- ERROR MODAL --------------------
  const errorCategories = [
    {
      value: "home_page",
      label:
        language === "ar" ? " أحاديث الصفحة الرئيسية " : "Home Page Hadiths",
    },
    {
      value: "quran",
      label: language === "ar" ? "القران الكريم " : "Holy Quran",
    },
    {
      value: "tajweed",
      label: language === "ar" ? "أحكام التلاوة" : "Rules of Recitation",
    },
    { value: "ahadiths", label: language === "ar" ? "الأحاديث " : "Hadiths" },
    {
      value: "tafsir",
      label: language === "ar" ? "تفسير القران" : "Quran Interpretation",
    },
    { value: "story", label: language === "ar" ? "القصص" : "Stories" },
    { value: "api", label: language === "ar" ? "خدمة API" : "API docs" },
  ];

  const openErrorModal = () => setErrorModalOpen(true);

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setFormData({ category: "", description: "" });
    setInputDirection(language === "ar" ? "rtl" : "ltr");
  };

  const isArabicText = (text) => /[\u0600-\u06FF]/.test(text);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: DOMPurify.sanitize(value) }));

    if (value.length > 0)
      setInputDirection(isArabicText(value) ? "rtl" : "ltr");
    else setInputDirection(language === "ar" ? "rtl" : "ltr");
  };

  const handleErrorReportSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const serviceID = "service_q9ux1k2";
    const templateID = "template_2lguhoe";
    const userID = "an4QUGfU0CzKLoFMB";

    /*
     * This shares the contact form's EmailJS template, which is written around
     * {{name}}, {{email}} and {{message}} — so sending the raw { category,
     * description } produced an empty mail, and failed outright wherever the
     * template binds reply-to to {{email}}. The report is mapped onto those
     * three variables instead.
     *
     * The page and the browser are included because a report without them says
     * something is broken but not where, which is not actionable.
     */
    const payload = {
      name: `${language === "ar" ? "تقرير خطأ" : "Error report"} — ${
        formData.category
      }`,
      email: formData.email?.trim() || "tlhamid18@gmail.com",
      message: [
        `${language === "ar" ? "الموضع" : "Location"}: ${formData.category}`,
        "",
        formData.description,
        "",
        `${language === "ar" ? "الصفحة" : "Page"}: ${window.location.href}`,
        `${language === "ar" ? "المتصفح" : "Browser"}: ${navigator.userAgent}`,
        `${language === "ar" ? "اللغة" : "Language"}: ${language}`,
      ].join("\n"),
    };

    emailjs.send(serviceID, templateID, payload, userID).then(
      () => {
        toast.success(
          language === "ar"
            ? "تم إرسال تقرير الخطأ بنجاح!"
            : "Error report sent successfully!",
        );
        setFormData({ category: "", description: "", email: "" });
        setLoading(false);
        closeErrorModal();
      },
      (err) => {
        toast.error(
          language === "ar"
            ? "فشل في إرسال تقرير الخطأ."
            : "Failed to send error report.",
        );
        console.error("EmailJS Error:", err);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    setInputDirection(language === "ar" ? "rtl" : "ltr");
  }, [language]);

  // -------------------- UI --------------------
  return (
    <div className="bg-transparent">
      {/* Modern AppBar */}
      <header
        className={`appbar ${language === "en" ? "ltr" : "rtl"}  ${
          isMobileNavOpen ? "drawer-open" : ""
        }`}
      >
        <div className="appbar-inner">
          <div className="appbar-left">
            <button
              className="appbar-icon-btn d-lg-none"
              type="button"
              onClick={showNavbar}
              aria-label="Open menu"
            >
              <WidgetsOutlinedIcon />
            </button>

            <NavLink to="/" className="brand" onClick={handleNavItemClick}>
              <img src={logo} alt="Logo" className="brand-logo" />
              <span className="brand-title">
                {language === "ar" ? "دين الله" : "God's Religion"}
              </span>
            </NavLink>
          </div>

          <nav className="appbar-nav d-none d-lg-flex">
            <ul className={`nav-list ${language === "ar" ? "rtl" : "ltr"}`}>
              {renderNavLinks()}
            </ul>
          </nav>

          <div className="appbar-right">
            <button
              type="button"
              className="appbar-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              aria-label="Open settings"
              title={language === "ar" ? "الإعدادات" : "Settings"}
            >
              <SettingsOutlinedIcon />
            </button>

            <div className="theme-toggle">
              <input
                type="checkbox"
                className="d-none"
                onChange={setTheme}
                checked={darkSwitched}
                id="darkModeSwitchFst"
              />
              <label className="theme-pill" htmlFor="darkModeSwitchFst">
                <span className="theme-emoji">
                  {darkSwitched ? "🌙" : "🔆"}
                </span>
                <span className="theme-text d-none d-md-inline">
                  {darkSwitched
                    ? language === "ar"
                      ? "داكن"
                      : "Dark"
                    : language === "ar"
                      ? "فاتح"
                      : "Light"}
                </span>
              </label>
            </div>

            {isBigScreen && (
              <button
                type="button"
                className="help-fab"
                onClick={openErrorModal}
                aria-label="Report error"
              >
                <HelpOutlineIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className="mobile-header" ref={mobileHeader}>
        <div className="black-left" onClick={closeNavbar}>
          <button
            type="button"
            className="drawer-close"
            aria-label="Close menu"
            onClick={closeNavbar}
          >
            <CloseOutlinedIcon />
          </button>
        </div>

        <div
          className={language === "ar" ? "right-nav" : "right-nav en"}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer-top">
            <div className="drawer-brand">
              <img src={logo} alt="Logo" className="drawer-logo" />
              <div className="drawer-title">
                {language === "ar" ? "القائمة" : "Menu"}
                <span className="drawer-sub">
                  {!isOnline
                    ? language === "ar"
                      ? "غير متصل"
                      : "Offline"
                    : isNetworkWeak
                      ? language === "ar"
                        ? "شبكة ضعيفة"
                        : "Weak network"
                      : language === "ar"
                        ? "متصل"
                        : "Online"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="drawer-settings"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
                closeNavbar(e);
              }}
            >
              <SettingsOutlinedIcon />
            </button>
          </div>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {renderNavLinks()}
          </ul>

          <div className="drawer-bottom">
            <button
              type="button"
              className="drawer-action"
              onClick={(e) => {
                e.stopPropagation();
                closeNavbar(e);
                openErrorModal();
              }}
            >
              <HelpOutlineIcon />
              {language === "ar" ? "الإبلاغ عن خطأ" : "Report error"}
            </button>

            <div className="drawer-theme">
              <span className="drawer-theme-label">
                {language === "ar" ? "المظهر" : "Theme"}
              </span>
              <label className="drawer-theme-pill" htmlFor="darkModeSwitchFst">
                {darkSwitched ? "🌙" : "🔆"}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable notch-nav */}
      <div
        ref={notchRef}
        className={`notch-nav ${visibility ? "hide" : ""} ${
          notchTucked ? "tucked" : ""
        }`}
        onMouseDownCapture={handleMouseDown} // ✅ optional
        onTouchStartCapture={handleTouchStart} // ✅ FIX mobile
        style={{
          position: "fixed",
          left: notchNavPosition.x,
          top: notchNavPosition.y,
          cursor: "move",
          touchAction: "none",
          zIndex: 180,
          "--tuck-dir": tuckDirection,
        }}
      >
        <button
          type="button"
          className="notch-btn"
          aria-label={language === "ar" ? "القائمة" : "Menu"}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={showNavbar}
        >
          <WidgetsOutlinedIcon />
        </button>

        {/*
          Mishkat, reachable from wherever the reader happens to be. A
          question tends to arrive in the middle of reading something else,
          and until now answering it meant leaving the page to go find the
          section first.
        */}
        <button
          type="button"
          className="notch-btn notch-btn--mishkat"
          aria-label={language === "ar" ? "اسأل مِشْكاة" : "Ask Mishkat"}
          title={language === "ar" ? "اسأل مِشْكاة" : "Ask Mishkat"}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/categories/mishkat");
          }}
        >
          <ManageSearchOutlinedIcon />
        </button>

        <button
          type="button"
          className="notch-btn"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <SettingsOutlinedIcon />
        </button>

        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="d-none"
            onChange={setTheme}
            checked={darkSwitched}
            id="darkModeSwitch"
          />
          <label className="notch-btn" htmlFor="darkModeSwitch">
            {darkSwitched ? "🌙" : "🔆"}
          </label>
        </div>

        <button
          type="button"
          className="notch-btn danger"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={openErrorModal}
        >
          <HelpOutlineIcon />
        </button>
      </div>

      {/* Modal for Network Check */}
      {!isOnline && (
        <Modal
          aria-labelledby="network-modal-title"
          open={!isOnline}
          onClose={() => setIsOnline(true)}
        >
          <Sheet className="sheet-surface"
            sx={{
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              border: "1px solid white",
            }}
          >
            <ModalClose variant="plain" sx={{ m: 1 }} />
            <Typography
              component="h2"
              id="network-modal-title"
              level="h4"
              textColor="inherit"
              sx={{ fontWeight: "lg", mb: 1 }}
            >
              {language === "ar" ? "تحقق من الشبكة" : "Check Network"}
            </Typography>
            <Typography level="body2" sx={{ mb: 2 }}>
              {language === "ar"
                ? "أنت غير متصل بالإنترنت. يرجى التحقق من اتصالك."
                : "You are currently offline. Please check your internet connection."}
            </Typography>
          </Sheet>
        </Modal>
      )}

      {/* Settings modal */}
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          direction: language === "ar" ? "rtl" : "ltr",
          p: 1.5,
        }}
      >
        <Sheet
          variant="outlined"
          className="settings-modal settings-ui sheet-surface"
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: "100%",
            height: "100vh",
            maxHeight: "90vh",
            borderRadius: { xs: "10px", sm: "18px" },
            maxWidth: { xs: "90%", sm: 650 },
            overflow: "auto",
            boxShadow: "lg",
            border: "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar */}
          <div className="settings-ui__top">
            <div className="settings-ui__title">
              <div className="settings-ui__icon">
                <SettingsOutlinedIcon />
              </div>
              <div>
                <Typography
                  component="h2"
                  id="modal-title"
                  level="h4"
                  sx={{ fontWeight: 800, m: 0, lineHeight: 1.1 }}
                >
                  {language === "ar" ? "الإعدادات" : "Settings"}
                </Typography>
                <Typography level="body2" sx={{ opacity: 0.75, mt: 0.4 }}>
                  {language === "ar"
                    ? "خصّص المظهر والخط والخلفية بسهولة"
                    : "Customize theme, font and background"}
                </Typography>
              </div>
            </div>

            <ModalClose
              variant="plain"
              onClick={() => setOpen(false)}
              sx={{
                m: 1,
                position: "absolute",
                top: 10,
                right: language === "ar" ? "auto" : 10,
                left: language === "ar" ? 10 : "auto",
                borderRadius: "12px",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
              }}
            />
          </div>

          {/* Content */}
          <div className="settings-ui__body">
            {/* Quick toggles */}
            <div className="settings-ui__section">
              <div className="settings-ui__sectionHead">
                <Typography level="title-md" sx={{ fontWeight: 800 }}>
                  {language === "ar" ? "سريع" : "Quick"}
                </Typography>
                <Typography level="body2" sx={{ opacity: 0.7 }}>
                  {language === "ar"
                    ? "تبديل سريع للمظهر"
                    : "Fast appearance toggle"}
                </Typography>
              </div>

              <div className="settings-ui__row">
                <div className="settings-ui__rowInfo">
                  <Typography level="title-sm" sx={{ fontWeight: 800 }}>
                    {language === "ar" ? "الوضع الليلي" : "Dark mode"}
                  </Typography>
                  <Typography level="body2" sx={{ opacity: 0.75 }}>
                    {darkSwitched
                      ? language === "ar"
                        ? "مفعّل"
                        : "Enabled"
                      : language === "ar"
                        ? "غير مفعّل"
                        : "Disabled"}
                  </Typography>
                </div>

                <label
                  className="settings-ui__toggle"
                  htmlFor="darkModeSwitchFst"
                >
                  <span className="settings-ui__toggleEmoji">
                    {darkSwitched ? "🌙" : "🔆"}
                  </span>
                  <span className="settings-ui__toggleText">
                    {darkSwitched
                      ? language === "ar"
                        ? "داكن"
                        : "Dark"
                      : language === "ar"
                        ? "فاتح"
                        : "Light"}
                  </span>
                </label>
              </div>
            </div>

            {/* Language + Text size */}
            <div className="settings-ui__grid2">
              <div className="settings-ui__card">
                <Typography level="title-sm" sx={{ fontWeight: 800, mb: 0.6 }}>
                  {language === "ar" ? "اللغة" : "Language"}
                </Typography>
                <Typography level="body2" sx={{ opacity: 0.75, mb: 1 }}>
                  {language === "ar"
                    ? "اختر لغة الواجهة"
                    : "Choose UI language"}
                </Typography>

                <Select
                  placeholder={
                    language === "ar" ? "اختر اللغة" : "Select language"
                  }
                  onChange={(event, newValue) => changeLanguage(newValue)}
                  value={language}
                  sx={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "var(--text-color)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <Option value="ar">
                    {language === "ar" ? "العربية" : "Arabic"}
                  </Option>
                  <Option value="en">
                    {language === "ar" ? "الإنجليزية" : "English"}
                  </Option>
                </Select>
              </div>

              <div className="settings-ui__card">
                <Typography level="title-sm" sx={{ fontWeight: 800, mb: 0.6 }}>
                  {language === "ar" ? "حجم الخط" : "Text size"}
                </Typography>
                <Typography level="body2" sx={{ opacity: 0.75, mb: 1 }}>
                  {language === "ar"
                    ? "غيّر حجم النص بسهولة"
                    : "Adjust reading size"}
                </Typography>

                <Select
                  placeholder={language === "ar" ? "حجم الخط" : "Text size"}
                  onChange={(event, newValue) => {
                    size(newValue);
                    setTextSize(newValue);
                  }}
                  value={textSize || "sm"}
                  sx={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "var(--text-color)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <Option value="sm">
                    {language === "ar" ? "افتراضي" : "Default"}
                  </Option>
                  <Option value="md">
                    {language === "ar" ? "متوسط" : "Medium"}
                  </Option>
                  <Option value="lg">
                    {language === "ar" ? "كبير" : "Large"}
                  </Option>
                </Select>
              </div>
            </div>

            {/* Font theme */}
            <div className="settings-ui__section">
              <div className="settings-ui__sectionHead">
                <Typography level="title-md" sx={{ fontWeight: 800 }}>
                  {language === "ar" ? "نوع الخط" : "Font theme"}
                </Typography>
                <Typography level="body2" sx={{ opacity: 0.7 }}>
                  {language === "ar"
                    ? "اختيار خط مناسب للقراءة"
                    : "Choose a comfortable font"}
                </Typography>
              </div>

              <div className="settings-ui__row">
                <Select
                  placeholder={language === "ar" ? "نوع الخط" : "Font theme"}
                  onChange={(event, newValue) => {
                    setFontTheme(newValue);
                    localStorage.setItem("fontTheme", newValue);
                  }}
                  value={fontTheme || "font-default"}
                  sx={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "var(--text-color)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  {language === "ar" ? (
                    <>
                      <Option value="font-default">افتراضي</Option>
                      <Option value="font-amiri">أميري</Option>
                      <Option value="font-uthmanic">عثماني</Option>
                      <Option value="font-scheherazade">شهرزاد</Option>
                      <Option value="font-modern">عصري</Option>
                      <Option value="font-noto-arabic">نسخ عربي</Option>
                    </>
                  ) : (
                    <>
                      <Option value="font-default">Default</Option>
                      <Option value="font-times">Times New Roman</Option>
                      <Option value="font-roboto">Roboto</Option>
                      <Option value="font-georgia">Georgia</Option>
                      <Option value="font-calibri">Calibri</Option>
                      <Option value="font-lateef">Cute</Option>
                    </>
                  )}
                </Select>
              </div>
            </div>

            {/* Background cards */}
            <div className="settings-ui__section">
              <div className="settings-ui__sectionHead">
                <Typography level="title-md" sx={{ fontWeight: 800 }}>
                  {language === "ar" ? "الخلفية" : "Background"}
                </Typography>
                <Typography level="body2" sx={{ opacity: 0.7 }}>
                  {language === "ar"
                    ? "اختر تأثير خلفية لطيف"
                    : "Pick a subtle background style"}
                </Typography>
              </div>

              <div className="settings-ui__bgs">
                <button
                  type="button"
                  className={`bg-card ${
                    activeClass === "light-filter" ? "active" : ""
                  }`}
                  onClick={(event) => updatedBodyStyle(event, "light-filter")}
                >
                  <div className="bg-card__icon">
                    <FilterBAndWOutlinedIcon />
                  </div>
                  <div className="bg-card__text">
                    <div className="bg-card__title">
                      {language === "ar" ? "تخفيف السطوع" : "Filter light"}
                    </div>
                    <div className="bg-card__sub">
                      {language === "ar" ? "مريح للعين" : "Eye comfort"}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`bg-card ${
                    activeClass === "brightness" ? "active" : ""
                  }`}
                  onClick={(event) => updatedBodyStyle(event, "brightness")}
                >
                  <div className="bg-card__icon">
                    <BrightnessAutoOutlinedIcon />
                  </div>
                  <div className="bg-card__text">
                    <div className="bg-card__title">
                      {language === "ar" ? "زيادة السطوع" : "Brightness"}
                    </div>
                    <div className="bg-card__sub">
                      {language === "ar" ? "تباين أوضح" : "More contrast"}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`bg-card ${activeClass === "sky" ? "active" : ""}`}
                  onClick={(event) => updatedBodyStyle(event, "sky")}
                >
                  <div className="bg-card__icon">
                    <NightsStayOutlinedIcon />
                  </div>
                  <div className="bg-card__text">
                    <div className="bg-card__title">
                      {language === "ar" ? "منتصف الليل" : "Midnight"}
                    </div>
                    <div className="bg-card__sub">
                      {language === "ar" ? "هدوء بصري" : "Calm mood"}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`bg-card bg-card--img ${
                    activeClass === "image" ? "active" : ""
                  }`}
                  onClick={(event) => updatedBodyStyle(event, "image")}
                  aria-label="Image background"
                  title={language === "ar" ? "خلفية صورة" : "Image background"}
                >
                  <div className="bg-card__overlay">
                    <div className="bg-card__title">
                      {language === "ar" ? "خلفية صورة" : "Image"}
                    </div>
                    <div className="bg-card__sub">
                      {language === "ar" ? "مظهر جميل" : "Nice look"}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Sheet>
      </Modal>

      {/* Report Error Modal */}
      <Modal
        aria-labelledby="report-error-modal-title"
        open={errorModalOpen}
        onClose={closeErrorModal}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          direction: language === "ar" ? "rtl" : "ltr",
          p: 1.5,
        }}
      >
        <Sheet
          variant="outlined"
          className="report-error-modal sheet-surface"
          sx={{
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
            overflowY: "auto",
            maxWidth: "95%",
            minWidth: isBigScreen ? "50%" : "90%",
            minHeight: "70%",
            maxHeight: "95%",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            border: "1px solid white",
          }}
        >
          <ModalClose
            variant="plain"
            sx={{ m: 1, marginBottom: "20px" }}
            onClick={closeErrorModal}
          />
          <Typography
            component="h2"
            id="report-error-modal-title"
            level="h4"
            textColor="inherit"
            sx={{ fontWeight: "lg", mb: 1 }}
          >
            {language === "ar" ? "الإبلاغ عن خطأ" : "Report an error"}
          </Typography>

          <hr />

          <form onSubmit={handleErrorReportSubmit}>
            <div className="d-flex-flex-column justify-centent-center gap-3 w-100 ">
              <div className="d-flex flex-row justify-content-between align-items-center gap-3 p-2 w-100">
                <label htmlFor="category" className="text-primary fs-5">
                  {language === "ar" ? "مكان الخطأ : " : "Error location : "}
                </label>

                <div className="error-category w-auto">
                  <Select
                    name="category"
                    placeholder={language === "ar" ? "أين؟" : "Where ?"}
                    onChange={(event, newValue) =>
                      setFormData((prev) => ({ ...prev, category: newValue }))
                    }
                    value={formData.category}
                    sx={{
                      width: 150,
                      backgroundColor: "var(--card-color)",
                      color: "var(--text-color)",
                      "&:hover": { backgroundColor: "var(--card-color)" },
                    }}
                    className="error-category-select"
                    required
                  >
                    {errorCategories.map((category) => (
                      <Option key={category.value} value={category.label}>
                        {category.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <hr />

            <div className="d-flex-flex-column justify-centent-center gap-3 w-100 mt-3">
              <FormControl>
                <FormLabel className="text-primary fw-normal fs-5">
                  {language === "ar" ? "تفاصيل الخطأ : " : "Error details : "}
                </FormLabel>
                <br />
                <textarea
                  name="description"
                  value={formData.description}
                  placeholder={
                    language === "ar"
                      ? "الرجاء توضيح تفاصيل الخطأ ..."
                      : "Please write more about error details... "
                  }
                  onChange={handleChange}
                  required
                  rows="7"
                  style={{
                    width: "100%",
                    backgroundColor: "var(--card-color)",
                    color: "var(--text-color)",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    padding: "8px",
                    outline: "none",
                    resize: "none",
                    direction: inputDirection,
                  }}
                />

                {/* Optional, so a reporter who wants an answer can get one. */}
                <FormLabel
                  htmlFor="reporter-email"
                  className="text-primary fw-normal fs-6 mt-3"
                >
                  {language === "ar"
                    ? "بريدك (اختياري، للردّ عليك)"
                    : "Your email (optional, so we can reply)"}
                </FormLabel>
                <input
                  id="reporter-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    backgroundColor: "var(--card-color)",
                    color: "var(--text-color)",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    padding: "8px",
                    outline: "none",
                    direction: "ltr",
                  }}
                />
              </FormControl>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <Button
                type="submit"
                variant="outlined"
                sx={{
                  border: "1px solid rgba(11,107,203,1)",
                  width: "max-content",
                  backgroundColor: "var(--card-color)",
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size="sm" />
                ) : language === "ar" ? (
                  "ارسال التقرير"
                ) : (
                  "Send Report"
                )}
              </Button>
            </div>
          </form>
        </Sheet>
      </Modal>
    </div>
  );
};

export default Header;
