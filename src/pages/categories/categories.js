import React, { useEffect, useRef, useState, useCallback } from "react";
import "./categories.css";

import quran from "../images/quran.avif";
import ahadith from "../images/ahadith.avif";
import fatawa from "../images/fatawa.avif";
import salat from "../images/salat.avif";
import tafsir from "../images/tafsir.avif";
import qisas from "../images/qisas.avif";
import animals from "../images/animals.avif";
import adhkar from "../images/adhkar.avif";
import asma2 from "../images/asma2.avif";
import tasbih from "../images/tasbih.avif";
import wasia from "../images/wasia.avif";
import islam from "../images/islam.avif";
import be from "../images/be.avif";
import radio from "../images/radio.avif";
import fiqh from "../images/fiqh.avif";
import history from "../images/history.avif";
import arabic from "../images/arabic.avif";
import topics from "../images/topics.avif";
import sira from "../images/sira.avif";
import tajweed from "../images/tajweed.avif";

import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../../components/languages/provider";
import throttle from "lodash.throttle";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useMediaQuery } from "@mui/material";

const navLinks = [
  { path: "islam", title: "whatIsIslam" },
  { path: "beMuslim", title: "beAMuslim" },
  { path: "quran", title: "quran" },
  { path: "tafsir", title: "quranInterpretationCat" },
  { path: "ahadith", title: "hadiths" },
  { path: "times", title: "prayerTimes" },
  { path: "adhkar", title: "azkar" },
  { path: "names", title: "asmaaHusna" },
  { path: "tasbih", title: "tasbeeh" },
  { path: "prophets", title: "prophetsStories" },
  { path: "animals", title: "animalsStories" },
  { path: "fatawa", title: "contemporaryFatwas" },
  { path: "library", title: "wisdomAndAdmonitions" },
  { path: "radio", title: "QuranRadio" },
  { path: "fiqh", title: "fiqhIslam" },
  { path: "historic", title: "islamicHistory" },
  { path: "arabic", title: "arabicLanguage" },
  { path: "knowledge", title: "OtherTopics" },
  { path: "sira", title: "alSira" },
  { path: "tajweed", title: "alTajweed" },
  { path: "questions", title: "askAQuestion" },
];

const CATEGORIES = [
  { to: "islam", img: islam, id: "whatIsIslam" },
  { to: "beMuslim", img: be, id: "beAMuslim" },
  { to: "quran", img: quran, id: "quran" },
  { to: "tafsir", img: tafsir, id: "quranInterpretationCat" },
  { to: "ahadith", img: ahadith, id: "hadiths" },
  { to: "times", img: salat, id: "prayerTimes" },
  { to: "adhkar", img: adhkar, id: "azkar" },
  { to: "names", img: asma2, id: "asmaaHusna" },
  { to: "tasbih", img: tasbih, id: "tasbeeh" },
  { to: "prophets", img: qisas, id: "prophetsStories" },
  { to: "animals", img: animals, id: "animalsStories" },
  { to: "fatawa", img: fatawa, id: "contemporaryFatwas" },
  { to: "library", img: wasia, id: "wisdomAndAdmonitions" },
  { to: "radio", img: radio, id: "QuranRadio", imgClass: "wideImg" },
  { to: "fiqh", img: fiqh, id: "fiqhIslam" },
  { to: "historic", img: history, id: "islamicHistory" },
  { to: "arabic", img: arabic, id: "arabicLanguage" },
  { to: "knowledge", img: topics, id: "OtherTopics" },
  { to: "sira", img: sira, id: "alSira" },
  { to: "tajweed", img: tajweed, id: "alTajweed" },
];

const LS_TITLE_KEY = "component-title";
const LS_POS_KEY = "last-category-position"; // we will store ABSOLUTE page Y now

const Categories = ({
  showHeader,
  hideHeader,
  backToTop,
  displayButton,
  hideButton,
  backTop,
  scrollTop,
  hasError,
}) => {
  const [subTitle, setSubTitle] = useState("");
  const [currentScroll, setCurrentScroll] = useState(0);
  const [checkTitle, setCheckTitle] = useState(false);
  const [isRadio, setIsRadio] = useState(false);
  const [selectedCategoryPosition, setSelectedCategoryPosition] = useState(0);

  const { language, translations } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const categoriesRef = useRef(null);
  const outletsRef = useRef(null);
  const contentRef = useRef(null);

  const isSmallScreen = useMediaQuery("(max-width:500px)");

  // ✅ scroll helper that works in ALL browsers/layouts
  const scrollPageTo = (top, behavior = "auto") => {
    const y = Math.max(0, Number(top) || 0);

    // window
    window.scrollTo({ top: y, behavior });

    // fallback for layouts where the scrolling element is html/body
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  };

  // Page title
  useEffect(() => {
    if (location.pathname.startsWith("/categories/")) {
      document.title = translations[subTitle] || "Categories";
    } else {
      document.title =
        language === "ar"
          ? "دين الله | الأقسام"
          : "God's religion | Categories";
    }
    // eslint-disable-next-line
  }, [subTitle, language, location]);

  // Load subtitle + last saved position
  useEffect(() => {
    const currentComponentTitle = localStorage.getItem(LS_TITLE_KEY);
    setSubTitle(
      currentComponentTitle || (language === "ar" ? "الأقسام" : "Categories"),
    );

    const saved = Number(localStorage.getItem(LS_POS_KEY) || 0);
    setSelectedCategoryPosition(saved);

    // ⚠️ If your parent scrollTop() scrolls window to top ALWAYS, it can kill restore.
    // Keep it only for outlet (like you had).
    if (location.pathname.startsWith("/categories/")) scrollTop?.();
    // eslint-disable-next-line
  }, [location.pathname, checkTitle]);

  // Event handler for clicks on categories
  const handleCategoryClick = (event) => {
    const target = event.target.closest(".div");
    document.body.scrollTo({
      top: selectedCategoryPosition,
    });
    if (target) {
      const componentTitleId = target.querySelector("span")?.id; // Get the ID from the span element
      if (componentTitleId) {
        setSubTitle(componentTitleId); // Set the subtitle for the outlet
        localStorage.setItem("component-title", componentTitleId);
        // Save the clicked category's position relative to the scrollable content
        if (contentRef.current) {
          const categoryPosition = target.offsetTop;
          localStorage.setItem("last-category-position", categoryPosition);
        }

        if (outletsRef.current) {
          outletsRef.current.classList.add("active");
          categoriesRef.current.classList.add("hide");
          if (contentRef.current) {
            contentRef.current.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) return;
    el.addEventListener("click", handleCategoryClick);
    return () => el.removeEventListener("click", handleCategoryClick);
    // eslint-disable-next-line
  }, []);

  // Close outlet
  const closeOutlet = () => {
    if (outletsRef.current) outletsRef.current.classList.remove("active");
    navigate("/categories");
    categoriesRef.current.classList.remove("hide");

    // Delay scrolling to ensure the categories are visible
    if (contentRef.current) {
      document.body.scrollTo({
        top: selectedCategoryPosition,
      });
    }
  };

  // Handle pathname changes (direct route, back button)
  useEffect(() => {
    const isOutlet =
      location.pathname.startsWith("/categories/") &&
      location.pathname !== "/categories" &&
      location.pathname !== "/categories/";

    if (isOutlet) {
      outletsRef.current?.classList.add("active");
      categoriesRef.current?.classList.add("hide");

      const categoryPath = location.pathname
        .replace("/categories/", "")
        .split("/")[0]
        .toLowerCase();

      const matchedLink = navLinks.find(
        (link) => link.path.toLowerCase() === categoryPath,
      );

      const nextTitle =
        matchedLink?.title || (language === "ar" ? "الأقسام" : "Categories");

      localStorage.setItem(LS_TITLE_KEY, nextTitle);
      setSubTitle(nextTitle);

      setCheckTitle(true);
      scrollTop?.();
      scrollPageTo(0, "auto");
    } else {
      outletsRef.current?.classList.remove("active");
      categoriesRef.current?.classList.remove("hide");
      setCheckTitle(false);

      const saved = Number(
        localStorage.getItem(LS_POS_KEY) || selectedCategoryPosition || 0,
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPageTo(saved, "auto");
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Scroll behavior
  // eslint-disable-next-line
  const checkScrollTop = useCallback(
    throttle((e) => {
      const { scrollTop } = e.target;
      const threshold = 300;
      const isScrollingDown = scrollTop > currentScroll;

      if (isScrollingDown) hideHeader?.();
      else showHeader?.();

      if (scrollTop > threshold) displayButton?.();
      else hideButton?.();

      setCurrentScroll(scrollTop);
    }, 250),
    // eslint-disable-next-line
    [currentScroll],
  );

  const handleScroll = (e) => checkScrollTop(e);

  useEffect(() => {
    setIsRadio(subTitle === "QuranRadio");
  }, [subTitle]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [backTop, checkTitle]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [backToTop]);

  return (
    <div className="container-fluid p-0">
      <div
        className="categories"
        style={{ marginTop: isRadio && isSmallScreen ? "0" : "1vh" }}
      >
        <div className="card content" ref={contentRef} onScroll={handleScroll}>
          <div className="card-header p-1 d-flex justify-content-center align-items-center">
            <p className="w-100 text-center fw-bold mt-2 catHeaderTitle">
              {translations.prayerKnowledge}
            </p>
          </div>

          <div className="card-body p-0">
            <div className="divisions" ref={categoriesRef}>
              {CATEGORIES.map((c) => (
                <NavLink key={c.to} className="div" to={c.to}>
                  <div className="catIcon">
                    <img
                      src={c.img}
                      className={c.imgClass || ""}
                      alt="category"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                  <span id={c.id}>{translations[c.id]}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="outlets card" ref={outletsRef}>
            <div
              className="card-header outlets-top"
              style={{ borderRadius: isSmallScreen ? "0" : undefined }}
            >
              <p>
                <MenuBookOutlinedIcon /> {translations[subTitle]}
              </p>

              <button type="button" onClick={closeOutlet} className="backBtn">
                ✕
              </button>
            </div>

            <div className="card-body outlets-body">
              {hasError ? "Error occurred!" : <Outlet />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
