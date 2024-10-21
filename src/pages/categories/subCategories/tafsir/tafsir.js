import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Autocomplete, FormControl, FormLabel } from "@mui/joy";
import useMediaQuery from "@mui/material/useMediaQuery";
import "./tafsir.css";
import { useTranslation } from "../../../../components/languages/provider";
import Loader from "../../../../components/loader/loader";
import styled from "styled-components";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitization
import { franc } from "franc";
import { toast } from "react-toastify";
import Alert from "@mui/material/Alert";

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

const Tafsir = () => {
  const [langs, setLangs] = useState("arabic");
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [selectedTafsir, setSelectedTafsir] = useState(null);
  const [tafsirList, setTafsirList] = useState([]);
  const [ayahList, setAyahList] = useState([]);
  const [warning, setWarning] = useState("");
  const [tafsir, setTafsir] = useState("");
  const [optionsVisible, setOptionsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alignmentClass, setAlignmentClass] = useState("w-100 my-3 text-end");
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  const [currentExplainedAyah, setCurrentExplainedAyah] = useState(null);
  // eslint-disable-next-line
  const isSmallScreen = useMediaQuery("(max-width:500px)");
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

      // Fetch the Tafsir automatically
      handleSubmit(
        savedLang,
        surahNumber,
        savedAyah ? parseInt(savedAyah, 10) : null,
        savedTafsir
      );
    }
    // eslint-disable-next-line
  }, [surahs]);

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
          setTafsir(cleanContent); // Set Tafsir for the specific Ayah
          setOptionsVisible(false); // Hide options after submission
          // Make loader off
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
          // Combine all Tafsir texts
          const allAyahsTafsir = responses
            .map((response) => response.tafsir.text)
            .join("\n");
          const cleanContent = DOMPurify.sanitize(allAyahsTafsir);
          setTafsir(cleanContent); // Set Tafsir for all Ayahs
          setOptionsVisible(false); // Hide options after submission
          // Make loader off
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
    setTafsir("");
    setOptionsVisible(true); // Show options again
    setLoading(false);
  };

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
          {language === "ar" ? "التفسير" : "Get Tafsir"}
        </Button>
      )}
      {!optionsVisible && (
        <Button variant="outlined" color="secondary" onClick={handleReset}>
          {language === "ar" ? "إعادة تعيين" : "Reset"}
        </Button>
      )}
    </div>
  );

  // Detect language
  useEffect(() => {
    // Detect language using franc
    const detectedLang = franc(tafsir);

    // Define languages that are typically right-to-left
    const rtlLanguages = ["arb", "fas", "urd", "heb"]; // Arabic, Persian, Urdu, Hebrew, etc.

    // Set the class based on detected language
    if (rtlLanguages.includes(detectedLang)) {
      setAlignmentClass("w-100 my-3 text-end"); // Right-to-left (Arabic, etc.)
    } else {
      setAlignmentClass("w-100 my-3 text-start"); // Left-to-right for other languages
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
  }, [selectedAyah, langs, surahs, selectedSurah]);

  return (
    <div>
      {!tafsir && (
        <Alert
          variant="outlined"
          severity="info"
          sx={{
            fontSize: "17px",
            width: "90%",
            margin: "10px",
            textAlign: "center",
            display: "flex",
            flexDirection: "row",
            gap: "5px",
            padding: "5px",
            color: "#03a9f4",
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
      {/* Tafsir area */}
      {loading && (
        <div className="close-loader" onClick={handleReset}>
          X
        </div>
      )}
      {loading ? (
        <div> {<Loader />} </div>
      ) : (
        <TafsirContainer>
          {/* Explained ayah text */}
          {!optionsVisible && (
            <p className="w-100 text-center my-2 explained-ayah">
              ✦ {currentExplainedAyah?.text} ✦
              <span className="text-info mx-2">
                [{" "}
                {langs === "arabic"
                  ? currentExplainedAyah?.surah.name
                  : currentExplainedAyah?.surah.englishName}
                {" : "}
                {currentExplainedAyah?.numberInSurah} ]
              </span>
            </p>
          )}
          <TafsirContent
            className={alignmentClass}
            dangerouslySetInnerHTML={{ __html: tafsir }}
          />
        </TafsirContainer>
      )}
      {!loading && !tafsir && (
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
    </div>
  );
};

export default Tafsir;
