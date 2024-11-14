import React, { useEffect, useRef, useState } from "react";
import "./header.css";
import logo from "../images/logo.png";
import { NavLink } from "react-router-dom";
import {
  HomeOutlined as HomeOutlinedIcon,
  WidgetsOutlined as WidgetsOutlinedIcon,
  CloseOutlined as CloseOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
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
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Button, FormControl, FormLabel, CircularProgress } from "@mui/joy";
import DOMPurify from "dompurify";
import { useMediaQuery } from "@mui/material";

const Header = ({ onNavClick, visibility, size }) => {
  const { changeLanguage, translations, language } = useTranslation();
  const [darkSwitched, setDarkSwitched] = useState(false);
  const [open, setOpen] = useState(false);
  const [textSize, setTextSize] = useState("");
  const [isOnline, setIsOnline] = useState(true); // State for network status
  const [isNetworkWeak, setIsNetworkWeak] = useState(false); // State for network strength
  const [errorModalOpen, setErrorModalOpen] = useState(false); // State for error report modal
  const [loading, setLoading] = useState(false); // Loading state for submit button
  const [inputDirection, setInputDirection] = useState("rtl");
  const [fontTheme, setFontTheme] = useState(""); // State for font theme

  // State for form data
  const [formData, setFormData] = useState({
    category: "",
    description: "",
  });

  const mobileHeader = useRef(null);
  const isBigScreen = useMediaQuery("(min-width:500px)");

  // Define the classes to check (excluding 'dark-mode' and 'light-mode')
  const classesToCheck = ["light-filter", "brightness", "image", "sky"];

  // State to keep track of the active background class
  const [activeClass, setActiveClass] = useState("");

  // State and refs for draggable notch-nav
  const [notchNavPosition, setNotchNavPosition] = useState({ x: 100, y: 100 });
  const positionRef = useRef({ x: 100, y: 100 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef(null);

  // Define the margin from the top and bottom edges
  const HEADER_MARGIN = 10; // You can adjust this value as needed

  const setTheme = (e) => {
    const body = document.body;
    // Remove all background classes and theme classes
    body.classList.remove("dark-mode", "light-mode", ...classesToCheck);

    // Reset the active background class
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

  // Initialize theme, background class, font theme, and notch-nav position from localStorage
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
      // Remove other background classes
      body.classList.remove(...classesToCheck);
      body.classList.add(savedBodyClass);
      setActiveClass(savedBodyClass); // Set the activeClass state
    } else {
      // Ensure only the theme class is present
      body.classList.remove(...classesToCheck);
      setActiveClass(""); // No active background class
    }

    // Initialize font theme from localStorage
    const savedFontTheme = localStorage.getItem("fontTheme");
    if (savedFontTheme && savedFontTheme !== null) {
      setFontTheme(savedFontTheme);
      body.classList.add(savedFontTheme);
    } else {
      // default font theme
      setFontTheme("font-default");
      body.classList.add("font-default");
      localStorage.setItem("fontTheme", "font-default");
    }

    // Initialize notch-nav position from localStorage
    const savedPosition = localStorage.getItem("notchNavPosition");
    if (savedPosition) {
      const parsedPosition = JSON.parse(savedPosition);
      setNotchNavPosition(parsedPosition);
      positionRef.current = parsedPosition;
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const body = document.body;

    // Get all font-related classes dynamically
    const allFontClasses = [
      "font-default",
      "font-arial",
      "font-times",
      "font-courier",
      "font-scheherazade",
      "font-amiri",
      "font-lateef",
      "font-dubai",
      "font-noto-arabic",
      "font-uthmanic",
      "font-roboto",
      "font-georgia",
      "font-tahoma",
      "font-verdana",
      "font-calibri",
      "font-trebuchet",
    ];

    // Remove all font-related classes from body
    body.classList.remove(...allFontClasses);

    // Add the selected font theme class
    if (fontTheme) {
      body.classList.add(fontTheme);
    }
  }, [fontTheme]);

  // Function to handle background class toggling
  const updatedBodyStyle = (event, className) => {
    const body = document.body;
    const bodyClasses = Array.from(body.classList);

    // Check if the body already has the class
    if (bodyClasses.includes(className)) {
      // Remove the class and reapply the theme class
      body.classList.remove(className);
      setActiveClass("");
      localStorage.removeItem("bodyClass");
    } else {
      // Remove all background classes
      body.classList.remove(...classesToCheck);

      // Apply the clicked class
      body.classList.add(className);
      setActiveClass(className);
      localStorage.setItem("bodyClass", className);
    }

    // Reapply theme class
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      body.classList.add("dark-mode");
    } else {
      body.classList.add("light-mode");
    }
  };

  const showNavbar = () => {
    if (mobileHeader.current) mobileHeader.current.classList.add("active");
  };

  useEffect(() => {
    if (mobileHeader.current) {
      mobileHeader.current.addEventListener("click", () => {
        mobileHeader.current.classList.remove("active");
      });
    }
  }, []);

  // Network detection and weak network detection
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateNetworkStrength = () => {
      if ("connection" in navigator) {
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        const effectiveType = connection.effectiveType;

        // Define what you consider as weak network types
        const weakConnections = ["slow-2g", "2g"];

        if (weakConnections.includes(effectiveType)) {
          setIsNetworkWeak(true);
        } else {
          setIsNetworkWeak(false);
        }

        // Listen for changes in the network connection
        connection.addEventListener("change", updateNetworkStrength);
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Check the initial network status
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

  // Show toast notification when network is weak
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
        }
      );
    } else {
      // Dismiss the toast if network is no longer weak
      toast.dismiss();
    }
  }, [isNetworkWeak, language]);

  const renderNavLinks = () => (
    <>
      <li className="nav-item">
        <NavLink className="nav-link" to="/" onClick={onNavClick}>
          <HomeOutlinedIcon className="mx-1" /> {translations.home}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/categories" onClick={onNavClick}>
          <ChecklistRtlOutlinedIcon className="mx-1" />{" "}
          {translations.categories}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/about" onClick={onNavClick}>
          <PersonSearchOutlinedIcon className="mx-1" /> {translations.about}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/api-docs" onClick={onNavClick}>
          <ApiOutlinedIcon className="mx-1" /> {translations.APIdocs}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/contact" onClick={onNavClick}>
          <RingVolumeOutlinedIcon className="mx-1" /> {translations.contact}
        </NavLink>
      </li>
    </>
  );

  // Helper function to update position with constraints
  const updatePosition = (newX, newY) => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get notch-nav dimensions
    const notchNav = document.querySelector(".notch-nav");
    const notchWidth = notchNav ? notchNav.offsetWidth : 0;
    const notchHeight = notchNav ? notchNav.offsetHeight : 0;

    // Apply constraints to keep the notch-nav within viewport and with margins
    const constrainedX = Math.max(
      0,
      Math.min(newX, viewportWidth - notchWidth)
    );
    const constrainedY = Math.max(
      HEADER_MARGIN,
      Math.min(newY, viewportHeight - notchHeight - HEADER_MARGIN)
    );

    setNotchNavPosition({ x: constrainedX, y: constrainedY });
    positionRef.current = { x: constrainedX, y: constrainedY };
  };

  // Dragging event handlers for mouse events
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

    // Use requestAnimationFrame for smoother updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      updatePosition(newX, newY);
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    localStorage.setItem(
      "notchNavPosition",
      JSON.stringify(positionRef.current)
    );
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // Dragging event handlers for touch events
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

    // Use requestAnimationFrame for smoother updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      updatePosition(newX, newY);
    });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    localStorage.setItem(
      "notchNavPosition",
      JSON.stringify(positionRef.current)
    );
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line
  }, []);

  // Error report categories
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
    {
      value: "ahadiths",
      label: language === "ar" ? "الأحاديث " : "Hadiths",
    },
    {
      value: "tafsir",
      label: language === "ar" ? "تفسير القران" : "Quran Interpretation",
    },
    {
      value: "story",
      label: language === "ar" ? "القصص" : "Stories",
    },
    {
      value: "api",
      label: language === "ar" ? "خدمة API" : "API docs",
    },
  ];

  // Handle opening and closing of error modal
  const openErrorModal = () => {
    setErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setFormData({ category: "", description: "" });
    if (language === "ar") setInputDirection("rtl");
    else setInputDirection("ltr");
  };

  // Function to detect if text is Arabic
  const isArabicText = (text) => {
    // Arabic Unicode range: \u0600-\u06FF
    return /[\u0600-\u06FF]/.test(text);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: DOMPurify.sanitize(value),
    }));
    // Detect language direction
    if (value.length > 0) {
      const isArabic = isArabicText(value);
      if (isArabic) setInputDirection("rtl");
      else setInputDirection("ltr");
    } else {
      if (language === "ar") setInputDirection("rtl");
      else setInputDirection("ltr");
    }
  };

  // Handle error report submission
  const handleErrorReportSubmit = (e) => {
    e.preventDefault();

    setLoading(true); // Start loading

    // EmailJS parameters
    const serviceID = "service_wkwt0sq";
    const templateID = "template_4cy5er2";
    const userID = "JgnJY3IJDvvpSS4nX";

    emailjs.send(serviceID, templateID, formData, userID).then(
      (response) => {
        toast.success(
          language === "ar"
            ? "تم إرسال تقرير الخطأ بنجاح!"
            : "Error report sent successfully!"
        );
        setLoading(false); // Stop loading
        closeErrorModal(); // Close modal and reset form
      },
      (err) => {
        toast.error(
          language === "ar"
            ? "فشل في إرسال تقرير الخطأ."
            : "Failed to send error report."
        );
        console.error("EmailJS Error:", err);
        setLoading(false); // Stop loading
      }
    );
  };

  // Set input direction based on language
  useEffect(() => {
    if (language === "ar") setInputDirection("rtl");
    else setInputDirection("ltr");
  }, [language]);

  return (
    <div className="bg-transparent">
      <header
        className={`navbar navbar-expand-lg bg-light fixed-top ${
          language === "en" ? "ltr" : "rtl"
        } ${visibility ? "hide" : ""}`}
      >
        <div
          className={`container-fluid bg-transparent ${
            language === "ar" ? "rtl" : "ltr"
          }`}
        >
          <span className="navbar-brand">
            <img className="ms-3" src={logo} alt="Logo" height="40" />
          </span>
          <span
            className={`d-block d-lg-none mobile-header-icon ${
              visibility ? "hide" : ""
            }`}
          >
            <WidgetsOutlinedIcon
              className="text-warning"
              onClick={showNavbar}
            />
          </span>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul
              className={`navbar-nav ms-auto mb-2 mb-lg-0 ${
                language === "ar" ? "rtl" : "ltr"
              }`}
            >
              {renderNavLinks()}
            </ul>
          </div>
          <SettingsOutlinedIcon
            className={`local-settings ${language === "en" && "margin"}`}
            onClick={() => setOpen(true)}
          />
          <div className={`form-switch ${language === "en" ? "en" : ""}`}>
            <input
              type="checkbox"
              className="d-none"
              onChange={setTheme}
              checked={darkSwitched}
              id="darkModeSwitchFst"
            />
            <label
              className="form-check-label fs-3"
              htmlFor="darkModeSwitchFst"
            >
              {darkSwitched ? "🔆" : "🌙"}
            </label>
          </div>
        </div>
      </header>
      {isBigScreen && (
        <HelpOutlineIcon
          className="text-light fs-2"
          onClick={openErrorModal}
          style={{
            position: "absolute",
            top: "81%",
            left: "10px",
            zIndex: "1000",
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            fontSize: "30px",
            cursor: "pointer",
          }}
        />
      )}
      <div className="mobile-header" ref={mobileHeader}>
        <div className="black-left">
          <span className="p-2 text-light close fs-2">
            <CloseOutlinedIcon />
          </span>
        </div>
        <div className={language === "ar" ? "right-nav" : "right-nav en"}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {renderNavLinks()}
          </ul>
        </div>
      </div>

      <div
        className={`notch-nav  ${visibility ? "hide" : ""}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: "absolute",
          left: notchNavPosition.x,
          top: notchNavPosition.y,
          cursor: "move",
          touchAction: "none",
        }}
      >
        <WidgetsOutlinedIcon
          className="text-warning notch-icon"
          onClick={showNavbar}
        />
        <SettingsOutlinedIcon
          className="settings text-light"
          onClick={() => setOpen(true)}
        />
        <div className="p-2">
          <input
            type="checkbox"
            className="d-none"
            onChange={setTheme}
            checked={darkSwitched}
            id="darkModeSwitch"
          />
          <label className="check-label fs-3" htmlFor="darkModeSwitch">
            {darkSwitched ? "🔆" : "🌙"}
          </label>
        </div>
        <HelpOutlineIcon
          className="text-danger notch-icon"
          onClick={openErrorModal}
        />
      </div>

      {/* Modal for Network Check */}
      {!isOnline && (
        <Modal
          aria-labelledby="network-modal-title"
          open={!isOnline}
          onClose={() => setIsOnline(true)} // Close the modal manually
        >
          <Sheet
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
      <React.Fragment>
        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          <Sheet
            variant="outlined"
            className="settings-modal"
            sx={{
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
              overflowY: "auto",
              maxWidth: "95%",
              border: "1px solid white",
            }}
          >
            <ModalClose
              variant="plain"
              sx={{ m: 1, marginBottom: "20px" }}
              onClick={() => setOpen(false)}
            />
            <Typography
              component="h2"
              id="modal-title"
              level="h4"
              textColor="inherit"
              className="ltr"
              sx={{ fontWeight: "lg", mb: 1 }}
            >
              <SettingsOutlinedIcon />{" "}
              {language === "ar" ? "الاعدادت" : "Settings"}
            </Typography>
            <hr />
            <div className="d-flex-flex-column justify-centent-center gap-3 w-100 ">
              <div className="d-flex flex-row justify-content-between align-items-center p-2 w-100">
                <label htmlFor="language">
                  {language === "ar" ? "اختر اللغة" : "Select language"}
                </label>
                <div className="language w-auto">
                  <Select
                    placeholder={
                      language === "ar" ? "اختر اللغة" : "Select language"
                    }
                    onChange={(event, newValue) => changeLanguage(newValue)}
                    value={language}
                    sx={{
                      width: 150,
                      backgroundColor: "var(--card-color)",
                      color: "var(--text-color)",
                    }}
                    className="lang-select"
                  >
                    <Option value="ar">
                      {language === "ar" ? "العربية" : "Arabic"}
                    </Option>
                    <Option value="en">
                      {language === "ar" ? "الانجليزية" : "English"}
                    </Option>
                  </Select>
                </div>
              </div>
            </div>
            <hr />
            <div className="settings-elements size">
              <p>{language === "ar" ? "حجم الخط" : "Text size"}</p>
              <Select
                placeholder={language === "ar" ? "حجم الخط" : "Text size"}
                onChange={(event, newValue) => {
                  size(newValue);
                  setTextSize(newValue);
                }}
                value={textSize || "sm"}
                sx={{
                  width: 150,
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
                className="lang-select"
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
            <hr />
            <div className="settings-elements font-theme">
              <p>{language === "ar" ? "نوع الخط" : "Font Theme"}</p>
              <Select
                placeholder={language === "ar" ? "نوع الخط" : "Font Theme"}
                onChange={(event, newValue) => {
                  setFontTheme(newValue);
                  localStorage.setItem("fontTheme", newValue);
                }}
                value={fontTheme || "font-default"}
                sx={{
                  width: 150,
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
                className="lang-select"
              >
                {/* Conditionally render options based on language */}
                {language === "ar" ? (
                  <>
                    <Option value="font-default">افتراضي</Option>
                    <Option value="font-scheherazade">شهرزاد</Option>
                    <Option value="font-amiri">أميري</Option>
                    <Option value="font-lateef">لطيف</Option>
                    <Option value="font-dubai">دبي</Option>
                    <Option value="font-noto-arabic">نوتو نسخ عربي</Option>
                    <Option value="font-uthmanic">عثماني نسخ</Option>
                  </>
                ) : (
                  <>
                    <Option value="font-default">Default</Option>
                    <Option value="font-arial">Arial</Option>
                    <Option value="font-times">Times New Roman</Option>
                    <Option value="font-roboto">Roboto</Option>
                    <Option value="font-georgia">Georgia</Option>
                    <Option value="font-tahoma">Tahoma</Option>
                    <Option value="font-verdana">Verdana</Option>
                    <Option value="font-calibri">Calibri</Option>
                    <Option value="font-trebuchet">Trebuchet MS</Option>
                  </>
                )}
              </Select>
            </div>
            <hr />
            <div className="settings-others bgs">
              <p>
                {language === "ar" ? "الخلفية و المزيد" : "Background and more"}
              </p>
              <br />
              <div className="others w-100">
                <div
                  className={`light-filter shadow tools ${
                    activeClass === "light-filter" ? "active" : ""
                  }`}
                  id="light-filter"
                  onClick={(event) =>
                    updatedBodyStyle(event, event.currentTarget.id)
                  }
                >
                  <span className="pe-none">
                    {language === "ar" ? "تخفيف السطوع" : "Filter light"} <br />
                    <FilterBAndWOutlinedIcon />
                  </span>
                </div>
                <div
                  className={`image shadow tools ${
                    activeClass === "image" ? "active" : ""
                  }`}
                  id="image"
                  onClick={(event) =>
                    updatedBodyStyle(event, event.currentTarget.id)
                  }
                ></div>
                <div
                  className={`brightness shadow tools ${
                    activeClass === "brightness" ? "active" : ""
                  }`}
                  id="brightness"
                  onClick={(event) =>
                    updatedBodyStyle(event, event.currentTarget.id)
                  }
                >
                  <span className="pe-none">
                    {language === "ar" ? "زيادة السطوع" : "Brightness"} <br />
                    <BrightnessAutoOutlinedIcon />
                  </span>
                </div>
                <div
                  className={`sky shadow tools ${
                    activeClass === "sky" ? "active" : ""
                  }`}
                  id="sky"
                  onClick={(event) =>
                    updatedBodyStyle(event, event.currentTarget.id)
                  }
                >
                  <span className="pe-none">
                    {language === "ar" ? "منتصف الليل" : "Midnight"} <br />
                    <NightsStayOutlinedIcon />
                  </span>
                </div>
              </div>
            </div>
          </Sheet>
        </Modal>
      </React.Fragment>

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
        }}
      >
        <Sheet
          variant="outlined"
          className="report-error-modal"
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
            className="ltr"
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
                      "&:hover": {
                        backgroundColor: "var(--card-color)",
                      },
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
                </FormLabel>{" "}
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
                  rows="9"
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
                ></textarea>
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
