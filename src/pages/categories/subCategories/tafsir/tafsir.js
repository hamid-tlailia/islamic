import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Autocomplete, FormControl, FormLabel } from "@mui/joy";
import "./tafsir.css";
import { useTranslation } from "../../../../components/languages/provider";
import Loader from "../../../../components/loader/loader";
import styled from "styled-components";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitization
import { franc } from "franc";
import { toast } from "react-toastify";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import GraphicEqOutlinedIcon from "@mui/icons-material/GraphicEqOutlined";

const TafsirContainer = styled.div`
  padding: 1rem;
  background-color: var(--card-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
`;

const TafsirContent = styled.div`
  color: ${({ theme }) => theme.textColor};
  span.red {
    color: red;
  }
  span.blue {
    color: blue;
  }
  span.green {
    color: green;
  }
  margin-bottom: 35px;
`;

const AudioTafsirCard = styled(Card)`
  margin: 1rem;
  cursor: pointer;
  background-color: var(--card-color) !important;
  color: var(--text-color) !important;

  &.active {
    border: 2px solid mediumvioletred;
  }
`;

const Tafsir = ({ toTop, src, audioName }) => {
  const [langs, setLangs] = useState("arabic");
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [selectedTafsir, setSelectedTafsir] = useState(null);
  const [tafsirList, setTafsirList] = useState([]);
  const [ayahList, setAyahList] = useState([]);
  const [warning, setWarning] = useState("");
  const [tafsir, setTafsir] = useState([]); // Text tafsir
  const [optionsVisible, setOptionsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alignmentClass, setAlignmentClass] = useState("w-100 my-3 text-end");
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  const [currentExplainedAyah, setCurrentExplainedAyah] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const itemsPerPage = 1; // Number of tafsir items per page
  const parentRef = useRef(null);

  // New state variables for tabs and audio tafsir
  const [tabIndex, setTabIndex] = useState(0);
  const [audioTafsirData, setAudioTafsirData] = useState([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [activeAudioCardId, setActiveAudioCardId] = useState(null);

  // Pagination for audio tafsir
  const initialAudioPage =
    parseInt(localStorage.getItem("audioTafsirPage"), 10) || 1;
  const [audioCurrentPage, setAudioCurrentPage] = useState(initialAudioPage);

  const audioItemsPerPage = 10; // Number of audio tafsir cards per page

  const { language } = useTranslation();

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

  // Tafsir options
  const tafsirs = {
    arabic: [
      {
        id: 93,
        name: language === "ar" ? "الوسيط" : "Al-Wasit",
        url: "https://api.qurancdn.com/api/v4/tafsirs/93/by_ayah",
      },
      {
        id: 14,
        name: language === "ar" ? "ابن كثير" : "Ibn Kathir",
        url: "https://api.qurancdn.com/api/v4/tafsirs/14/by_ayah",
      },
      {
        id: 15,
        name: language === "ar" ? "الطبري" : "Al Tabari",
        url: "https://api.qurancdn.com/api/v4/tafsirs/15/by_ayah",
      },
      {
        id: 94,
        name: language === "ar" ? "البغوي" : "Al Baghawi",
        url: "https://api.qurancdn.com/api/v4/tafsirs/94/by_ayah",
      },
      {
        id: 91,
        name: language === "ar" ? "السعدي" : "Al Saadi",
        url: "https://api.qurancdn.com/api/v4/tafsirs/91/by_ayah",
      },
      {
        id: 90,
        name: language === "ar" ? "القرطبي" : "Al Qurtubi",
        url: "https://api.qurancdn.com/api/v4/tafsirs/90/by_ayah",
      },
    ],
    english: [
      {
        id: 169,
        name: language === "ar" ? "ابن كثير" : "Ibn Kathir",
        url: "https://api.qurancdn.com/api/v4/tafsirs/169/by_ayah",
      },
      {
        id: 168,
        name: language === "ar" ? "معارف القران" : "Maarif Al Quran",
        url: "https://api.qurancdn.com/api/v4/tafsirs/168/by_ayah",
      },
    ],
  };

  // Fetch Surah names and Ayah count
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/quran/quran-uthmani")
      .then((response) => response.json())
      .then((data) => {
        const surahsData = data.data.surahs;
        setSurahs(surahsData);
      })
      .catch((error) => setIsErrorFetching(true));
  }, []);

  useEffect(() => {
    if (langs) {
      setTafsirList(tafsirs[langs]); // Set the correct Tafsir list based on selected language
    } else {
      setTafsirList([]);
    }
    // eslint-disable-next-line
  }, [langs]);

  useEffect(() => {
    if (selectedSurah) {
      const surah = surahs.find((s) => s.number === selectedSurah.value);
      if (surah) {
        const totalAyahs = surah.ayahs.length;
        setAyahList(
          Array.from({ length: totalAyahs }, (_, i) => ({
            label: language === "ar" ? `الآية ${i + 1}` : `Ayah ${i + 1}`,
            value: i + 1,
          }))
        );
      }
    } else {
      setAyahList([]);
    }
  }, [selectedSurah, surahs, language]);

  // Load saved selections from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("savedLang");
    const savedSurah = localStorage.getItem("savedSurah");
    const savedAyah = localStorage.getItem("savedAyah");
    const savedTafsir = localStorage.getItem("savedTafsir");
    const savedCurrentPage = localStorage.getItem("savedCurrentPage");

    if (savedLang) {
      setLangs(savedLang);
    }

    if (savedLang && savedSurah && savedTafsir) {
      // Set the Tafsir list based on saved language
      setTafsirList(tafsirs[savedLang]);

      // Find the saved Tafsir option
      const tafsirOption = tafsirs[savedLang].find(
        (t) => t.url === savedTafsir
      );

      if (tafsirOption) {
        setSelectedTafsir({
          label: tafsirOption.name,
          value: tafsirOption.url,
        });
      }

      // Parse and set the selected Surah
      const surahNumber = parseInt(savedSurah, 10);
      const surah = surahs.find((s) => s.number === surahNumber);
      if (surah) {
        setSelectedSurah({
          label: language === "ar" ? surah.name : surah.englishName,
          value: surah.number,
        });
      }

      // If Ayah was saved
      if (savedAyah) {
        const ayahNumber = parseInt(savedAyah, 10);
        setSelectedAyah({
          label:
            language === "ar" ? `الآية ${ayahNumber}` : `Ayah ${ayahNumber}`,
          value: ayahNumber,
        });
      }

      // Set currentPage if saved and viewing entire surah
      if (!savedAyah && savedCurrentPage) {
        setCurrentPage(parseInt(savedCurrentPage, 10));
      }

      // Fetch the Tafsir automatically
      handleSubmit(
        savedLang,
        surahNumber,
        savedAyah ? parseInt(savedAyah, 10) : null,
        savedTafsir,
        true
      );
    }

    // Load activeAudioCardId and audioCurrentPage from localStorage
    const savedActiveAudioCardId = localStorage.getItem("activeAudioCardId");
    if (savedActiveAudioCardId) {
      setActiveAudioCardId(parseInt(savedActiveAudioCardId, 10));
    }

    const savedAudioTafsirPage = localStorage.getItem("audioTafsirPage");
    if (savedAudioTafsirPage) {
      setAudioCurrentPage(parseInt(savedAudioTafsirPage, 10));
    }
    // eslint-disable-next-line
  }, [surahs]); // Empty dependency array to run only once on mount

  const handleSubmit = (
    langParam,
    surahParam,
    ayahParam,
    tafsirParam,
    fromLocalStorage = false
  ) => {
    const langToUse = langParam || langs;
    const surahToUse = surahParam || selectedSurah?.value;
    const ayahToUse = ayahParam || selectedAyah?.value;
    const tafsirToUse = tafsirParam || selectedTafsir?.value;

    if (!langToUse || !surahToUse || !tafsirToUse) {
      setWarning(
        language === "ar"
          ? "جميع القوائم المنسدلة مطلوبة باستثناء رقم الآية عند اختيار السورة."
          : "All dropdowns are required except Ayah number when Surah is selected"
      );
      return;
    }

    if (!surahToUse && ayahToUse) {
      setWarning("Please select a Surah first.");
      return;
    }

    // Save selections to localStorage
    localStorage.setItem("savedLang", langToUse);
    localStorage.setItem("savedSurah", surahToUse);
    if (ayahToUse) {
      localStorage.setItem("savedAyah", ayahToUse);
      localStorage.removeItem("savedCurrentPage"); // Remove saved page when specific ayah is selected
    } else {
      localStorage.removeItem("savedAyah");
    }
    localStorage.setItem("savedTafsir", tafsirToUse);

    // Make loader on
    setLoading(true);
    const tafsirUrl = tafsirToUse;

    // If a specific Ayah is selected, fetch Tafsir for that Ayah
    if (ayahToUse) {
      const apiUrl = `${tafsirUrl}/${surahToUse}:${ayahToUse}?words=false`;
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const cleanContent = DOMPurify.sanitize(data.tafsir.text);
          setTafsir([cleanContent]); // Set Tafsir as an array
          setOptionsVisible(false); // Hide options after submission
          setCurrentPage(1); // Reset to first page
          setLoading(false);
        })
        .catch((error) => {
          setIsErrorFetching(true);
          setLoading(false);
        });
    } else {
      // If no specific Ayah is selected, fetch Tafsir for all Ayahs in the Surah
      const surah = surahs.find((s) => s.number === surahToUse);
      if (!surah) return; // Safety check

      // Create an array of all Ayah numbers in the Surah
      const ayahNumbers = Array.from(
        { length: surah.ayahs.length },
        (_, i) => i + 1
      );

      // Create an array of fetch promises for each Ayah
      const fetchPromises = ayahNumbers.map(async (ayahNumber) => {
        const apiUrl = `${tafsirUrl}/${surahToUse}:${ayahNumber}?words=false`;
        const response = await fetch(apiUrl);
        return await response.json();
      });

      // Use Promise.all to fetch all Tafsir data concurrently
      Promise.all(fetchPromises)
        .then((responses) => {
          // Map and sanitize all tafsir texts
          const allAyahsTafsir = responses.map((response) => {
            const sanitizedText = DOMPurify.sanitize(response.tafsir.text);
            return sanitizedText;
          });
          setTafsir(allAyahsTafsir); // Set Tafsir as an array
          setOptionsVisible(false); // Hide options after submission

          // Set currentPage to saved page if available
          if (fromLocalStorage && localStorage.getItem("savedCurrentPage")) {
            setCurrentPage(
              parseInt(localStorage.getItem("savedCurrentPage"), 10)
            );
          } else {
            setCurrentPage(1); // Reset to first page
          }

          setLoading(false);
        })
        .catch((error) => {
          setIsErrorFetching(true);
          setLoading(false);
        });
    }
  };

  const handleReset = () => {
    setWarning("");
    setTafsir([]);
    setOptionsVisible(true); // Show options again
    setCurrentExplainedAyah(null);
    setCurrentPage(1); // Reset to first page
  };

  // Save currentPage to localStorage when it changes and viewing entire surah
  useEffect(() => {
    if (!selectedAyah && tafsir.length > 0) {
      localStorage.setItem("savedCurrentPage", currentPage);
    }
  }, [currentPage, selectedAyah, tafsir]);

  // Save audioCurrentPage to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("audioTafsirPage", audioCurrentPage);
  }, [audioCurrentPage]);

  // Helper function to get the display value based on the current language
  const getDisplayLangValue = (lang) => {
    if (lang === "arabic") return language === "ar" ? "العربية" : "arabic";
    if (lang === "english") return language === "ar" ? "الإنجليزية" : "english";
    return ""; // Default to an empty string if no valid value
  };

  const renderDropdowns = () => (
    <div className="card p-2 d-flex flex-column justify-content-center align-items-center gap-5">
      {optionsVisible && (
        <div className="options">
          <FormControl>
            <FormLabel
              sx={{
                color: "var(--text-color)",
              }}
            >
              {language === "ar" ? "اللغة" : "Language"}
            </FormLabel>
            <Autocomplete
              placeholder={language === "ar" ? "اختر اللغة" : "Select language"}
              value={getDisplayLangValue(langs)}
              onChange={(event, newValue) => {
                setLangs(
                  newValue === "arabic" || newValue === "العربية"
                    ? "arabic"
                    : newValue === "english" || newValue === "الإنجليزية"
                    ? "english"
                    : ""
                );

                setOptionsVisible(true);
                setSelectedTafsir(null);
                setWarning("");
              }}
              options={[
                language === "ar" ? "العربية" : "arabic",
                language === "ar" ? "الإنجليزية" : "english",
              ]}
              isOptionEqualToValue={(option, value) => option === value}
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
              }}
            />
          </FormControl>

          <FormControl disabled={!langs}>
            <FormLabel
              sx={{
                color: "var(--text-color)",
              }}
            >
              {language === "ar" ? "السورة" : "Surah"}
            </FormLabel>
            <Autocomplete
              placeholder={language === "ar" ? "اختر السورة" : "Select Surah"}
              value={selectedSurah}
              onChange={(event, newValue) => {
                setSelectedSurah(newValue);
                setWarning("");
                setSelectedAyah(null);
              }}
              options={surahs.map((surah) => ({
                label: language === "ar" ? surah.name : surah.englishName,
                value: surah?.number,
              }))}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
              }}
            />
          </FormControl>

          <FormControl disabled={!selectedSurah}>
            <FormLabel
              sx={{
                color: "var(--text-color)",
              }}
            >
              {language === "ar" ? "الآية" : "Ayah"}
            </FormLabel>
            <Autocomplete
              placeholder={
                language === "ar"
                  ? "اختر الآية (اختياري)"
                  : "Select Ayah (Optional)"
              }
              value={selectedAyah}
              onChange={(event, newValue) => {
                setSelectedAyah(newValue);
                setWarning("");
                if (newValue) {
                  localStorage.removeItem("savedCurrentPage"); // Clear saved page when specific ayah is selected
                }
              }}
              options={ayahList}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
              }}
            />
          </FormControl>

          <FormControl disabled={!langs}>
            <FormLabel
              sx={{
                color: "var(--text-color)",
              }}
            >
              {language === "ar" ? "نوع التفسير" : "Tafsir source"}
            </FormLabel>
            <Autocomplete
              placeholder={language === "ar" ? "اختر التفسير" : "Select Tafsir"}
              value={selectedTafsir}
              onChange={(event, newValue) => {
                setSelectedTafsir(newValue);
                setWarning("");
              }}
              options={tafsirList?.map((tafsir) => ({
                label: tafsir.name,
                value: tafsir.url,
              }))}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
              }}
            />
          </FormControl>
        </div>
      )}

      {warning && (
        <Button
          className="pe-none warning w-100 fs-6"
          color="error"
          variant="outlined"
        >
          <span className="mt-1">{warning}</span> <span>⚠️</span>
        </Button>
      )}

      {optionsVisible && (
        <Button
          variant="outlined"
          color="primary"
          sx={{ maxWidth: "max-content" }}
          onClick={() => handleSubmit()}
        >
          {langs === "arabic" && language === "ar"
            ? "الحصول على التفسير"
            : "Get Tafsir"}
        </Button>
      )}
      {!optionsVisible && (
        <Button variant="outlined" color="primary" onClick={handleReset}>
          {langs === "arabic" && language === "ar" ? "إعادة تعيين" : "Reset"}
        </Button>
      )}
    </div>
  );

  // Detect language
  useEffect(() => {
    if (tafsir.length > 0) {
      // Combine some tafsir texts for language detection
      const textForDetection = tafsir.slice(0, 3).join(" ");
      const detectedLang = franc(textForDetection);

      // Define languages that are typically right-to-left
      const rtlLanguages = ["arb"]; // Arabic

      // Set the class based on detected language
      if (rtlLanguages.includes(detectedLang)) {
        setAlignmentClass("w-100 my-3 text-end"); // Right-to-left (Arabic, etc.)
      } else {
        setAlignmentClass("w-100 my-3 text-start"); // Left-to-right for other languages
      }
    }
  }, [tafsir]);

  // Get the current selected ayah text
  const getExplainedAyahText = async (url) => {
    try {
      const ayahResponse = await fetch(url);
      const data = await ayahResponse.json();
      setCurrentExplainedAyah(data.data);
    } catch (error) {
      setIsErrorFetching(true);
    }
  };

  useEffect(() => {
    if (selectedAyah !== null && selectedSurah) {
      const ayahNumber = surahs[selectedSurah.value - 1].ayahs.find(
        (a) => a.numberInSurah === selectedAyah.value
      );
      if (langs === "arabic") {
        getExplainedAyahText(
          `https://api.alquran.cloud/v1/ayah/${ayahNumber?.number}`
        );
      } else {
        getExplainedAyahText(
          `https://api.alquran.cloud/v1/ayah/${ayahNumber?.number}/en.asad`
        );
      }
    }
    // eslint-disable-next-line
  }, [selectedAyah, surahs]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Fetch Audio Tafsir Data
  useEffect(() => {
    if (tabIndex === 1) {
      fetchAudioTafsirData();
    }
    // eslint-disable-next-line
  }, [tabIndex, langs]);

  const fetchAudioTafsirData = () => {
    setAudioLoading(true);
    const languageCode = langs === "arabic" ? "ar" : "en";
    fetch(
      `https://www.mp3quran.net/api/v3/tafsir?tafsir=1&language=${languageCode}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.tafasir && data.tafasir.soar) {
          const soarData = data.tafasir.soar;
          setAudioTafsirData(soarData);
        } else {
          setAudioTafsirData([]);
        }
        setAudioLoading(false);
      })
      .catch((error) => {
        setIsErrorFetching(true);
        setAudioLoading(false);
      });
  };

  const handlePlayAudio = (url, name, id) => {
    src(url);
    audioName(name);
    setActiveAudioCardId(id);
    localStorage.setItem("activeAudioCardId", id);
  };

  return (
    <div ref={parentRef}>
      {/* Tabs at the top, full width */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        className="navs shadow-1-strong rounded-2 mx-2"
        textColor="primary"
        style={{ marginBottom: "1rem" }}
      >
        <Tab
          label={language === "ar" ? "تفسير النص" : "Text Tafsir"}
          sx={{
            color:
              tabIndex === 0
                ? "mediumvioletred !important"
                : "var(--text-color)",
            fontWeight: tabIndex === 0 ? "bold" : "normal",
          }}
          className="quranTabs"
        />
        <Tab
          label={language === "ar" ? "تفسير صوتي" : "Audio Tafsir"}
          sx={{
            color:
              tabIndex === 1
                ? "mediumvioletred !important"
                : "var(--text-color)",
            fontWeight: tabIndex === 1 ? "bold" : "normal",
          }}
          className="quranTabs"
        />
      </Tabs>

      {tabIndex === 0 && (
        <>
          {/* Text Tafsir Tab Content */}
          {/* Move the alert and dropdowns here */}
          {tafsir.length === 0 && (
            <Alert
              variant="outlined"
              severity="success"
              sx={{
                fontSize: "17px",
                width: "90%",
                margin: "10px",
                textAlign: "center",
                display: "flex",
                flexDirection: "row",
                gap: "5px",
                padding: "5px",
                color: "#169777",
                border: "1px solid #169777",
                direction: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {language === "ar"
                ? "للعلم: في حال عدم اختيار الآية، سيتم تفسير السورة كاملة. يتم حفظ المعلومات الخاصة بك في كل مرة تبحث فيها عن تفسير جديد."
                : "Note: If no Ayah is selected, the entire Surah will be explained. Your selections are saved every time you search for a new Tafsir."}
            </Alert>
          )}

          {renderDropdowns()}
          <hr />

          {loading ? (
            <div>{<Loader />}</div>
          ) : tafsir.length > 0 ? (
            <>
              <TafsirContainer>
                {/* Explained ayah text */}
                {!optionsVisible && (
                  <div className="">
                    {" "}
                    {currentExplainedAyah !== null ? (
                      <p className="w-100 text-center my-2 explained-ayah d-flex flex-column gap-2 justify-content-center align-items-center">
                        <span>✦ {currentExplainedAyah?.text} ✦</span>
                        <span className="mx-2" style={{ color: "#169777" }}>
                          [
                          {langs === "arabic"
                            ? currentExplainedAyah?.surah.name
                            : currentExplainedAyah?.surah.englishName}
                          {" : "}
                          {currentExplainedAyah?.numberInSurah}]
                        </span>
                      </p>
                    ) : (
                      <p className="w-100 text-center my-2 explained-ayah">
                        ✦{" "}
                        {langs === "arabic"
                          ? surahs.find(
                              (s) => s.number === selectedSurah?.value
                            )?.name
                          : surahs.find(
                              (s) => s.number === selectedSurah?.value
                            )?.englishName}{" "}
                        ✦
                      </p>
                    )}
                  </div>
                )}
                {(() => {
                  const indexOfLastItem = currentPage * itemsPerPage;
                  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                  const currentTafsirItems = tafsir.slice(
                    indexOfFirstItem,
                    indexOfLastItem
                  );
                  const totalPages = Math.ceil(tafsir.length / itemsPerPage);

                  return (
                    <>
                      <div
                        className={`w-100  text-primary fw-bold  my-3 ${
                          langs === "arabic" && language === "ar"
                            ? "ltr text-end"
                            : "rtl text-start"
                        }`}
                      >
                        <span>
                          {totalPages} / {currentPage}{" "}
                          {language === "ar" && langs === "arabic"
                            ? "الصفحة"
                            : "Page"}
                        </span>
                      </div>
                      {currentTafsirItems.map((tafsirText, index) => (
                        <TafsirContent
                          key={index + indexOfFirstItem}
                          className={alignmentClass}
                          dangerouslySetInnerHTML={{ __html: tafsirText }}
                        />
                      ))}
                      {/* Pagination buttons */}
                      <div className="pagination-buttons w-100 text-center d-flex flex-row gap-3 justify-content-center align-items-center my-3">
                        {currentPage > 1 && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setCurrentPage(currentPage - 1);
                              toTop();
                            }}
                            style={{ marginRight: "10px" }}
                          >
                            {langs === "arabic" && language === "ar"
                              ? "السابق"
                              : "Previous"}
                          </Button>
                        )}
                        {currentPage < totalPages && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setCurrentPage(currentPage + 1);
                              toTop();
                            }}
                          >
                            {langs === "arabic" && language === "ar"
                              ? "التالي"
                              : "Next"}
                          </Button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </TafsirContainer>
            </>
          ) : (
            <div className="w-100 my-5 p-4 text-center  border rounded shadow">
              <p className="text-primary font-weight-bold">
                {language === "ar"
                  ? "﴿وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ﴾"
                  : "“And fear Allah. And Allah teaches you. And Allah is Knowing of all things.”"}
              </p>
              <p>
                {language === "ar"
                  ? "سورة البقرة، الآية 282"
                  : "Surah Al-Baqarah, Ayah 282"}
              </p>

              <div className="mt-4 p-3 text-dark bg-warning rounded">
                <h5 className="font-weight-bold">
                  {language === "ar" ? "التفسير" : "Tafsir"}
                </h5>
                <p className="text-justify">
                  {language === "ar"
                    ? "في هذه الآية الكريمة، يأمر الله المؤمنين بتقواه، ويبيّن لهم أن التقوى تؤدي إلى تعليم الله لهم. العلم هنا يشمل المعرفة بالدين والدنيا، وهو مرتبط بشكل مباشر بتقوى الله."
                    : "In this noble Ayah, Allah commands the believers to have Taqwa (piety), and He makes it clear that piety leads to Allah teaching them. The knowledge mentioned here encompasses both religious and worldly matters, and it is directly related to the fear of Allah."}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {tabIndex === 1 && (
        <>
          {/* Audio Tafsir Tab Content */}
          {audioLoading ? (
            <div className="w-100 text-center loader-placeholder">
              <CircularProgress />
            </div>
          ) : audioTafsirData.length > 0 ? (
            <>
              {(() => {
                const audioIndexOfLastItem =
                  audioCurrentPage * audioItemsPerPage;
                const audioIndexOfFirstItem =
                  audioIndexOfLastItem - audioItemsPerPage;
                const currentAudioTafsirItems = audioTafsirData.slice(
                  audioIndexOfFirstItem,
                  audioIndexOfLastItem
                );
                const totalAudioPages = Math.ceil(
                  audioTafsirData.length / audioItemsPerPage
                );

                return (
                  <>
                    <div className="d-flex flex-row gap-2 w-100 justify-content-center align-items-center text-primary p-2">
                      {" "}
                      <span>
                        {language === "ar" ? " الصفحة " : " Page "}{" "}
                        {audioCurrentPage}{" "}
                      </span>
                      <span>
                        {language === "ar" ? " من " : " From "}{" "}
                        {totalAudioPages}{" "}
                      </span>{" "}
                    </div>
                    <div className="audio-tafsir-parent w-100">
                      {currentAudioTafsirItems.map((item) => (
                        <AudioTafsirCard
                          key={item.id}
                          onClick={() =>
                            handlePlayAudio(item.url, item.name, item.id)
                          }
                          className={`audio-tafsir-container  d-flex flex-row gap-2 ${
                            item.id === activeAudioCardId ? "active" : ""
                          }`}
                        >
                          <GraphicEqOutlinedIcon
                            className={
                              item.id === activeAudioCardId
                                ? "text-primary"
                                : ""
                            }
                          />
                          <CardContent className="d-flex flex-column justify-content-center align-items-center gap-2">
                            <Typography variant="h5" color="primary">
                              {language === "ar"
                                ? "الخلاصة من تفسير الطبري"
                                : "Summary from Tafsir Al-Tabari Arabic only"}{" "}
                            </Typography>
                            <Typography variant="h6">{item.name}</Typography>
                          </CardContent>
                        </AudioTafsirCard>
                      ))}
                    </div>
                    {/* Pagination buttons */}
                    <div className="pagination-buttons w-100 text-center d-flex flex-row gap-3 justify-content-center align-items-center my-3">
                      {audioCurrentPage > 1 && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setAudioCurrentPage(audioCurrentPage - 1);
                            toTop();
                          }}
                          style={{ marginRight: "10px" }}
                        >
                          {language === "ar" ? "السابق" : "Previous"}
                        </Button>
                      )}
                      {audioCurrentPage < totalAudioPages && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setAudioCurrentPage(audioCurrentPage + 1);
                            toTop();
                          }}
                        >
                          {language === "ar" ? "التالي" : "Next"}
                        </Button>
                      )}
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <Typography variant="body1">
              {language === "ar"
                ? "لا توجد بيانات تفسير صوتي متاحة."
                : "No audio tafsir data available."}
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

export default Tafsir;
