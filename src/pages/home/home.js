import { getJSON, TTL } from "../../lib/apiClient";
import React, { useEffect, useState, useCallback } from "react";
import "./home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import { NavLink } from "react-router-dom";
import { useTranslation } from "../../components/languages/provider";
import { toast } from "react-toastify";

import sliderImageOne from "../images/slider3.avif";
import quran from "../images/quran.avif";
import ahadith from "../images/ahadith.avif";
import fatawa from "../images/fatawa.avif";
import show from "../images/interface.avif";
import salat from "../images/salat.avif";

const Home = ({ onNavClick }) => {
  const { translations, language } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [selectedHadiths, setSelectedHadiths] = useState([]);
  const [hadithsLoading, setHadithsLoading] = useState(true);
  const [error, setError] = useState(false);

  const storedLimit =
    parseInt(localStorage.getItem("last-category-limit")) || 0;

  const fetchHadithDetails = async (id) => {
    try {
      const hadithData = await getJSON(`https://hadeethenc.com/api/v1/hadeeths/one/?language=${language}&id=${id}`, { ttl: TTL.LONG });

      return { id, data: hadithData };
    } catch (err) {
      console.error(`Error fetching Hadith details for ID ${id}:`, err);
      return null;
    }
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const fetchHadiths = useCallback(async () => {
    try {
      setHadithsLoading(true);
      localStorage.removeItem("last-category-limit");

      const categoriesData = await getJSON(
        `https://hadeethenc.com/api/v1/categories/list/?language=${language}`,
        { ttl: TTL.LONG }
      );

      const newLimit = storedLimit + 5;
      const categoriesToFetch = categoriesData.slice(storedLimit, newLimit);

      if (newLimit > categoriesData.length)
        localStorage.setItem("last-category-limit", "0");
      else localStorage.setItem("last-category-limit", newLimit);

      let allHadithIds = [];

      for (const category of categoriesToFetch) {
        const hadithsData = await getJSON(
          `https://hadeethenc.com/api/v1/hadeeths/list/?language=${language}&category_id=${category.id}`,
          { ttl: TTL.LONG }
        );

        if (hadithsData?.data && Array.isArray(hadithsData.data)) {
          const ids = hadithsData.data.map((hadith) => hadith.id);
          allHadithIds = allHadithIds.concat(ids);
        }
      }

      allHadithIds = [...new Set(allHadithIds)];
      const shuffledIds = shuffleArray(allHadithIds);
      const limitedIds = shuffledIds.slice(0, 5);

      const hadithDetailsPromises = limitedIds.map((id) =>
        fetchHadithDetails(id)
      );
      const hadithDetails = await Promise.all(hadithDetailsPromises);

      setSelectedHadiths(hadithDetails.filter((h) => h !== null));
      setHadithsLoading(false);
    } catch (err) {
      console.error("Error fetching Hadiths:", err);
      setError(true);
      setHadithsLoading(false);
    }
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    setSelectedHadiths([]);
    fetchHadiths();
  }, [fetchHadiths, language]);

  useEffect(() => {
    if (error) {
      toast.error(
        language === "ar"
          ? "هناك مشكلة بسيطة سيتم حلها قريبا"
          : "Failed to load Hadiths. Please try again later."
      );
    }
    return () => setError(false);
  }, [error, language]);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    appendArrows: ".homeui-arrows",
    prevArrow: (
      <button className="homeui-arrow homeui-prev" aria-label="Previous">
        ←
      </button>
    ),
    nextArrow: (
      <button className="homeui-arrow homeui-next" aria-label="Next">
        →
      </button>
    ),
  };

  useEffect(() => {
    const newTitle =
      language === "ar" ? "دين الله | الرئيسية" : "God's religion | Home";
    document.title = newTitle;
    localStorage.setItem("pageTitle", newTitle);
  }, [isReady, language]);

  useEffect(() => {
    setIsReady(true);
    localStorage.removeItem("last-category-position");
  }, []);

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const dirClass = language === "ar" ? "rtl" : "ltr";

  const renderSlide = (item, index) => {
    const h = item?.data;

    return (
      <div className="homeui-slide" key={index}>
        <img
          src={sliderImageOne}
          className="homeui-img"
          alt={`Slide ${index + 1}`}
        />

        <div className={`homeui-overlay ${dirClass}`}>
          <div className="homeui-overlayCard">
            <p className={`homeui-title ${dirClass}`}>{h?.title}</p>

            <div className="homeui-divider" />

            <div
              className="homeui-scroll"
      
            >
              <p className={`homeui-hadith ${dirClass}`}>{h?.hadeeth}</p>

              <div className="homeui-badges">
                <span className="homeui-badge">
                  {language === "ar" ? "حديث" : "Hadith"}{" "}
                  {h?.grade?.replace("hadith", "")}
                </span>
                <span className="homeui-badge soft">{h?.attribution}</span>
              </div>

              <div className="homeui-divider" />

              <p className={`homeui-subTitle ${dirClass}`}>
                {language === "ar" ? "شرح الحديث :" : "Explanation :"}
              </p>
              <p className={`homeui-text ${dirClass}`}>{h?.explanation}</p>

              {Array.isArray(h?.hints) && h.hints.length > 0 && (
                <>
                  <div className="homeui-divider" />
                  <p className={`homeui-subTitle ${dirClass}`}>
                    {language === "ar" ? "ما يستفاد من الحديث :" : "Hints :"}
                  </p>
                  <div className={`homeui-hints ${dirClass}`}>
                    {h.hints.map((hint, idx) => (
                      <div className="homeui-hint" key={idx}>
                        {h.hints.length > 1 ? `${idx + 1} - ` : ""}
                        {hint}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const homeContentMarginTop = selectedHadiths.length === 0 ? "0" : "-4vh";

  return (
    <div className={`homeui ${language === "ar" ? "rtl" : "ltr"}`}>
      {/* Slider */}
      <div className="homeui-sliderWrap">
        {error ? (
          <div className="homeui-slide">
            <img src={sliderImageOne} className="homeui-img" alt="Error" />
            <div className={`homeui-overlay ${dirClass}`}>
              <div className="homeui-overlayCard">
                <p className="homeui-text">
                  {language === "ar"
                    ? "هناك مشكلة بسيطة سيتم حلها قريبا"
                    : "Something went wrong, please try again later."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Slider {...settings}>
            {hadithsLoading ? (
              <div className="homeui-slide">
                <img
                  src={sliderImageOne}
                  className="homeui-img"
                  alt="Loading"
                />
                <div className={`homeui-overlay ${dirClass}`}>
                  <div className="homeui-overlayCard">
                    <p className={`homeui-loading ${dirClass}`}>
                      {language === "ar"
                        ? "جاري تحميل الأحاديث..."
                        : "Loading Hadiths..."}
                    </p>
                  </div>
                </div>
              </div>
            ) : selectedHadiths.length !== 0 ? (
              selectedHadiths.map((item, idx) => renderSlide(item, idx))
            ) : (
              <div className="homeui-slide">
                <img src={sliderImageOne} className="homeui-img" alt="Hadith" />
                <div className={`homeui-overlay ${dirClass}`}>
                  <div className="homeui-overlayCard">
                    <p className="homeui-hadith">
                      {translations.prophetSaid} {translations.prophetHadith}
                    </p>
                    <div className="homeui-divider" />
                    <span className="homeui-badge soft">
                      {translations.hadithReference}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Slider>
        )}

        <div className="homeui-arrows" />
      </div>

      {/* Content */}
      <div
        className="homeui-content"
        style={{ marginTop: homeContentMarginTop }}
      >
        <div className={`homeui-grid ${language === "ar" ? "rtl" : "ltr"}`}>
          {/* Left: description */}
          <div className="homeui-panel">
            <div className="homeui-hero">
              <h1 className="homeui-siteName">{translations.siteName}</h1>
              <p className="homeui-siteDesc">{translations.siteDescription}</p>
            </div>

            <div className="homeui-features">
              <div className="homeui-feature">
                <div className="homeui-featureIcon">
                  <img src={quran} alt="icon" />
                </div>
                <div className="homeui-featureText">
                  <h3>{translations.quranInterpretation}</h3>
                  <p>{translations.quranInterpretationDescription}</p>
                </div>
              </div>

              <div className="homeui-feature">
                <div className="homeui-featureIcon">
                  <img src={ahadith} alt="icon" />
                </div>
                <div className="homeui-featureText">
                  <h3>{translations.propheticHadiths}</h3>
                  <p>{translations.propheticHadithsDescription}</p>
                </div>
              </div>

              <div className="homeui-feature">
                <div className="homeui-featureIcon">
                  <img src={fatawa} alt="icon" />
                </div>
                <div className="homeui-featureText">
                  <h3>{translations.fatwasAndArticles}</h3>
                  <p>{translations.fatwasAndArticlesDescription}</p>
                </div>
              </div>

              <div className="homeui-feature">
                <div className="homeui-featureIcon">
                  <img src={salat} alt="icon" />
                </div>
                <div className="homeui-featureText">
                  <h3>{translations.prayerTimesAndQibla}</h3>
                  <p>{translations.prayerTimesAndQiblaDescription}</p>
                </div>
              </div>

              <div className="homeui-feature">
                <div className="homeui-featureIcon">
                  <img src={show} alt="icon" />
                </div>
                <div className="homeui-featureText">
                  <h3>{translations.userInterface}</h3>
                  <p>{translations.userInterfaceDescription}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: shortcuts */}
          <div className="homeui-cta">
            <NavLink
              to="/categories"
              className="homeui-link"
              onClick={onNavClick}
            >
              <div className="homeui-ctaCard primary">
                <ChecklistRtlOutlinedIcon className="homeui-ctaIcon" />
                <div className="homeui-ctaText">
                  <span className="homeui-ctaTitle">
                    {translations.categoriesBtn}
                  </span>
                  <span className="homeui-ctaSub">
                    {language === "ar"
                      ? "تصفح الأقسام بسرعة"
                      : "Browse categories quickly"}
                  </span>
                </div>
              </div>
            </NavLink>

            <NavLink
              to="/categories/beMuslim"
              className="homeui-link"
              onClick={() => {
                localStorage.setItem("component-title", "beAMuslim");
                onNavClick?.();
              }}
            >
              <div className="homeui-ctaCard">
                <ManageSearchOutlinedIcon className="homeui-ctaIcon" />
                <div className="homeui-ctaText">
                  <span className="homeui-ctaTitle">
                    {translations.discoverBtn}
                  </span>
                  <span className="homeui-ctaSub">
                    {language === "ar"
                      ? "اكتشف محتوى مفيد"
                      : "Discover useful content"}
                  </span>
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
