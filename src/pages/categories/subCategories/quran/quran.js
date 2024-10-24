// Quran.js
import React, { useState, useEffect, useRef } from "react";
import "./quran.css";
import { SyncAltOutlined as SyncIcon } from "@mui/icons-material";
import SlowMotionVideoOutlinedIcon from "@mui/icons-material/SlowMotionVideoOutlined";
import { Tabs, Tab, Box } from "@mui/material"; // Import Material UI Tabs components
import logo from "../images/logo.png";
import Quran_Tafsir from "./Quran_Tafsir.json";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogContent from "@mui/joy/DialogContent";
import ZoomOutMapOutlinedIcon from "@mui/icons-material/ZoomOutMapOutlined";
import { useTranslation } from "../../../../components/languages/provider";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";

const Quran = ({ src }) => {
  const [surahs, setSurahs] = useState([]);
  const [allAyahs, setAllAyahs] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [surahData, setSurahData] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [refs, setRefs] = useState([]);
  const [tafseerLangs, setTafseerLangs] = useState("arabe");
  const [apiTafseer, setApiTafseer] = useState([]);
  const [apiTranslation, setApiTranslation] = useState([]);
  const [quranLangs, setQuranLangs] = useState("Arabe");
  const [openAyahTafsirModal, setOpenAyahTafsirModal] = useState(false);
  const [signleAyahTafsirText, setSignleAyahTafsirText] = useState("");
  const [layout, setLayout] = useState(undefined);
  const [tafsirLoader, setTafsirLoader] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState();
  const [englishTafsir, setEnglishTafsir] = useState([]);
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(null);
  const [prevAyahIndex, setPrevAyahIndex] = useState(null); // New state variable
  const [tabValue, setTabValue] = useState(0);
  const [allSurahTafseer, setAllSurahTafseer] = useState([]);
  const reciterNameMap = {
    // ... (Include your reciterNameMap object here)
  };
  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(false);
  const { translations, language } = useTranslation();
  const surahsRef = useRef(null);
  const ayahsRef = useRef(null);

  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "هناك خطأ ما سيتم معالجة الأمر قريبا "
          : "Something happened, we'll fix it soon"
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching]);

  useEffect(() => {
    const fetchQuran = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.alquran.cloud/v1/quran/quran-uthmani"
        );
        const data = await response.json();
        if (data?.data?.surahs) {
          setSurahs(data.data.surahs);
        }
      } catch (error) {
        setIsErrorFetching(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuran();
  }, []);

  const selectReciter = useRef(null);

  const handleSurahClick = (e, surah) => {
    setAllAyahs(surah);
    ayahsRef.current.classList.add("active");
    surahsRef.current.classList.add("d-none");
    ayahsRef.current.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedSurah(surah.number);
    if (selectReciter.current) selectReciter.current.value = "default";
  };

  const goBack = () => {
    ayahsRef.current.classList.remove("active");
    surahsRef.current.classList.remove("d-none");
  };

  const toggleVisibility = () => setIsOpen(!isOpen);

  const reverseSurahs = () => setIsReversed(!isReversed);

  useEffect(() => {
    if (selectedSurah) {
      const surahTfsir = Quran_Tafsir.Surahs.find(
        (surah) => surah.number === Number(selectedSurah)
      );
      setSurahData(surahTfsir);
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (selectedSurah > 0) {
      const getSurahData = async () => {
        try {
          const translationResponse = await fetch(
            `https://api.alquran.cloud/v1/surah/${selectedSurah}/en.asad`
          );
          const translationData = await translationResponse.json();
          setApiTranslation(translationData.data.ayahs);
        } catch (error) {
          console.log("Error fetching surah data:", error);
          setIsErrorFetching(true);
        }
      };
      getSurahData();
    }
  }, [selectedSurah]);

  useEffect(() => {
    setTafsirLoader(true);
    const getSurahData = async () => {
      try {
        if (selectedSurah > 0) {
          const tafseerResponse = await fetch(
            `https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/${
              tafseerLangs === "arabe" ? "ar.muyassar" : "en.asad"
            }`
          );
          const tafseerData = await tafseerResponse.json();
          setApiTafseer(tafseerData.data[0]);
          setTafsirLoader(false);
        }
      } catch (error) {
        console.log("Error fetching surah tafseer data:", error);
        setIsErrorFetching(true);
      }
    };

    if (selectedSurah > 0 && allAyahs?.ayahs.length > 0) {
      getSurahData();
    }
  }, [selectedSurah, allAyahs?.ayahs.length, tafseerLangs]);

  useEffect(() => {
    setRefs(allAyahs?.ayahs.map(() => React.createRef()));
  }, [allAyahs?.ayahs]);

  const scrollToRef = (index) => {
    if (refs[index] && refs[index].current && index >= 1) {
      // Remove 'scrolled-ayah' from previous ayah
      if (
        prevAyahIndex !== null &&
        refs[prevAyahIndex] &&
        refs[prevAyahIndex].current
      ) {
        refs[prevAyahIndex].current.parentElement.classList.remove(
          "scrolled-ayah"
        );
      }

      // Scroll to the selected ayah
      refs[index - 1].current.scrollIntoView({
        block: "start",
      });

      // Add 'scrolled-ayah' class to the selected ayah
      refs[index].current.parentElement.classList.add("scrolled-ayah");

      // Update prevAyahIndex
      setPrevAyahIndex(index);
      setCurrentAyahIndex(null);
    }
  };

  const handleDropdownChange = (event) => {
    const index = event.target.value;
    setCurrentAyahIndex(index);
    scrollToRef(index);
  };

  const getSingleAyahTafsir = (ayahNumber) => {
    const surahNumber = allAyahs.number;
    const ayahTfasir = Quran_Tafsir.Surahs?.find(
      (tafsir) => tafsir.number === Number(surahNumber)
    );
    setSelectedAyah(ayahNumber);

    if (ayahTfasir) {
      if (quranLangs === "Arabe" || quranLangs === "Together") {
        const ayahArabicTafsir = ayahTfasir.ayahs[ayahNumber]?.tafsir || "";
        const englishTafsir = `<p className='dr-rtl'>${
          selectedSurah ? ayahArabicTafsir : ""
        } </p>`;
        const cleanContent = DOMPurify.sanitize(englishTafsir);
        setSignleAyahTafsirText(cleanContent);
      }
      setOpenAyahTafsirModal(true);
    }
  };
  // Set arabic tafsir for Explanation Tab
  useEffect(() => {
    const surahNumber = allAyahs?.number;
    const ayahTfasir = Quran_Tafsir.Surahs?.find(
      (tafsir) => tafsir.number === Number(surahNumber)
    );
    setAllSurahTafseer(ayahTfasir);
  }, [allAyahs]);

  useEffect(() => {
    const fetchReciters = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://www.mp3quran.net/api/v3/reciters"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReciters(data.reciters);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reciters:", error);
        setLoading(false);
        setIsErrorFetching(true);
      }
    };

    fetchReciters();
  }, []);

  useEffect(() => {
    if (language === "en") {
      setQuranLangs("English");
      setTafseerLangs("english");
    }
  }, [language]);

  useEffect(() => {
    setTafsirLoader(true);
    const getSurahData = async () => {
      try {
        if (selectedSurah > 0) {
          const tafseerResponse = await fetch(
            `http://api.quran-tafseer.com/tafseer/9/${selectedSurah}/1/${allAyahs?.ayahs.length}`
          );
          const tafseerData = await tafseerResponse.json();
          setEnglishTafsir(tafseerData);
          setTafsirLoader(false);
        }
      } catch (error) {
        console.log("Error fetching surah english tafseer data:", error);
        setIsErrorFetching(true);
      }
    };

    if (selectedSurah > 0 && allAyahs?.ayahs.length > 0) {
      getSurahData();
    }
    // eslint-disable-next-line
  }, [selectedSurah, allAyahs?.ayahs.length, quranLangs]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="quran">
      {isLoading ? (
        <div className="loader-container">
          <div className="loader">
            <div className="spinner"></div>
            <img src={logo} alt="Loading..." />
          </div>
        </div>
      ) : (
        <React.Fragment>
          <div className="data-container shadow-4 card mb-5 p-2">
            <div className="metaData" style={{ position: "relative" }}>
              <p>{translations.numberOfAyahs}</p>
              <p>{translations.numberOfSurahs}</p>
              <p>{translations.numberOfSajdahs}</p>
            </div>
            <div
              id="additional-info"
              className={`additional-infos  mb-3 ${isOpen && "show"}`}
            >
              <p>{translations.numberOfRukoos}</p>
              <p>{translations.numberOfPages}</p>
              <p>{translations.numberOfManazil}</p>
              <p>{translations.numberOfQuarterHizbs}</p>
              <p>{translations.numberOfJuz}</p>
            </div>
            <button
              className="btn btn-coral text-light metaData-btns"
              onClick={toggleVisibility}
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "40px",
                transform: "translateX(-50%)",
              }}
            >
              <span className={`${isOpen && "text-primary"}`}>
                {isOpen
                  ? language === "ar"
                    ? "أقل"
                    : "Less"
                  : language === "ar"
                  ? "المزيد"
                  : "More"}
              </span>
            </button>
            <button
              className="btn btn-coral rounded-3 shadow-2-strong p-1 mt-2 text-light metaData-btns"
              onClick={reverseSurahs}
              style={{
                position: "absolute",
                bottom: "-16px",
                right: "10px",
                transform: "translateX(-50%) rotate(90deg)",
              }}
            >
              {isReversed ? (
                <SyncIcon className="text-primary" />
              ) : (
                <SyncIcon className="text-white" />
              )}
            </button>
          </div>
          <div
            className={isReversed ? "reversed 114-1" : "surahs 1-114"}
            ref={surahsRef}
          >
            {surahs.length > 0 ? (
              surahs.map((surah, index) => (
                <div
                  className="surah"
                  key={index}
                  data-name={index + 1}
                  onClick={(e) => handleSurahClick(e, surah)}
                >
                  <div className="surah-number pe-none"> {surah.number} </div>
                  <div className="surah-names pe-none">
                    <div className="surah-arabic-name"> {surah.name} </div>
                    <h5 className="surah-english-name">{surah.englishName}</h5>
                  </div>
                  <div className="surah-infos p-2 pe-none">
                    <p className="surah-ayahs mb-1">
                      <span> {surah.ayahs.length} </span>{" "}
                      {language === "ar" ? "ايه" : "Ayahs"}
                    </p>
                    <hr className="mb-0 mt-0" />
                    <p className="surah-placement pe-none">
                      {surah.revelationType === "Meccan"
                        ? language === "ar"
                          ? "مكية"
                          : "Meccan"
                        : language === "ar"
                        ? "مدنية"
                        : "Medinan"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <span>
                {" "}
                {language === "ar"
                  ? "الرجاء المحاولة مرة أخرى"
                  : "No Data please try again"}{" "}
              </span>
            )}
          </div>
          <div className="ayahs p-0" ref={ayahsRef}>
            <div className="back" onClick={goBack}>
              X
            </div>
            {allAyahs && (
              <div className="w-100">
                <div className="surah-title mt-2 w-100 text-center  fs-3">
                  ✧ {language === "ar" ? allAyahs.name : allAyahs.englishName} ✧
                </div>
                <div className="d-flex flex-column flex-lg-row flex-md-row justify-content-between align-items-center gap-2 my-2 p-2">
                  <div className="d-flex flex-row gap-3 justify-content-start align-items-center d-none d-lg-flex d-md-flex">
                    <p className="quran-listen-btn">
                      <SlowMotionVideoOutlinedIcon className="mx-2" />
                      <span>
                        {language === "ar"
                          ? "سيتم تشغيل التلاوة بمجرد اختيار القارئ"
                          : "The recitation will start as soon as the reciter is selected"}
                      </span>
                    </p>
                  </div>
                  <div className="dropdown">
                    <select
                      className="form-select"
                      style={{ minWidth: "310px", width: "100%" }}
                      onChange={src}
                      ref={selectReciter}
                    >
                      <option className="pe-none" value="default">
                        {language === "ar" ? "اختر القارئ" : "Choose reciter"}
                      </option>
                      {!loading &&
                        reciters?.map((reciter, index) => {
                          const surahIndex = `${
                            selectedSurah < 10
                              ? "00"
                              : selectedSurah < 100
                              ? "0"
                              : ""
                          }${selectedSurah}`;
                          const surahUrl = `${reciter.moshaf[0].server}${surahIndex}.mp3`;

                          if (
                            reciter.moshaf[0].surah_list
                              .split(",")
                              .includes(String(selectedSurah))
                          ) {
                            const reciterName =
                              language === "en"
                                ? reciterNameMap[reciter.name] || reciter.name
                                : reciter.name;

                            return (
                              <option
                                key={index}
                                value={surahUrl}
                                data-name={
                                  language === "ar"
                                    ? allAyahs.name
                                    : allAyahs.englishName
                                }
                              >
                                {reciterName}
                              </option>
                            );
                          }
                          return null;
                        })}
                    </select>
                  </div>
                </div>
                <Box className=" my-2 w-100">
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Quran Tabs"
                    className="navs shadow-1-strong rounded-2 mx-2"
                    variant="fullWidth"
                  >
                    {/* First Tab: Reading */}
                    <Tab
                      label={language === "ar" ? "القراءة" : "Reading"}
                      sx={{
                        color:
                          tabValue === 0
                            ? "mediumvioletred !important"
                            : "var(--text-color)",
                        fontWeight: tabValue === 0 ? "bold" : "normal",
                      }}
                      className="quranTabs"
                    />
                    {/* Second Tab: Explanation */}
                    <Tab
                      label={language === "ar" ? "التفسير" : "Explanation"}
                      sx={{
                        color:
                          tabValue === 1
                            ? "mediumvioletred !important"
                            : "var(--text-color)",
                        fontWeight: tabValue === 1 ? "bold" : "normal",
                      }}
                      className="quranTabs"
                    />
                  </Tabs>

                  <TabPanel value={tabValue} index={0}>
                    {/* Reading Tab Content */}
                    <div className="w-100 h-100 p-2">
                      <div className="w-100 text-center d-flex justify-content-between dr-rtl align-items-center langs gap-2 py-2">
                        <select
                          className="form-select"
                          value={quranLangs}
                          onChange={(event) =>
                            setQuranLangs(event.target.value)
                          }
                          style={{ minWidth: "220px" }}
                        >
                          <option value="Arabe">العربية/Arabe</option>
                          <option value="English">الانجليزية/English</option>
                          <option value="Together">Together</option>
                        </select>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => setLayout("fullscreen")}
                        >
                          <ZoomOutMapOutlinedIcon />
                        </button>
                      </div>

                      <div
                        className={
                          allAyahs.name === "سُورَةُ ٱلْفَاتِحَةِ" ||
                          allAyahs.name === "سُورَةُ التَّوۡبَةِ"
                            ? "d-none"
                            : "w-100 text-center me-3 mt-3 mb-3"
                        }
                      >
                        {quranLangs === "English" && language === "en" ? (
                          "In the name of God, The Most Gracious, The Dispenser of Grace"
                        ) : quranLangs === "Arabe" && language === "ar" ? (
                          "🌸 بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ 🌸 "
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            <span>
                              🌸 بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ 🌸
                            </span>
                            <span>
                              In the name of God, The Most Gracious, The
                              Dispenser of Grace
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ayah w-100">
                        {allAyahs.ayahs.map((ayah, index) => (
                          <div
                            className={
                              ayah.text ===
                                "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" &&
                              allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                ? "d-none"
                                : quranLangs === "English"
                                ? "ayah-text dr-ltr text-start"
                                : "ayah-text"
                            }
                            key={index}
                            onClick={() => getSingleAyahTafsir(index)}
                          >
                            <p className="pe-none">
                              {quranLangs === "Arabe" ||
                              quranLangs === "Together" ? (
                                <>
                                  {allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                    ? ayah.text.replace(
                                        "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                        ""
                                      )
                                    : ayah.text}
                                  {quranLangs === "Together" && <br />}
                                </>
                              ) : null}
                              {quranLangs === "English" ||
                              quranLangs === "Together" ? (
                                apiTranslation.length > 0 ? (
                                  <span
                                    style={{ color: "var(--text-color)" }}
                                    className="dr-ltr"
                                  >
                                    {apiTranslation[index]?.text.replace(
                                      /^[;:!]/,
                                      ""
                                    )}
                                    {quranLangs === "Together" && <br />}
                                  </span>
                                ) : (
                                  <span>Loading...</span>
                                )
                              ) : null}
                            </p>

                            <p
                              className={`ayah-number ${
                                quranLangs === "English" && "ltr"
                              } ${language === "en" && "ltr"}`}
                            >
                              {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    {/* Explanation Tab Content */}
                    <div className="tafseer-controls d-flex flex-row gap-3 w-100">
                      <select
                        className="form-select"
                        value={tafseerLangs}
                        onChange={(event) =>
                          setTafseerLangs(event.target.value)
                        }
                      >
                        <option value="arabe">العربية/Arabe</option>
                        <option value="english">الانجليزية/English</option>
                      </select>
                      <select
                        className="form-select"
                        onChange={handleDropdownChange}
                        value={
                          currentAyahIndex !== null ? currentAyahIndex : -1
                        }
                      >
                        <option value={-1}>
                          {language === "en" || tafseerLangs === "english"
                            ? "To Ayah"
                            : "الى الأية"}
                        </option>
                        {allAyahs.ayahs.map((ayah, index) => (
                          <option key={index} value={index}>
                            {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {surahData !== null && (
                      <div
                        className="tafseer"
                        style={{
                          direction: tafseerLangs === "arabe" ? "rtl" : "ltr",
                        }}
                      >
                        {surahData.ayahs.map((ayah, index) => (
                          <div key={ayah.number}>
                            <div
                              className="ayah-text mb-3"
                              style={{
                                textAlign:
                                  tafseerLangs === "arabe" ? "right" : "left",
                              }}
                            >
                              <p
                                className="w-100 ayah-in-tafseer"
                                ref={refs[index]}
                              >
                                ۞{" "}
                                {tafseerLangs === "arabe" &&
                                allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                  ? allAyahs?.ayahs[
                                      ayah.number - 1
                                    ]?.text.replace(
                                      "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                      ""
                                    )
                                  : tafseerLangs === "arabe"
                                  ? allAyahs?.ayahs[ayah.number - 1]?.text
                                  : apiTranslation[index]?.text.replace(
                                      /^[;:!]/,
                                      ""
                                    )}
                                ۞
                              </p>
                              <p
                                className={`ayah-number ${
                                  tafseerLangs === "english" && "ltr"
                                } ${language === "en" && "ltr"}`}
                              >
                                {index + 1}
                              </p>
                            </div>

                            {tafsirLoader ? (
                              <span>
                                {language === "ar"
                                  ? "جاري العمل..."
                                  : "Working..."}
                              </span>
                            ) : (
                              <p
                                className={
                                  tafseerLangs === "english"
                                    ? "mb-3 ltr"
                                    : "mb-3"
                                }
                              >
                                {tafseerLangs === "arabe"
                                  ? allSurahTafseer
                                    ? allSurahTafseer?.ayahs?.map((t) => (
                                        <span>
                                          {" "}
                                          {t.number === index + 1 &&
                                            t.tafsir}{" "}
                                        </span>
                                      ))
                                    : "التفسير غير متاح"
                                  : apiTafseer
                                  ? apiTafseer?.ayahs.map((t) => (
                                      <span>
                                        {" "}
                                        {t.numberInSurah === ayah.number &&
                                          t.text}{" "}
                                      </span>
                                    ))
                                  : "English explanation not available"}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabPanel>
                </Box>
              </div>
            )}
          </div>
        </React.Fragment>
      )}
      {/* Single Ayah Tafsir Modal */}
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={openAyahTafsirModal}
        onClose={() => setOpenAyahTafsirModal(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: 500,
            minWidth: 250,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
            backgroundColor: "var(--card-color)",
            overflowY: "auto",
            maxHeight: "100%",
          }}
        >
          <div className="d-flex flex-row justify-content-between align-items-center dr-ltr">
            <ModalClose variant="plain" sx={{ m: 1 }} />
            <Typography
              component="h2"
              id="modal-title"
              level="h4"
              textColor="inherit"
              fontWeight="lg"
              mb={1}
              sx={{ color: "var(--main-color)" }}
            >
              {language === "ar" || quranLangs === "Arabe"
                ? "التفسير الميسر"
                : "The Easy Explanation"}
            </Typography>
          </div>
          <Typography
            id="modal-desc"
            textColor="text.tertiary"
            sx={{ color: "var(--text-color)", textAlign: "justify" }}
          >
            {quranLangs !== "English" && (
              <span
                className="alert  mb-4 p-0 d-flex flex-column gap-2 text-align-justify"
                dangerouslySetInnerHTML={{ __html: signleAyahTafsirText }}
              ></span>
            )}

            {tafsirLoader ? (
              language === "ar" ? (
                "جاري العمل..."
              ) : (
                "Working..."
              )
            ) : englishTafsir.length > 0 ? (
              quranLangs !== "Arabe" &&
              englishTafsir.map(
                (ayah, index) =>
                  ayah.ayah_number - 1 === selectedAyah && (
                    <div
                      className="alert  p-0 ltr text-align-justify"
                      key={index}
                    >
                      <span className="ltr w-100  mt-2 text-align-justify">
                        {" "}
                        {ayah.text}
                      </span>
                    </div>
                  )
              )
            ) : (
              <span>{language === "ar" ? "جاري العمل..." : "Working..."}</span>
            )}
          </Typography>
        </Sheet>
      </Modal>

      {/* Full Screen Quran Reading Modal */}
      <Modal open={!!layout} onClose={() => setLayout(undefined)}>
        <ModalDialog
          layout={layout}
          style={{ backgroundColor: "var(--card-color)" }}
        >
          <ModalClose className="close-modal" sx={{ zIndex: "999" }} />
          <DialogContent>
            <div
              style={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                overflowX: "hidden",
                padding: 2,
              }}
            >
              <p className="mx-2 m-2 w-100 text-center surah-title  fs-3">
                ✧ {allAyahs?.name} ✧
              </p>
              <div
                className={
                  allAyahs?.name === "سُورَةُ ٱلْفَاتِحَةِ" ||
                  allAyahs?.name === "سُورَةُ التَّوۡبَةِ"
                    ? "d-none"
                    : "w-100 text-center me-3 my-3"
                }
              >
                {quranLangs === "English" ? (
                  "In the name of God, The Most Gracious, The Dispenser of Grace"
                ) : quranLangs === "Arabe" ? (
                  " بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ "
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <p> بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ </p>
                    <p>
                      In the name of God, The Most Gracious, The Dispenser of
                      Grace
                    </p>
                  </div>
                )}
              </div>
              <section
                style={{
                  borderRadius: "4px",
                  fontSize: "1.5rem",
                  textAlign: "justify",
                  position: "relative",
                  lineHeight: "2", // Adjust for readability
                  direction:
                    quranLangs === "Arabe"
                      ? "rtl"
                      : quranLangs === "English"
                      ? "ltr"
                      : "rtl", // Right-to-left for Arabic
                  unicodeBidi: "embed", // Correct bidi handling for Arabic script
                }}
              >
                <p style={{ margin: 0 }}>
                  {allAyahs?.ayahs.map((ayah, index) => (
                    <span
                      key={index}
                      id={index}
                      onClick={() => getSingleAyahTafsir(index)}
                      className="modal-ayah"
                    >
                      <span>
                        {/* Display the Ayah text */}
                        {quranLangs === "Arabe" || quranLangs === "Together" ? (
                          <>
                            {allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                              ? ayah.text.replace(
                                  "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                  ""
                                )
                              : ayah.text}
                            {quranLangs === "Together" && <br />}
                          </>
                        ) : null}

                        {/* Display the Ayah number inside the symbol */}
                        <span style={{ marginLeft: "5px", marginRight: "5px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              position: "relative",
                              width: "1.5rem",
                              height: "1.5rem",
                              borderRadius: "50%",
                              lineHeight: "1.5rem",
                              textAlign: "center",
                              color: "green",
                            }}
                          >
                            ۝
                            <span
                              style={{
                                position: "absolute",
                                fontSize: "0.75rem",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                              }}
                            >
                              {index + 1}
                            </span>
                          </span>
                        </span>

                        {/* For English or combined languages */}
                        {quranLangs === "English" ||
                        quranLangs === "Together" ? (
                          <span className="">
                            {apiTranslation[index]?.text.replace(/^[;:!]/, "")}
                            {quranLangs === "Together" && <hr />}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  ))}
                </p>
              </section>
            </div>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </div>
  );
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className="w-100 p-2 rounded-3"
    >
      {value === index && (
        <Box sx={{ p: 1, minWidth: "100%", borderRadius: "20px" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default Quran;
