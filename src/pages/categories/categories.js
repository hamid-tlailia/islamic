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
import ask from "../images/ask.png";
import qiblah from "../images/qiblah.png";
import fiqh from "../images/fiqh.png";
import history from "../images/history.png";
import arabic from "../images/arabic.png";
import topics from "../images/topics.png";
import sira from "../images/sira.png";
import tajweed from "../images/tajweed.png";
import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "../../components/languages/provider";
import { useNavigate, useLocation } from "react-router-dom";
import throttle from "lodash.throttle";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

const navLinks = [
  {
    path: "islam",
    title: "whatIsIslam",
  },
  {
    path: "beMuslim",
    title: "beAMuslim",
  },
  {
    path: "quran",
    title: "quran",
  },
  {
    path: "tafsir",
    title: "quranInterpretationCat",
  },
  {
    path: "ahadith",
    title: "hadiths",
  },
  {
    path: "times",
    title: "prayerTimes",
  },
  {
    path: "adhkar",
    title: "azkar",
  },
  {
    path: "names",
    title: "asmaaHusna",
  },
  {
    path: "tasbih",
    title: "tasbeeh",
  },
  {
    path: "prophets",
    title: "prophetsStories",
  },
  {
    path: "animals",
    title: "animalsStories",
  },
  {
    path: "fatawa",
    title: "contemporaryFatwas",
  },
  {
    path: "library",
    title: "wisdomAndAdmonitions",
  },
  {
    path: "qiblah",
    title: "qiblahDirection",
  },
  {
    path: "fiqh",
    title: "fiqhIslam",
  },
  {
    path: "historic",
    title: "islamicHistory",
  },
  {
    path: "arabic",
    title: "arabicLanguage",
  },
  {
    path: "knowledge",
    title: "OtherTopics",
  },
  {
    path: "sira",
    title: "alSira",
  },
  {
    path: "tajweed",
    title: "alTajweed",
  },
  {
    path: "questions",
    title: "askAQuestion",
  },
];

const Categories = ({
  showHeader,
  hideHeader,
  backToTop,
  displayButton,
  hideButton,
  backTop,
  scrollTop,
}) => {
  // Define sub component title
  const [subTitle, setSubTitle] = useState("");
  // Handle scrolling state
  const [currentScroll, setCurrentScroll] = useState(0);
  const [checkTitle, setCheckTitle] = useState(false);
  // State to store the selected category position
  const [selectedCategoryPosition, setSelectedCategoryPosition] = useState(0);
  const { language, translations } = useTranslation();
  // Get outlets area
  const navigate = useNavigate();
  const location = useLocation();
  const categoriesRef = useRef(null);
  const outletsRef = useRef(null);
  const contentRef = useRef(null);
  // Change page title
  useEffect(() => {
    if (location.pathname.startsWith("/categories/")) {
      document.title = translations[subTitle];
    } else {
      document.title =
        language === "ar"
          ? "دين الله | الأقسام"
          : "God's religion | Categories";
    }
    // eslint-disable-next-line
  }, [subTitle, language, location]);
  // get component title from local storage
  useEffect(() => {
    const currentComponentTitle = localStorage.getItem("component-title");
    if (currentComponentTitle) setSubTitle(currentComponentTitle);
    else setSubTitle("الأقسام");
    const savedPosition = localStorage.getItem("last-category-position");
    setSelectedCategoryPosition(savedPosition);
    if (location.pathname.startsWith("/categories/")) scrollTop();
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

  // Add event listener for category clicks
  useEffect(() => {
    const categoryElement = categoriesRef.current;
    if (categoryElement) {
      categoryElement.addEventListener("click", handleCategoryClick);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (categoryElement) {
        categoryElement.removeEventListener("click", handleCategoryClick);
      }
    };
    // eslint-disable-next-line
  }, []);

  // Handle outlet closing
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

  // Updated useEffect to handle pathname changes
  useEffect(() => {
    if (location.pathname.startsWith("/categories/")) {
      outletsRef.current?.classList.add("active");
      categoriesRef.current?.classList.add("hide");
      // Extract the category segment after "/categories/"
      const categoryPath = location.pathname
        .replace("/categories/", "")
        .split("/")[0]
        .toLowerCase(); // Optional: normalize to lowercase if needed

      // Find the matching navigation link based on the categoryPath
      const matchedLink = navLinks.find(
        (link) => link.path.toLowerCase() === categoryPath
      );

      if (matchedLink) {
        // Save the title to localStorage
        localStorage.setItem("component-title", matchedLink.title);
      } else {
        // Optionally, handle the case where no matching category is found
        const defaultTitle = language === "ar" ? "الأقسام" : "Categories";
        localStorage.setItem("component-title", defaultTitle);
      }
      setCheckTitle(true);
      scrollTop();
    } else {
      outletsRef.current.classList.remove("active");
      categoriesRef.current.classList.remove("hide");
      document.body.scrollTo({
        top: selectedCategoryPosition,
      });
      setCheckTitle(false);
    }
    // eslint-disable-next-line
  }, [location.pathname, selectedCategoryPosition]); // Depend on location.pathname to run the effect when the path changes

  // Function to handle scrolling and show/hide button
  // eslint-disable-next-line
  const checkScrollTop = useCallback(
    throttle((e) => {
      const { scrollTop } = e.target;
      const threshold = 300;
      const isScrollingDown = scrollTop > currentScroll;

      // Handle header visibility immediately
      if (isScrollingDown) {
        hideHeader();
      } else {
        showHeader();
      }

      // Handle button display throttled
      if (scrollTop > threshold) {
        displayButton();
      } else {
        hideButton();
      }

      // Update current scroll position
      setCurrentScroll(scrollTop);
    }, 300), // Throttle delay of 300ms
    [currentScroll]
  );

  const handleScroll = (e) => {
    checkScrollTop(e);
  };

  // Function to scroll back to the top
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [backTop, checkTitle]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [backToTop]);

  return (
    <div className="container-fluid p-0">
      <div className="categories">
        <div className="card content" ref={contentRef} onScroll={handleScroll}>
          <div className="card-header p-0">
            <p className="w-100 text-center  p-2">
              {translations.prayerKnowledge}
            </p>
          </div>
          <div className="card-body p-0">
            {/* Categories */}
            <div className="divisions" ref={categoriesRef}>
              <NavLink className="div" to="islam">
                <img src={islam} alt="divs" />
                <span id="whatIsIslam"> {translations.whatIsIslam}</span>
              </NavLink>
              <NavLink className="div" to="beMuslim">
                <img src={be} alt="divs" />
                <span id="beAMuslim"> {translations.beAMuslim}</span>
              </NavLink>
              <NavLink className="div" to="quran">
                <img src={quran} alt="divs" />
                <span id="quran"> {translations.quran}</span>
              </NavLink>
              <NavLink className="div" to="tafsir">
                <img src={tafsir} alt="divs" />
                <span id="quranInterpretationCat">
                  {" "}
                  {translations.quranInterpretationCat}
                </span>
              </NavLink>
              <NavLink className="div" to="ahadith">
                <img src={ahadith} alt="divs" />
                <span id="hadiths">{translations.hadiths}</span>
              </NavLink>
              <NavLink className="div" to="times">
                <img src={salat} alt="divs" />
                <span id="prayerTimes"> {translations.prayerTimes}</span>
              </NavLink>
              <NavLink className="div" to="adhkar">
                <img src={adhkar} alt="divs" />
                <span id="azkar">{translations.azkar}</span>
              </NavLink>
              <NavLink className="div" to="names">
                <img src={asma2} alt="divs" />
                <span id="asmaaHusna"> {translations.asmaaHusna}</span>
              </NavLink>
              <NavLink className="div" to="tasbih">
                <img src={tasbih} alt="divs" />
                <span id="tasbeeh">{translations.tasbeeh}</span>
              </NavLink>
              <NavLink className="div" to="prophets">
                <img src={qisas} alt="divs" />
                <span id="prophetsStories">
                  {" "}
                  {translations.prophetsStories}
                </span>
              </NavLink>
              <NavLink className="div" to="animals">
                <img src={animals} alt="divs" />
                <span id="animalsStories"> {translations.animalsStories}</span>
              </NavLink>
              <NavLink className="div" to="fatawa">
                <img src={fatawa} alt="divs" />
                <span id="contemporaryFatwas">
                  {" "}
                  {translations.contemporaryFatwas}
                </span>
              </NavLink>
              <NavLink className="div" to="library">
                <img src={wasia} alt="divs" />
                <span id="wisdomAndAdmonitions">
                  {" "}
                  {translations.wisdomAndAdmonitions}
                </span>
              </NavLink>
              <NavLink className="div" to="qiblah">
                <img src={qiblah} className="w-100" alt="divs" />
                <span id="qiblahDirection">
                  {" "}
                  {translations.qiblahDirection}
                </span>
              </NavLink>
              <NavLink className="div" to="fiqh">
                <img src={fiqh} alt="divs" />
                <span id="fiqhIslam"> {translations.fiqhIslam}</span>
              </NavLink>
              <NavLink className="div" to="historic">
                <img src={history} alt="divs" />
                <span id="islamicHistory"> {translations.islamicHistory}</span>
              </NavLink>
              <NavLink className="div" to="arabic">
                <img src={arabic} alt="divs" />
                <span id="arabicLanguage"> {translations.arabicLanguage}</span>
              </NavLink>
              <NavLink className="div" to="knowledge">
                <img src={topics} alt="divs" />
                <span id="OtherTopics"> {translations.OtherTopics}</span>
              </NavLink>
              <NavLink className="div" to="sira">
                <img src={sira} alt="divs" />
                <span id="alSira"> {translations.alSira}</span>
              </NavLink>
              <NavLink className="div" to="tajweed">
                <img src={tajweed} alt="divs" />
                <span id="alTajweed"> {translations.alTajweed}</span>
              </NavLink>
              <NavLink className="div" to="questions">
                <img src={ask} alt="divs" />
                <span id="askAQuestion"> {translations.askAQuestion}</span>
              </NavLink>
            </div>
          </div>
          {/* Categories result area */}
          <div className="outlets card" ref={outletsRef}>
            <div className="card-header outlets-top">
              <p>
                {" "}
                <MenuBookOutlinedIcon /> {translations[subTitle]}{" "}
              </p>
              <p onClick={closeOutlet} className="back">
                X
              </p>
            </div>
            <div className="card-body outlets-body">{<Outlet />}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
