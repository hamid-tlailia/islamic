import React, { useState, useEffect } from "react";
import "./library.css";
// Import Json file of books
import booksData from "./json/books.json";
// Import language provider
import { useTranslation } from "../../../../components/languages/provider";
// Import Joy UI components
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
} from "@mui/joy";
// Import Icons
import DownloadIcon from "@mui/icons-material/Download";
import FavoriteIcon from "@mui/icons-material/Favorite"; // Import filled heart icon
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share"; // Import ShareIcon
import { toast } from "react-toastify";

const Library = () => {
  const { language } = useTranslation();

  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState(language);
  const [loading, setLoading] = useState(false);

  // Initialize favorites from localStorage
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favoriteBooks");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const bookCategories = {
    All: {
      en: "All",
      ar: "الكل",
    },
    Favorites: {
      en: "Favorites",
      ar: "المفضلة",
    },
    Adhkar: {
      en: "Supplications",
      ar: "الأذكار",
    },
    Quran: {
      en: "Quran",
      ar: "القرآن",
    },
    Dalalat: {
      en: "Signs",
      ar: "الدلالات العقدية",
    },
    Tawhid: {
      en: "Tawhid",
      ar: "التوحيد",
    },
    Sunnah: {
      en: "Sunnah",
      ar: "السنة",
    },
    Sira: {
      en: "Seerah of the Prophet",
      ar: "السيرة النبوية",
    },
    Signs: {
      en: "Signs of Hour",
      ar: "علامات الساعة",
    },
    Others: {
      en: "Other categories",
      ar: "مواضيع مختلفة",
    },
    Fiqh: {
      en: "Islamic Fiqh",
      ar: "الفقه الاسلامي",
    },
  };

  const categories = [
    "All",
    "Favorites",
    ...new Set(booksData.map((book) => book.book_category)),
  ];

  const languages = ["ar", "en"];

  // useEffect for category and language filtering
  useEffect(() => {
    setLoading(true);
    // Simulate loading time
    setTimeout(() => {
      let filtered = booksData;

      if (categoryFilter === "Favorites") {
        filtered = favorites;
      } else if (categoryFilter !== "All") {
        filtered = filtered.filter(
          (book) => book.book_category === categoryFilter
        );
      }

      if (languageFilter === "ar") {
        filtered = filtered.filter(
          (book) => book.book_lang === "ar" || book.book_lang === "both"
        );
      } else if (languageFilter === "en") {
        filtered = filtered.filter(
          (book) => book.book_lang === "en" || book.book_lang === "both"
        );
      }

      setFilteredBooks(filtered);
      setLoading(false);
    }, 1000);
    // eslint-disable-next-line
  }, [categoryFilter, languageFilter]);

  // useEffect for favorites changes when in "Favorites" category
  useEffect(() => {
    if (categoryFilter === "Favorites") {
      setLoading(true);
      // Simulate loading time
      setTimeout(() => {
        let filtered = favorites;

        if (languageFilter === "ar") {
          filtered = filtered.filter(
            (book) => book.book_lang === "ar" || book.book_lang === "both"
          );
        } else if (languageFilter === "en") {
          filtered = filtered.filter(
            (book) => book.book_lang === "en" || book.book_lang === "both"
          );
        }

        setFilteredBooks(filtered);
        setLoading(false);
      }, 1000);
    }
    // eslint-disable-next-line
  }, [favorites, categoryFilter, languageFilter]);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("favoriteBooks", JSON.stringify(favorites));
  }, [favorites]);

  const handleAddToFavorites = (book) => {
    if (favorites.some((favBook) => favBook.id === book.id)) {
      // Remove the book if it exists
      const updatedFavorites = favorites.filter(
        (favBook) => favBook.id !== book.id
      );
      setFavorites(updatedFavorites);
      toast.info(
        language === "ar"
          ? "تمت إزالة الكتاب من المفضلة"
          : "Book removed from favorites"
      );
    } else {
      // Add the book if it does not exist
      setFavorites([...favorites, book]);
      toast.success(
        language === "ar"
          ? "تم إضافة الكتاب إلى المفضلة"
          : "Book added to favorites"
      );
    }
  };

  const handleShare = (book) => {
    const url =
      languageFilter === "ar"
        ? book.book_url_ar
        : book.book_url_en || book.book_url_ar;

    const title = book.book_name[languageFilter] || book.book_name["ar"];

    if (navigator.share) {
      navigator
        .share({
          title: title,
          url: url,
        })
        .then(() => {
          toast.success(
            language === "ar" ? "شكرا لك على النشر" : "Thanks for sharing!"
          );
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that do not support navigator.share
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success(
            language === "ar"
              ? "تم نسخ الرابط إلى الحافظة"
              : "Link copied to clipboard"
          );
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          marginBottom: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
          {categories.map((category) => (
            <Option key={category} value={category}>
              {bookCategories[category]?.[language] || category}
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

      {/* Books */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: 4,
            alignItems: "center",
            p: 2,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            textAlign:
              languageFilter === "ar"
                ? "right"
                : languageFilter === "en"
                ? "left"
                : "right",
          }}
        >
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  maxHeight: 500,
                  maxWidth: 300,
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
              >
                <img
                  className="img-fluid w-100"
                  src={
                    languageFilter === "ar"
                      ? book.book_image_ar
                      : book.book_image_en || book.book_image_ar
                  }
                  alt={book.book_name[language]}
                />

                <CardContent>
                  <Typography
                    level="h6"
                    component="div"
                    sx={{ color: "var(--main-color)" }}
                  >
                    {book.book_name[languageFilter] || book.book_name["ar"]}
                  </Typography>
                  <Typography level="body2">
                    {languageFilter === "ar" ? "الحجم :" : "Size:"}{" "}
                    {languageFilter === "ar"
                      ? book.book_size_ar
                      : book.book_size_en}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 1,
                    boxShadow: 3,
                  }}
                  className="box"
                >
                  <IconButton
                    component="a"
                    href={
                      languageFilter === "ar"
                        ? book.book_url_ar
                        : book.book_url_en || book.book_url_ar
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "blue",
                      "&:hover": {
                        border: "1px solid blue",
                        color: "blue",
                      },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>

                  {/* Share Button */}
                  <IconButton
                    onClick={() => handleShare(book)}
                    sx={{
                      color: "var(--text-color)",
                      "&:hover": {
                        color: "blue",
                      },
                    }}
                  >
                    <ShareIcon />
                  </IconButton>

                  {/* Favorite Button */}
                  <IconButton
                    onClick={() => handleAddToFavorites(book)}
                    sx={{
                      color: favorites.some((favBook) => favBook.id === book.id)
                        ? "red"
                        : "var(--text-color)",
                      "&:hover": {
                        color: favorites.some(
                          (favBook) => favBook.id === book.id
                        )
                          ? "darkred"
                          : "gray",
                      },
                    }}
                  >
                    {favorites.some((favBook) => favBook.id === book.id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Box>
              </Card>
            ))
          ) : categoryFilter === "Favorites" ? (
            <Alert
              variant="outlined"
              color="info"
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
                direction: language === "ar" ? "rtl" : "ltr",
                backgroundColor: "transparent",
                border: "1px solid #169777",
              }}
            >
              {language === "ar"
                ? "لا توجد كتب في المفضلة حاليًا. الرجاء إضافة بعض الكتب إلى المفضلة."
                : "There are currently no books in your favorites. Please add some books to your favorites."}
            </Alert>
          ) : (
            <Alert
              variant="outlined"
              color="info"
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
                direction: language === "ar" ? "rtl" : "ltr",
                backgroundColor: "transparent",
                border: "1px solid #169777",
              }}
            >
              {language === "ar"
                ? "لا توجد كتب متاحة لهذه التصفية."
                : "No books available for this filter."}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Library;
