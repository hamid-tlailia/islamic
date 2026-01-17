import React, { useEffect, useMemo, useState } from "react";
import "./library.css";

// Import JSON file of books
import booksData from "./json/books.json";

// Import language provider
import { useTranslation } from "../../../../components/languages/provider";

// Joy UI
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Select,
  Option,
  CircularProgress,
  Alert,
  Skeleton,
  Input,
  Chip,
  Divider,
  Button,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/joy";

// Icons
import DownloadIcon from "@mui/icons-material/Download";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SortByAlphaOutlinedIcon from "@mui/icons-material/SortByAlphaOutlined";

import { toast } from "react-toastify";

const Library = () => {
  const { language } = useTranslation();

  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState(language);
  const [loading, setLoading] = useState(false);

  // UI state
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("az"); // az | za

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [activeBook, setActiveBook] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favoriteBooks");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Track image loading
  const [imageLoaded, setImageLoaded] = useState({});

  const bookCategories = {
    All: { en: "All", ar: "الكل" },
    Favorites: { en: "Favorites", ar: "المفضلة" },
    Adhkar: { en: "Supplications", ar: "الأذكار" },
    Quran: { en: "Quran", ar: "القرآن" },
    Dalalat: { en: "Signs", ar: "الدلالات العقدية" },
    Tawhid: { en: "Tawhid", ar: "التوحيد" },
    Sunnah: { en: "Sunnah", ar: "السنة" },
    Sira: { en: "Seerah of the Prophet", ar: "السيرة النبوية" },
    Signs: { en: "Signs of Hour", ar: "علامات الساعة" },
    Others: { en: "Other categories", ar: "مواضيع مختلفة" },
    Fiqh: { en: "Islamic Fiqh", ar: "الفقه الاسلامي" },
  };

  const categories = useMemo(
    () => [
      "All",
      "Favorites",
      ...new Set(booksData.map((b) => b.book_category)),
    ],
    [],
  );

  const languages = ["ar", "en"];

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("favoriteBooks", JSON.stringify(favorites));
  }, [favorites]);

  // Base filtering by category + language (simulate loading)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      let base = booksData;

      if (categoryFilter === "Favorites") {
        base = favorites;
      } else if (categoryFilter !== "All") {
        base = base.filter((book) => book.book_category === categoryFilter);
      }

      if (languageFilter === "ar") {
        base = base.filter(
          (book) => book.book_lang === "ar" || book.book_lang === "both",
        );
      } else if (languageFilter === "en") {
        base = base.filter(
          (book) => book.book_lang === "en" || book.book_lang === "both",
        );
      }

      setFilteredBooks(base);
      setLoading(false);
    }, 650);

    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [categoryFilter, languageFilter, favorites]);

  const handleAddToFavorites = (book) => {
    if (favorites.some((fav) => fav.id === book.id)) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== book.id));
      toast.info(
        language === "ar"
          ? "تمت إزالة الكتاب من المفضلة"
          : "Book removed from favorites",
      );
    } else {
      setFavorites((prev) => [...prev, book]);
      toast.success(
        language === "ar"
          ? "تم إضافة الكتاب إلى المفضلة"
          : "Book added to favorites",
      );
    }
  };

  const handleShare = async (book) => {
    const url =
      languageFilter === "ar"
        ? book.book_url_ar
        : book.book_url_en || book.book_url_ar;
    const title =
      book.book_name?.[languageFilter] || book.book_name?.ar || "Book";

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        toast.success(
          language === "ar" ? "شكرا لك على النشر" : "Thanks for sharing!",
        );
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(
          language === "ar"
            ? "تم نسخ الرابط إلى الحافظة"
            : "Link copied to clipboard",
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageLoad = (id) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  const openPreview = (book) => {
    setActiveBook(book);
    setPreviewOpen(true);
  };

  const openSummary = (book) => {
    setActiveBook(book);
    setSummaryOpen(true);
  };

  const getBookUrl = (book) =>
    languageFilter === "ar"
      ? book.book_url_ar
      : book.book_url_en || book.book_url_ar;

  const getBookImage = (book) =>
    languageFilter === "ar"
      ? book.book_image_ar
      : book.book_image_en || book.book_image_ar;

  const getBookTitle = (book) =>
    book.book_name?.[languageFilter] || book.book_name?.ar || "—";

  const getBookSize = (book) =>
    languageFilter === "ar" ? book.book_size_ar : book.book_size_en;

  const isFav = (book) => favorites.some((fav) => fav.id === book.id);

  // Search + Sort + Favorites reverse (display logic)
  const booksToDisplay = useMemo(() => {
    const base =
      categoryFilter === "Favorites"
        ? filteredBooks.slice().reverse()
        : filteredBooks.slice();

    const q = query.trim().toLowerCase();
    const searched = q
      ? base.filter((b) => {
          const tAr = (b.book_name?.ar || "").toLowerCase();
          const tEn = (b.book_name?.en || "").toLowerCase();
          return tAr.includes(q) || tEn.includes(q);
        })
      : base;

    const sorted = searched.sort((a, b) => {
      const ta = (getBookTitle(a) || "").toString().toLowerCase();
      const tb = (getBookTitle(b) || "").toString().toLowerCase();
      return sortMode === "az" ? ta.localeCompare(tb) : tb.localeCompare(ta);
    });

    return sorted;
    // eslint-disable-next-line
  }, [filteredBooks, categoryFilter, query, sortMode, languageFilter]);

  return (
    <Box>
      {/* Header / Controls */}
      <Box className="libHeader">
        <Box className="libHeaderRow">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "ar" ? "ابحث عن كتاب..." : "Search a book..."
            }
            startDecorator={<SearchOutlinedIcon />}
            className="libSearch"
          />

          <Select
            value={sortMode}
            onChange={(e, v) => setSortMode(v)}
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
            className="select"
            startDecorator={<SortByAlphaOutlinedIcon />}
          >
            <Option value="az">
              {language === "ar" ? "ترتيب: أ→ي" : "Sort: A→Z"}
            </Option>
            <Option value="za">
              {language === "ar" ? "ترتيب: ي→أ" : "Sort: Z→A"}
            </Option>
          </Select>
        </Box>

        <Box className="libHeaderRow">
          <Select
            value={categoryFilter}
            onChange={(e, value) => setCategoryFilter(value)}
            placeholder={
              language === "ar" ? "تصفية حسب النوع" : "Filter by Category"
            }
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
            className="select"
          >
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {bookCategories[cat]?.[language] || cat}
              </Option>
            ))}
          </Select>

          <Select
            value={languageFilter}
            onChange={(e, value) => setLanguageFilter(value)}
            placeholder={language === "ar" ? "اختر اللغة" : "Select Language"}
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
            className="select"
          >
            {languages.map((lang) => (
              <Option key={lang} value={lang}>
                {language === "ar"
                  ? lang === "ar"
                    ? "العربية"
                    : "الإنجليزية"
                  : lang === "ar"
                    ? "Arabic"
                    : "English"}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
            alignItems: "center",
            p: 2,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          className="libGrid"
          sx={{
            textAlign: languageFilter === "ar" ? "right" : "left",
          }}
        >
          {booksToDisplay.length > 0 ? (
            booksToDisplay.map((book) => (
              <Card key={book.id} variant="outlined" className="libCard">
                <Box className="libCoverWrap">
                  <Chip
                    variant="soft"
                    size="sm"
                    className="libCategoryChip"
                    sx={{ direction: languageFilter === "ar" ? "rtl" : "ltr" }}
                  >
                    {bookCategories[book.book_category]?.[language] ||
                      book.book_category}
                  </Chip>

                  {!imageLoaded[book.id] && (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={210}
                      animation="wave"
                    />
                  )}

                  <img
                    className="libCover"
                    src={getBookImage(book)}
                    alt={getBookTitle(book)}
                    style={
                      imageLoaded[book.id]
                        ? { display: "block" }
                        : { display: "none" }
                    }
                    onLoad={() => handleImageLoad(book.id)}
                    onError={() => handleImageLoad(book.id)}
                  />
                </Box>

                <CardContent className="libCardContent">
                  <Typography level="title-md" className="libTitle">
                    {getBookTitle(book)}
                  </Typography>

                  <Box className="libMeta">
                    <Chip size="sm" variant="soft">
                      {languageFilter === "ar" ? "الحجم" : "Size"}:{" "}
                      {getBookSize(book) || "—"}
                    </Chip>

                    <Chip size="sm" variant="soft">
                      {languageFilter === "ar"
                        ? book.book_lang === "both"
                          ? "لغتان"
                          : book.book_lang === "ar"
                            ? "عربي"
                            : "إنجليزي"
                        : book.book_lang === "both"
                          ? "2 languages"
                          : book.book_lang === "ar"
                            ? "Arabic"
                            : "English"}
                    </Chip>
                  </Box>
                </CardContent>

                <Divider />

                <Box className="libActions">
                  {/* Preview */}
                  <Tooltip
                    title={language === "ar" ? "معاينة PDF" : "Preview PDF"}
                  >
                    <IconButton
                      onClick={() => openPreview(book)}
                      className="libActionBtn"
                      aria-label="preview"
                    >
                      <VisibilityOutlinedIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Summary */}
                  <Tooltip title={language === "ar" ? "ملخص" : "Summary"}>
                    <IconButton
                      onClick={() => openSummary(book)}
                      className="libActionBtn"
                      aria-label="summary"
                    >
                      <DescriptionOutlinedIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Download */}
                  <Tooltip title={language === "ar" ? "تحميل" : "Download"}>
                    <IconButton
                      component="a"
                      href={getBookUrl(book)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="libActionBtn"
                      aria-label="download"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Share */}
                  <Tooltip title={language === "ar" ? "مشاركة" : "Share"}>
                    <IconButton
                      onClick={() => handleShare(book)}
                      className="libActionBtn"
                      aria-label="share"
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Favorite */}
                  <Tooltip title={language === "ar" ? "مفضلة" : "Favorite"}>
                    <IconButton
                      onClick={() => handleAddToFavorites(book)}
                      className={`libActionBtn ${isFav(book) ? "isFav" : ""}`}
                      aria-label="favorite"
                    >
                      {isFav(book) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            ))
          ) : (
            <Alert
              variant="outlined"
              color="info"
              sx={{
                fontSize: "16px",
                width: "min(920px, 95%)",
                margin: "10px auto",
                textAlign: "center",
                color: "#169777",
                direction: language === "ar" ? "rtl" : "ltr",
                backgroundColor: "transparent",
                border: "1px solid #169777",
              }}
            >
              {categoryFilter === "Favorites"
                ? language === "ar"
                  ? "لا توجد كتب في المفضلة حاليًا. الرجاء إضافة بعض الكتب إلى المفضلة."
                  : "There are currently no books in your favorites. Please add some books."
                : language === "ar"
                  ? "لا توجد كتب متاحة لهذه التصفية."
                  : "No books available for this filter."}
            </Alert>
          )}
        </Box>
      )}

      {/* PDF Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <ModalDialog className="libModal" layout="center">
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VisibilityOutlinedIcon />
            <Typography level="title-md" sx={{ flex: 1, color: "inherit" }}>
              {activeBook ? getBookTitle(activeBook) : ""}
            </Typography>
            <IconButton variant="plain" onClick={() => setPreviewOpen(false)}>
              <CloseOutlinedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent className="libModalContent">
            {activeBook ? (
              <iframe
                title="pdf-preview"
                src={getBookUrl(activeBook)}
                className="libPdfFrame"
              />
            ) : null}

            <Typography level="body-xs" sx={{ opacity: 0.75, mt: 1 }}>
              {language === "ar"
                ? "إذا لم تظهر المعاينة في بعض الأجهزة، استخدم زر التحميل."
                : "If preview doesn’t load on some devices, use Download."}
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              component="a"
              href={activeBook ? getBookUrl(activeBook) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              variant="solid"
            >
              {language === "ar" ? "تحميل" : "Download"}
            </Button>
            <Button variant="outlined" onClick={() => setPreviewOpen(false)}>
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Summary Modal */}
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <ModalDialog className="libModal" layout="center">
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DescriptionOutlinedIcon />
            <Typography level="title-md" sx={{ flex: 1 }}>
              {activeBook ? getBookTitle(activeBook) : ""}
            </Typography>
            <IconButton variant="plain" onClick={() => setSummaryOpen(false)}>
              <CloseOutlinedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent className="libSummary">
            {activeBook ? (
              <>
                <Typography
                  level="body-sm"
                  sx={{ lineHeight: 1.9, color: "var(--text-color)" }}
                >
                  {/* If you add these fields in JSON: book_summary_ar / book_summary_en */}
                  {languageFilter === "ar"
                    ? activeBook.book_summary_ar ||
                      "لا يوجد ملخص لهذا الكتاب بعد. يمكنك إضافته داخل المفضلة."
                    : activeBook.book_summary_en ||
                      "No summary yet. You can add it to favorite"}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip variant="soft">
                    {languageFilter === "ar" ? "التصنيف" : "Category"}:{" "}
                    {bookCategories[activeBook.book_category]?.[language] ||
                      activeBook.book_category}
                  </Chip>
                  <Chip variant="soft">
                    {languageFilter === "ar" ? "اللغة" : "Language"}:{" "}
                    {activeBook.book_lang === "both"
                      ? language === "ar"
                        ? "العربية-الانجليزية"
                        : "Arabic-English"
                      : ""}
                    {activeBook.book_lang === "ar"
                      ? language === "ar"
                        ? "العربية"
                        : "Arabic"
                      : ""}
                    {activeBook.book_lang === "en"
                      ? language === "ar"
                        ? "الانجليزية"
                        : "English"
                      : ""}
                  </Chip>
                  <Chip variant="soft">
                    {languageFilter === "ar" ? "الحجم" : "Size"}:{" "}
                    {getBookSize(activeBook) || "—"}
                  </Chip>
                </Box>
              </>
            ) : null}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                if (activeBook) handleShare(activeBook);
              }}
              variant="outlined"
            >
              {language === "ar" ? "مشاركة" : "Share"}
            </Button>
            <Button variant="solid" onClick={() => setSummaryOpen(false)}>
              {language === "ar" ? "تم" : "Done"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Library;
