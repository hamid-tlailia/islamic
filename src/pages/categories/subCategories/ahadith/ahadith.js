// Ahadith.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ahadith.css";

import {
  Autocomplete as JoyAutocomplete,
  Button,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Typography,
  Modal,
  ModalDialog,
  Input,
  Sheet,
  Divider,
  Switch,
  Tooltip,
  IconButton,
} from "@mui/joy";

import Chip from "@mui/joy/Chip";
import { Pagination, Stack, PaginationItem } from "@mui/material";

import { useTranslation } from "../../../../components/languages/provider";
import Loader from "../../../../components/loader/loader";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import TextIncreaseOutlinedIcon from "@mui/icons-material/TextIncreaseOutlined";
import TextDecreaseOutlinedIcon from "@mui/icons-material/TextDecreaseOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import BookIcon from "@mui/icons-material/Book";
import PersonIcon from "@mui/icons-material/Person";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LayersIcon from "@mui/icons-material/Layers";
import EventIcon from "@mui/icons-material/Event";

import DOMPurify from "dompurify";
import { toast } from "react-toastify";

const API_BASE_URL = "https://hadithapi.com/api";
const API_KEY = "$2y$10$fU2PWbaYN3uvYDyOgAqwOoR2FoASJXazDpMFEnGcEJyxbkGwLJeq";

const SUNNAH_COLLECTION_BASE = {
  "sahih-bukhari": "bukhari",
  "sahih-muslim": "muslim",
  "abu-dawood": "abudawud",
  "al-tirmidhi": "tirmidhi",
  "ibn-e-majah": "ibnmajah",
  "sunan-nasai": "nasai",
  mishkat: "mishkat",
  "musnad-ahmad": "ahmad",
};

const booksList = {
  "sahih-bukhari": { ar: "صحيح البخاري", en: "Sahih Bukhari" },
  "sahih-muslim": { ar: "صحيح مسلم", en: "Sahih Muslim" },
  "al-tirmidhi": { ar: "جامع الترمذي", en: "Jami' At-Tirmidhi" },
  "abu-dawood": { ar: "سنن أبي داود", en: "Sunan Abi Dawud" },
  "ibn-e-majah": { ar: "سنن ابن ماجه", en: "Sunan Ibn Majah" },
  "sunan-nasai": { ar: "سنن النسائي", en: "Sunan An-Nasa'i" },
  mishkat: { ar: "مشكاة المصابيح", en: "Mishkat Al-Masabih" },
  "musnad-ahmad": { ar: "مسند أحمد", en: "Musnad Ahmad" },
  "al-silsila-sahiha": { ar: "السلسلة الصحيحة", en: "Al-Silsila Sahiha" },
};

const writerInfo = {
  "sahih-bukhari": {
    writerName: { en: "Imam Bukhari", ar: "الإمام البخاري" },
    writerDeath: { en: "256 AH", ar: "256 هـ" },
  },
  "sahih-muslim": {
    writerName: { en: "Imam Muslim", ar: "الإمام مسلم" },
    writerDeath: { en: "261 AH", ar: "261 هـ" },
  },
  "al-tirmidhi": {
    writerName: { en: "Imam At-Tirmidhi", ar: "الإمام الترمذي" },
    writerDeath: { en: "279 AH", ar: "279 هـ" },
  },
  "abu-dawood": {
    writerName: { en: "Imam Abu Dawood", ar: "الإمام أبو داود" },
    writerDeath: { en: "275 AH", ar: "275 هـ" },
  },
  "ibn-e-majah": {
    writerName: { en: "Imam Ibn Majah", ar: "الإمام ابن ماجه" },
    writerDeath: { en: "273 AH", ar: "273 هـ" },
  },
  "sunan-nasai": {
    writerName: { en: "Imam An-Nasa'i", ar: "الإمام النسائي" },
    writerDeath: { en: "303 AH", ar: "303 هـ" },
  },
  mishkat: {
    writerName: { en: "Imam Khatib at-Tabrizi", ar: "الإمام الخطيب التبريزي" },
    writerDeath: { en: "741 AH", ar: "741 هـ" },
  },
};

function safeJsonParse(maybeString) {
  try {
    return typeof maybeString === "string"
      ? JSON.parse(maybeString)
      : maybeString;
  } catch {
    return null;
  }
}

function removeTashkeel(str = "") {
  return str
    .replace(/[\u0610-\u061A]/g, "")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[\u0670]/g, "")
    .replace(/[\u06D6-\u06ED]/g, "");
}

function normalizeArabic(str = "") {
  return removeTashkeel(str)
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMatnArabic(hadithArabic = "") {
  const text = (hadithArabic || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const separators = [
    "قال رسول الله صلى الله عليه وسلم:",
    "قال رسول الله ﷺ:",
    "عن النبي صلى الله عليه وسلم قال:",
    "عن النبي ﷺ قال:",
    "قَالَ:",
    "قال:",
    "يقول:",
    ":",
  ];

  for (const sep of separators) {
    const idx = text.indexOf(sep);
    if (idx !== -1) {
      const after = text.slice(idx + sep.length).trim();
      if (after.length >= 15) return after;
    }
  }
  return text;
}

function limitWords(text = "", maxWords = 35, maxChars = 240) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const words = t.split(" ");
  const sliced = words.slice(0, maxWords).join(" ");
  return sliced.length > maxChars ? sliced.slice(0, maxChars).trim() : sliced;
}

async function fetchDorarBySKey(skey) {
  const apiUrl = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(
    skey
  )}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
    apiUrl
  )}`;
  const resp = await fetch(proxyUrl);
  if (!resp.ok) throw new Error(`Dorar proxy failed ${resp.status}`);
  const data = await resp.json();
  const parsed = safeJsonParse(data.contents);
  return parsed || null;
}

function extractDorarGrade(html = "") {
  const clean = DOMPurify.sanitize(html);
  const txt = clean
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const patterns = [
    /خلاصة حكم المحدث\s*[:：]\s*([^|]+?)(?:\s{2,}|$)/,
    /خلاصة حكم المحدّث\s*[:：]\s*([^|]+?)(?:\s{2,}|$)/,
    /حكم المحدث\s*[:：]\s*([^|]+?)(?:\s{2,}|$)/,
    /إسناده\s+([^|]+?)(?:\s{2,}|$)/,
  ];

  for (const p of patterns) {
    const m = txt.match(p);
    if (m?.[1]) return m[1].trim();
  }

  const quick = txt.match(/\b(صحيح|حسن|ضعيف|موضوع)\b/);
  return quick?.[1] || "";
}

function mapArabicGradeToBadge(gradeText = "") {
  const t = gradeText || "";
  if (/موضوع/.test(t))
    return {
      key: "mawdu",
      labelAr: "موضوع",
      labelEn: "Fabricated",
      tone: "danger",
    };
  if (/ضعيف|لا يصح|منكر/.test(t))
    return { key: "daif", labelAr: "ضعيف", labelEn: "Weak", tone: "danger" };
  if (/حسن/.test(t))
    return { key: "hasan", labelAr: "حسن", labelEn: "Hasan", tone: "warning" };
  if (/صحيح|إسناده صحيح|ثابت/.test(t))
    return { key: "sahih", labelAr: "صحيح", labelEn: "Sahih", tone: "success" };
  return {
    key: "unknown",
    labelAr: "غير محدد",
    labelEn: "Unknown",
    tone: "neutral",
  };
}

function mapHadithApiStatus(status = "") {
  const s = (status || "").toLowerCase();
  if (s.includes("sahih"))
    return { key: "sahih", labelAr: "صحيح", labelEn: "Sahih", tone: "success" };
  if (s.includes("hasan"))
    return { key: "hasan", labelAr: "حسن", labelEn: "Hasan", tone: "warning" };
  if (s.includes("daif") || s.includes("ضعيف"))
    return { key: "daif", labelAr: "ضعيف", labelEn: "Weak", tone: "danger" };
  return {
    key: "unknown",
    labelAr: "غير محدد",
    labelEn: "Unknown",
    tone: "neutral",
  };
}

function buildDorarQueryText(arabicText = "") {
  const matn = extractMatnArabic(arabicText);
  const norm = normalizeArabic(matn || arabicText);
  return limitWords(norm, 35, 240);
}

const Ahadith = () => {
  const { language } = useTranslation();
  const dir = language === "ar" ? "rtl" : "ltr";

  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [ahadith, setAhadith] = useState([]);

  const [selectedBook, setSelectedBook] = useState(
    () => localStorage.getItem("selectedBook") || null
  );
  const [selectedChapter, setSelectedChapter] = useState(() => {
    const saved = localStorage.getItem("selectedChapter");
    return saved ? Number(saved) : null;
  });

  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem("page");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Search modal
  const [openSearch, setOpenSearch] = useState(false);
  const [searchMode, setSearchMode] = useState("number"); // number | text
  const [hadithNumber, setHadithNumber] = useState("");
  const [searchText, setSearchText] = useState("");
  const [hadithLangs, setHadithLangs] = useState("ar"); // ar | en
  const [searchBookSlug, setSearchBookSlug] = useState(
    () => localStorage.getItem("selectedBook") || null
  );

  // Result + verify
  const [searchResult, setSearchResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [dorarHtml, setDorarHtml] = useState("");
  const [dorarGradeText, setDorarGradeText] = useState("");

  // Dorar modal
  const [openHadithModal, setOpenHadithModal] = useState(false);

  // Favorites
  const [openFav, setOpenFav] = useState(false);
  const [favQuery, setFavQuery] = useState("");

  // UI
  const [fontScale, setFontScale] = useState(() => {
    const saved = localStorage.getItem("ahadith_fontScale");
    return saved ? parseFloat(saved) : 1;
  });
  const [showHeading, setShowHeading] = useState(true);

  // ✅ Favorites storage (this is your “fav list”)
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("ahadith_bookmarks");
    return saved ? safeJsonParse(saved) || [] : [];
  });

  const responseRef = useRef(null);

  // ===== Helpers for labels (fix “select empty after refresh”) =====
  const getBookLabel = (bookObj) => {
    if (!bookObj) return "";
    const slug = bookObj.bookSlug;
    const mapped = booksList?.[slug]?.[language === "ar" ? "ar" : "en"];
    return mapped || bookObj.bookName || slug || "";
  };

  const getChapterLabel = (chapterObj) => {
    if (!chapterObj) return "";
    if (language === "ar")
      return chapterObj.chapterArabic || `الفصل ${chapterObj.chapterNumber}`;
    return chapterObj.chapterEnglish || `Chapter ${chapterObj.chapterNumber}`;
  };

  const selectedBookObj = useMemo(() => {
    if (!selectedBook) return null;
    return books.find((b) => b.bookSlug === selectedBook) || null;
  }, [books, selectedBook]);

  const selectedChapterObj = useMemo(() => {
    if (selectedChapter == null) return null;
    return (
      chapters.find(
        (c) => Number(c.chapterNumber) === Number(selectedChapter)
      ) || null
    );
  }, [chapters, selectedChapter]);

  const isSelectionReady = !!selectedBookObj && !!selectedChapterObj;

  // ===== Persist UI =====
  useEffect(
    () => localStorage.setItem("ahadith_fontScale", String(fontScale)),
    [fontScale]
  );
  useEffect(
    () => localStorage.setItem("ahadith_bookmarks", JSON.stringify(bookmarks)),
    [bookmarks]
  );

  useEffect(() => {
    if (selectedBook) localStorage.setItem("selectedBook", selectedBook);
    else localStorage.removeItem("selectedBook");
  }, [selectedBook]);

  useEffect(() => {
    if (selectedChapter != null)
      localStorage.setItem("selectedChapter", String(selectedChapter));
    else localStorage.removeItem("selectedChapter");
  }, [selectedChapter]);

  useEffect(() => localStorage.setItem("page", String(page)), [page]);

  // ===== Initial =====
  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // if no book, clear
    if (!selectedBook) {
      setChapters([]);
      setSelectedChapter(null);
      setAhadith([]);
      setTotalPages(1);
      setSearchResult(null);
      setSearchBookSlug(null);
      return;
    }
    // keep search modal book in sync
    setSearchBookSlug(selectedBook);

    fetchChapters(selectedBook);
    // eslint-disable-next-line
  }, [selectedBook]);

  useEffect(() => {
    // HARD guard
    if (!selectedBook || selectedChapter == null) {
      setAhadith([]);
      setTotalPages(1);
      return;
    }
    fetchAhadith();
    // eslint-disable-next-line
  }, [selectedBook, selectedChapter, page]);

  const translateBookInfo = (book) => {
    if (!book) return {};
    const bookSlug = book.bookSlug;
    const writer = writerInfo[bookSlug];

    const writerName = writer
      ? writer.writerName[language]
      : language === "ar"
      ? book.writerName
      : `Imam ${book.writerName}`;

    const writerDeath = writer
      ? writer.writerDeath[language]
      : book.writerDeath;

    return {
      bookName:
        booksList?.[bookSlug]?.[language === "ar" ? "ar" : "en"] ||
        book.bookName ||
        bookSlug,
      writerName,
      hadithsCount:
        language === "ar"
          ? `عدد الأحاديث: ${book.hadiths_count}`
          : `Hadiths Count: ${book.hadiths_count}`,
      chaptersCount:
        language === "ar"
          ? `عدد الفصول: ${book.chapters_count}`
          : `Chapters Count: ${book.chapters_count}`,
      writerDeath:
        language === "ar"
          ? `تاريخ وفاة المؤلف: ${writerDeath}`
          : `Writer's Death: ${writerDeath}`,
    };
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/books?apiKey=${API_KEY}`);
      const data = await resp.json();

      if (data.books && typeof data.books === "object") {
        const arr = Object.values(data.books).filter(
          (b) =>
            b.bookName !== "Musnad Ahmad" && b.bookName !== "Al-Silsila Sahiha"
        );
        setBooks(arr);

        // validate saved book exists
        const savedSlug = localStorage.getItem("selectedBook");
        if (savedSlug && !arr.some((b) => b.bookSlug === savedSlug)) {
          localStorage.removeItem("selectedBook");
          localStorage.removeItem("selectedChapter");
          localStorage.removeItem("page");
          setSelectedBook(null);
          setSelectedChapter(null);
          setPage(1);
          setAhadith([]);
          setChapters([]);
        }
      } else {
        setBooks([]);
      }
    } catch (e) {
      console.error(e);
      toast.error(
        language === "ar" ? "تعذر تحميل الكتب" : "Failed to load books"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (bookSlug) => {
    try {
      setLoading(true);
      const resp = await fetch(
        `${API_BASE_URL}/${bookSlug}/chapters?apiKey=${API_KEY}`
      );
      const data = await resp.json();

      if (data.chapters && Array.isArray(data.chapters)) {
        setChapters(data.chapters);

        const saved = localStorage.getItem("selectedChapter");
        const savedNum = saved ? Number(saved) : null;

        if (savedNum != null && Number.isFinite(savedNum)) {
          const ok = data.chapters.some(
            (c) => Number(c.chapterNumber) === savedNum
          );
          if (!ok) {
            setSelectedChapter(null);
            localStorage.removeItem("selectedChapter");
            setAhadith([]);
            setTotalPages(1);
          } else {
            setSelectedChapter(savedNum);
          }
        } else {
          setSelectedChapter(null);
          localStorage.removeItem("selectedChapter");
          setAhadith([]);
          setTotalPages(1);
        }
      } else {
        setChapters([]);
        setSelectedChapter(null);
        setAhadith([]);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
      toast.error(
        language === "ar" ? "تعذر تحميل الفصول" : "Failed to load chapters"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAhadith = async () => {
    if (!selectedBook || selectedChapter == null) return;

    setLoading(true);
    try {
      const resp = await fetch(
        `${API_BASE_URL}/hadiths?apiKey=${API_KEY}&book=${selectedBook}&chapter=${selectedChapter}&page=${page}`
      );
      const data = await resp.json();
      const list = data?.hadiths?.data;

      if (Array.isArray(list)) {
        setAhadith(list);
        setTotalPages(data?.hadiths?.last_page || 1);
        setSearchResult(null);
        setDorarHtml("");
        setDorarGradeText("");
      } else {
        setAhadith([]);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
      toast.error(
        language === "ar" ? "تعذر تحميل الأحاديث" : "Failed to load hadiths"
      );
    } finally {
      setLoading(false);
    }
  };

  const authorCard = useMemo(() => {
    if (!selectedBook || ahadith.length !== 0) return null;
    const book = books.find((b) => b.bookSlug === selectedBook);
    if (!book) return null;

    const info = translateBookInfo(book);

    return (
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          backgroundColor: "var(--card-color)",
          color: "var(--text-color)",
          borderColor: "rgba(255,255,255,0.12)",
        }}
        className="ah-card"
      >
        <CardContent>
          <div className={`ah-author ${dir}`}>
            <Typography level="title-md" className="ah-section-title">
              {language === "ar" ? "معلومات عن المؤلف" : "Author Summary"}
            </Typography>
            <Divider />
            <div className="ah-author-grid">
              <div className="ah-author-row">
                <BookIcon />
                <span>{language === "ar" ? "الكتاب:" : "Book:"}</span>
                <b>{info.bookName}</b>
              </div>
              <div className="ah-author-row">
                <PersonIcon />
                <span>{language === "ar" ? "المؤلف:" : "Author:"}</span>
                <b>{info.writerName}</b>
              </div>
              <div className="ah-author-row">
                <FormatListNumberedIcon />
                <span>{info.hadithsCount}</span>
              </div>
              <div className="ah-author-row">
                <LayersIcon />
                <span>{info.chaptersCount}</span>
              </div>
              <div className="ah-author-row">
                <EventIcon />
                <span>{info.writerDeath}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
    // eslint-disable-next-line
  }, [selectedBook, ahadith.length, books, language, dir]);

  // ===== Favorites =====
  const isBookmarked = (bookSlug, hadithNo) => {
    const key = `${bookSlug || ""}::${hadithNo || ""}`;
    return bookmarks.some((x) => x.key === key);
  };

  const toggleBookmarkFromHadith = (bookSlug, h) => {
    const key = `${bookSlug || ""}::${h?.hadithNumber || ""}`;
    const title =
      booksList?.[bookSlug]?.[language === "ar" ? "ar" : "en"] ||
      bookSlug ||
      "";

    const payload = {
      key,
      book: bookSlug,
      bookTitle: title,
      hadithNumber: h?.hadithNumber,
      ar: h?.hadithArabic || "",
      en: h?.hadithEnglish || "",
      status: h?.status || "",
      headingAr: h?.headingArabic || "",
      headingEn: h?.headingEnglish || "",
      ts: Date.now(),
    };

    setBookmarks((prev) => {
      if (prev.some((x) => x.key === key)) {
        toast.info(
          language === "ar" ? "تمت إزالة الحفظ" : "Removed from favorites"
        );
        return prev.filter((x) => x.key !== key);
      }
      toast.success(language === "ar" ? "تم حفظ الحديث" : "Saved to favorites");
      return [payload, ...prev].slice(0, 300);
    });
  };

  const removeBookmark = (key) => {
    setBookmarks((prev) => prev.filter((x) => x.key !== key));
    toast.info(language === "ar" ? "تم الحذف" : "Deleted");
  };

  // ===== Actions =====
  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt || "");
      toast.success(language === "ar" ? "تم النسخ" : "Copied");
    } catch {
      toast.error(language === "ar" ? "فشل النسخ" : "Copy failed");
    }
  };

  const shareHadith = async (txt) => {
    try {
      if (navigator.share) await navigator.share({ text: txt || "" });
      else await copyText(txt);
    } catch {}
  };

  const openDorarSearch = (arabicText) => {
    const q = encodeURIComponent(arabicText || "");
    window.open(
      `https://dorar.net/hadith/search?q=${q}`,
      "_blank",
      "noreferrer"
    );
  };

  const openSunnah = (bookSlug, hadithNumberX) => {
    const c = SUNNAH_COLLECTION_BASE[bookSlug];
    if (!c || !hadithNumberX) return;
    window.open(
      `https://sunnah.com/${c}:${hadithNumberX}`,
      "_blank",
      "noreferrer"
    );
  };

  const verifyWithDorar = async (arabicText) => {
    const skey = buildDorarQueryText(arabicText);
    setVerifying(true);
    setDorarHtml("");
    setDorarGradeText("");

    try {
      const dorar = await fetchDorarBySKey(skey);
      const html = dorar?.ahadith?.result || "";
      const clean = DOMPurify.sanitize(html);
      setDorarHtml(clean);

      const grade = extractDorarGrade(html);
      setDorarGradeText(grade || "");
    } catch (e) {
      console.error(e);
      toast.error(
        language === "ar"
          ? "تعذر التحقق من الدرر"
          : "Failed to verify via Dorar"
      );
    } finally {
      setVerifying(false);
    }
  };

  const getDisplayLangValue = () => {
    if (hadithLangs === "ar") return language === "ar" ? "العربية" : "Arabic";
    if (hadithLangs === "en")
      return language === "ar" ? "الإنجليزية" : "English";
    return "";
  };

  const handleResetAll = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setChapters([]);
    setAhadith([]);
    setSearchResult(null);
    setPage(1);
    setTotalPages(1);
    setDorarHtml("");
    setDorarGradeText("");
    setSearchBookSlug(null);

    localStorage.removeItem("selectedBook");
    localStorage.removeItem("selectedChapter");
    localStorage.removeItem("page");
  };

  const handleSearch = async () => {
    const respAria = responseRef.current;
    if (respAria) {
      respAria.style.border = "0";
      respAria.innerHTML = "";
    }

    const bookToUse = searchBookSlug || selectedBook;

    if (!bookToUse) {
      if (respAria) {
        respAria.style.border = "2px solid red";
        respAria.style.padding = "6px";
        respAria.innerHTML =
          language === "ar" ? "اختر كتابًا للبحث" : "Choose a book for search";
      }
      return;
    }

    setLoading(true);
    setSearchResult(null);
    setDorarHtml("");
    setDorarGradeText("");

    try {
      if (searchMode === "number") {
        if (!hadithNumber || String(hadithNumber).trim() === "") {
          toast.info(
            language === "ar" ? "اكتب رقم الحديث" : "Enter hadith number"
          );
          setLoading(false);
          return;
        }

        // Sync main selectedBook to searched book (so UI stays consistent)
        if (selectedBook !== bookToUse) {
          setSelectedBook(bookToUse);
          setSelectedChapter(null);
          setChapters([]);
          setAhadith([]);
          setPage(1);
          localStorage.removeItem("selectedChapter");
          localStorage.removeItem("page");
        }

        const resp = await fetch(
          `${API_BASE_URL}/hadiths?apiKey=${API_KEY}&book=${bookToUse}&hadithNumber=${hadithNumber}`
        );
        const data = await resp.json();
        const item = data?.hadiths?.data?.[0] || null;

        if (!item) {
          toast.error(
            language === "ar" ? "لم يتم العثور على الحديث" : "Hadith not found"
          );
        } else {
          setSearchResult(item);
          setAhadith([]);
          setOpenSearch(false);

          if (hadithLangs === "ar" && item?.hadithArabic) {
            // auto verify
            verifyWithDorar(item.hadithArabic);
          }
        }
      } else {
        const q = (searchText || "").trim();
        if (!q) {
          toast.info(
            language === "ar" ? "اكتب نصًا للبحث" : "Enter text to search"
          );
          setLoading(false);
          return;
        }

        // text search is page-local (loaded list)
        const needle =
          hadithLangs === "ar" ? normalizeArabic(q) : q.toLowerCase();
        const pool = ahadith.length ? ahadith : [];

        const found =
          pool.find((h) => {
            const text =
              hadithLangs === "ar"
                ? normalizeArabic(h?.hadithArabic || "")
                : (h?.hadithEnglish || "").toLowerCase();
            return text.includes(needle);
          }) || null;

        if (!found) {
          toast.info(
            language === "ar"
              ? "لم يتم العثور ضمن الصفحة الحالية. افتح صفحات أكثر أو استخدم فتح الدرر."
              : "Not found in current page. Load more pages or use Dorar open button."
          );
        } else {
          setSearchResult(found);
          setOpenSearch(false);
          if (hadithLangs === "ar" && found?.hadithArabic)
            verifyWithDorar(found.hadithArabic);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "ar" ? "حدث خطأ أثناء البحث" : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Dorar grade only as “priority” for Bukhari/Muslim, otherwise show API status only
  const renderGradeChip = (h) => {
    const currentBook =
      (searchResult && h === searchResult
        ? searchBookSlug || selectedBook
        : selectedBook) || "";
    const allowDorarPriority =
      currentBook === "sahih-bukhari" || currentBook === "sahih-muslim";

    if (
      searchResult &&
      h === searchResult &&
      dorarGradeText &&
      allowDorarPriority
    ) {
      const badge = mapArabicGradeToBadge(dorarGradeText);
      return (
        <Chip variant="soft" color={badge.tone} className="ah-chip">
          {language === "ar"
            ? `حكم الدرر: ${badge.labelAr}`
            : `Dorar: ${badge.labelEn}`}
        </Chip>
      );
    }

    const apiBadge = mapHadithApiStatus(h?.status);
    return (
      <Chip variant="soft" color={apiBadge.tone} className="ah-chip">
        {language === "ar"
          ? `الدرجة: ${apiBadge.labelAr}`
          : `Status: ${apiBadge.labelEn}`}
      </Chip>
    );
  };

  const renderHadithCard = (bookSlug, h, idx, isSearch = false) => {
    const showText =
      (hadithLangs === "ar" ? h?.hadithArabic : h?.hadithEnglish) || "";
    const heading = language === "ar" ? h?.headingArabic : h?.headingEnglish;

    return (
      <Card
        key={`${bookSlug || ""}-${h?.hadithNumber || idx}-${
          isSearch ? "s" : "l"
        }`}
        variant="outlined"
        className={`ah-card ${dir}`}
        sx={{
          backgroundColor: "var(--card-color)",
          color: "var(--text-color)",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <CardContent>
          {showHeading && heading ? (
            <Typography level="title-md" className="ah-heading">
              {heading}
            </Typography>
          ) : null}

          <Typography
            className="ah-text"
            sx={{ fontSize: `calc(1rem * ${fontScale})` }}
          >
            {showText ||
              (language === "ar"
                ? "لا توجد نسخة متاحة"
                : "No version available")}
          </Typography>

          <div className="ah-meta">
            <div className="ah-meta-left">
              {renderGradeChip(h)}
              <Chip variant="outlined" color="primary" className="ah-chip">
                {language === "ar"
                  ? `رقم: ${h?.hadithNumber}`
                  : `No: ${h?.hadithNumber}`}
              </Chip>
            </div>

            <div className="ah-actions">
              <Tooltip title={language === "ar" ? "نسخ" : "Copy"}>
                <IconButton
                  variant="outlined"
                  color="primary"
                  onClick={() => copyText(showText)}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={language === "ar" ? "مشاركة" : "Share"}>
                <IconButton
                  variant="outlined"
                  className="ah-filter-btn"
                  style={{ color: "var(--text-color)" }}
                  onClick={() => shareHadith(showText)}
                >
                  <ShareOutlinedIcon />
                </IconButton>
              </Tooltip>

              {/* ✅ THIS is the Hokm/Takhrij button (opens modal) */}
              {hadithLangs === "ar" ? (
                <Tooltip
                  title={
                    language === "ar" ? "نبذة/تخريج وحكم" : "Takhrij / grading"
                  }
                >
                  <IconButton
                    variant="outlined"
                    color="success"
                    loading={verifying && isSearch}
                    onClick={async () => {
                      // show modal immediately then load
                      setSearchResult(h);
                      setOpenHadithModal(true);
                      await verifyWithDorar(h?.hadithArabic || "");
                    }}
                  >
                    <MenuBookOutlinedIcon />
                  </IconButton>
                </Tooltip>
              ) : null}

              <Tooltip
                title={
                  language === "ar" ? "فتح بحث الدرر" : "Open Dorar search"
                }
              >
                <IconButton
                  variant="outlined"
                  color="warning"
                  onClick={() => openDorarSearch(h?.hadithArabic || "")}
                >
                  <OpenInNewOutlinedIcon />
                </IconButton>
              </Tooltip>

              {SUNNAH_COLLECTION_BASE[bookSlug] ? (
                <Tooltip
                  title={
                    language === "ar"
                      ? "فتح في Sunnah.com"
                      : "Open on Sunnah.com"
                  }
                >
                  <IconButton
                    variant="outlined"
                    style={{ color: "var(--text-color)" }}
                    className="ah-filter-btn"
                    onClick={() => openSunnah(bookSlug, h?.hadithNumber)}
                  >
                    <OpenInNewOutlinedIcon />
                  </IconButton>
                </Tooltip>
              ) : null}

              <Tooltip title={language === "ar" ? "المفضلة" : "Favorite"}>
                <IconButton
                  variant="outlined"
                  className="ah-filter-btn"
                  style={{
                    color: isBookmarked(bookSlug, h?.hadithNumber)
                      ? "green"
                      : "var(--text-color)",
                  }}
                  onClick={() => toggleBookmarkFromHadith(bookSlug, h)}
                >
                  {isBookmarked(bookSlug, h?.hadithNumber) ? (
                    <BookmarkAddedOutlinedIcon />
                  ) : (
                    <BookmarkAddOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {isSearch && dorarGradeText ? (
            <div className="ah-verify-row">
              <Typography level="body-sm" className="ah-verify-note">
                {language === "ar"
                  ? "الحكم المعروض من الدرر (أولوية على API عند توفره للبخاري/مسلم)."
                  : "Dorar judgement shown (preferred for Bukhari/Muslim when available)."}
              </Typography>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  const favFiltered = useMemo(() => {
    const q = (favQuery || "").trim();
    if (!q) return bookmarks;
    const qAr = normalizeArabic(q);
    const qEn = q.toLowerCase();

    return bookmarks.filter((b) => {
      const ar = normalizeArabic(b.ar || "");
      const en = (b.en || "").toLowerCase();
      const bookT = (b.bookTitle || "").toLowerCase();
      const no = String(b.hadithNumber || "");
      return (
        ar.includes(qAr) ||
        en.includes(qEn) ||
        bookT.includes(qEn) ||
        no.includes(qEn)
      );
    });
  }, [bookmarks, favQuery]);

  return (
    <div className="ah-page" dir={dir}>
      {/* Sticky toolbar */}
      <div className={`ah-toolbar ${dir}`}>
        <div className="ah-toolbar-left">
          <Typography level="title-md" className="ah-toolbar-title">
            {language === "ar" ? "الأحاديث" : "Ahadith"}
          </Typography>

          <div className="ah-toolbar-actions">
            <Tooltip title={language === "ar" ? "تكبير الخط" : "Increase text"}>
              <IconButton
                variant="outlined"
                onClick={() =>
                  setFontScale((x) => Math.min(1.35, +(x + 0.05).toFixed(2)))
                }
              >
                <TextIncreaseOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={language === "ar" ? "تصغير الخط" : "Decrease text"}>
              <IconButton
                variant="outlined"
                onClick={() =>
                  setFontScale((x) => Math.max(0.85, +(x - 0.05).toFixed(2)))
                }
              >
                <TextDecreaseOutlinedIcon />
              </IconButton>
            </Tooltip>

            {/* ✅ Favorites list button (opens fav modal) */}
            <Tooltip title={language === "ar" ? "المفضلة" : "Favorites"}>
              <IconButton
                variant="outlined"
                color="neutral"
                onClick={() => setOpenFav(true)}
              >
                <FavoriteBorderOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={language === "ar" ? "إعادة تعيين" : "Reset"}>
              <IconButton variant="outlined" onClick={handleResetAll}>
                <RestartAltOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="ah-toolbar-right">
          <FormControl size="sm" className="ah-switch">
            <FormLabel sx={{ color: "var(--text-color)" }}>
              {language === "ar" ? "إظهار العنوان" : "Show heading"}
            </FormLabel>
            <Switch
              checked={showHeading}
              onChange={(e) => setShowHeading(e.target.checked)}
            />
          </FormControl>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOpenSearch(true)}
            startDecorator={<SearchOutlinedIcon />}
            className="ah-search-btn"
          >
            {language === "ar" ? "بحث" : "Search"}
          </Button>
        </div>
      </div>

      {authorCard}

      {/* Selectors row */}
      <div className={`ah-selectors ${dir}`}>
        <FormControl sx={{ minWidth: 260 }} disabled={!books.length} required>
          <FormLabel sx={{ color: "var(--text-color)" }}>
            {language === "ar" ? "اختر كتابًا" : "Select book"}
          </FormLabel>
          <JoyAutocomplete
            placeholder={language === "ar" ? "اختر كتابًا" : "Select book"}
            options={books}
            getOptionLabel={(option) => getBookLabel(option)}
            onChange={(event, newValue) => {
              setSelectedBook(newValue ? newValue.bookSlug : null);
              setSelectedChapter(null);
              setChapters([]);
              setAhadith([]);
              setPage(1);
              localStorage.removeItem("selectedChapter");
              localStorage.removeItem("page");
            }}
            value={selectedBookObj}
            isOptionEqualToValue={(option, value) =>
              option.bookSlug === value.bookSlug
            }
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
          />
        </FormControl>

        <FormControl
          sx={{ minWidth: 260 }}
          disabled={!selectedBook || !chapters.length}
          required
        >
          <FormLabel sx={{ color: "var(--text-color)" }}>
            {language === "ar" ? "اختر فصلًا" : "Select chapter"}
          </FormLabel>
          <JoyAutocomplete
            placeholder={language === "ar" ? "اختر فصلًا" : "Select chapter"}
            options={chapters}
            getOptionLabel={(option) => getChapterLabel(option)}
            value={selectedChapterObj}
            onChange={(event, newValue) => {
              setSelectedChapter(
                newValue ? Number(newValue.chapterNumber) : null
              );
              setPage(1);
              setAhadith([]);
              localStorage.removeItem("page");
            }}
            isOptionEqualToValue={(option, value) =>
              Number(option.chapterNumber) === Number(value?.chapterNumber)
            }
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
          />
        </FormControl>

        {isSelectionReady &&
          totalPages > 1 &&
          ahadith.length > 0 &&
          !loading && (
            <Stack spacing={2} className="ah-pagination" dir={dir}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                variant="outlined"
                color="primary"
                size="medium"
                renderItem={(item) => <PaginationItem {...item} />}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "var(--text-color)",
                    borderColor: "rgba(255,255,255,0.24)",
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "var(--primary-color)",
                    color: "#fff",
                    borderColor: "var(--primary-color)",
                  },
                }}
              />
            </Stack>
          )}
      </div>

      {/* Search result */}
      {searchResult && !loading && (
        <div className="ah-section">
          <Typography level="title-md" className={`ah-section-title ${dir}`}>
            {language === "ar" ? "نتيجة البحث" : "Search Result"}
          </Typography>
          {renderHadithCard(
            searchBookSlug || selectedBook,
            searchResult,
            0,
            true
          )}
        </div>
      )}

      {/* Loader / List */}
      {loading ? (
        <div className="ah-loader">
          <Loader />
        </div>
      ) : (
        <>
          {!isSelectionReady ? (
            <div className="ah-empty">
              {language === "ar"
                ? "اختر كتابًا ثم فصلًا لعرض الأحاديث."
                : "Select a book and a chapter to view hadiths."}
            </div>
          ) : (
            <div className="ah-list">
              {ahadith.map((h, idx) => renderHadithCard(selectedBook, h, idx))}
            </div>
          )}
        </>
      )}

      {/* ======================= Search Modal ======================= */}
      <Modal open={openSearch} onClose={() => setOpenSearch(false)}>
        <ModalDialog
          sx={{
            borderRadius: "lg",
            padding: "18px",
            maxWidth: 720,
            minWidth: 320,
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "lg",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
          className={`ah-modal ${dir}`}
        >
          <Typography ref={responseRef} className="ah-modal-error"></Typography>

          <Typography
            component="h2"
            level="h6"
            sx={{ mb: 1 }}
            className="ah-modal-title"
          >
            {language === "ar" ? "بحث عن حديث" : "Search Hadith"}
          </Typography>

          <div className="ah-modal-row">
            <FormControl sx={{ flex: 1 }}>
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "اللغة" : "Language"}
              </FormLabel>
              <JoyAutocomplete
                placeholder={
                  language === "ar" ? "اختر اللغة" : "Select language"
                }
                value={getDisplayLangValue()}
                onChange={(event, newValue) => {
                  setHadithLangs(
                    newValue === "Arabic" || newValue === "العربية"
                      ? "ar"
                      : "en"
                  );
                }}
                options={[
                  language === "ar" ? "العربية" : "Arabic",
                  language === "ar" ? "الإنجليزية" : "English",
                ]}
                isOptionEqualToValue={(o, v) => o === v}
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
              />
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "طريقة البحث" : "Search mode"}
              </FormLabel>
              <JoyAutocomplete
                placeholder={language === "ar" ? "اختر طريقة" : "Choose mode"}
                value={
                  searchMode === "number"
                    ? language === "ar"
                      ? "بالرقم"
                      : "By number"
                    : language === "ar"
                    ? "بالنص"
                    : "By text"
                }
                onChange={(e, v) => {
                  if (!v) return;
                  setSearchMode(
                    v === (language === "ar" ? "بالرقم" : "By number")
                      ? "number"
                      : "text"
                  );
                }}
                options={[
                  language === "ar" ? "بالرقم" : "By number",
                  language === "ar" ? "بالنص" : "By text",
                ]}
                isOptionEqualToValue={(o, v) => o === v}
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
              />
            </FormControl>
          </div>

          {/* Book selector inside search (works even if user didn't choose any book yet) */}
          <FormControl sx={{ mt: 1 }} disabled={!books.length} required>
            <FormLabel sx={{ color: "var(--text-color)" }}>
              {language === "ar" ? "الكتاب" : "Book"}
            </FormLabel>
            <JoyAutocomplete
              placeholder={language === "ar" ? "اختر كتابًا" : "Select book"}
              options={books}
              getOptionLabel={(option) => getBookLabel(option)}
              onChange={(event, newValue) =>
                setSearchBookSlug(newValue ? newValue.bookSlug : null)
              }
              value={
                searchBookSlug
                  ? books.find((b) => b.bookSlug === searchBookSlug)
                  : null
              }
              isOptionEqualToValue={(option, value) =>
                option.bookSlug === value.bookSlug
              }
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
              }}
            />
          </FormControl>

          {searchMode === "number" ? (
            <FormControl sx={{ mt: 1 }}>
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "رقم الحديث" : "Hadith number"}
              </FormLabel>
              <Input
                placeholder={language === "ar" ? "مثال: 1" : "e.g. 1"}
                value={hadithNumber}
                onChange={(e) => setHadithNumber(e.target.value)}
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
              />
            </FormControl>
          ) : (
            <FormControl sx={{ mt: 1 }}>
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "نص البحث" : "Search text"}
              </FormLabel>
              <Input
                placeholder={
                  language === "ar"
                    ? "اكتب جزءًا من الحديث..."
                    : "Type part of the hadith..."
                }
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
              />
              <Typography level="body-sm" className="ah-tip">
                {language === "ar"
                  ? "بحث النص يعمل داخل الصفحة الحالية فقط. للبحث العام استخدم فتح الدرر من بطاقة الحديث."
                  : "Text search works only in the current loaded page. For global search use Dorar open button."}
              </Typography>
            </FormControl>
          )}

          <div className="ah-modal-actions">
            <Button
              variant="solid"
              color="primary"
              onClick={handleSearch}
              startDecorator={<SearchOutlinedIcon />}
              className="ah-primary"
              disabled={loading}
              sx={{
                border: "1px solid var(--primary-color)",
                backgroundColor: "var(--primary-color)",
                color: "#fff",
              }}
            >
              {loading
                ? language === "ar"
                  ? "جارٍ البحث..."
                  : "Searching..."
                : language === "ar"
                ? "بحث"
                : "Search"}
            </Button>

            <Button
              variant="solid"
              color="danger"
              onClick={() => setOpenSearch(false)}
              startDecorator={<CloseOutlinedIcon />}
              disabled={loading}
              className="ah-danger"
              sx={{
                border: "1px solid #c41c1c",
                backgroundColor: "#c41c1c",
                color: "#fff",
              }}
            >
              {language === "ar" ? "خروج" : "Close"}
            </Button>
          </div>
        </ModalDialog>
      </Modal>

      {/* ======================= Favorites Modal (✅ exists) ======================= */}
      <Modal open={openFav} onClose={() => setOpenFav(false)}>
        <ModalDialog
          sx={{
            borderRadius: "lg",
            padding: "18px",
            maxWidth: 920,
            minWidth: 320,
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "lg",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            overflowX: "hidden",
            overflowY: "auto",
          }}
          className={`ah-modal ${dir}`}
        >
          {/* ✅ header row with title + close */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Typography
              level="h5"
              className="ah-modal-title"
              sx={{ m: 0, textAlign: "start" }}
            >
              {language === "ar" ? "المفضلة" : "Favorites"}
            </Typography>
            <IconButton
              variant="outlined"
              onClick={() => setOpenFav(false)}
              aria-label="close"
            >
              <CloseOutlinedIcon />
            </IconButton>
          </div>

          <Divider sx={{ my: 1 }} />

          <FormControl sx={{ mb: 1 }}>
            <FormLabel sx={{ color: "var(--text-color)" }}>
              {language === "ar" ? "بحث داخل المفضلة" : "Search favorites"}
            </FormLabel>
            <Input
              value={favQuery}
              onChange={(e) => setFavQuery(e.target.value)}
              placeholder={
                language === "ar"
                  ? "نص / رقم / اسم كتاب..."
                  : "Text / number / book..."
              }
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
              }}
            />
          </FormControl>

          <div className="ah-fav-list">
            {favFiltered.length ? (
              favFiltered.map((b) => {
                const apiBadge = mapHadithApiStatus(b.status);
                const viewText =
                  (hadithLangs === "ar" ? b.ar : b.en) || b.ar || b.en || "";
                return (
                  <Card
                    key={b.key}
                    variant="outlined"
                    className={`ah-card ${dir}`}
                    sx={{
                      backgroundColor: "var(--card-color)",
                      color: "var(--text-color)",
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  >
                    <CardContent>
                      <div className="ah-fav-top">
                        <div className="ah-fav-meta">
                          <Chip
                            variant="soft"
                            color={apiBadge.tone}
                            className="ah-chip"
                          >
                            {language === "ar"
                              ? `الدرجة: ${apiBadge.labelAr}`
                              : `Status: ${apiBadge.labelEn}`}
                          </Chip>
                          <Chip
                            variant="outlined"
                            color="primary"
                            className="ah-chip"
                          >
                            {language === "ar"
                              ? `رقم: ${b.hadithNumber}`
                              : `No: ${b.hadithNumber}`}
                          </Chip>
                          <Chip
                            variant="outlined"
                            color="neutral"
                            className="ah-chip"
                          >
                            {b.bookTitle}
                          </Chip>
                        </div>

                        <div className="ah-fav-actions">
                          <Tooltip title={language === "ar" ? "فتح" : "Open"}>
                            <IconButton
                              variant="outlined"
                              color="primary"
                              onClick={async () => {
                                setSearchBookSlug(b.book);
                                setHadithNumber(String(b.hadithNumber || ""));
                                setOpenFav(false);
                                setOpenSearch(false);

                                // sync main selection
                                if (selectedBook !== b.book) {
                                  setSelectedBook(b.book);
                                  setSelectedChapter(null);
                                  setChapters([]);
                                  setAhadith([]);
                                  setPage(1);
                                }

                                setLoading(true);
                                try {
                                  const resp = await fetch(
                                    `${API_BASE_URL}/hadiths?apiKey=${API_KEY}&book=${b.book}&hadithNumber=${b.hadithNumber}`
                                  );
                                  const data = await resp.json();
                                  const item = data?.hadiths?.data?.[0] || null;
                                  if (item) {
                                    setSearchResult(item);
                                    setAhadith([]);
                                    if (
                                      hadithLangs === "ar" &&
                                      item?.hadithArabic
                                    )
                                      verifyWithDorar(item.hadithArabic);
                                  } else {
                                    setSearchResult({
                                      hadithNumber: b.hadithNumber,
                                      hadithArabic: b.ar,
                                      hadithEnglish: b.en,
                                      status: b.status,
                                      headingArabic: b.headingAr,
                                      headingEnglish: b.headingEn,
                                    });
                                  }
                                } catch (e) {
                                  console.error(e);
                                  toast.error(
                                    language === "ar"
                                      ? "تعذر فتح الحديث"
                                      : "Failed to open hadith"
                                  );
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              <OpenInNewOutlinedIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={language === "ar" ? "نسخ" : "Copy"}>
                            <IconButton
                              variant="outlined"
                              color="neutral"
                              onClick={() => copyText(viewText)}
                            >
                              <ContentCopyOutlinedIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              language === "ar" ? "فتح الدرر" : "Open Dorar"
                            }
                          >
                            <IconButton
                              variant="outlined"
                              color="warning"
                              onClick={() => openDorarSearch(b.ar || "")}
                            >
                              <OpenInNewOutlinedIcon />
                            </IconButton>
                          </Tooltip>

                          {SUNNAH_COLLECTION_BASE[b.book] ? (
                            <Tooltip
                              title={
                                language === "ar" ? "Sunnah.com" : "Sunnah.com"
                              }
                            >
                              <IconButton
                                variant="outlined"
                                color="neutral"
                                onClick={() =>
                                  openSunnah(b.book, b.hadithNumber)
                                }
                              >
                                <OpenInNewOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          ) : null}

                          <Tooltip title={language === "ar" ? "حذف" : "Delete"}>
                            <IconButton
                              variant="outlined"
                              color="danger"
                              onClick={() => removeBookmark(b.key)}
                            >
                              <DeleteOutlineOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </div>

                      <Typography
                        className="ah-text"
                        sx={{ fontSize: `calc(1rem * ${fontScale})` }}
                      >
                        {viewText ||
                          (language === "ar"
                            ? "لا يوجد نص محفوظ"
                            : "No saved text")}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="ah-empty">
                {language === "ar"
                  ? "لا توجد أحاديث محفوظة."
                  : "No saved hadiths."}
              </div>
            )}
          </div>
        </ModalDialog>
      </Modal>

      {/* ======================= Hokm/Takhrij Modal (✅ appears) ======================= */}
      <Modal
        open={openHadithModal}
        onClose={() => setOpenHadithModal(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        <Sheet
          variant="outlined"
          className="ah-dorar-sheet"
          sx={{
            maxWidth: 860,
            borderRadius: "lg",
            p: 2,
            boxShadow: "lg",
            overflowY: "auto",
            maxHeight: "90%",
            minWidth: "45%",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
        >
          {/* ✅ header row with title + close + rtl/ltr friendly */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexDirection: dir === "rtl" ? "row-reverse" : "row",
            }}
          >
            <Typography
              level="h4"
              className="ah-dorar-title"
              sx={{ m: 0, textAlign: "start" }}
            >
              {language === "ar"
                ? "التخريج والحكم (الدرر)"
                : "Takhrij / Grading (Dorar)"}
            </Typography>

            <IconButton
              variant="outlined"
              onClick={() => setOpenHadithModal(false)}
              aria-label="close"
            >
              <CloseOutlinedIcon />
            </IconButton>
          </div>

          <Divider sx={{ my: 1 }} />

          {verifying ? (
            <div className="ah-dorar-loading">
              <Button loading variant="plain" className="w-100">
                Loading
              </Button>
            </div>
          ) : (
            <div className="ah-dorar-body">
              {dorarGradeText ? (
                <div className="ah-dorar-grade">
                  <Chip
                    variant="soft"
                    color={mapArabicGradeToBadge(dorarGradeText).tone}
                    className="ah-chip"
                  >
                    {language === "ar"
                      ? `خلاصة الحكم: ${dorarGradeText}`
                      : `Grade summary: ${dorarGradeText}`}
                  </Chip>
                </div>
              ) : null}

              <div
                className="ah-dorar-html"
                dangerouslySetInnerHTML={{
                  __html:
                    hadithLangs === "en"
                      ? language === "ar"
                        ? "تفاصيل الدرر غالبًا بالعربية."
                        : "Dorar details are mostly Arabic."
                      : dorarHtml ||
                        (language === "ar"
                          ? "لا توجد نتيجة واضحة."
                          : "No clear result found."),
                }}
              />
            </div>
          )}
        </Sheet>
      </Modal>
    </div>
  );
};

export default Ahadith;
