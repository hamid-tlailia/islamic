import React, { useEffect, useRef, useState, useCallback } from "react";
import "./categories.css";

import quran from "../images/quran.png";
import ahadith from "../images/ahadith.png";
import fatawa from "../images/fatawa.png";
import salat from "../images/salat.png";
import tafsir from "../images/tafsir.png";
import qisas from "../images/qisas.png";
import animals from "../images/animals.png";
import adhkar from "../images/adhkar.png";
import asma2 from "../images/asma2.png";
import tasbih from "../images/tasbih.png";
import wasia from "../images/wasia.png";
import islam from "../images/islam.png";
import be from "../images/be.png";
import radio from "../images/radio.png";
import fiqh from "../images/fiqh.png";
import history from "../images/history.png";
import arabic from "../images/arabic.png";
import topics from "../images/topics.png";
import sira from "../images/sira.png";
import tajweed from "../images/tajweed.png";

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

  // Load subtitle + last position
  useEffect(() => {
    const currentComponentTitle = localStorage.getItem("component-title");
    setSubTitle(currentComponentTitle || "الأقسام");

    const savedPosition = Number(
      localStorage.getItem("last-category-position") || 0
    );
    setSelectedCategoryPosition(savedPosition);

    if (location.pathname.startsWith("/categories/")) scrollTop();
    // eslint-disable-next-line
  }, [location.pathname, checkTitle]);

  // Click handler (delegated)
  const handleCategoryClick = (event) => {
    const target = event.target.closest(".div");
    if (!target) return;

    // store position BEFORE leaving
    if (contentRef.current) {
      localStorage.setItem("last-category-position", String(target.offsetTop));
    }

    const componentTitleId = target.querySelector("span")?.id;
    if (componentTitleId) {
      setSubTitle(componentTitleId);
      localStorage.setItem("component-title", componentTitleId);
    }

    outletsRef.current?.classList.add("active");
    categoriesRef.current?.classList.add("hide");

    // go top inside scroll container
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
    outletsRef.current?.classList.remove("active");
    categoriesRef.current?.classList.remove("hide");

    setIsRadio(false);
    navigate("/categories");

    // restore scroll position
    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: selectedCategoryPosition,
          behavior: "smooth",
        });
      }
    });
  };

  // Handle pathname changes (open outlet when direct route)
  useEffect(() => {
    if (location.pathname.startsWith("/categories/")) {
      outletsRef.current?.classList.add("active");
      categoriesRef.current?.classList.add("hide");

      const categoryPath = location.pathname
        .replace("/categories/", "")
        .split("/")[0]
        .toLowerCase();

      const matchedLink = navLinks.find(
        (link) => link.path.toLowerCase() === categoryPath
      );

      const nextTitle =
        matchedLink?.title || (language === "ar" ? "الأقسام" : "Categories");

      localStorage.setItem("component-title", nextTitle);
      setSubTitle(nextTitle);

      setCheckTitle(true);
      scrollTop();
    } else {
      outletsRef.current?.classList.remove("active");
      categoriesRef.current?.classList.remove("hide");

      setCheckTitle(false);

      requestAnimationFrame(() => {
        contentRef.current?.scrollTo({
          top: selectedCategoryPosition,
          behavior: "smooth",
        });
      });
    }
    // eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, selectedCategoryPosition]);

  // Scroll behavior
  // eslint-disable-next-line
  const checkScrollTop = useCallback(
    throttle((e) => {
      const { scrollTop } = e.target;
      const threshold = 300;
      const isScrollingDown = scrollTop > currentScroll;

      if (isScrollingDown) hideHeader();
      else showHeader();

      if (scrollTop > threshold) displayButton();
      else hideButton();

      setCurrentScroll(scrollTop);
    }, 250),
    // eslint-disable-next-line
    [currentScroll]
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
            {/* Categories */}
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

          {/* Outlet */}
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
