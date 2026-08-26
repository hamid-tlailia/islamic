// Tajweed.jsx (FULL - UI updated with collapsible filters, neutral colors)
// NOTE: logic is same; only UI structure + neutral color usage.

import { getJSON, TTL } from "../../../../lib/apiClient";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../../../components/languages/provider";
import {
  Box,
  Typography,
  Button,
  Modal,
  Card,
  IconButton,
  Select,
  Option,
  CircularProgress,
} from "@mui/joy";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import SlowMotionVideoOutlinedIcon from "@mui/icons-material/SlowMotionVideoOutlined";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { surahName } from "../../../../lib/surahNames";

// Quran text on this page is set in Amiri; the font ships in this chunk.
import "@fontsource/amiri/arabic-400.css";
import "./tajweed.css";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { useMediaQuery } from "@mui/material";
import { useSwipeable } from "react-swipeable";

const tajweedRules = {
  ham_wasl: {
    en: "Hamzat al-Wasl",
    ar: "همزة الوصل",
    description_en:
      "A connecting Hamzah pronounced at the beginning of speech and dropped in the middle of speech. This rule is applied to facilitate smoother recitation when words are joined together. For instance, in the phrase 'Al-Malik ibn...', the Hamzah in 'ibn' is dropped for easier pronunciation.",
    description_ar:
      "هي الهمزة الزائدة التي تثبت في الابتداء وتسقط في الوصل لتسهيل القراءة بين الكلمات المتتابعة، كما في جملة 'الملك ابن...'.",
    letters: "",
    color: "#504a4a",
  },
  silent: {
    en: "Silent Letters",
    ar: "الأحرف الصامتة",
    description_en:
      "Letters that are written but not pronounced during recitation. These silent letters maintain the visual integrity of the Quranic text while allowing for a smoother auditory recitation, ensuring the beauty and rhythm of the Quran.",
    description_ar:
      "هي الأحرف المكتوبة ولكنها لا تُنطق أثناء التلاوة، حيث تُسهم في الحفاظ على جمال ونسق التلاوة مع عدم تغيير النص القرآني المكتوب.",
    letters: "",
    color: "#504a4a",
  },
  laam_shamsiyah: {
    en: "Lam Shamsiyyah",
    ar: "لام الشمسية",
    description_en:
      "The 'Lam' that is not pronounced due to assimilation with the following sun letter. It merges into the sun letter to make the recitation smoother.",
    description_ar:
      "هي اللام التي لا تُنطق بسبب إدغامها بالحرف الشمسي التالي لتسهيل النطق.",
    letters: "",
    color: "#504a4a",
  },
  madda_normal: {
    en: "Normal Madd",
    ar: "مد طبيعي",
    description_en:
      "Extending the vowel sound for two counts without any cause. It occurs when a letter of Madd (Alif, Ya, or Waw) is not followed by a hamzah or a sukoon.",
    description_ar:
      "هو المد الذي يُمد بمقدار حركتين دون سبب، ويحدث عند وجود حرف مد غير متبوع بهمز أو سكون.",
    letters: "",
    color: "#537FFF",
  },
  madda_permissible: {
    en: "Al-Madd Al-'Aridh",
    ar: "المد العارض",
    description_en:
      "Al-Madd Al-'Aridh (Incidental Madd) occurs when a vowel letter or a soft letter is followed by a consonant that becomes silent due to a pause. It is called 'incidental' because the final letter in the word becomes silent as a result of the pause; if it were connected, it would become a normal Madd. Its ruling allows for three possibilities: shortening (two counts), medium lengthening (four counts), and full lengthening (six counts).",
    description_ar:
      "المد العارض هو أن يقع بعد حرف المد أو حرف اللين ساكن سكونه عارض لأجل الوقف. وحكمه: القصر حركتان، والتوسط أربع، والإشباع ست.",
    letters: "",
    color: "#4050FF",
  },
  madda_necessary: {
    en: "Necessary Madd",
    ar: "مد لازم",
    description_en:
      "Extending the vowel sound for six counts obligatorily when followed by a sukoon in the same word.",
    description_ar:
      "وهو أن يأتي بعد حرف المد سكون لازم وصلا ووقفا، وسمي لازما للزوم مده ست حركات.",
    letters: "",
    color: "#000EBC",
  },
  qalaqah: {
    en: "Qalqalah",
    ar: "قلقلة",
    description_en:
      "A vibration or echoing sound produced when pronouncing specific letters (ق، ط، ب، ج، د). It adds a bouncing effect to the pronunciation.",
    description_ar: "هي اهتزاز أو تردد الصوت عند نطق بعض الحروف (قطب جد).",
    letters: "[ق، ط، ب، ج، د]",
    color: "#DD0008",
  },
  madda_obligatory: {
    en: "Obligatory Madd",
    ar: "مد واجب",
    description_en:
      "It is the Madd that must be extended for four or five counts when there is a Hamzah in the same word (muttasil) or in the following word (munfasil).",
    description_ar:
      "هو المد الذي يجب مده أربع أو خمس حركات عند وجود همزة في نفس الكلمة (متصل) أو في الكلمة التالية (منفصل).",
    letters: "",
    color: "#2144C1",
  },
  ikhafa_shafawi: {
    en: "Ikhfā’ Shafawī",
    ar: "إخفاء شفوي",
    description_en:
      "Concealing the 'Mīm Sākinah' when followed by 'Bā’ (ب)' with nasalization.",
    description_ar: "إخفاء الميم الساكنة عند ملاقاتها بحرف الباء (ب) مع الغنة.",
    letters: "ب",
    color: "#D500B7",
  },
  ikhafa: {
    en: "Ikhfā’",
    ar: "إخفاء",
    description_en:
      "Concealing the 'Nūn Sākinah' or 'Tanwīn' with nasalization when followed by specific letters.",
    description_ar:
      "إخفاء النون الساكنة أو التنوين مع الغنة عند ملاقاتها بحروف الإخفاء.",
    letters: "[ت، ث، ج، د، ذ، ز، س، ش، ص، ض، ط، ظ، ف، ق، ك]",
    color: "#9400A8",
  },
  idgham_shafawi: {
    en: "Idghām Shafawī",
    ar: "إدغام شفوي",
    description_en:
      "Merging 'Mīm Sākinah' into the following 'Mīm' with nasalization.",
    description_ar: "إدغام الميم الساكنة في الميم التالية مع الغنة.",
    letters: "م",
    color: "green",
  },
  iqlab: {
    en: "Iqlāb",
    ar: "إقلاب",
    description_en:
      "Changing 'Nūn Sākinah' or 'Tanwīn' into 'Mīm' when followed by 'Bā’ (ب)' with nasalization.",
    description_ar:
      "قلب النون الساكنة أو التنوين إلى ميم عند ملاقاتها بحرف الباء (ب) مع الغنة.",
    letters: "ب",
    color: "#1b87a5",
  },
  idgham_ghunnah: {
    en: "Idghām with Ghunnah",
    ar: "إدغام بغنة",
    description_en:
      "Merging 'Nūn Sākinah' or 'Tanwīn' into (ي، م، ن، و) with nasalization.",
    description_ar:
      "إدغام النون الساكنة أو التنوين في (ي، م، ن، و) مع الغنة (ينمو).",
    letters: "[ي، م، ن، و]",
    color: "#FF7E1E",
  },
  idgham_wo_ghunnah: {
    en: "Idghām without Ghunnah",
    ar: "إدغام بلا غنة",
    description_en:
      "Merging 'Nūn Sākinah' or 'Tanwīn' into (ل، ر) without nasalization.",
    description_ar: "إدغام النون الساكنة أو التنوين في (ل، ر) بلا غنة.",
    letters: "ل، ر",
    color: "rgb(142, 121, 5)",
  },
  idgham_mutajanisayn: {
    en: "Idghām Mutajānishayn",
    ar: "إدغام متماثلين",
    description_en:
      "Merging two letters with the same articulation point but different characteristics.",
    description_ar: "إدغام حرفين اتفقا مخرجًا واختلفا صفة.",
    letters: "",
    color: "#A1A1A1",
  },
  idgham_mutaqaribayn: {
    en: "Idghām Mutaqāribayn",
    ar: "إدغام متقاربين",
    description_en:
      "Merging two letters that are close in articulation point and characteristics.",
    description_ar: "إدغام حرفين تقاربا مخرجًا وصفة.",
    letters: "",
    color: "#A1A1A1",
  },
  ghunnah: {
    en: "Ghunnah",
    ar: "غنة",
    description_en:
      "A nasal sound that accompanies the pronunciation of certain letters (م، ن).",
    description_ar: "صوت يخرج من الخيشوم يصاحب نطق بعض الحروف (الميم والنون).",
    letters: "",
    color: "#FF7E1E",
  },
};

const Tajweed = ({ audioName, documentName }) => {
  const { language } = useTranslation();
  const [currentSurah, setCurrentSurah] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [quranData, setQuranData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surahList, setSurahList] = useState([]);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ayahAudioSRC, setAyahAudioSRC] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [nestedModalOpen, setNestedModalOpen] = useState(false);
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPageChanged, setSavedPageChanged] = useState(false);
  const contentRef = useRef(null);
  const [animationClass, setAnimationClass] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);
  const [surahPageInfo, setSurahPageInfo] = useState({});
  const isSmallScreen = useMediaQuery("(max-width:500px)");

  // NEW: collapsible filters
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* The legend of colours for the page in hand, and the reading mode. */
  const [rulesOpen, setRulesOpen] = useState(false);
  const [reciteMode, setReciteMode] = useState(
    () => localStorage.getItem("tajweedReciteMode") === "1",
  );

  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "هناك خطأ ما سيتم معالجة الأمر قريبا "
          : "Something happened, we'll fix it soon",
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching]);

  // Detect if user changed saved page to not saved one
  useEffect(() => {
    const savedSurah = localStorage.getItem("savedTajweedSurah");
    const savedPage = localStorage.getItem("savedPage");
    const currentSavedPage = parseInt(savedPage, 10);

    if (savedSurah && savedPage) {
      if (currentSavedPage !== currentPage) setSavedPageChanged(true);
      else setSavedPageChanged(false);
    }
  }, [currentPage, currentSurah, saved]);

  const restoreSavedInfos = () => {
    const savedSurah = localStorage.getItem("savedTajweedSurah");
    const savedPage = localStorage.getItem("savedPage");
    if (savedSurah && savedPage) {
      setCurrentSurah(parseInt(savedSurah, 10));
      setCurrentPage(parseInt(savedPage, 10));
    } else {
      setCurrentSurah(1);
      setCurrentPage(1);
    }
    setFiltersOpen(false);
  };

  // Swipe handlers (small screens)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handlePrev(),
    onSwipedRight: () => handleNext(),
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: false,
  });

  useEffect(() => {
    const savedSurah = localStorage.getItem("savedTajweedSurah");
    const savedPage = localStorage.getItem("savedPage");
    if (savedSurah && savedPage) {
      setCurrentSurah(parseInt(savedSurah, 10));
      setCurrentPage(parseInt(savedPage, 10));
    } else {
      setCurrentSurah(1);
      setCurrentPage(1);
    }
  }, []);

  useEffect(() => {
    const fetchSurahList = async () => {
      try {
        const data = await getJSON("https://api.quran.com/api/v4/chapters?language=en", { ttl: TTL.IMMUTABLE });

        if (data.chapters && data.chapters.length > 0) {
          setSurahList(data.chapters);

          const pageInfo = {};
          for (const surah of data.chapters) {
            pageInfo[surah.id] = {
              startPage: surah.pages[0],
              endPage: surah.pages[1],
            };
          }
          setSurahPageInfo(pageInfo);
        } else {
          setIsErrorFetching(true);
        }
      } catch (err) {
        setIsErrorFetching(true);
      }
    };
    fetchSurahList();
  }, []);

  useEffect(() => {
    const fetchQuranData = async () => {
      setLoading(true);
      setError(null);

      try {
        let apiUrl = "";
        if (currentPage) {
          apiUrl = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?page_number=${currentPage}`;
        } else if (currentSurah) {
          apiUrl = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${currentSurah}`;
        }

        if (!apiUrl) {
          setQuranData([]);
          setLoading(false);
          return;
        }

        const data = await getJSON(apiUrl, { ttl: TTL.IMMUTABLE });

        if (data.verses && data.verses.length > 0) {
          const processedVerses = data.verses.map((verse) => ({
            ...verse,
            text_uthmani: processAyahText(
              verse.text_uthmani_tajweed
                .replace(/<tajweed([^>]*)>/g, "<span$1>")
                .replace(/<\/tajweed>/g, "</span>"),
            ),
            ayah_key: verse.verse_key,
          }));
          setQuranData(processedVerses);

          if (data.meta && data.meta.current_page) {
            setCurrentPage(data.meta.current_page);
          }
        } else {
          setIsErrorFetching(true);
        }
      } catch (err) {
        setIsErrorFetching(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuranData();
  }, [currentSurah, currentPage]);

  const processAyahText = (text) => {
    return text.replace(/(\s*[\u0660-\u0669]+)\s*$/u, (match, p1) => {
      return `<span class="ayah-symbol">${p1.trim()}</span>`;
    });
  };

  const handlePrev = () => {
    if (currentPage && currentPage > 1) {
      setAnimationClass("flip-right");
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateSurahBasedOnPage(newPage);
    } else {
      setAnimationClass("flip-left");
      toast.info(
        language === "ar"
          ? "أنت بالفعل في أول صفحة"
          : "You are in the first page",
      );
    }
    checkSavedPage();
  };

  const handleNext = () => {
    if (currentPage && currentPage < 604) {
      setAnimationClass("flip-left");
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateSurahBasedOnPage(newPage);
    } else {
      setAnimationClass("flip-right");
      toast.info(
        language === "ar"
          ? "لقد وصلت الى اخر صفحة"
          : "You are in the last page",
      );
    }
    checkSavedPage();
  };

  const updateSurahBasedOnPage = (page) => {
    for (const surahId in surahPageInfo) {
      const { startPage, endPage } = surahPageInfo[surahId];
      if (page >= startPage && page <= endPage) {
        setCurrentSurah(parseInt(surahId));
        break;
      }
    }
  };

  const handleSurahSelect = (event, newValue) => {
    const surahNumber = newValue;
    if (surahNumber) {
      setCurrentSurah(surahNumber);
      const startPage = surahPageInfo[surahNumber]?.startPage;
      if (startPage) setCurrentPage(startPage);
      else setCurrentPage(null);
    }
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    if (value === "") {
      setCurrentPage(null);
    } else {
      const pageNumber = Math.max(1, Math.min(604, parseInt(value, 10)));
      setCurrentPage(pageNumber);
      updateSurahBasedOnPage(pageNumber);
    }
  };

  const handleAyahClick = (ayah) => {
    setSelectedAyah(ayah);
    setModalOpen(true);
    getAyahAudio(ayah.id);
  };

  const getAyahAudio = async (ayahId) => {
    setAudioLoading(true);
    try {
      const audio_Src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahId}.mp3`;
      setAyahAudioSRC(audio_Src);
      setAudioLoading(false);
    } catch (error) {
      toast.error(
        language === "ar"
          ? "الملف الصوتي غير متاح"
          : "Unable to get audio please try again",
      );
    }
  };

  const handleSave = () => {
    if (currentSurah && currentPage && !saved) {
      localStorage.setItem("savedTajweedSurah", currentSurah);
      localStorage.setItem("savedPage", currentPage);
      toast.success(
        language === "ar" ? "تم حفظ السورة والصفحة!" : "Surah and Page saved!",
      );
    }
    checkSavedPage();
  };

  const extractTajweedClasses = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const spans = tempDiv.querySelectorAll("span");
    const classes = new Set();
    spans.forEach((span) => {
      if (span.className) {
        span.className.split(" ").forEach((cls) => {
          if (tajweedRules[cls]) classes.add(cls);
        });
      }
    });
    return Array.from(classes);
  };

  const getTranslatedTajweedRules = (classes) => {
    return classes.map((cls) => ({
      className: cls,
      name: language === "ar" ? tajweedRules[cls].ar : tajweedRules[cls].en,
      description:
        language === "ar"
          ? tajweedRules[cls].description_ar
          : tajweedRules[cls].description_en,
      letters: tajweedRules[cls].letters,
      color: tajweedRules[cls].color,
    }));
  };

  const handleRuleClick = (rule) => {
    setSelectedRule(rule);
    setNestedModalOpen(true);
  };

  const handleAudioPlayPause = () => {
    if (audioLoading) return;
    audioName(ayahAudioSRC);
    documentName("تجويد");
  };

  const handleAudioLoadedMetadata = () => setAudioLoading(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio)
      audio.addEventListener("loadedmetadata", handleAudioLoadedMetadata);
    return () => {
      if (audio)
        audio.removeEventListener("loadedmetadata", handleAudioLoadedMetadata);
    };
  }, [ayahAudioSRC]);

  const renderSurahName = (verse, index) => {
    const surahNumber = verse.verse_key.split(":")[0];
    const currentAyahNumber = verse.verse_key.split(":")[1];

    if (
      index === 0 ||
      quranData[index - 1].verse_key.split(":")[0] !== surahNumber
    ) {
      const surahName = surahList.find(
        (surah) => surah.id === parseInt(surahNumber),
      );
      return (
        <>
          {parseInt(currentAyahNumber) === 1 && (
            <Typography
              key={`surah-${surahNumber}`}
              variant="h6"
              sx={{ textAlign: "center", margin: "6px 0" }}
              className="w-100 d-flex justify-content-center align-items-center mb-1"
            >
              <span className="surah_name">
                {parseInt(currentAyahNumber) === 1
                  ? language === "ar"
                    ? `【 سورة ${surahName?.name_arabic} 】`
                    : `[ ${surahName?.name_simple} ]`
                  : null}
              </span>
            </Typography>
          )}
        </>
      );
    }
    return null;
  };

  useEffect(() => {
    const storedPage = parseInt(localStorage.getItem("savedPage"));
    const storedSurah = parseInt(localStorage.getItem("savedTajweedSurah"));
    if (storedPage && storedSurah) {
      if (storedPage === currentPage) setSaved(true);
      else setSaved(false);
    } else {
      setSaved(false);
    }
  }, [currentPage, currentSurah]);

  const checkSavedPage = () => {
    const storedPage = parseInt(localStorage.getItem("savedPage"), 10);
    const storedSurah = parseInt(localStorage.getItem("savedTajweedSurah"), 10);
    if (storedPage && storedSurah) {
      if (storedPage === currentPage) setSaved(true);
      else setSaved(false);
    } else {
      setSaved(false);
    }
  };

  useEffect(() => {
    if (saved) {
      const storedSurah = parseInt(
        localStorage.getItem("savedTajweedSurah"),
        10,
      );
      setCurrentSurah(storedSurah);
    }
  }, [saved, savedPageChanged]);

  // close filters on page change (optional niceness)
  useEffect(() => {
    // if user navigates, keep panel closed on small screens
    if (isSmallScreen) setFiltersOpen(false);
    // eslint-disable-next-line
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("tajweedReciteMode", reciteMode ? "1" : "0");
  }, [reciteMode]);

  /*
   * Which surah the page in hand belongs to, by name.
   *
   * The bar used to read "السورة 3 / 114", and a number is not how anyone
   * knows where they are in the mushaf. The chapter list carries the name; the
   * local table stands in for it while that request is in flight or offline.
   */
  const currentSurahMeta = surahList.find((sr) => sr.id === currentSurah);
  const currentSurahLabel = currentSurah
    ? language === "ar"
      ? `سورة ${currentSurahMeta?.name_arabic || surahName(currentSurah, "ar")}`
      : currentSurahMeta?.name_simple || surahName(currentSurah, "en")
    : "—";

  /*
   * Every rule the colours on this page actually stand for — not the whole
   * table of twenty. A reciter looking at a coloured word wants to know what
   * that colour means here, and the page is a short enough list to read.
   */
  const pageRules = (() => {
    const seen = new Set();
    quranData.forEach((ayah) =>
      extractTajweedClasses(ayah.text_uthmani).forEach((cls) => seen.add(cls)),
    );
    return getTranslatedTajweedRules(Array.from(seen));
  })();

  return (
    <Box {...swipeHandlers} className="tajweed-shell" sx={{ width: "100%" }}>
      {/* ===== Top Bar (always visible) ===== */}
      <Box className="tajweed-topbar">
        <Box className="tajweed-topbar-left">
          <IconButton
            className="tajweed-filterBtn"
            variant="soft"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <TuneRoundedIcon sx={{ color: "crimson" }} />
            <span
              className="tajweed-filterBtnText"
              style={{ color: "var(--text-color)" }}
            >
              {language === "ar" ? "الفلاتر" : "Filters"}
            </span>
          </IconButton>

          {/* What the colours on this page mean. */}
          <IconButton
            className={`tajweed-filterBtn ${rulesOpen ? "is-on" : ""}`}
            variant="soft"
            aria-pressed={rulesOpen}
            onClick={() => setRulesOpen((v) => !v)}
          >
            <PaletteOutlinedIcon sx={{ color: "var(--primary-color)" }} />
            <span
              className="tajweed-filterBtnText"
              style={{ color: "var(--text-color)" }}
            >
              {language === "ar" ? "القواعد" : "Rules"}
            </span>
          </IconButton>

          {/* Larger type and wider leading, for reading aloud. */}
          <IconButton
            className={`tajweed-filterBtn ${reciteMode ? "is-on" : ""}`}
            variant="soft"
            aria-pressed={reciteMode}
            onClick={() => setReciteMode((v) => !v)}
          >
            <MenuBookRoundedIcon sx={{ color: "var(--primary-color)" }} />
            <span
              className="tajweed-filterBtnText"
              style={{ color: "var(--text-color)" }}
            >
              {language === "ar" ? "وضع التلاوة" : "Recite"}
            </span>
          </IconButton>

          {savedPageChanged && (
            <IconButton
              className="tajweed-restoreBtn"
              variant="soft"
              onClick={restoreSavedInfos}
            >
              <RestoreIcon sx={{ color: "blue" }} />
            </IconButton>
          )}
        </Box>

        <Button
          className={
            saved && !savedPageChanged ? "tajweed-savedBtn" : "tajweed-saveBtn"
          }
          variant="solid"
          onClick={handleSave}
          sx={{ pointerEvents: saved && !savedPageChanged ? "none" : "all" }}
        >
          {saved && !savedPageChanged ? (
            <>
              <DoneOutlinedIcon
                className="tajweed-btnIcon green"
                style={{ color: "green" }}
              />
              {language === "ar" ? "محفوظة" : "Saved"}
            </>
          ) : (
            <>
              <BookmarksOutlinedIcon className="tajweed-btnIcon" />
              {language === "ar" ? "حفظ" : "Save"}
            </>
          )}
        </Button>
      </Box>

      {/* ===== Info Bar (always visible) ===== */}
      <Box className="tajweed-infobar">
        {!isSmallScreen && (
          <IconButton
            className="tajweed-navBtn"
            variant="soft"
            onClick={handlePrev}
            disabled={currentPage <= 1}
          >
            {language === "ar" ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
          </IconButton>
        )}

        <Box className="tajweed-metaPill">
          <Typography className="tajweed-metaText">
            <b className="tajweed-metaSurah">{currentSurahLabel}</b>
            <span className="tajweed-metaSep">•</span>
            {language === "ar" ? "الصفحة" : "Page"} <b>{currentPage || "-"}</b>{" "}
            / 604
          </Typography>
        </Box>

        {!isSmallScreen && (
          <IconButton
            className="tajweed-navBtn"
            variant="soft"
            onClick={handleNext}
            disabled={currentPage >= 604}
          >
            {language === "ar" ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
          </IconButton>
        )}
      </Box>

      {/* ===== Hidden Filters Panel ===== */}
      <Box className={`tajweed-filters ${filtersOpen ? "open" : ""}`}>
        <Box className="tajweed-filtersHead">
          <Typography className="tajweed-filtersTitle">
            {language === "ar" ? "إعدادات الفلاتر" : "Filter Settings"}
          </Typography>

          <IconButton
            className="tajweed-filtersClose"
            variant="soft"
            onClick={() => setFiltersOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className="tajweed-filtersRow">
          <Select
            placeholder={language === "ar" ? "اختر سورة" : "Select Surah"}
            onChange={handleSurahSelect}
            value={currentSurah}
            className="surahs-select tajweed-surahSelect"
            sx={{ minWidth: 240, color: "var(--text-color)" }}
          >
            {surahList.map((surah) => (
              <Option key={surah.id} value={surah.id}>
                {language === "ar"
                  ? `سورة ${surah?.name_arabic}`
                  : surah.name_simple}
              </Option>
            ))}
          </Select>

          <Box className="tajweed-pagePick">
            <Typography className="tajweed-label">
              {language === "ar" ? "الصفحة" : "Page"}
            </Typography>

            <input
              className="tajweed-pageInput"
              type="number"
              value={currentPage || ""}
              onChange={handlePageInput}
              min="1"
              max="604"
              placeholder="1"
              inputMode="numeric"
            />

            <Typography className="tajweed-pageTotal">/ 604</Typography>
          </Box>
        </Box>
      </Box>

      {/* ===== Rules legend for this page ===== */}
      {rulesOpen && (
        <Box className="tajweed-legend">
          <Typography className="tajweed-legendTitle">
            {language === "ar"
              ? "أحكام التجويد في هذه الصفحة"
              : "Tajweed rules on this page"}
          </Typography>

          {pageRules.length ? (
            <Box className="tajweed-legendList">
              {pageRules.map((rule) => (
                <button
                  key={rule.className}
                  type="button"
                  className="tajweed-legendChip"
                  onClick={() => handleRuleClick(rule)}
                >
                  <span
                    className="tajweed-legendSwatch"
                    style={{ background: rule.color }}
                    aria-hidden="true"
                  />
                  {rule.name}
                </button>
              ))}
            </Box>
          ) : (
            <Typography className="tajweed-legendEmpty">
              {language === "ar"
                ? "لا توجد أحكام ملوّنة في هذه الصفحة."
                : "No coloured rules on this page."}
            </Typography>
          )}
        </Box>
      )}

      {/* ===== Content ===== */}
      <Box
        {...swipeHandlers}
        ref={contentRef}
        className={`tajweed-content ${!loading ? animationClass : ""} ${
          reciteMode ? "is-recite" : ""
        }`}
        sx={{ direction: "rtl" }}
      >
        {loading && (
          <Box className="tajweed-loading">
            <CircularProgress />
            <Typography className="tajweed-loadingText">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </Typography>
          </Box>
        )}

        {error && (
          <Typography textAlign="center" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <div className="tajweed-parent">
            {quranData.map((ayah, index) => (
              <React.Fragment key={ayah.id}>
                {renderSurahName(ayah, index)}
                <span
                  onClick={() => handleAyahClick(ayah)}
                  className="tajweed-text"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(ayah.text_uthmani),
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </Box>

      {/* ===== Ayah Modal ===== */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAyahAudioSRC(null);
          setAudioLoading(false);
        }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Card className="tajweed-modal sheet-surface">
          <Box className="tajweed-modalHeader">
            <Typography
              level="h4"
              className="tajweed-modalTitle"
              sx={{ color: "var(--text-color)" }}
            >
              {language === "ar" ? "نص الآية" : "Ayah Text"}
            </Typography>

            <IconButton
              className="tajweed-closeBtn"
              variant="soft"
              onClick={() => {
                setModalOpen(false);
                setAyahAudioSRC(null);
                setAudioLoading(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <div
            className="tajweed-ayahText rtl"
            style={{ color: "var(--text-color)" }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(selectedAyah?.text_uthmani),
            }}
          />

          {selectedAyah && ayahAudioSRC && (
            <Box className="tajweed-audioRow">
              <audio ref={audioRef} src={ayahAudioSRC} preload="auto" />
              {audioLoading ? (
                <CircularProgress />
              ) : (
                <Button
                  className="tajweed-audioBtn"
                  variant="soft"
                  onClick={handleAudioPlayPause}
                >
                  <SlowMotionVideoOutlinedIcon sx={{ color: "green" }} />
                  {language === "ar" ? "استمع إلى الآية" : "Listen to Ayah"}
                </Button>
              )}
            </Box>
          )}

          <Box className="tajweed-divider" />

          <Typography
            level="h5"
            className="tajweed-rulesTitle"
            sx={{ color: "var(--text-color)" }}
          >
            {language === "ar" ? "أحكام التجويد" : "Tajweed Rules"}
          </Typography>

          {selectedAyah && (
            <Box className="tajweed-rulesWrap">
              {getTranslatedTajweedRules(
                extractTajweedClasses(selectedAyah.text_uthmani),
              ).map((rule, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="tajweed-ruleChip"
                  style={{ borderColor: rule.color, color: rule.color }}
                  onClick={() => handleRuleClick(rule)}
                  title={rule.name}
                >
                  {rule.name}
                </button>
              ))}
            </Box>
          )}
        </Card>
      </Modal>

      {/* ===== Rule Modal ===== */}
      <Modal
        open={nestedModalOpen}
        onClose={() => setNestedModalOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Card className="tajweed-modal tajweed-modalSmall sheet-surface">
          <Box className="tajweed-modalHeader">
            <Typography
              level="h5"
              className="tajweed-modalTitle"
              sx={{ color: selectedRule?.color || "var(--text-color)" }}
            >
              {selectedRule?.name}
            </Typography>

            <IconButton
              className="tajweed-closeBtn"
              variant="soft"
              onClick={() => setNestedModalOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography
            className="tajweed-ruleDesc"
            sx={{ color: "var(--text-color)" }}
          >
            {selectedRule?.description}
          </Typography>

          {selectedRule?.letters && (
            <Typography
              className="tajweed-letters"
              sx={{
                color: selectedRule?.color,
                direction: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {language === "ar"
                ? `الحروف: ${selectedRule.letters}`
                : `Letters: ${selectedRule.letters}`}
            </Typography>
          )}
        </Card>
      </Modal>
    </Box>
  );
};

export default Tajweed;
