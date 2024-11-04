import React, { useEffect, useState, useCallback } from "react";
import "./home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { NavLink } from "react-router-dom";
import { useTranslation } from "../../components/languages/provider";
import { toast } from "react-toastify";

// Import the single image to use for all Hadiths
import sliderImageOne from "../images/slider2.jpg"; // Use your preferred image here
import quran from "../images/quran.png";
import ahadith from "../images/ahadith.png";
import fatawa from "../images/fatawa.png";
import show from "../images/interface.png";
import salat from "../images/salat.png";

const Home = ({ onNavClick }) => {
  const { translations, language } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [selectedHadiths, setSelectedHadiths] = useState([]);
  const [hadithsLoading, setHadithsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Function to fetch Hadiths
  const fetchHadiths = useCallback(async () => {
    try {
      setHadithsLoading(true); // Start loading

      // Fetch categories in the selected language
      const categoriesResponse = await fetch(
        `https://hadeethenc.com/api/v1/categories/list/?language=${language}`
      );
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
      }
      const categoriesData = await categoriesResponse.json();

      // Get the current limit from localStorage or start at 0
      const storedLimit =
        parseInt(localStorage.getItem("last-category-limit")) || 0;

      // Determine the new limit
      const newLimit = storedLimit + 5;

      // Slice the categories data based on the current limit
      const categoriesToFetch = categoriesData.slice(storedLimit, newLimit);

      // Update the limit in localStorage
      localStorage.setItem("last-category-limit", newLimit);

      let allHadithIds = [];

      // Fetch Hadith IDs for each category in the current slice
      for (const category of categoriesToFetch) {
        const hadithsResponse = await fetch(
          `https://hadeethenc.com/api/v1/hadeeths/list/?language=${language}&category_id=${category.id}`
        );
        if (!hadithsResponse.ok) {
          throw new Error(`HTTP error! status: ${hadithsResponse.status}`);
        }
        const hadithsData = await hadithsResponse.json();

        if (
          hadithsData &&
          hadithsData.data &&
          Array.isArray(hadithsData.data)
        ) {
          const ids = hadithsData.data.map((hadith) => hadith.id);
          allHadithIds = allHadithIds.concat(ids);
        } else {
          console.error(
            `Unexpected hadithsData structure for category ID ${category.id}:`,
            hadithsData
          );
        }
      }

      // Remove duplicate IDs
      allHadithIds = [...new Set(allHadithIds)];

      // Shuffle the IDs
      const shuffledIds = shuffleArray(allHadithIds);

      // Limit the number of Hadiths to fetch to 100 (adjust as needed)
      const limitedIds = shuffledIds.slice(0, 5);

      // Fetch Hadith details for the limited IDs
      const hadithDetailsPromises = limitedIds.map((id) =>
        fetchHadithDetails(id)
      );
      const hadithDetails = await Promise.all(hadithDetailsPromises);

      setSelectedHadiths((prevHadiths) => [
        ...prevHadiths,
        ...hadithDetails.filter((hadith) => hadith !== null),
      ]);
      setHadithsLoading(false);
      console.log(hadithDetails);
    } catch (error) {
      console.error("Error fetching Hadiths:", error);
      setError(true);
      toast.error(
        language === "ar"
          ? "هناك مشكلة بسيطة سيتم حلها قريبا"
          : "Failed to load Hadiths. Please try again later."
      );
      setHadithsLoading(false);
    }
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    fetchHadiths();
  }, [fetchHadiths]);

  const fetchHadithDetails = async (id) => {
    try {
      // Fetch Hadith in the selected language
      const response = await fetch(
        `https://hadeethenc.com/api/v1/hadeeths/one/?language=${language}&id=${id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const hadithData = await response.json();

      return {
        id,
        data: hadithData,
      };
    } catch (error) {
      console.error(`Error fetching Hadith details for ID ${id}:`, error);
      return null;
    }
  };

  // Function to shuffle an array
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const settings = {
    dots: false, // Enable dots for navigation
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    appendArrows: ".custom-arrows",
    prevArrow: <button className="slick-prev">←</button>,
    nextArrow: <button className="slick-next">→</button>,
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

  return (
    <div className="home">
      <div className="carousel-container mt-5">
        {error ? (
          <div className="carousel-item">
            <img src={sliderImageOne} className="img-fluid" alt="Error" />
            <div className={`carousel-caption ${language === "en" && "en"}`}>
              <div className={`p-3 ${language === "en" && "text-start"}`}>
                <p>{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <Slider {...settings}>
            {hadithsLoading ? (
              // Show a loader or skeleton in place of the Hadith text
              <div className="carousel-item">
                <img
                  src={sliderImageOne}
                  className="img-fluid"
                  alt="Loading..."
                />
                <div
                  className={`carousel-caption ${language === "en" && "en"}`}
                >
                  <div
                    className={`p-3 ${
                      language === "en ltr" && "text-start rtl"
                    }`}
                  >
                    <p>
                      {language === "ar"
                        ? "...جاري تحميل الأحاديث"
                        : "Loading Hadiths..."}{" "}
                    </p>
                  </div>
                </div>
              </div>
            ) : selectedHadiths.length !== 0 ? (
              selectedHadiths.map((item, index) => (
                <div className="carousel-item" key={index}>
                  <img
                    src={sliderImageOne}
                    className="img-fluid"
                    alt={`Slide ${index + 1}`}
                  />
                  <div
                    className={`carousel-caption ${language === "en" && "en"}`}
                  >
                    <div
                      className={`p-1 ${language === "en" && "text-start"}`}
                      style={{ overflowX: "hidden" }}
                    >
                      <p className="text-warning">{item.data.hadeeth}</p>
                      <small className="text-white badge hadith-degree p-1 bg-success mt-1">
                        {language === "ar"
                          ? "درجة الحديث : "
                          : "Hadith degree : "}{" "}
                        {item.data.grade.replace("hadith", "")}
                      </small>
                      <hr />
                      <p className="text-light">{item.data.explanation}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="carousel-item">
                <img src={sliderImageOne} className="img-fluid" alt="Hadith" />
                <div
                  className={`carousel-caption ${language === "en" && "en"}`}
                >
                  <div
                    className={`p-1 ${language === "en" && "text-start"}`}
                    style={{ overflowX: "hidden" }}
                  >
                    <p className="text-warning">
                      {translations.prophetSaid} : {translations.prophetHadith}
                    </p>
                    <small className="text-white hadith-degree p-1 mt-1">
                      {translations.hadithReference}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </Slider>
        )}
        <div className="custom-arrows"></div>
      </div>

      {/* Description */}
      <div
        className="container-fluid d-flex justify-content-center align-items-center card home-content"
        style={{ marginTop: selectedHadiths.length === 0 ? "0" : "-8vh" }}
      >
        <div
          className={`row w-100 site-map ${
            language === "ar" ? "rtl" : "ltr en"
          }`}
        >
          <div className="col-12 col-lg-6 col-md-6">
            <div className="description">
              <div className="card-body">
                <h1 className="card-title text-center site-name fs-1">
                  {translations.siteName}
                </h1>
                <p className="text-center">{translations.siteDescription}</p>

                <div className="feature">
                  <h2>
                    <img src={quran} alt="icon" className="icons" />
                    <span>{translations.quranInterpretation}</span>
                  </h2>
                  <p>{translations.quranInterpretationDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={ahadith} alt="icon" className="icons" />
                    <span>{translations.propheticHadiths}</span>
                  </h2>
                  <p>{translations.propheticHadithsDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={fatawa} alt="icon" className="icons" />
                    <span>{translations.fatwasAndArticles}</span>
                  </h2>
                  <p>{translations.fatwasAndArticlesDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={salat} alt="icon" className="icons" />
                    <span>{translations.prayerTimesAndQibla}</span>
                  </h2>
                  <p>{translations.prayerTimesAndQiblaDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={show} alt="icon" className="icons" />
                    <span>{translations.userInterface}</span>
                  </h2>
                  <p>{translations.userInterfaceDescription}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6 col-md-6 home-btns">
            <NavLink
              to="/categories"
              className="home-shortcut-href"
              onClick={onNavClick}
            >
              <button className="btn btn-outline-primary">
                <GridViewOutlinedIcon className="home-short-icon" />{" "}
                {translations.categoriesBtn}
              </button>
            </NavLink>
            <NavLink
              to="/categories/beMuslim"
              className="home-shortcut-href"
              onClick={() => {
                localStorage.setItem("component-title", "beAMuslim");
                onNavClick();
              }}
            >
              <button className="btn btn-outline-secondary">
                <ManageSearchOutlinedIcon className="home-short-icon" />{" "}
                {translations.discoverBtn}
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
