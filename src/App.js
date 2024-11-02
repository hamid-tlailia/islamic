import React, { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
// Import navigation router
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { TranslationProvider } from "./components/languages/provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KeyboardDoubleArrowUpOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowUpOutlined";
// Lazy load components
const Header = lazy(() => import("./components/header/header"));
const Footer = lazy(() => import("./components/footer/footer"));
const Loader = lazy(() => import("./components/loader/loader"));
const Home = lazy(() => import("./pages/home/home"));
const Categories = lazy(() => import("./pages/categories/categories"));
const About = lazy(() => import("./pages/about/about"));
const API = lazy(() => import("./pages/api/apidocs"));
const Contact = lazy(() => import("./pages/contact/contact"));
const Islam = lazy(() =>
  import("./pages/categories/subCategories/islam/islam")
);
const Adhkar = lazy(() =>
  import("./pages/categories/subCategories/adhkar/adhkar")
);
const Ahadith = lazy(() =>
  import("./pages/categories/subCategories/ahadith/ahadith")
);
const Animals = lazy(() =>
  import("./pages/categories/subCategories/animalsQisas/animals")
);
const BeMuslim = lazy(() =>
  import("./pages/categories/subCategories/beMuslim/beMuslim")
);
const Fatawa = lazy(() =>
  import("./pages/categories/subCategories/fatawa/fatwa")
);
const Hikam = lazy(() =>
  import("./pages/categories/subCategories/library/library")
);
const Names = lazy(() =>
  import("./pages/categories/subCategories/names/names")
);
const Prophets = lazy(() =>
  import("./pages/categories/subCategories/prophetsQisas/prophets")
);
const Quran = lazy(() =>
  import("./pages/categories/subCategories/quran/quran")
);
const Tafsir = lazy(() =>
  import("./pages/categories/subCategories/tafsir/tafsir")
);
const Tasbih = lazy(() =>
  import("./pages/categories/subCategories/tasbih/tasbih")
);
const Times = lazy(() =>
  import("./pages/categories/subCategories/times/times")
);
const Radio = lazy(() =>
  import("./pages/categories/subCategories/qiblah/radio")
);
const Fiqh = lazy(() => import("./pages/categories/subCategories/fiqh/fiqh"));
const Historic = lazy(() =>
  import("./pages/categories/subCategories/historic/history")
);
const Arabic = lazy(() =>
  import("./pages/categories/subCategories/arabic/arabic")
);
const Topics = lazy(() =>
  import("./pages/categories/subCategories/topics/topics")
);
const Sira = lazy(() => import("./pages/categories/subCategories/sira/sira"));
const Tajweed = lazy(() =>
  import("./pages/categories/subCategories/tajweed/tajweed")
);
const Player = lazy(() => import("./components/player/player"));

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  // Loader state
  const [isLoading, setIsLoading] = useState(true);
  const [isNowPlaying, setIsNowPlaying] = useState(false);
  const [newSRC, setNewSRC] = useState(null);
  const [playingSurah, setPlayingSurah] = useState("");
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [activeStyle, setActiveStyle] = useState([]);
  const [scrollToTop, setScrollToTop] = useState(false);
  const [show, setShow] = useState(false);
  const [backToTop, setBackToTop] = useState(false);
  const [pageTitle, setPageTitle] = useState(null);
  const [language, setLanguage] = useState();
  // Get current page title
  useEffect(() => {
    setPageTitle(document.title);
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) setLanguage(savedLanguage);
    else setLanguage("ar");
  }, [lastScroll]);
  //  Add animation for components

  const triggerAnimation = () => {
    setIsLoaded(false); // Reset the animation state
    setTimeout(() => {
      setIsLoaded(true); // Trigger the animation after a short delay
    }, 100); // Adjust the delay as necessary
    setBackToTop(true);
  };

  // Remove components animation

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Add loader 1s when load page

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const pausePlayer = () => {
    setIsNowPlaying(false);
    setNewSRC(null);
    setPlayingSurah("");
  };

  const audioSRC = (e) => {
    const src = e.target.value;
    if (src && src !== "default") setNewSRC(src);
    const selectedElement = e.target.options[e.target.selectedIndex];
    const surah_name = selectedElement.getAttribute("data-name");
    setPlayingSurah(surah_name);
    setIsNowPlaying(true);
  };
  const playerSrc = (src) => {
    setNewSRC(src ? src : null);
    setIsNowPlaying(true);
  };
  useEffect(() => {
    const body = document.body;
    const handleScroll = () => {
      const currentScroll = body.scrollTop; // Get the current scroll position

      if (currentScroll < lastScroll) {
        // Scrolling up
        setHideHeader(false);
        document.body.classList.remove("navLess"); // Remove class to show header
      } else {
        // Scrolling down
        setHideHeader(true);
        document.body.classList.add("navLess"); // Add class to hide header
      }

      setLastScroll(currentScroll); // Update last scroll position
    };

    // Add scroll event listener
    body.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener on component unmount
    return () => {
      body.removeEventListener("scroll", handleScroll);
    };
  }, [lastScroll]); // Dependency on lastScroll to update on every scroll event

  useEffect(() => {
    const body = document.body;
    const handleScroll = () => {
      const scrollLimit = 300;
      const bodyScrollIndex = body.scrollTop;
      setShow(bodyScrollIndex > scrollLimit);
    };

    // Attach scroll event listener
    body.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (backToTop) {
      body.scrollTo({ top: 0, behavior: "smooth" });
      setBackToTop(false); // Reset after scrolling back to top
    }
  }, [backToTop]);
  // Control body  text size
  // Control body text size
  const handleSize = (selectedSize) => {
    const body = document.body;

    // Map the select values to their corresponding classes
    const sizeClasses = {
      sm: "sm",
      md: "md",
      lg: "lg",
    };

    // Remove all size-related classes first
    Object.values(sizeClasses).forEach((sizeClass) => {
      body.classList.remove(sizeClass);
    });

    // Add the selected size class
    if (sizeClasses[selectedSize]) {
      body.classList.add(sizeClasses[selectedSize]);
    }
  };

  // Function to handle adding/removing styles
  const adjustStyle = (event, style) => {
    const body = document.body;

    if (event.target.classList.contains("active")) {
      // If it is active, remove the 'active' class and the style from the state
      event.target.classList.remove("active");
      body.classList.remove(style);

      // Remove the style from the activeStyle state
      setActiveStyle((prevStyles) =>
        prevStyles.filter((active) => active !== style)
      );
    } else {
      // If it is not active, add the 'active' class and the style to the state
      event.target.classList.add("active");
      body.classList.add(style);

      // Add the style to the activeStyle state
      setActiveStyle((prevStyles) => {
        // Ensure the style is not already present before adding
        if (!prevStyles.includes(style)) {
          return [...prevStyles, style];
        }
        return prevStyles;
      });
    }
  };

  // Clear all body styles when toggle to dark mode

  const clearBodyStyles = () => {
    setActiveStyle([]);
  };

  // Show hide header on categories scroll
  const headerON = () => {
    setHideHeader(false);
  };
  const headerOFF = () => {
    setHideHeader(true);
  };

  const scrollContent = () => {
    setScrollToTop(true);
  };
  setInterval(() => {
    setScrollToTop(false);
    setBackToTop(false);
  }, 1000);

  const nowPlayingName = (audioName) => {
    setPlayingSurah(audioName);
  };
  return (
    <TranslationProvider>
      <div className="App custom-cursor">
        {isLoading ? (
          <Loader />
        ) : (
          <Router>
            <Suspense fallback={<Loader />}>
              <Header
                onNavClick={triggerAnimation}
                visibility={hideHeader}
                size={handleSize}
                bodyStyle={adjustStyle}
                active={activeStyle}
                clearThemes={clearBodyStyles}
              />
              <div
                className={`lazy-component-wrapper ${isLoaded ? "loaded" : ""}`}
              >
                <Routes>
                  <Route
                    exact
                    path="/"
                    element={<Home onNavClick={triggerAnimation} />}
                  />
                  <Route
                    path="/categories"
                    element={
                      <Categories
                        showHeader={headerON}
                        hideHeader={headerOFF}
                        backToTop={scrollToTop}
                        displayButton={() => setShow(true)}
                        hideButton={() => setShow(false)}
                        backTop={backToTop}
                        scrollTop={() => setBackToTop(true)}
                      />
                    }
                  >
                    {/* All routes under the categories component start */}
                    <Route path="islam" element={<Islam />} />
                    <Route path="adhkar" element={<Adhkar />} />
                    <Route path="ahadith" element={<Ahadith />} />
                    <Route
                      path="animals"
                      element={<Animals scrollUp={scrollContent} />}
                    />
                    <Route path="beMuslim" element={<BeMuslim />} />
                    <Route
                      path="fatawa"
                      element={
                        <Fatawa src={playerSrc} audioName={nowPlayingName} />
                      }
                    />
                    <Route path="library" element={<Hikam />} />
                    <Route path="names" element={<Names />} />
                    <Route
                      path="prophets"
                      element={<Prophets scrollUp={scrollContent} />}
                    />
                    <Route
                      path="quran"
                      element={
                        <Quran
                          src={audioSRC}
                          toTop={() => setBackToTop(true)}
                        />
                      }
                    />
                    <Route
                      path="tafsir"
                      element={<Tafsir toTop={() => setBackToTop(true)} src={playerSrc} audioName={nowPlayingName} />}
                    />
                    <Route path="tasbih" element={<Tasbih />} />
                    <Route path="times" element={<Times />} />
                    <Route path="radio" element={<Radio  src={playerSrc} audioName={nowPlayingName} isPlaying={isNowPlaying}/>} />
                    <Route
                      path="fiqh"
                      element={
                        <Fiqh src={playerSrc} audioName={nowPlayingName} />
                      }
                    />
                    <Route
                      path="historic"
                      element={
                        <Historic src={playerSrc} audioName={nowPlayingName} />
                      }
                    />
                    <Route
                      path="arabic"
                      element={
                        <Arabic src={playerSrc} audioName={nowPlayingName} />
                      }
                    />
                    <Route
                      path="knowledge"
                      element={
                        <Topics
                          back={scrollContent}
                          src={playerSrc}
                          audioName={nowPlayingName}
                        />
                      }
                    />
                    <Route
                      path="sira"
                      element={
                        <Sira src={playerSrc} audioName={nowPlayingName} />
                      }
                    />
                    <Route
                      path="tajweed"
                      element={
                        <Tajweed
                          audioName={playerSrc}
                          documentName={nowPlayingName}
                        />
                      }
                    />
                    {/* All routes under the categories component end */}
                  </Route>
                  <Route
                    path="/about"
                    element={<About onAboutClick={triggerAnimation} />}
                  />
                  <Route
                    path="/api-docs"
                    element={
                      <API
                        showScrillBtn={() => setShow(true)}
                        hideScrollBtn={() => setShow(false)}
                        back={backToTop}
                      />
                    }
                  />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/*" element={<Home />} />
                  {/* Path to APIs */}
                  <Route
                    path="/APIs/stories.json"
                    element={<Navigate to="/APIs/stories.json" />}
                  />
                  <Route
                    path="/APIs/animals.json"
                    element={<Navigate to="/APIs/animals.json" />}
                  />
                  <Route
                    path="/APIs/Quran_Tafsir.json"
                    element={<Navigate to="/APIs/Quran_Tafsir.json" />}
                  />
                  <Route
                    path="/APIs/books.json"
                    element={<Navigate to="/APIs/books.json" />}
                  />
                  <Route
                    path="/APIs/adhkar.json"
                    element={<Navigate to="/APIs/adhkar.json" />}
                  />
                  <Route
                    path="en-al-jalalayn.json"
                    element={<Navigate to="en-al-jalalayn.json" />}
                  />
                  {/* Add more routes as needed */}
                </Routes>
              </div>
              <Footer onFooterClick={triggerAnimation} />
              <Player
                show={isNowPlaying}
                hidePlayer={pausePlayer}
                src={newSRC}
                surah_name={playingSurah}
                title={pageTitle}
              />
            </Suspense>
          </Router>
        )}
        <ToastContainer
          draggable
          position="top-center"
          style={{
            zIndex: "99999",
            textAlign: language === "ar" ? "right" : "left",
          }}
        ></ToastContainer>
        {/* Back to top */}

        {show && (
          <button
            className="btn  back-to-top"
            onClick={() => setBackToTop(true)}
          >
            <KeyboardDoubleArrowUpOutlinedIcon />
          </button>
        )}
      </div>
    </TranslationProvider>
  );
}

export default App;
