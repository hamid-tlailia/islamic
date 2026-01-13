// Tafsir.jsx ✅ FULL FILE (Audio search works + keep ALL audio when no search +
// If user searched single ayah -> show only audios whose ayah-range includes it (fallback to surah if no range)
// If user searched full surah -> show only audios of same surah (by number/name)
// Audio search is independent: if user types in audio search, it will NOT be restricted by text search)

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import DOMPurify from "dompurify";
import { franc } from "franc";
import { toast } from "react-toastify";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import GraphicEqOutlinedIcon from "@mui/icons-material/GraphicEqOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import LibraryMusicOutlinedIcon from "@mui/icons-material/LibraryMusicOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

const TafsirContainer = styled.div`
  padding: 1rem;
  background-color: var(--card-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
`;

const TafsirContent = styled.p`
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
  margin: 0.5rem;
  cursor: pointer;
  background-color: var(--card-color) !important;
  color: var(--text-color) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.14);

  &.active {
    border: 2px solid mediumvioletred;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.18);
  }
`;

const Tafsir = ({ toTop, src, audioName }) => {
  const { language } = useTranslation();

  const [langs, setLangs] = useState("arabic");
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [selectedTafsir, setSelectedTafsir] = useState(null);
  const [tafsirList, setTafsirList] = useState([]);
  const [ayahList, setAyahList] = useState([]);
  const [warning, setWarning] = useState("");
  const [tafsir, setTafsir] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alignmentClass, setAlignmentClass] = useState("w-100 my-3 text-end");
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  const [currentExplainedAyah, setCurrentExplainedAyah] = useState(null);

  // pagination text
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  const parentRef = useRef(null);

  // main tabs (Text / Audio)
  const [tabIndex, setTabIndex] = useState(0);

  // ✅ Track what the user LAST searched in text tafsir
  // mode: "none" | "surah" | "ayah"
  const [lastTextQuery, setLastTextQuery] = useState({
    mode: "none",
    surahNumber: null,
    surahName: "",
    ayahNumber: null,
  });

  // ======================= AUDIO =======================
  const [audioLoading, setAudioLoading] = useState(false);
  const [activeAudioCardId, setActiveAudioCardId] = useState(null);

  // ✅ keep full list always
  const [audioAllData, setAudioAllData] = useState([]); // ALWAYS array

  // audio UI (Audio list / Filter)
  const [audioSubTab, setAudioSubTab] = useState(0); // 0 Audio, 1 Filter

  // ✅ audio independent search
  const [audioQuickSearch, setAudioQuickSearch] = useState(
    localStorage.getItem("audioQuickSearch") || ""
  );

  // pagination audio
  const initialAudioPage =
    parseInt(localStorage.getItem("audioTafsirPage"), 10) || 1;
  const [audioCurrentPage, setAudioCurrentPage] = useState(initialAudioPage);
  const audioItemsPerPage = 10;

  // -------------------- toast error --------------------
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

  // -------------------- tafsir options --------------------
  const tafsirs = useMemo(
    () => ({
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
    }),
    [language]
  );

  // -------------------- fetch surahs --------------------
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/quran/quran-uthmani")
      .then((response) => response.json())
      .then((data) => {
        const surahsData = data?.data?.surahs || [];
        setSurahs(Array.isArray(surahsData) ? surahsData : []);
      })
      .catch(() => setIsErrorFetching(true));
  }, []);

  // update tafsirList for lang
  useEffect(() => {
    if (langs) setTafsirList(tafsirs[langs] || []);
    else setTafsirList([]);
  }, [langs, tafsirs]);

  // ayahList for selected surah
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
    } else setAyahList([]);
  }, [selectedSurah, surahs, language]);

  // -------------------- Load saved selections --------------------
  useEffect(() => {
    const savedLang = localStorage.getItem("savedLang");
    const savedSurah = localStorage.getItem("savedSurah");
    const savedAyah = localStorage.getItem("savedAyah");
    const savedTafsir = localStorage.getItem("savedTafsir");
    const savedCurrentPage = localStorage.getItem("savedCurrentPage");

    if (savedLang) setLangs(savedLang);

    if (savedLang && savedSurah && savedTafsir) {
      setTafsirList(tafsirs[savedLang] || []);

      const tafsirOption = (tafsirs[savedLang] || []).find(
        (t) => t.url === savedTafsir
      );
      if (tafsirOption) {
        setSelectedTafsir({
          label: tafsirOption.name,
          value: tafsirOption.url,
        });
      }

      const surahNumber = parseInt(savedSurah, 10);
      const surah = surahs.find((s) => s.number === surahNumber);
      if (surah) {
        setSelectedSurah({
          label: language === "ar" ? surah.name : surah.englishName,
          value: surah.number,
        });
      }

      if (savedAyah) {
        const ayahNumber = parseInt(savedAyah, 10);
        setSelectedAyah({
          label:
            language === "ar" ? `الآية ${ayahNumber}` : `Ayah ${ayahNumber}`,
          value: ayahNumber,
        });
      }

      if (!savedAyah && savedCurrentPage) {
        setCurrentPage(parseInt(savedCurrentPage, 10));
      }

      handleSubmit(
        savedLang,
        surahNumber,
        savedAyah ? parseInt(savedAyah, 10) : null,
        savedTafsir,
        true
      );
    }

    // audio restore
    const savedActiveAudioCardId = localStorage.getItem("activeAudioCardId");
    if (savedActiveAudioCardId)
      setActiveAudioCardId(parseInt(savedActiveAudioCardId, 10));

    const savedAudioTafsirPage = localStorage.getItem("audioTafsirPage");
    if (savedAudioTafsirPage)
      setAudioCurrentPage(parseInt(savedAudioTafsirPage, 10));

    // eslint-disable-next-line
  }, [surahs]);

  // -------------------- Submit Text Tafsir --------------------
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

    // save to localStorage
    localStorage.setItem("savedLang", langToUse);
    localStorage.setItem("savedSurah", surahToUse);
    if (ayahToUse) {
      localStorage.setItem("savedAyah", ayahToUse);
      localStorage.removeItem("savedCurrentPage");
    } else localStorage.removeItem("savedAyah");
    localStorage.setItem("savedTafsir", tafsirToUse);

    // ✅ set lastTextQuery (this controls audio filtering when audio search is empty)
    const surahObj = surahs.find((s) => s.number === surahToUse);
    const surahNameLabel =
      surahObj && language === "ar" ? surahObj.name : surahObj?.englishName;

    setLastTextQuery({
      mode: ayahToUse ? "ayah" : "surah",
      surahNumber: surahToUse,
      surahName: String(surahNameLabel || ""),
      ayahNumber: ayahToUse ? Number(ayahToUse) : null,
    });

    setLoading(true);
    const tafsirUrl = tafsirToUse;

    // single ayah
    if (ayahToUse) {
      const apiUrl = `${tafsirUrl}/${surahToUse}:${ayahToUse}?words=false`;
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const cleanContent = DOMPurify.sanitize(data?.tafsir?.text || "");
          setTafsir([cleanContent]);
          setOptionsVisible(false);
          setCurrentPage(1);
          setLoading(false);
        })
        .catch(() => {
          setIsErrorFetching(true);
          setLoading(false);
        });
      return;
    }

    // whole surah
    const surah = surahs.find((s) => s.number === surahToUse);
    if (!surah) {
      setLoading(false);
      return;
    }

    const ayahNumbers = Array.from(
      { length: surah.ayahs.length },
      (_, i) => i + 1
    );

    const fetchPromises = ayahNumbers.map(async (ayahNumber) => {
      const apiUrl = `${tafsirUrl}/${surahToUse}:${ayahNumber}?words=false`;
      const response = await fetch(apiUrl);
      return await response.json();
    });

    Promise.all(fetchPromises)
      .then((responses) => {
        const allAyahsTafsir = responses.map((resp) =>
          DOMPurify.sanitize(resp?.tafsir?.text || "")
        );
        setTafsir(allAyahsTafsir);
        setOptionsVisible(false);

        if (fromLocalStorage && localStorage.getItem("savedCurrentPage")) {
          setCurrentPage(
            parseInt(localStorage.getItem("savedCurrentPage"), 10)
          );
        } else {
          setCurrentPage(1);
        }
        setLoading(false);
      })
      .catch(() => {
        setIsErrorFetching(true);
        setLoading(false);
      });
  };

  const handleReset = () => {
    setWarning("");
    setTafsir([]);
    setOptionsVisible(true);
    setCurrentExplainedAyah(null);
    setCurrentPage(1);

    // ✅ no text search anymore => audio shows all (unless audio search is typed)
    setLastTextQuery({
      mode: "none",
      surahNumber: null,
      surahName: "",
      ayahNumber: null,
    });
  };

  // save currentPage when surah tafsir
  useEffect(() => {
    if (!selectedAyah && tafsir.length > 0) {
      localStorage.setItem("savedCurrentPage", currentPage);
    }
  }, [currentPage, selectedAyah, tafsir]);

  // save audio page + audio search
  useEffect(() => {
    localStorage.setItem("audioTafsirPage", String(audioCurrentPage));
  }, [audioCurrentPage]);

  useEffect(() => {
    localStorage.setItem("audioQuickSearch", audioQuickSearch);
  }, [audioQuickSearch]);

  // language detection for alignment
  useEffect(() => {
    if (tafsir.length > 0) {
      const textForDetection = tafsir.slice(0, 3).join(" ");
      const detectedLang = franc(textForDetection);
      const rtlLanguages = ["arb"];
      setAlignmentClass(
        rtlLanguages.includes(detectedLang)
          ? "w-100 my-3 text-end"
          : "w-100 my-3 text-start"
      );
    }
  }, [tafsir]);

  // get explained ayah text (when selected)
  const getExplainedAyahText = async (url) => {
    try {
      const ayahResponse = await fetch(url);
      const data = await ayahResponse.json();
      setCurrentExplainedAyah(data.data);
    } catch {
      setIsErrorFetching(true);
    }
  };

  useEffect(() => {
    if (selectedAyah !== null && selectedSurah && surahs.length > 0) {
      const surahIndex = selectedSurah.value - 1;
      const foundAyahObj = surahs[surahIndex]?.ayahs?.find(
        (a) => a.numberInSurah === selectedAyah.value
      );
      if (!foundAyahObj?.number) return;

      if (langs === "arabic") {
        getExplainedAyahText(
          `https://api.alquran.cloud/v1/ayah/${foundAyahObj.number}`
        );
      } else {
        getExplainedAyahText(
          `https://api.alquran.cloud/v1/ayah/${foundAyahObj.number}/en.asad`
        );
      }
    }
    // eslint-disable-next-line
  }, [selectedAyah, selectedSurah, surahs, langs]);

  // -------------------- Tabs --------------------
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    if (newValue === 1) setAudioSubTab(0);
  };

  // ======================= AUDIO FETCH (ALWAYS ALL) =======================
  const normalizeToArray = (v) => (Array.isArray(v) ? v : []);

  const normalizeMp3QuranResponse = (data) => {
    // mp3quran response often: data.tafasir.soar (array of items)
    // We'll safely try multiple shapes:
    const arr =
      data?.tafasir?.soar ||
      data?.tafsir?.soar ||
      data?.soar ||
      data?.tafasir ||
      data?.tafsir ||
      [];
    return normalizeToArray(arr);
  };

  const fetchAudioAll = () => {
    setAudioLoading(true);
    const languageCode = langs === "arabic" ? "ar" : "eng";
    const url = `https://www.mp3quran.net/api/v3/tafsir?tafsir=1&language=${languageCode}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const arr = normalizeMp3QuranResponse(data);
        setAudioAllData(arr); // ✅ keep full always
        setAudioLoading(false);
      })
      .catch(() => {
        setIsErrorFetching(true);
        setAudioAllData([]); // ✅ always array
        setAudioLoading(false);
      });
  };

  // Fetch audio when entering Audio tab OR language change
  useEffect(() => {
    if (tabIndex === 1) fetchAudioAll();
    // eslint-disable-next-line
  }, [tabIndex, langs]);

  const handlePlayAudio = (url, name, id) => {
    src(url);
    audioName(name);
    setActiveAudioCardId(id);
    localStorage.setItem("activeAudioCardId", String(id));
  };

  // ======================= AUDIO FILTERING LOGIC =======================
  const clean = (s) =>
    String(s || "")
      .toLowerCase()
      .trim();

  const getItemSurahNumber = (item) => {
    // different APIs use different keys
    const n =
      item?.sura ??
      item?.surah ??
      item?.surah_id ??
      item?.sura_id ??
      item?.number ??
      item?.id; // last fallback (not always correct)
    const nn = Number(n);
    return Number.isFinite(nn) && nn > 0 ? nn : null;
  };

  const getItemSurahName = (item) => {
    // mp3quran items often have name
    return String(item?.name || item?.sura_name || item?.surah_name || "");
  };

  const getAyahRangeFromItem = (item) => {
    // Your requirement: single ayah => show audio whose range includes ayah.
    // We don't know exact keys, so we check common possibilities.
    const tryNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const from =
      tryNum(item?.ayah_from) ??
      tryNum(item?.from_ayah) ??
      tryNum(item?.from) ??
      tryNum(item?.start) ??
      tryNum(item?.ayahStart) ??
      tryNum(item?.ayah_start) ??
      null;

    const to =
      tryNum(item?.ayah_to) ??
      tryNum(item?.to_ayah) ??
      tryNum(item?.to) ??
      tryNum(item?.end) ??
      tryNum(item?.ayahEnd) ??
      tryNum(item?.ayah_end) ??
      null;

    if (from !== null && to !== null && from > 0 && to > 0) {
      return { from: Math.min(from, to), to: Math.max(from, to) };
    }
    return null;
  };

  const audioDisplayedData = useMemo(() => {
    const base = Array.isArray(audioAllData) ? audioAllData : [];

    // ✅ If user typed audio search => filter by name ONLY (independent of text search)
    if (clean(audioQuickSearch)) {
      const q = clean(audioQuickSearch);
      return base.filter((item) => clean(getItemSurahName(item)).includes(q));
    }

    // ✅ If no audio search:
    // - If user never searched in text => show ALL
    if (lastTextQuery.mode === "none") return base;

    // - If user searched full surah => show audios of same surah (by number or name)
    if (lastTextQuery.mode === "surah") {
      const targetNum = Number(lastTextQuery.surahNumber) || null;
      const targetName = clean(lastTextQuery.surahName);

      return base.filter((item) => {
        const n = getItemSurahNumber(item);
        if (targetNum && n && n === targetNum) return true;
        // fallback name match
        const nm = clean(getItemSurahName(item));
        if (targetName && nm.includes(targetName)) return true;
        // another fallback: maybe Arabic name stored while UI is English
        // so try matching by selectedSurah label too if exists:
        const label = clean(selectedSurah?.label);
        if (label && nm.includes(label)) return true;
        return false;
      });
    }

    // - If user searched single ayah => show ONLY audios whose range includes ayah
    //   If item has no range fields, fallback to same surah.
    if (lastTextQuery.mode === "ayah") {
      const targetAyah = Number(lastTextQuery.ayahNumber);
      const targetNum = Number(lastTextQuery.surahNumber) || null;
      const targetName = clean(lastTextQuery.surahName);

      return base.filter((item) => {
        const n = getItemSurahNumber(item);
        const range = getAyahRangeFromItem(item);

        // if we have a range => MUST include that ayah
        if (range && Number.isFinite(targetAyah)) {
          const inRange = targetAyah >= range.from && targetAyah <= range.to;
          if (!inRange) return false;

          // if item also has surah number, ensure it's same surah when possible
          if (targetNum && n && n !== targetNum) return false;

          return true;
        }

        // no range info => fallback to surah match
        if (targetNum && n && n === targetNum) return true;
        const nm = clean(getItemSurahName(item));
        if (targetName && nm.includes(targetName)) return true;
        const label = clean(selectedSurah?.label);
        if (label && nm.includes(label)) return true;

        return false;
      });
    }

    return base;
  }, [audioAllData, audioQuickSearch, lastTextQuery, selectedSurah]);

  // reset audio page when displayed list changes
  useEffect(() => {
    setAudioCurrentPage(1);
  }, [
    audioQuickSearch,
    lastTextQuery.mode,
    lastTextQuery.surahNumber,
    lastTextQuery.ayahNumber,
  ]);

  // -------------------- Helpers --------------------
  const getDisplayLangValue = (lang) => {
    if (lang === "arabic") return language === "ar" ? "العربية" : "arabic";
    if (lang === "english") return language === "ar" ? "الإنجليزية" : "english";
    return "";
  };

  const renderDropdowns = () => (
    <div className="card p-2 d-flex flex-column justify-content-center align-items-center gap-4 tafsir-ui-card">
      <div className="tafsir-ui-head">
        <div className="tafsir-ui-title">
          <span className="tafsir-ui-icon">
            <SearchOutlinedIcon />
          </span>
          <div className="tafsir-ui-texts">
            <h5 className="m-0">
              {language === "ar" ? "البحث في التفسير" : "Tafsir Search"}
            </h5>
            <p className="m-0 tafsir-ui-sub">
              {language === "ar"
                ? "اختر اللغة والسورة والآية (اختياري) ثم نوع التفسير"
                : "Choose language, surah, optional ayah, then tafsir source"}
            </p>
          </div>
        </div>
      </div>

      {optionsVisible && (
        <div className="options tafsir-ui-options">
          <FormControl>
            <FormLabel sx={{ color: "var(--text-color)" }}>
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
            <FormLabel sx={{ color: "var(--text-color)" }}>
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
            <FormLabel sx={{ color: "var(--text-color)" }}>
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
                if (newValue) localStorage.removeItem("savedCurrentPage");
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
            <FormLabel sx={{ color: "var(--text-color)" }}>
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

      <div className="tafsir-ui-actions">
        {optionsVisible ? (
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
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleReset}
            startIcon={<RestartAltOutlinedIcon />}
          >
            {langs === "arabic" && language === "ar" ? "إعادة تعيين" : "Reset"}
          </Button>
        )}
      </div>
    </div>
  );

  // -------------------- AUDIO RENDER --------------------
  const renderAudio = () => {
    if (audioLoading) {
      return (
        <div className="w-100 text-center loader-placeholder">
          <CircularProgress />
        </div>
      );
    }

    const list = Array.isArray(audioDisplayedData) ? audioDisplayedData : [];

    const totalPages = Math.max(1, Math.ceil(list.length / audioItemsPerPage));
    const safePage = Math.min(Math.max(audioCurrentPage, 1), totalPages);

    const start = (safePage - 1) * audioItemsPerPage;
    const end = start + audioItemsPerPage;
    const pageItems = list.slice(start, end);

    const explainContext = () => {
      if (audioQuickSearch.trim()) {
        return language === "ar"
          ? "تصفية حسب اسم السورة داخل التفسير الصوتي"
          : "Filtering by surah name inside Audio Tafsir";
      }
      if (lastTextQuery.mode === "ayah") {
        return language === "ar"
          ? `يعرض المقاطع التي تشمل الآية ${lastTextQuery.ayahNumber} من السورة المختارة`
          : `Showing segments that include ayah ${lastTextQuery.ayahNumber} for the selected surah`;
      }
      if (lastTextQuery.mode === "surah") {
        return language === "ar"
          ? `يعرض التفسير الصوتي لنفس السورة: ${lastTextQuery.surahName || ""}`
          : `Showing audio tafsir for the same surah: ${
              lastTextQuery.surahName || ""
            }`;
      }
      return language === "ar"
        ? "لم يتم اختيار تفسير نصي بعد — يتم عرض جميع السور"
        : "No text search yet — showing all surahs";
    };

    return (
      <>
        <div className="tafsir-audio-head">
          <div className="tafsir-audio-head-left">
            <LibraryMusicOutlinedIcon className="tafsir-audio-head-ic" />
            <div>
              <div className="tafsir-audio-head-title">
                {language === "ar" ? "التفسير الصوتي" : "Audio Tafsir"}
              </div>
              <div className="tafsir-audio-head-sub">{explainContext()}</div>
            </div>
          </div>

          <div className="tafsir-audio-head-right">
            <div className="tafsir-audio-searchWrap">
              <SearchOutlinedIcon className="tafsir-audio-searchIc" />
              <input
                className="tafsir-audio-search"
                value={audioQuickSearch}
                onChange={(e) => {
                  setAudioQuickSearch(e.target.value);
                  setAudioCurrentPage(1);
                }}
                placeholder={
                  language === "ar"
                    ? "ابحث باسم السورة (صوتي)..."
                    : "Search by surah name (audio)..."
                }
              />
            </div>

            <button
              type="button"
              className={`tafsir-audio-filterBtn ${
                audioSubTab === 1 ? "active" : ""
              }`}
              onClick={() => setAudioSubTab((t) => (t === 1 ? 0 : 1))}
              title={language === "ar" ? "فلتر" : "Filter"}
            >
              <FilterAltOutlinedIcon />
            </button>
          </div>
        </div>

        {audioSubTab === 1 && (
          <div className="tafsir-audio-filterCard">
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              {language === "ar" ? "خيارات التصفية" : "Filter options"}
            </Typography>

            <div className="tafsir-audio-filterRow">
              <Button
                variant="outlined"
                onClick={() => {
                  setAudioQuickSearch("");
                  setAudioCurrentPage(1);
                }}
              >
                {language === "ar" ? "مسح بحث الصوت" : "Clear audio search"}
              </Button>

              <Button variant="outlined" onClick={() => fetchAudioAll()}>
                {language === "ar" ? "تحديث" : "Refresh"}
              </Button>
            </div>
          </div>
        )}

        <div className="d-flex flex-row gap-2 w-100 justify-content-center align-items-center text-primary p-2">
          <span>
            {language === "ar" ? " الصفحة " : " Page "} {safePage}
          </span>
          <span>
            {language === "ar" ? " من " : " From "} {totalPages}
          </span>
          <span style={{ opacity: 0.7 }}>
            ({list.length} {language === "ar" ? "عنصر" : "items"})
          </span>
        </div>

        {list.length === 0 ? (
          <div className="w-100 text-center my-4" style={{ opacity: 0.85 }}>
            {language === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
          </div>
        ) : (
          <>
            <div className="audio-tafsir-parent w-100">
              {pageItems.map((item) => (
                <AudioTafsirCard
                  key={item.id || item.url}
                  onClick={() => handlePlayAudio(item.url, item.name, item.id)}
                  className={`audio-tafsir-container d-flex flex-row p-2 gap-2 ${
                    item.id === activeAudioCardId ? "active" : ""
                  }`}
                >
                  <GraphicEqOutlinedIcon
                    className={
                      item.id === activeAudioCardId ? "text-primary" : ""
                    }
                  />
                  <CardContent className="d-flex flex-column justify-content-center align-items-center gap-2">
                    <Typography variant="h5" color="primary">
                      {language === "ar"
                        ? "الخلاصة من تفسير الطبري"
                        : "Summary from Tafsir Al-Tabari"}
                    </Typography>
                    <Typography variant="h6">{item.name}</Typography>
                  </CardContent>
                </AudioTafsirCard>
              ))}
            </div>

            <div className="pagination-buttons w-100 text-center d-flex flex-row gap-3 justify-content-center align-items-center my-3">
              {safePage > 1 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setAudioCurrentPage(safePage - 1);
                    toTop?.();
                  }}
                  style={{ marginRight: "10px" }}
                >
                  {language === "ar" ? "السابق" : "Previous"}
                </Button>
              )}
              {safePage < totalPages && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setAudioCurrentPage(safePage + 1);
                    toTop?.();
                  }}
                >
                  {language === "ar" ? "التالي" : "Next"}
                </Button>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  // -------------------- Text Tab content --------------------
  const renderText = () => (
    <>
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
        <div>
          <Loader />
        </div>
      ) : tafsir.length > 0 ? (
        <TafsirContainer>
          {!optionsVisible && (
            <div className="tafsir-result-head">
              {currentExplainedAyah !== null ? (
                <p className="w-100 text-center my-2 explained-ayah d-flex flex-column gap-2 justify-content-center align-items-center">
                  <span>✦ {currentExplainedAyah?.text} ✦</span>
                  <span className="mx-2" style={{ color: "#169777" }}>
                    [
                    {langs === "arabic"
                      ? currentExplainedAyah?.surah?.name
                      : currentExplainedAyah?.surah?.englishName}
                    {" : "}
                    {currentExplainedAyah?.numberInSurah}]
                  </span>
                </p>
              ) : (
                <p className="w-100 text-center my-2 explained-ayah">
                  ✦{" "}
                  {langs === "arabic"
                    ? surahs.find((s) => s.number === selectedSurah?.value)
                        ?.name
                    : surahs.find((s) => s.number === selectedSurah?.value)
                        ?.englishName}{" "}
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
                  className={`w-100 text-primary fw-bold my-3 ${
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
                    style={{
                      direction: langs === "arabic" ? "rtl" : "ltr",
                    }}
                    dangerouslySetInnerHTML={{ __html: tafsirText }}
                  />
                ))}

                <div className="pagination-buttons w-100 text-center d-flex flex-row gap-3 justify-content-center align-items-center my-1">
                  {currentPage > 1 && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        toTop?.();
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
                        toTop?.();
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
      ) : (
        <div className="w-100 my-5 p-4 text-center border rounded shadow d-flex flex-column">
          <span className="text-primary font-weight-bold">
            {language === "ar"
              ? "﴿وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ﴾"
              : "“And fear Allah. And Allah teaches you. And Allah is Knowing of all things.”"}
          </span>
          <span className="mt-1">
            {language === "ar"
              ? "سورة البقرة، الآية 282"
              : "Surah Al-Baqarah, Ayah 282"}
          </span>

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
  );

  return (
    <div ref={parentRef}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        className="tafsir-navs shadow-1-strong rounded-2 mx-2"
        textColor="primary"
        style={{ marginBottom: "1rem" }}
      >
        <Tab
          label={language === "ar" ? "التفسير النصي " : "Text Tafsir"}
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
          label={language === "ar" ? "التفسير المسموع" : "Audio Tafsir"}
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

      {tabIndex === 0 && renderText()}
      {tabIndex === 1 && renderAudio()}
    </div>
  );
};

export default Tafsir;
