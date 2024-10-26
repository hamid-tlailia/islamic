import React, { useEffect, useState } from "react";
import "./home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { NavLink } from "react-router-dom";
import { useTranslation } from "../../components/languages/provider";

// Import the single image to use for all Hadiths
import sliderImageOne from "../images/slider1.jpg"; // Use your preferred image here
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
  const [error, setError] = useState(null);
  useEffect(() => {
    localStorage.removeItem("last-category-position");
  }, []);

  useEffect(() => {
    const fetchHadiths = async () => {
      try {
        // Fetch categories in the selected language
        const categoriesResponse = await fetch(
          `https://hadeethenc.com/api/v1/categories/list/?language=${language}`
        );
        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
        }
        const categoriesData = await categoriesResponse.json();

        let allHadithIds = [];

        // Limit the number of categories to fetch
        const categoriesToFetch = categoriesData.slice(0, 5);

        // Fetch Hadith IDs for each category
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

        // Limit the number of Hadiths to fetch to 10
        const limitedIds = shuffledIds.slice(0, 100);

        // Fetch Hadith details for the limited IDs
        const hadithDetailsPromises = limitedIds.map((id) =>
          fetchHadithDetails(id)
        );
        const hadithDetails = await Promise.all(hadithDetailsPromises);

        setSelectedHadiths(hadithDetails.filter((hadith) => hadith !== null));
        setHadithsLoading(false);
      } catch (error) {
        console.error("Error fetching Hadiths:", error);
        setError("Failed to load Hadiths. Please try again later.");
        setHadithsLoading(false);
      }
    };

    fetchHadiths();
    // eslint-disable-next-line
  }, [language]); // Depend on the language

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
            ) : (
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
                    <div className={`p-3 ${language === "en" && "text-start"}`}>
                      <p className="text-warning">{item.data.hadeeth}</p>
                      <small className="text-white badge bg-success mt-1">
                        {language === "ar"
                          ? "درجة الحديث : "
                          : "Hadith degree : "}{" "}
                        {item.data.grade}
                      </small>
                      <hr />
                      <p className="text-light">
                        {item.data.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Slider>
        )}
        <div className="custom-arrows"></div>
      </div>
      {/* Description */}
      <div className="container-fluid d-flex justify-content-center align-items-center card content">
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
                    {translations.quranInterpretation}
                  </h2>
                  <p>{translations.quranInterpretationDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={ahadith} alt="icon" className="icons" />
                    {translations.propheticHadiths}
                  </h2>
                  <p>{translations.propheticHadithsDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={fatawa} alt="icon" className="icons" />
                    {translations.fatwasAndArticles}
                  </h2>
                  <p>{translations.fatwasAndArticlesDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={salat} alt="icon" className="icons" />
                    {translations.prayerTimesAndQibla}
                  </h2>
                  <p>{translations.prayerTimesAndQiblaDescription}</p>
                </div>

                <div className="feature">
                  <h2>
                    <img src={show} alt="icon" className="icons" />
                    {translations.userInterface}
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
