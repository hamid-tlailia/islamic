// Quran.js
import React, { useEffect, useMemo, useRef, useState } from "react";
// Ayah text on this page is set in Amiri; the font ships in this chunk.
import "@fontsource/amiri/arabic-400.css";
import "./quran.css";
import {
  SyncAltOutlined as SyncIcon,
  SlowMotionVideoOutlined as SlowMotionVideoOutlinedIcon,
  ZoomOutMapOutlined as ZoomOutMapOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  CloseOutlined as CloseOutlinedIcon,
} from "@mui/icons-material";

import { Tabs, Tab, Box, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import DialogContent from "@mui/material/DialogContent";

import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Switch from "@mui/joy/Switch";
import Divider from "@mui/joy/Divider";

import Select from "react-select";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";

import logo from "../images/logo.png";
import {
  loadArabicTafsir,
  loadEnglishTafsir,
} from "../../../../lib/staticData";
import { useTranslation } from "../../../../components/languages/provider";

/* ===================== SEARCH NORMALIZATION ===================== */
/**
 * Remove tashkeel + tatweel and normalize some Arabic variants.
 * This makes search match "word" even if text has diacritics.
 */
function normalizeArabic(str = "") {
  return String(str)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // tashkeel
    .replace(/\u0640/g, "") // tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

function normalizeForSearch(str = "") {
  const s = String(str).toLowerCase();
  // if Arabic exists -> normalize Arabic chars and remove diacritics
  if (/[\u0600-\u06FF]/.test(s)) return normalizeArabic(s);
  return s.trim();
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a regex that matches Arabic query even if the text has tashkeel between letters
function buildArabicLooseRegex(query) {
  const q = normalizeArabic(query);
  if (!q) return null;

  const parts = [...q].map((ch) => {
    const esc = escapeRegExp(ch);

    // allow common variant groups for better match
    if (ch === "ا") return "[اأإآٱ]";
    if (ch === "ي") return "[يى]";
    if (ch === "ه") return "[هة]";
    if (ch === "و") return "[وؤ]";
    return esc;
  });

  // allow optional tashkeel between each letter
  const diacritics = "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*";
  const pattern = parts.join(diacritics);
  return new RegExp(`(${pattern})`, "gi");
}

function highlightText(text, query) {
  if (!query) return text;

  const isArabicQuery = /[\u0600-\u06FF]/.test(query);
  let re;

  if (isArabicQuery) {
    re = buildArabicLooseRegex(query);
    if (!re) return text;
  } else {
    const safe = escapeRegExp(query.trim());
    if (!safe) return text;
    re = new RegExp(`(${safe})`, "gi");
  }

  const parts = String(text).split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="quran-mark">
        {p}
      </mark>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
}

const Quran = ({ src, toTop, audioName }) => {
  const { translations, language } = useTranslation();
  const isSmallScreen = useMediaQuery("(max-width:500px)");

  // ===================== DATA =====================
  const [surahs, setSurahs] = useState([]);
  const [allAyahs, setAllAyahs] = useState(null);
  const [surahData, setSurahData] = useState(null);

  const [apiTranslation, setApiTranslation] = useState([]);
  const [englishTafsir, setEnglishTafsir] = useState([]);
  const [allSurahTafseer, setAllSurahTafseer] = useState(null);

  // ===================== UI STATE =====================
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorFetching, setIsErrorFetching] = useState(false);

  const [isOpenMoreInfo, setIsOpenMoreInfo] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [layout, setLayout] = useState(undefined); // fullscreen modal
  const [openAyahTafsirModal, setOpenAyahTafsirModal] = useState(false);
  const [singleAyahTafsirText, setSingleAyahTafsirText] = useState("");
  const [tafsirLoader, setTafsirLoader] = useState(true);

  // Settings modal
  const [openSettings, setOpenSettings] = useState(false);
  const [persistProgress, setPersistProgress] = useState(true);
  const [autoPlayReciter, setAutoPlayReciter] = useState(true);

  // ===================== LANG MODE =====================
  const [tafseerLangs, setTafseerLangs] = useState("arabe"); // "arabe" | "english"
  const [quranLangs, setQuranLangs] = useState("Arabe"); // "Arabe" | "English" | "Together"

  // ===================== SEARCH =====================
  const [surahSearch, setSurahSearch] = useState("");
  const [ayahSearch, setAyahSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ===================== PAGINATION =====================
  const itemsPerPageExplanation = 10;
  const itemsPerPageReading = 10;
  const itemsPerPageModal = 10;

  const [currentPageExplanation, setCurrentPageExplanation] = useState(1);
  const [currentPageReading, setCurrentPageReading] = useState(1);
  const [currentPageModal, setCurrentPageModal] = useState(1);

  // for cross-page scrolling
  const [pendingTafsirScrollIndex, setPendingTafsirScrollIndex] =
    useState(null);
  const [pendingReadingScrollIndex, setPendingReadingScrollIndex] =
    useState(null);
  // ===================== REFS =====================
  const surahsRef = useRef(null);
  const ayahsRef = useRef(null);
  const selectedSurahRef = useRef(null);
  const modalContainer = useRef(null);
  const pageAyahRefs = useRef([]);

  // ===================== ERROR TOAST =====================
  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "هناك خطأ ما سيتم معالجة الأمر قريبا"
          : "Something happened, we'll fix it soon",
      );
    }
  }, [isErrorFetching, language]);

  // ===================== FETCH QURAN =====================
  useEffect(() => {
    const fetchQuran = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.alquran.cloud/v1/quran/quran-uthmani",
        );
        const data = await response.json();
        if (data?.data?.surahs) setSurahs(data.data.surahs);
      } catch (e) {
        setIsErrorFetching(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuran();
  }, []);

  // ===================== PERSIST SETTINGS LOAD =====================
  useEffect(() => {
    const savedPersist = localStorage.getItem("quranPersistProgress");
    const savedAutoPlay = localStorage.getItem("quranAutoPlayReciter");
    if (savedPersist !== null) setPersistProgress(savedPersist === "true");
    if (savedAutoPlay !== null) setAutoPlayReciter(savedAutoPlay === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("quranPersistProgress", String(persistProgress));
  }, [persistProgress]);

  useEffect(() => {
    localStorage.setItem("quranAutoPlayReciter", String(autoPlayReciter));
  }, [autoPlayReciter]);

  // ===================== LOAD SAVED SURAH/PAGES =====================
  useEffect(() => {
    if (!persistProgress) return;
    if (surahs.length === 0) return;

    const savedSurah = localStorage.getItem("quranSurah");
    if (!savedSurah) return;

    try {
      const parsedSurah = JSON.parse(savedSurah);
      const found = surahs.find((s) => s.number === parsedSurah.number);
      if (!found) {
        localStorage.removeItem("quranSurah");
        localStorage.removeItem("explainedPage");
        localStorage.removeItem("quranModalPage");
        return;
      }

      setAllAyahs(found);
      setSelectedSurah(found.number);

      const savedPageExplanation = parseInt(
        localStorage.getItem("explainedPage") || "1",
        10,
      );
      const savedPageModal = parseInt(
        localStorage.getItem("quranModalPage") || "1",
        10,
      );

      if (!Number.isNaN(savedPageExplanation))
        setCurrentPageExplanation(savedPageExplanation);
      if (!Number.isNaN(savedPageModal)) setCurrentPageModal(savedPageModal);

      if (ayahsRef.current) ayahsRef.current.classList.add("active");
      if (surahsRef.current) surahsRef.current.classList.add("d-none");
    } catch {
      // ignore
    }
  }, [surahs, persistProgress]);

  // ===================== LANGUAGE DEFAULTS =====================
  useEffect(() => {
    if (language === "en") {
      setQuranLangs("English");
      setTafseerLangs("english");
    } else {
      setQuranLangs("Arabe");
      setTafseerLangs("arabe");
    }
  }, [language]);

  // ===================== SELECT SURAH =====================
  const handleSurahClick = (surah) => {
    setAllAyahs(surah);
    setSelectedSurah(surah.number);
    if (ayahsRef.current) {
      ayahsRef.current.classList.add("active");
      ayahsRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (surahsRef.current) surahsRef.current.classList.add("d-none");

    // reset
    setAyahSearch("");
    setShowSearch(false);

    setCurrentPageReading(1);
    setCurrentPageModal(1);
    setCurrentPageExplanation(1);
    setPendingTafsirScrollIndex(null);
    setPendingReadingScrollIndex(null);

    if (persistProgress) {
      localStorage.setItem("quranSurah", JSON.stringify(surah));
      localStorage.setItem("explainedPage", "1");
      localStorage.setItem("quranModalPage", "1");
    }
  };

  const goBack = () => {
    if (ayahsRef.current) ayahsRef.current.classList.remove("active");
    if (surahsRef.current) surahsRef.current.classList.remove("d-none");

    setCurrentPageReading(1);
    setCurrentPageModal(1);
    setCurrentPageExplanation(1);

    setTimeout(() => {
      if (selectedSurahRef.current) {
        selectedSurahRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 200);
  };

  // ===================== SURAH DATA (AR TAFSIR JSON) =====================
  useEffect(() => {
    if (!selectedSurah) return;
    let cancelled = false;
    loadArabicTafsir()
      .then(({ Surahs }) => {
        if (cancelled) return;
        setSurahData(
          Surahs.find((s) => s.number === Number(selectedSurah)) || null,
        );
      })
      .catch(() => {
        if (!cancelled) setSurahData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSurah]);

  // ===================== API TRANSLATION =====================
  useEffect(() => {
    if (!selectedSurah) return;
    const run = async () => {
      try {
        const r = await fetch(
          `https://api.alquran.cloud/v1/surah/${selectedSurah}/en.asad`,
        );
        const d = await r.json();
        if (d?.data?.ayahs) setApiTranslation(d.data.ayahs);
      } catch (e) {
        setIsErrorFetching(true);
      }
    };
    run();
  }, [selectedSurah]);

  // ===================== ENGLISH TAFSIR JSON =====================
  useEffect(() => {
    const surahNumber = allAyahs?.number;
    if (!surahNumber) return;
    let cancelled = false;
    setTafsirLoader(true);

    loadEnglishTafsir()
      .then((surahs) => {
        if (cancelled) return;
        setEnglishTafsir(surahs[surahNumber - 1]?.ayahs || []);
      })
      .catch(() => {
        if (!cancelled) setEnglishTafsir([]);
      })
      .finally(() => {
        if (!cancelled) setTafsirLoader(false);
      });

    return () => {
      cancelled = true;
    };
  }, [allAyahs]);

  // ===================== ALL SURAH AR TAFSIR (FOR LIST) =====================
  useEffect(() => {
    const surahNumber = allAyahs?.number;
    if (!surahNumber) return;
    let cancelled = false;
    loadArabicTafsir()
      .then(({ Surahs }) => {
        if (cancelled) return;
        setAllSurahTafseer(
          Surahs?.find((t) => t.number === Number(surahNumber)) || null,
        );
      })
      .catch(() => {
        if (!cancelled) setAllSurahTafseer(null);
      });
    return () => {
      cancelled = true;
    };
  }, [allAyahs]);

  // ===================== META UI =====================
  const toggleVisibility = () => setIsOpenMoreInfo((s) => !s);
  const reverseSurahs = () => setIsReversed((s) => !s);

  // ===================== RECITERS =====================
  const reciterNameMap = {
    "ماهر المعيقلي": "Maher Al-Muaiqly",
    "مشاري العفاسي": "Mishary Al-Afasy",
    "عبدالباسط عبدالصمد": "Abdulbasit Abdulsamad",
    "سعود الشريم": "Saud Al-Shuraim",
    "عبدالرحمن السديس": "Abdulrahman Al-Sudais",
  };

  const [reciters, setReciters] = useState([]);
  const [loadingReciters, setLoadingReciters] = useState(false);
  const [selectedReciterOption, setSelectedReciterOption] = useState(null);

  useEffect(() => {
    const fetchReciters = async () => {
      setLoadingReciters(true);
      try {
        const response = await fetch(
          "https://www.mp3quran.net/api/v3/reciters",
        );
        const data = await response.json();
        setReciters(data?.reciters || []);
      } catch (error) {
        setIsErrorFetching(true);
      } finally {
        setLoadingReciters(false);
      }
    };
    fetchReciters();
  }, []);

  const recitersOptions = useMemo(() => {
    if (!reciters?.length || !selectedSurah) return [];
    return reciters
      .filter((r) =>
        r?.moshaf?.[0]?.surah_list?.split(",")?.includes(String(selectedSurah)),
      )
      .map((r) => {
        const surahIndex =
          selectedSurah < 10 ? "00" : selectedSurah < 100 ? "0" : "";
        const surahUrl = `${r.moshaf[0].server}${surahIndex}${selectedSurah}.mp3`;

        const reciterName =
          language === "en"
            ? reciterNameMap[r.name] || r.name
            : `${r.name} - ${r.moshaf[0].name}`;

        return { value: surahUrl, label: reciterName };
      });
    // eslint-disable-next-line
  }, [reciters, selectedSurah, language]);

  const handleReciterSelect = (opt) => {
    setSelectedReciterOption(opt || null);
    if (!opt) return;
    if (autoPlayReciter) src(opt);
    if (autoPlayReciter)
      audioName(language === "ar" ? allAyahs.name : allAyahs.englishName);
  };

  const playSelectedReciter = () => {
    if (selectedReciterOption) {
      src(selectedReciterOption);
      audioName(language === "ar" ? allAyahs.name : allAyahs.englishName);
    }
  };

  // ===================== PAGINATION LISTS =====================
  // Explanation
  const totalAyahsExplanation = surahData?.ayahs?.length || 0;
  const totalPagesExplanation = Math.ceil(
    totalAyahsExplanation / itemsPerPageExplanation,
  );
  const indexOfLastAyahExplanation =
    currentPageExplanation * itemsPerPageExplanation;
  const indexOfFirstAyahExplanation =
    indexOfLastAyahExplanation - itemsPerPageExplanation;

  const currentAyahsExplanation = useMemo(() => {
    return (
      surahData?.ayahs?.slice(
        indexOfFirstAyahExplanation,
        indexOfLastAyahExplanation,
      ) || []
    );
  }, [surahData, indexOfFirstAyahExplanation, indexOfLastAyahExplanation]);

  // Reading
  const totalAyahsReading = allAyahs?.ayahs?.length || 0;
  const totalPagesReading = Math.ceil(totalAyahsReading / itemsPerPageReading);
  const indexOfLastAyahReading = currentPageReading * itemsPerPageReading;
  const indexOfFirstAyahReading = indexOfLastAyahReading - itemsPerPageReading;

  const currentAyahsReading = useMemo(() => {
    return (
      allAyahs?.ayahs?.slice(indexOfFirstAyahReading, indexOfLastAyahReading) ||
      []
    );
  }, [allAyahs, indexOfFirstAyahReading, indexOfLastAyahReading]);

  // Modal
  const totalAyahsModal = allAyahs?.ayahs?.length || 0;
  const totalPagesModal = Math.ceil(totalAyahsModal / itemsPerPageModal);
  const indexOfLastAyahModal = currentPageModal * itemsPerPageModal;
  const indexOfFirstAyahModal = indexOfLastAyahModal - itemsPerPageModal;

  const currentAyahsModal = useMemo(() => {
    return (
      allAyahs?.ayahs?.slice(indexOfFirstAyahModal, indexOfLastAyahModal) || []
    );
  }, [allAyahs, indexOfFirstAyahModal, indexOfLastAyahModal]);

  // ===================== FIX: TAFSIR TO AYAH SCROLL =====================
  useEffect(() => {
    pageAyahRefs.current = currentAyahsExplanation.map(
      (_, i) => pageAyahRefs.current[i] || React.createRef(),
    );
  }, [currentAyahsExplanation]);

  useEffect(() => {
    if (pendingTafsirScrollIndex === null) return;

    if (
      pendingTafsirScrollIndex < indexOfFirstAyahExplanation ||
      pendingTafsirScrollIndex >= indexOfLastAyahExplanation
    ) {
      return;
    }

    const localIndex = pendingTafsirScrollIndex - indexOfFirstAyahExplanation;
    const ref = pageAyahRefs.current[localIndex];
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: isSmallScreen ? "start" : "center",
      });
      ref.current.parentElement?.classList?.add("scrolled-ayah");
      setTimeout(
        () => ref.current?.parentElement?.classList?.remove("scrolled-ayah"),
        3500,
      );
      setPendingTafsirScrollIndex(null);
    }
  }, [
    pendingTafsirScrollIndex,
    indexOfFirstAyahExplanation,
    indexOfLastAyahExplanation,
    currentAyahsExplanation,
    isSmallScreen,
  ]);

  // ===================== FIX: READING SEARCH JUMP (SCROLL TO WORD) =====================
  const scrollCardToFirstMark = (card) => {
    if (!card) return;
    // find first mark and bring it to center
    const mark = card.querySelector("mark.quran-mark");
    if (mark) {
      mark.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (pendingReadingScrollIndex === null) return;
    if (
      pendingReadingScrollIndex < indexOfFirstAyahReading ||
      pendingReadingScrollIndex >= indexOfLastAyahReading
    ) {
      return;
    }

    const localIndex = pendingReadingScrollIndex - indexOfFirstAyahReading;
    const container = ayahsRef.current;
    if (container) {
      const cards = container.querySelectorAll("[data-ayah-card='1']");
      const card = cards[localIndex];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("scrolled-ayah");
        setTimeout(() => card.classList.remove("scrolled-ayah"), 3500);

        // scroll to the word highlight after render
        setTimeout(() => scrollCardToFirstMark(card), 120);
      }
      setPendingReadingScrollIndex(null);
    }
  }, [
    pendingReadingScrollIndex,
    indexOfFirstAyahReading,
    indexOfLastAyahReading,
  ]);

  // ===================== SINGLE AYAH TAFSIR MODAL =====================
  const getSingleAyahTafsir = async (ayahIndex0) => {
    const surahNumber = allAyahs?.number;
    if (!surahNumber) return;

    // Resolves from cache once the surah-level effects above have run.
    let ayahTfasir;
    try {
      const { Surahs } = await loadArabicTafsir();
      ayahTfasir = Surahs?.find((t) => t.number === Number(surahNumber));
    } catch {
      return;
    }
    if (!ayahTfasir) return;

    const arab = ayahTfasir.ayahs?.[ayahIndex0]?.tafsir || "";
    const eng =
      englishTafsir?.find((a) => a.ayah_number === String(ayahIndex0 + 1))
        ?.text || "";

    let html = "";
    if (quranLangs === "Arabe") html = `<p class='dr-rtl'>${arab}</p>`;
    else if (quranLangs === "English")
      html = `<p class='dr-ltr my-2'>${eng}</p>`;
    else {
      html = `<div>
        <p class='dr-rtl my-2'>${arab}</p>
        <hr />
        <p class='dr-ltr my-2'>${eng}</p>
      </div>`;
    }

    setSingleAyahTafsirText(DOMPurify.sanitize(html));
    setOpenAyahTafsirModal(true);
  };

  // ===================== PAGINATION HANDLERS =====================
  const handleNextPageExplanation = () => {
    setCurrentPageExplanation((prev) => {
      const newPage = Math.min(prev + 1, totalPagesExplanation);
      if (persistProgress)
        localStorage.setItem("explainedPage", String(newPage));
      return newPage;
    });
    toTop?.();
  };

  const handlePrevPageExplanation = () => {
    setCurrentPageExplanation((prev) => {
      const newPage = Math.max(prev - 1, 1);
      if (persistProgress)
        localStorage.setItem("explainedPage", String(newPage));
      return newPage;
    });
    toTop?.();
  };

  const handleNextPageReading = () => {
    setCurrentPageReading((prev) => Math.min(prev + 1, totalPagesReading));
    toTop?.();
  };
  const handlePrevPageReading = () => {
    setCurrentPageReading((prev) => Math.max(prev - 1, 1));
    toTop?.();
  };

  const handleNextPageModal = () => {
    setCurrentPageModal((prev) => {
      const newPage = Math.min(prev + 1, totalPagesModal);
      if (persistProgress)
        localStorage.setItem("quranModalPage", String(newPage));
      return newPage;
    });
    modalContainer.current?.parentElement?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevPageModal = () => {
    setCurrentPageModal((prev) => {
      const newPage = Math.max(prev - 1, 1);
      if (persistProgress)
        localStorage.setItem("quranModalPage", String(newPage));
      return newPage;
    });
    modalContainer.current?.parentElement?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================== TABS =====================
  const handleTabChange = (_e, newValue) => setTabValue(newValue);

  // ===================== OPTIONS =====================
  const options = {
    ar: [
      { value: "Arabe", text: "🇸🇦 العربية" },
      { value: "English", text: "🇬🇧 الإنجليزية" },
      { value: "Together", text: " العربية + الإنجليزية 🌐" },
    ],
    en: [
      { value: "Arabe", text: "🇸🇦 Arabic" },
      { value: "English", text: "🇬🇧 English" },
      { value: "Together", text: "🌐 Arabic + English" },
    ],
  };
  const currentOptions = language === "ar" ? options.ar : options.en;

  // ===================== BISMILLAAH =====================
  const arabicText = "🌸 بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ 🌸";
  const englishText =
    "In the name of God, The Most Gracious, The Dispenser of Grace";

  const getQuranText = () => {
    if (quranLangs === "English") return englishText;
    if (quranLangs === "Arabe") return arabicText;
    return (
      <div className="d-flex flex-column gap-2">
        <span>{arabicText}</span>
        <span>{englishText}</span>
      </div>
    );
  };

  // ===================== SURAH FILTER (REMOVE TASHKEEL) =====================
  const filteredSurahs = useMemo(() => {
    const q = normalizeForSearch(surahSearch);
    const list = isReversed ? [...surahs].reverse() : surahs;
    if (!q) return list;

    return list.filter((s) => {
      const a = normalizeForSearch(s.name || "");
      const e = normalizeForSearch(s.englishName || "");
      const n = String(s.number);
      return a.includes(q) || e.includes(q) || n.includes(q);
    });
  }, [surahs, surahSearch, isReversed]);

  // ===================== AYAH SEARCH (REMOVE TASHKEEL) =====================
  const matchedAyahIndices = useMemo(() => {
    const q = normalizeForSearch(ayahSearch);
    if (!q || !allAyahs?.ayahs?.length) return [];

    const matches = [];
    for (let i = 0; i < allAyahs.ayahs.length; i++) {
      const ar = normalizeForSearch(allAyahs.ayahs[i]?.text || "");
      const en = normalizeForSearch(apiTranslation[i]?.text || "");
      if (ar.includes(q) || en.includes(q)) matches.push(i);
    }
    return matches;
  }, [ayahSearch, allAyahs, apiTranslation]);

  const jumpToMatch = (globalIndex0) => {
    const page = Math.floor(globalIndex0 / itemsPerPageReading) + 1;
    setCurrentPageReading(page);
    setPendingReadingScrollIndex(globalIndex0);
    toTop?.();
  };

  // ===================== TAFSIR "TO AYAH" =====================
  const handleTafsirToAyah = (e) => {
    const val = e.target.value;
    if (val === "-1") return;
    const globalIndex0 = parseInt(val, 10);
    if (Number.isNaN(globalIndex0)) return;

    const page = Math.floor(globalIndex0 / itemsPerPageExplanation) + 1;
    setCurrentPageExplanation(page);
    if (persistProgress) localStorage.setItem("explainedPage", String(page));
    setPendingTafsirScrollIndex(globalIndex0);
  };

  // ===================== REACT-SELECT STYLES (BORDER ALWAYS VISIBLE) =====================
  const selectStyles = {
    container: (provided) => ({
      ...provided,
      minWidth: "200px",
      width: "100%",
    }),
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "var(--card-color)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: state.isFocused
        ? "var(--surah-hover-color)"
        : "var(--select-border, rgba(255,255,255,0.28))",
      boxShadow: state.isFocused
        ? "0 0 0 3px rgba(199, 21, 133, 0.18)"
        : "none",
      color: "var(--text-color)",
      minHeight: 44,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--card-color)",
      border: "1px solid var(--select-border, rgba(255,255,255,0.18))",
      overflow: "hidden",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "rgba(199, 21, 133, 0.35)"
        : state.isFocused
          ? "rgba(199, 21, 133, 0.15)"
          : "var(--card-color)",
      color: state.isSelected ? "white" : "var(--text-color)",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--text-color)",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--text-color)",
      opacity: 0.8,
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--text-color)",
    }),
  };

  // ===================== DIR =====================
  const rootDir = language === "ar" ? "rtl" : "ltr";

  return (
    <div className="quran" dir={rootDir}>
      {isLoading ? (
        <div className="loader-container">
          <div className="loader">
            <div className="spinner" />
            <img src={logo} alt="Loading..." />
          </div>
        </div>
      ) : (
        <>
          {/* ===================== HEADER / META ===================== */}
          <div className="data-container shadow-4 card mb-4 p-2">
            <div className="meta-header">
              <div className="metaData">
                <span>{translations.numberOfAyahs}</span>
                <span>{translations.numberOfSurahs}</span>
                <span>{translations.numberOfSajdahs}</span>
                <span>{translations.numberOfRukoos}</span>
              </div>

              <div className="meta-actions">
                <button
                  className="quran-icon-btn"
                  onClick={() => setOpenSettings(true)}
                  title={language === "ar" ? "الإعدادات" : "Settings"}
                >
                  <SettingsOutlinedIcon className="icon" />
                </button>

                <button
                  className="quran-icon-btn"
                  onClick={reverseSurahs}
                  title={language === "ar" ? "عكس السور" : "Reverse surahs"}
                >
                  <SyncIcon className={`icon ${isReversed ? "warn" : ""}`} />
                </button>

                <button
                  className="pill-btn"
                  onClick={toggleVisibility}
                  title={language === "ar" ? "المزيد" : "More"}
                >
                  {isOpenMoreInfo
                    ? language === "ar"
                      ? "أقل"
                      : "Less"
                    : language === "ar"
                      ? "المزيد"
                      : "More"}
                </button>
              </div>
            </div>

            <div
              className={`additional-infos mb-2 ${
                isOpenMoreInfo ? "show" : ""
              }`}
            >
              <span>{translations.numberOfPages}</span>
              <span>{translations.numberOfManazil}</span>
              <span>{translations.numberOfQuarterHizbs}</span>
              <span>{translations.numberOfJuz}</span>
            </div>
          </div>

          {/* ===================== SURAH SEARCH BAR ===================== */}
          <div className="quran-toolbar">
            <div className="quran-search">
              <SearchOutlinedIcon className="icon" />
              <input
                className="quran-search-input"
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                placeholder={
                  language === "ar" ? "ابحث عن سورة..." : "Search surah..."
                }
              />
              {!!surahSearch && (
                <button
                  className="clear-btn"
                  onClick={() => setSurahSearch("")}
                  title="Clear"
                >
                  <CloseOutlinedIcon className="icon" />
                </button>
              )}
            </div>
          </div>

          {/* ===================== SURAH LIST ===================== */}
          <div className="surahs" ref={surahsRef}>
            {filteredSurahs.length ? (
              filteredSurahs.map((surah) => (
                <div
                  className={`surah ${
                    selectedSurah === surah.number ? "selected-surah" : ""
                  }`}
                  key={surah.number}
                  ref={
                    selectedSurah === surah.number
                      ? (el) => (selectedSurahRef.current = el)
                      : null
                  }
                  onClick={() => handleSurahClick(surah)}
                >
                  <div className="surah-number pe-none">{surah.number}</div>

                  <div className="surah-names pe-none">
                    <div className="surah-arabic-name">
                      {language === "ar" ? surah.name : surah.englishName}
                    </div>
                    <h5 className="surah-english-name">
                      {language === "ar" ? surah.englishName : surah.name}
                    </h5>
                  </div>

                  <div className="surah-infos pe-none mx-2 mt-2">
                    <p className="surah-ayahs mb-1">
                      <span>{surah.ayahs.length}</span>{" "}
                      {language === "ar" ? "آية" : "Ayahs"}
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
              <span>{language === "ar" ? "لا توجد نتائج" : "No results"}</span>
            )}
          </div>

          {/* ===================== AYAHS VIEW ===================== */}
          <div className="ayahs p-0" ref={ayahsRef}>
            <div className="back" onClick={goBack}>
              X
            </div>

            {allAyahs && (
              <Box className="w-100">
                <div className="surah-title mt-2 w-100 text-center fs-3">
                  ✧ {language === "ar" ? allAyahs.name : allAyahs.englishName} ✧
                </div>

                {/* Reciter + info */}
                <div className="controls-row">
                  {autoPlayReciter && (
                    <div className="quran-listen-btn d-none d-lg-flex d-md-flex">
                      <SlowMotionVideoOutlinedIcon className="mx-2 icon" />
                      <span style={{ textWrap: "nowrap" }}>
                        {language === "ar"
                          ? "سيتم تشغيل التلاوة بمجرد اختيار القارئ"
                          : "The recitation will start as soon as the reciter is selected"}
                      </span>
                    </div>
                  )}

                  <div className="reciter-wrap">
                    <Select
                      options={loadingReciters ? [] : recitersOptions}
                      isLoading={loadingReciters}
                      onChange={handleReciterSelect}
                      className="reciters-select"
                      placeholder={
                        loadingReciters
                          ? language === "ar"
                            ? "⏳ الرجاء الانتظار..."
                            : "⏳ Please wait..."
                          : language === "ar"
                            ? "اختر القارئ..."
                            : "Choose reciter..."
                      }
                      noOptionsMessage={() =>
                        loadingReciters
                          ? language === "ar"
                            ? "جاري التحميل..."
                            : "Loading..."
                          : language === "ar"
                            ? "لا توجد نتائج"
                            : "No options"
                      }
                      styles={selectStyles}
                    />
                    {!autoPlayReciter && (
                      <button
                        className="pill-btn pill-btn-primary"
                        onClick={playSelectedReciter}
                        disabled={!selectedReciterOption}
                      >
                        {language === "ar" ? "تشغيل" : "Play"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <Box className="my-2 w-100">
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Quran Tabs"
                    className="navs shadow-1-strong rounded-2 mx-2"
                    variant="fullWidth"
                  >
                    <Tab
                      label={language === "ar" ? "القراءة" : "Reading"}
                      className="quranTabs"
                      value={0}
                      sx={{
                        color:
                          tabValue === 0
                            ? "mediumvioletred !important"
                            : "var(--text-color)",
                        fontWeight: tabValue === 0 ? "bold" : "normal",
                      }}
                    />
                    <Tab
                      label={language === "ar" ? "التفسير" : "Explanation"}
                      className="quranTabs"
                      value={1}
                      sx={{
                        color:
                          tabValue === 1
                            ? "mediumvioletred !important"
                            : "var(--text-color)",
                        fontWeight: tabValue === 1 ? "bold" : "normal",
                      }}
                    />
                  </Tabs>

                  {/* ===================== TAB: READING ===================== */}
                  <TabPanel value={tabValue} index={0}>
                    <div className="w-100 h-100 p-2">
                      {/* top controls */}
                      <div
                        className={`top-row ${
                          language === "ar" ? "rtl" : "ltr"
                        }`}
                      >
                        <select
                          className="form-select"
                          value={quranLangs}
                          onChange={(e) => setQuranLangs(e.target.value)}
                          style={{
                            minWidth: "180px",
                            borderColor:
                              "var(--select-border, rgba(47, 35, 35, 0.84))",
                            borderRadius: "8px",
                          }}
                        >
                          {currentOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.text}
                            </option>
                          ))}
                        </select>

                        <div className="top-actions">
                          <button
                            className="quran-icon-btn"
                            onClick={() => setShowSearch((s) => !s)}
                            title={
                              language === "ar"
                                ? "بحث داخل السورة"
                                : "Search inside surah"
                            }
                          >
                            <SearchOutlinedIcon className="icon" />
                          </button>

                          <button
                            className="quran-icon-btn"
                            onClick={() => setLayout("fullscreen")}
                            title={
                              language === "ar" ? "ملء الشاشة" : "Fullscreen"
                            }
                          >
                            <ZoomOutMapOutlinedIcon className="icon" />
                          </button>
                        </div>
                      </div>

                      {/* search inside surah */}
                      {showSearch && (
                        <div className="ayah-search-box">
                          <div className="quran-search">
                            <SearchOutlinedIcon className="icon" />
                            <input
                              className="quran-search-input"
                              value={ayahSearch}
                              onChange={(e) => setAyahSearch(e.target.value)}
                              placeholder={
                                language === "ar"
                                  ? "ابحث عن آية (نص عربي/ترجمة)..."
                                  : "Search ayah (Arabic/English)..."
                              }
                            />
                            {!!ayahSearch && (
                              <button
                                className="clear-btn"
                                onClick={() => setAyahSearch("")}
                                title="Clear"
                              >
                                <CloseOutlinedIcon className="icon" />
                              </button>
                            )}
                          </div>

                          {!!ayahSearch && (
                            <div className="match-row">
                              <span className="muted">
                                {language === "ar"
                                  ? `عدد النتائج: ${matchedAyahIndices.length}`
                                  : `Matches: ${matchedAyahIndices.length}`}
                              </span>

                              <div className="match-chips">
                                {matchedAyahIndices.slice(0, 12).map((idx0) => (
                                  <button
                                    key={idx0}
                                    className="chip-btn"
                                    onClick={() => jumpToMatch(idx0)}
                                  >
                                    {idx0 + 1}
                                  </button>
                                ))}
                                {matchedAyahIndices.length > 12 && (
                                  <span className="muted">
                                    +{matchedAyahIndices.length - 12}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* bismillah */}
                      <div
                        className={
                          allAyahs.number === 1 || allAyahs.number === 9
                            ? "d-none"
                            : "w-100 text-center me-3 mt-3 mb-3"
                        }
                      >
                        {getQuranText()}
                      </div>

                      {/* ayahs */}
                      <div className="ayah w-100">
                        {currentAyahsReading.map((ayah, i) => {
                          const globalIndex0 = indexOfFirstAyahReading + i;
                          const ayahNumber = globalIndex0 + 1;

                          const arabic =
                            allAyahs.number !== 1
                              ? ayah.text.replace(
                                  "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                  "",
                                )
                              : ayah.text;

                          const english =
                            apiTranslation?.[globalIndex0]?.text?.replace(
                              /^[;:!]/,
                              "",
                            ) || "";

                          const dir = quranLangs === "English" ? "ltr" : "rtl";

                          const hideBism =
                            ayah.text ===
                              "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" &&
                            allAyahs.number !== 1;

                          if (hideBism) return null;

                          return (
                            <div
                              key={ayahNumber}
                              data-ayah-card="1"
                              className="ayah-text"
                              style={{ direction: dir }}
                              onClick={() => getSingleAyahTafsir(globalIndex0)}
                            >
                              <p className="pe-none mt-3">
                                {(quranLangs === "Arabe" ||
                                  quranLangs === "Together") && (
                                  <>
                                    {highlightText(arabic, ayahSearch)}
                                    {quranLangs === "Together" && <br />}
                                  </>
                                )}

                                {(quranLangs === "English" ||
                                  quranLangs === "Together") && (
                                  <span
                                    className="dr-ltr"
                                    style={{ color: "var(--text-color)" }}
                                  >
                                    {highlightText(
                                      english ||
                                        (language === "ar"
                                          ? "جاري التحميل..."
                                          : "Loading..."),
                                      ayahSearch,
                                    )}
                                    {quranLangs === "Together" && <br />}
                                  </span>
                                )}
                              </p>

                              <p
                                className={`ayah-number ${
                                  quranLangs === "English" ? "ltr" : ""
                                }`}
                              >
                                {ayahNumber}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Reading */}
                      {totalAyahsReading > itemsPerPageReading && (
                        <div
                          className="pagination-controls d-flex justify-content-between align-items-center mt-4"
                          style={{
                            direction: language === "ar" ? "rtl" : "ltr",
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={handlePrevPageReading}
                            disabled={currentPageReading === 1}
                          >
                            {language === "ar" ? "السابق" : "Previous"}
                          </Button>
                          <span>
                            {language === "ar"
                              ? `صفحة ${currentPageReading} من ${totalPagesReading}`
                              : `Page ${currentPageReading} of ${totalPagesReading}`}
                          </span>
                          <Button
                            variant="outlined"
                            onClick={handleNextPageReading}
                            disabled={currentPageReading === totalPagesReading}
                          >
                            {language === "ar" ? "التالي" : "Next"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabPanel>

                  {/* ===================== TAB: TAFSIR ===================== */}
                  <TabPanel value={tabValue} index={1}>
                    <div className="tafseer-controls d-flex flex-row gap-3 w-100">
                      <select
                        className="form-select"
                        value={tafseerLangs}
                        onChange={(e) => setTafseerLangs(e.target.value)}
                      >
                        <option value="arabe">
                          {language === "ar" ? "🇸🇦 العربية" : "Arabic 🇸🇦"}
                        </option>
                        <option value="english">
                          {language === "ar" ? "🇬🇧 الانجليزية" : "English 🇬🇧"}
                        </option>
                      </select>

                      <select
                        className="form-select"
                        onChange={handleTafsirToAyah}
                        defaultValue="-1"
                      >
                        <option value="-1">
                          {tafseerLangs === "english" ? "To Ayah" : "الى الأية"}
                        </option>
                        {Array.from(
                          { length: totalAyahsExplanation },
                          (_, i) => (
                            <option key={i} value={i}>
                              {i + 1}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {surahData && (
                      <div
                        className="tafseer"
                        style={{
                          direction: tafseerLangs === "arabe" ? "rtl" : "ltr",
                        }}
                      >
                        {currentAyahsExplanation.map((ayah, i) => {
                          const globalIndex0 = indexOfFirstAyahExplanation + i;
                          const ayahNum = globalIndex0 + 1;

                          const arabicTafsir =
                            allSurahTafseer?.ayahs?.find(
                              (t) => t.number === ayahNum,
                            )?.tafsir || "التفسير غير متاح";

                          const englishTafsirText =
                            englishTafsir?.find(
                              (a) => a.ayah_number === String(ayahNum),
                            )?.text || "Explanation not available";

                          const ayahText =
                            tafseerLangs === "arabe"
                              ? (
                                  allAyahs?.ayahs?.[globalIndex0]?.text || ""
                                ).replace(
                                  allAyahs?.number !== 1
                                    ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
                                    : "",
                                  "",
                                )
                              : (
                                  apiTranslation?.[globalIndex0]?.text || ""
                                ).replace(/^[;:!]/, "");

                          return (
                            <div key={ayahNum}>
                              <div
                                className="ayah-text mb-2"
                                style={{
                                  direction:
                                    tafseerLangs === "arabe" ? "rtl" : "ltr",
                                }}
                              >
                                <p
                                  className="w-100 ayah-in-tafseer mt-3"
                                  ref={pageAyahRefs.current[i]}
                                >
                                  ۞ {ayahText} ۞
                                </p>
                                <p
                                  className={`ayah-number ${
                                    tafseerLangs === "english" ? "ltr" : "rtl"
                                  }`}
                                >
                                  {ayahNum}
                                </p>
                              </div>

                              {tafsirLoader ? (
                                <span>
                                  {language === "ar"
                                    ? "جاري العمل..."
                                    : "Loading..."}
                                </span>
                              ) : (
                                <div className="tafseer-text">
                                  {tafseerLangs === "arabe" && (
                                    <p className="mb-3">{arabicTafsir}</p>
                                  )}
                                  {tafseerLangs === "english" && (
                                    <p className="mb-3 ltr">
                                      {englishTafsirText}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {totalPagesExplanation > 1 && (
                      <div
                        className="pagination-controls d-flex justify-content-between align-items-center mt-4"
                        style={{ direction: language === "ar" ? "rtl" : "ltr" }}
                      >
                        <Button
                          variant="outlined"
                          onClick={handlePrevPageExplanation}
                          disabled={currentPageExplanation === 1}
                        >
                          {language === "ar" ? "السابق" : "Previous"}
                        </Button>
                        <span>
                          {language === "ar"
                            ? `صفحة ${currentPageExplanation} من ${totalPagesExplanation}`
                            : `Page ${currentPageExplanation} of ${totalPagesExplanation}`}
                        </span>
                        <Button
                          variant="outlined"
                          onClick={handleNextPageExplanation}
                          disabled={
                            currentPageExplanation === totalPagesExplanation
                          }
                        >
                          {language === "ar" ? "التالي" : "Next"}
                        </Button>
                      </div>
                    )}
                  </TabPanel>
                </Box>

                {/* ===================== FULLSCREEN MODAL ===================== */}
                <Modal open={!!layout} onClose={() => setLayout(undefined)}>
                  <ModalDialog
                    layout={layout}
                    style={{
                      backgroundColor: "var(--card-color)",
                      width: "100%",
                      padding: "1px",
                    }}
                  >
                    <ModalClose
                      className="close-modal"
                      sx={{ zIndex: "999" }}
                    />
                    <DialogContent>
                      <div ref={modalContainer} className="modalWrap">
                        {currentPageModal < 2 && (
                          <p className="mx-2 m-2 w-100 text-center surah-title fs-3">
                            ✧ {allAyahs?.name} ✧
                          </p>
                        )}

                        <div
                          className={
                            allAyahs?.number === 1 || allAyahs?.number === 9
                              ? "d-none"
                              : "w-100 text-center me-3 my-3"
                          }
                        >
                          {currentPageModal < 2 ? getQuranText() : null}
                        </div>

                        <section
                          className={`modal-section ${
                            quranLangs === "English" ? "ltr" : "rtl"
                          }`}
                        >
                          <p className="modal-ayahs-container">
                            {currentAyahsModal.map((ayah, i) => {
                              const globalIndex0 = indexOfFirstAyahModal + i;
                              const ayahNum = globalIndex0 + 1;

                              const arabic =
                                allAyahs.number !== 1
                                  ? ayah.text.replace(
                                      "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                      "",
                                    )
                                  : ayah.text;

                              const english =
                                apiTranslation?.[globalIndex0]?.text?.replace(
                                  /^[;:!]/,
                                  "",
                                ) || "";

                              return (
                                <span
                                  key={ayahNum}
                                  className="modal-ayah"
                                  onClick={() =>
                                    getSingleAyahTafsir(globalIndex0)
                                  }
                                >
                                  {(quranLangs === "Arabe" ||
                                    quranLangs === "Together") && (
                                    <>
                                      {highlightText(arabic, ayahSearch)}
                                      {quranLangs === "Together" && <br />}
                                    </>
                                  )}

                                  {/* FIXED BADGE */}
                                  <span className="ayah-badge">
                                    <span className="ayah-badge-symbol">۝</span>
                                    <span className="ayah-badge-num">
                                      {ayahNum}
                                    </span>
                                  </span>

                                  {(quranLangs === "English" ||
                                    quranLangs === "Together") && (
                                    <>
                                      <span className="dr-ltr">
                                        {highlightText(english, ayahSearch)}
                                      </span>
                                      {quranLangs === "Together" && <hr />}
                                    </>
                                  )}
                                </span>
                              );
                            })}
                          </p>
                        </section>

                        {totalAyahsModal > itemsPerPageModal && (
                          <div
                            className="pagination-controls d-flex justify-content-between align-items-center mt-4"
                            style={{
                              direction: language === "ar" ? "rtl" : "ltr",
                            }}
                          >
                            <Button
                              variant="outlined"
                              onClick={handlePrevPageModal}
                              disabled={currentPageModal === 1}
                            >
                              {language === "ar" ? "السابق" : "Previous"}
                            </Button>
                            <span>
                              {language === "ar"
                                ? `صفحة ${currentPageModal} من ${totalPagesModal}`
                                : `Page ${currentPageModal} of ${totalPagesModal}`}
                            </span>
                            <Button
                              variant="outlined"
                              onClick={handleNextPageModal}
                              disabled={currentPageModal === totalPagesModal}
                            >
                              {language === "ar" ? "التالي" : "Next"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </ModalDialog>
                </Modal>
              </Box>
            )}
          </div>
        </>
      )}

      {/* ===================== SETTINGS MODAL ===================== */}
      <Modal open={openSettings} onClose={() => setOpenSettings(false)}>
        <ModalDialog
          style={{
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            width: "min(520px, 95vw)",
          }}
        >
          <div className="d-flex flex-direction-row justify-content-between">
            <Typography level="h4" sx={{ color: "var(--text-color)", mb: 1 }}>
              {language === "ar" ? "الإعدادات" : "Settings"}
            </Typography>
          </div>

          <Divider sx={{ my: 1, opacity: 0.25 }} />

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-title">
                {language === "ar" ? "حفظ التقدم" : "Persist progress"}
              </div>
              <div className="settings-sub">
                {language === "ar"
                  ? "يحفظ السورة والصفحات الأخيرة"
                  : "Saves last surah + pages"}
              </div>
            </div>
            <Switch
              checked={persistProgress}
              onChange={(e) => setPersistProgress(e.target.checked)}
            />
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-title">
                {language === "ar"
                  ? "تشغيل تلقائي للقارئ"
                  : "Auto-play reciter"}
              </div>
              <div className="settings-sub">
                {language === "ar"
                  ? "تشغيل التلاوة فور اختيار القارئ"
                  : "Play immediately after selecting reciter"}
              </div>
            </div>
            <Switch
              checked={autoPlayReciter}
              onChange={(e) => setAutoPlayReciter(e.target.checked)}
            />
          </div>

          <Divider sx={{ my: 1, opacity: 0.25 }} />

          <Button
            variant="outlined"
            onClick={() => setOpenSettings(false)}
            sx={{
              color: "var(--text-color)",
              borderColor: "var(--select-border, rgba(31, 23, 23, 0.76))",
              borderRadius: "8px",
            }}
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </Button>
        </ModalDialog>
      </Modal>

      {/* ===================== SINGLE AYAH TAFSIR MODAL ===================== */}
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={openAyahTafsirModal}
        onClose={() => setOpenAyahTafsirModal(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: "95%",
            maxHeight: "90%",
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
            backgroundColor: "var(--card-color)",
            overflowY: "auto",
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
              sx={{ color: "var(--main-color)", border: "none" }}
            >
              {language === "ar" ? "التفسير" : "Explanation"}
            </Typography>
          </div>

          <Typography
            id="modal-desc"
            sx={{ color: "var(--text-color)", textAlign: "justify" }}
          >
            {tafsirLoader ? (
              language === "ar" ? (
                "جاري العمل..."
              ) : (
                "Working..."
              )
            ) : singleAyahTafsirText ? (
              <span
                className="alert mb-4 p-0 d-flex flex-column gap-2 text-align-justify"
                dangerouslySetInnerHTML={{ __html: singleAyahTafsirText }}
              />
            ) : (
              <span>{language === "ar" ? "جاري العمل..." : "Loading..."}</span>
            )}
          </Typography>
        </Sheet>
      </Modal>
    </div>
  );
};

// TabPanel
function TabPanel({ children, value, index }) {
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
