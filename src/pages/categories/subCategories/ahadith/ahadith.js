import React, { useState, useEffect, useRef } from "react";
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
  ModalClose,
  Sheet,
} from "@mui/joy"; // Import from MUI Joy
import Chip from "@mui/joy/Chip";
import { Pagination, Stack } from "@mui/material";
import "./ahadith.css";
import { useTranslation } from "../../../../components/languages/provider";
import Loader from "../../../../components/loader/loader";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { toast } from "react-toastify";
import BookIcon from "@mui/icons-material/Book";
import PersonIcon from "@mui/icons-material/Person";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LayersIcon from "@mui/icons-material/Layers";
import EventIcon from "@mui/icons-material/Event";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitization

const Ahadith = () => {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [ahadith, setAhadith] = useState([]);
  const [selectedBook, setSelectedBook] = useState(() => {
    return localStorage.getItem("selectedBook") || null;
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return localStorage.getItem("selectedChapter") || null;
  });
  // eslint-disable-next-line
  const [loader, setLoader] = useState(false);
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem("page");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { language } = useTranslation();
  const [open, setOpen] = useState(false); // State to manage the modal open/close status
  const [searchResult, setSearchResult] = useState(null);
  const [hadithNumber, setHadithNumber] = useState("");
  const [hadithLangs, setHadithLangs] = useState("ar");
  const [openHadithModal, setOpenHadithModal] = React.useState(false);
  const [hadithExplanation, setHadithExplanation] = useState(null);
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  // Function to handle modal close
  const handleClose = () => {
    setOpen(false);
  };
  const API_BASE_URL = "https://hadithapi.com/api";
  const API_KEY = "$2y$10$fU2PWbaYN3uvYDyOgAqwOoR2FoASJXazDpMFEnGcEJyxbkGwLJeq";

  const booksList = {
    "sahih-bukhari": {
      ar: "صحيح البخاري",
      en: "Sahih Bukhari",
    },
    "sahih-muslim": {
      ar: "صحيح مسلم",
      en: "Sahih Muslim",
    },
    "al-tirmidhi": {
      ar: "جامع الترمذي",
      en: "Jami' Al-Tirmidhi",
    },
    "abu-dawood": {
      ar: "سنن أبي داود",
      en: "Sunan Abu Dawood",
    },
    "ibn-e-majah": {
      ar: "سنن ابن ماجه",
      en: "Sunan Ibn-e-Majah",
    },
    "sunan-nasai": {
      ar: "سنن النسائي",
      en: "Sunan An-Nasa'i",
    },
    mishkat: {
      ar: "مشكاة المصابيح",
      en: "Mishkat Al-Masabih",
    },
    "musnad-ahmad": {
      ar: "مسند أحمد",
      en: "Musnad Ahmad",
    },
    "al-silsila-sahiha": {
      ar: "السلسلة الصحيحة",
      en: "Al-Silsila Sahiha",
    },
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, []);

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

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books?apiKey=${API_KEY}`);
      const data = await response.json();

      if (data.books && typeof data.books === "object") {
        const booksArray = Object.values(data.books).filter(
          (book) =>
            book.bookName !== "Musnad Ahmad" &&
            book.bookName !== "Al-Silsila Sahiha"
        );
        setBooks(booksArray);

        // Validate selectedBook from localStorage
        if (selectedBook) {
          const isBookValid = booksArray.find(
            (book) => book.bookSlug === selectedBook
          );
          if (!isBookValid) {
            setSelectedBook(null);
            localStorage.removeItem("selectedBook");
          }
        }
      } else {
        console.error("Books data is not in the expected format:", data);
        setBooks([]);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setIsErrorFetching(true);
    }
  };

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook);
      // Do not reset page here, as we want to restore last page
      setAhadith([]);
      setTotalPages(1);
      // Save selectedBook to localStorage
      localStorage.setItem("selectedBook", selectedBook);
    } else {
      // If no selectedBook, remove from localStorage
      localStorage.removeItem("selectedBook");
    }
    // eslint-disable-next-line
  }, [selectedBook]);

  const fetchChapters = async (bookSlug) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${bookSlug}/chapters?&apiKey=${API_KEY}`
      );
      const data = await response.json();

      if (data.chapters && Array.isArray(data.chapters)) {
        setChapters(data.chapters);

        // Validate selectedChapter from localStorage
        if (selectedChapter) {
          const isChapterValid = data.chapters.find(
            (chapter) => chapter.chapterNumber.toString() === selectedChapter
          );
          if (!isChapterValid) {
            setSelectedChapter(null);
            localStorage.removeItem("selectedChapter");
          }
        }
      } else {
        console.error("Chapters data is not in the expected format:", data);
        setChapters([]);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setIsErrorFetching(true);
    }
  };

  useEffect(() => {
    if (selectedChapter) {
      fetchAhadith();
      // Save selectedChapter to localStorage
      localStorage.setItem("selectedChapter", selectedChapter);
    } else {
      // If no selectedChapter, remove from localStorage
      localStorage.removeItem("selectedChapter");
    }
    // eslint-disable-next-line
  }, [selectedChapter, page]); // Include 'page' here

  useEffect(() => {
    // Save page to localStorage
    localStorage.setItem("page", page);
  }, [page]);

  const fetchAhadith = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/hadiths?&apiKey=${API_KEY}&book=${selectedBook}&chapter=${selectedChapter}&page=${page}`
      );
      const data = await response.json();

      if (
        data.hadiths &&
        data.hadiths.data &&
        Array.isArray(data.hadiths.data)
      ) {
        setAhadith(data.hadiths.data);
        setTotalPages(data.hadiths.last_page || 1);
        setSearchResult(null);

        // If page is not selected, default to 1 if multiple pages exist
        if (!page && data.hadiths.last_page > 1) {
          setPage(1);
        }
      } else {
        console.error("Ahadith data is not in the expected format");
        setAhadith([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching ahadith:", error);
      setIsErrorFetching(true);
    } finally {
      setLoading(false);
    }
  };

  const getDegreeColor = (status) => {
    if (status === "Sahih" || status === "sahih") return "green";
    else if (status === "Daif") return "red";
    return "black";
  };
  const writerInfo = {
    "sahih-bukhari": {
      writerName: {
        en: "Imam Bukhari",
        ar: "الإمام البخاري",
      },
      writerDeath: {
        en: "256 AH",
        ar: "256 هـ",
      },
    },
    "sahih-muslim": {
      writerName: {
        en: "Imam Muslim",
        ar: "الإمام مسلم",
      },
      writerDeath: {
        en: "261 AH",
        ar: "261 هـ",
      },
    },
    "al-tirmidhi": {
      writerName: {
        en: "Imam At-Tirmidhi",
        ar: "الإمام الترمذي",
      },
      writerDeath: {
        en: "279 AH",
        ar: "279 هـ",
      },
    },
    "abu-dawood": {
      writerName: {
        en: "Imam Abu Dawood",
        ar: "الإمام أبو داود",
      },
      writerDeath: {
        en: "275 AH",
        ar: "275 هـ",
      },
    },
    "ibn-e-majah": {
      writerName: {
        en: "Imam Ibn Majah",
        ar: "الإمام ابن ماجه",
      },
      writerDeath: {
        en: "273 AH",
        ar: "273 هـ",
      },
    },
    "sunan-nasai": {
      writerName: {
        en: "Imam An-Nasa'i",
        ar: "الإمام النسائي",
      },
      writerDeath: {
        en: "303 AH",
        ar: "303 هـ",
      },
    },
    mishkat: {
      writerName: {
        en: "Imam Khatib at-Tabrizi",
        ar: "الإمام الخطيب التبريزي",
      },
      writerDeath: {
        en: "741 AH",
        ar: "741 هـ",
      },
    },
  };

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
        language === "ar" ? booksList[bookSlug]?.ar : booksList[bookSlug]?.en,
      writerName: writerName,
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

  const hadithForScience = {
    ar: {
      text: "قال رسول الله (صلى الله عليه وسلم) : من سلك طريقًا يلتمس فيه علمًا، سهل الله له به طريقًا إلى الجنة",
      description:
        "هذا الحديث يحث على طلب العلم ويسلط الضوء على فضله في الإسلام.",
      reference: "رواه مسلم",
    },
    en: {
      text: "Whoever follows a path in pursuit of knowledge, Allah will make a path to Paradise easy for him.",
      description:
        "This hadith encourages seeking knowledge and highlights its virtue in Islam.",
      reference: "Narrated by Muslim",
    },
  };

  const response = useRef(null);
  const resultSearch = useRef(null);
  const handleSearch = () => {
    const hadithsCounts = translateBookInfo(
      books.find((book) => book.bookSlug === selectedBook)
    ).hadithsCount?.replace(
      language === "ar" ? "عدد الأحاديث:" : "Hadiths Count:",
      ""
    );
    const respAria = response.current;
    const result = resultSearch.current;
    if (!selectedBook) {
      if (respAria) {
        if (language === "ar") {
          respAria.innerHTML = "الرجاء اختيار الكتاب";
        } else {
          respAria.innerHTML = "Please choose a book";
        }
      }
    } else if (hadithNumber > Number(hadithsCounts.trim())) {
      if (respAria) {
        if (language === "ar") {
          respAria.innerHTML = `رقم الحديث غير موجود , اخر حديث رقم : ${hadithsCounts}`;
        } else {
          respAria.innerHTML = "Hadith number does not exist in book";
        }
      }
    } else {
      setLoading(true);
      setSearchResult(null); // Reset previous search results
      fetch(
        `${API_BASE_URL}/hadiths?apiKey=${API_KEY}&book=${selectedBook}&hadithNumber=${hadithNumber}`
      )
        .then((response) => response.json())
        .then((data) => {
          setSearchResult(data.hadiths.data[0]); // Set search results
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching hadith:", error);
          setLoading(false);
          if (result) {
            if (language === "ar") {
              result.innerHTML = "رقم الحديث غير موجود في الكتاب";
            } else {
              result.innerHTML = "Hadith number does not exist in book";
            }
          }
          setIsErrorFetching(true);
        });
      setOpen(false);
      setAhadith([]);
    }
  };
  // Helper function to get the display value based on the current language
  const getDisplayLangValue = (lang) => {
    if (hadithLangs === "ar") return language === "ar" ? "العربية" : "arabic";
    if (hadithLangs === "en")
      return language === "ar" ? "الإنجليزية" : "english";
    return ""; // Default to an empty string if no valid value
  };

  const fetchHadithExplanation = async (hadith) => {
    const apiUrl = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(
      hadith
    )}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      apiUrl
    )}`;

    setLoader(true);
    setHadithExplanation(null);
    setOpenHadithModal(true);

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the contents of the response
      const data = await response.json();
      const parsedData = JSON.parse(data.contents); // Since data comes as a string
      const explanation = parsedData.ahadith?.result || "No explanation found.";

      const cleanContent = DOMPurify.sanitize(explanation);
      setHadithExplanation(cleanContent);
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.error("Error fetching Hadith explanation:", error);
      setHadithExplanation(
        language === "ar"
          ? "لا تتوفر معلومات عن الحديث"
          : "Hadith Summary not available"
      );
      setIsErrorFetching(true);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column w-100">
      {selectedBook && ahadith.length === 0 && (
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            transition: "all 0.3s ease",
          }}
        >
          <CardContent>
            <Stack
              spacing={2}
              direction="column"
              sx={{
                textAlign: language === "ar" ? "right" : "left",
                direction: language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="w-100 text-center text-success">
                {language === "ar"
                  ? "معلومات عن المؤلف"
                  : "Summary about Author"}
              </div>
              <hr />
              {/* Book Name */}
              <Typography
                variant="h5"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <BookIcon
                  sx={{
                    mr: language === "ar" ? 0 : 1,
                    ml: language === "ar" ? 1 : 0,
                  }}
                />
                {language === "ar" ? "الكتاب" : "Book"}:{" "}
                {
                  translateBookInfo(
                    books.find((book) => book.bookSlug === selectedBook)
                  ).bookName
                }
              </Typography>
              {/* Author */}
              <Typography
                variant="body1"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <PersonIcon
                  sx={{
                    mr: language === "ar" ? 0 : 1,
                    ml: language === "ar" ? 1 : 0,
                  }}
                />
                {language === "ar" ? "المؤلف" : "Author"}:{" "}
                {
                  translateBookInfo(
                    books.find((book) => book.bookSlug === selectedBook)
                  ).writerName
                }
              </Typography>

              {/* Hadiths Count */}
              <Typography
                variant="body1"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <FormatListNumberedIcon
                  sx={{
                    mr: language === "ar" ? 0 : 1,
                    ml: language === "ar" ? 1 : 0,
                  }}
                />
                {
                  translateBookInfo(
                    books.find((book) => book.bookSlug === selectedBook)
                  ).hadithsCount
                }
              </Typography>

              {/* Chapters Count */}
              <Typography
                variant="body1"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <LayersIcon
                  sx={{
                    mr: language === "ar" ? 0 : 1,
                    ml: language === "ar" ? 1 : 0,
                  }}
                />
                {
                  translateBookInfo(
                    books.find((book) => book.bookSlug === selectedBook)
                  ).chaptersCount
                }
              </Typography>

              {/* Writer's Death */}
              <Typography
                variant="body1"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <EventIcon
                  sx={{
                    mr: language === "ar" ? 0 : 1,
                    ml: language === "ar" ? 1 : 0,
                  }}
                />
                {
                  translateBookInfo(
                    books.find((book) => book.bookSlug === selectedBook)
                  ).writerDeath
                }
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      <div
        className="flex-column flex-lg-row flex-md-row justify-content-center align-items-center gap-3 mb-3"
        style={{ display: loading ? "none" : "flex" }}
      >
        {ahadith.length === 0 && (
          <>
            {/* FormControl for Selecting Book */}
            <FormControl
              sx={{ minWidth: 200, marginRight: 2, mb: 2 }}
              disabled={!books.length}
              required
            >
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "اختر كتابا" : "Select Book"}
              </FormLabel>
              <JoyAutocomplete
                placeholder={language === "ar" ? "اختر كتابا" : "Select Book"}
                options={books}
                getOptionLabel={(option) =>
                  option && booksList[option.bookSlug]
                    ? language === "ar"
                      ? booksList[option.bookSlug].ar
                      : booksList[option.bookSlug].en
                    : ""
                }
                onChange={(event, newValue) => {
                  setSelectedBook(newValue ? newValue.bookSlug : null);
                  setSelectedChapter(null);
                  setChapters([]);
                  setAhadith([]);
                  setPage(1);
                  localStorage.removeItem("selectedChapter");
                  localStorage.removeItem("page");
                }}
                value={
                  selectedBook
                    ? books.find((book) => book.bookSlug === selectedBook)
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

            {/* FormControl for Selecting Chapter */}
            {selectedBook && (
              <FormControl
                sx={{
                  minWidth: 200,
                  marginRight: 2,
                  mb: 2,
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
                disabled={!chapters.length}
                required
              >
                <FormLabel sx={{ color: "var(--text-color)" }}>
                  {language === "ar" ? "اختر فصلا" : "Select Chapter"}
                </FormLabel>
                <JoyAutocomplete
                  placeholder={
                    language === "ar" ? "اختر فصلا" : "Select Chapter"
                  }
                  options={chapters}
                  getOptionLabel={(option) =>
                    option
                      ? language === "ar"
                        ? option.chapterArabic
                        : option.chapterEnglish
                      : ""
                  }
                  value={
                    selectedChapter
                      ? chapters.find(
                          (chapter) => chapter.chapterNumber === selectedChapter
                        )
                      : null
                  }
                  onChange={(event, newValue) => {
                    setSelectedChapter(
                      newValue ? newValue.chapterNumber : null
                    );
                    setPage(1);
                    setAhadith([]);
                    localStorage.removeItem("page");
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.chapterNumber === value?.chapterNumber
                  }
                  sx={{
                    backgroundColor: "var(--card-color)",
                    color: "var(--text-color)",
                  }}
                />
              </FormControl>
            )}
          </>
        )}
        {ahadith.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            className="w-50"
            onClick={() => {
              setAhadith([]);
            }}
          >
            {language === "ar" ? "اعادة تعيين" : "Reset"}
          </Button>
        )}
        {/* Pagination */}
        {!loading &&
          totalPages > 1 &&
          selectedChapter &&
          ahadith.length > 0 && (
            <Stack
              spacing={2}
              className="my-3 mt-2 d-flex justify-content-center align-items-center w-100 ltr mt-0"
              sx={{ width: "100%", textAlign: "center" }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                variant="outlined"
                color="primary"
                size="medium"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "var(--text-color)",
                    borderColor: "var(--text-color)",
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "blue",
                    color: "#fff",
                    borderColor: "var(--primary-color)",
                  },
                }}
              />
            </Stack>
          )}
        <FormControl>
          <Button
            className={ahadith.length === 0 && "mt-2"}
            variant="outlined"
            color="primary"
            onClick={() => setOpen(true)}
          >
            <SearchOutlinedIcon />
          </Button>
        </FormControl>
      </div>
      {loading && (
        <div className="close-loader" onClick={() => setLoading(false)}>
          X
        </div>
      )}
      {searchResult !== null && !loading && (
        <div
          key={searchResult.id}
          className="card p-2 mb-2 border border-secondary d-flex flex-column gap-3"
          ref={resultSearch}
        >
          <h5 className="hadith-heading">
            {hadithLangs === "ar"
              ? searchResult.hadithArabic
              : searchResult.hadithEnglish
              ? searchResult.hadithEnglish
              : "English version not available"}
          </h5>
          <div className="d-flex flex-column flex-lg-row flex-md-row justify-content-between align-items-center gap-2">
            <Chip
              variant="outlined"
              color="success"
              style={{
                color: getDegreeColor(searchResult.status),
                borderRadius: "5px",
                backgroundColor: "transparent",
              }}
            >
              {hadithLangs === "ar"
                ? `درجة الحديث : ${
                    searchResult.status === "Sahih" ||
                    searchResult.status === "sahih"
                      ? "صحيح"
                      : searchResult.status
                  }`
                : `Hadith Status : ${searchResult.status}`}
            </Chip>
            <p className="hadith-number">
              {hadithLangs === "ar"
                ? `رقم الحديث: ${searchResult.hadithNumber}`
                : `Hadith Number: ${searchResult.hadithNumber}`}
            </p>
            <div className="hadith-options d-flex flex-row gap-2 mb-4">
              <Button
                onClick={() =>
                  navigator.clipboard
                    .writeText(
                      hadithLangs === "ar"
                        ? searchResult?.hadithArabic
                        : searchResult?.hadithEnglish
                    )
                    .then(() =>
                      toast.success(
                        language === "ar"
                          ? "تم نسخ الحديث بنجاح"
                          : "Hadith copied to clipboard"
                      )
                    )
                }
                variant="outlined"
                color="primary"
              >
                <ContentCopyOutlinedIcon />
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  fetchHadithExplanation(searchResult?.hadithArabic)
                }
              >
                <MenuBookOutlinedIcon />
              </Button>
            </div>
          </div>
        </div>
      )}
      {ahadith.length === 0 && !searchResult && (
        <div
          className="w-100 my-5 p-4 text-center  border rounded shadow"
          style={{
            direction: language === "ar" ? "rtl" : "ltr",
            textAlign: "center",
          }}
        >
          <h5 className="text-primary font-weight-bold">
            {language === "ar"
              ? hadithForScience.ar.text
              : hadithForScience.en.text}
          </h5>
          <small className="text-justify">
            {language === "ar"
              ? hadithForScience.ar.reference
              : hadithForScience.en.reference}
          </small>
          <p className="mt-4 p-3 text-dark bg-warning rounded">
            {language === "ar"
              ? hadithForScience.ar.description
              : hadithForScience.en.description}
          </p>
        </div>
      )}
      {/* Loader while fetching Ahadith */}
      {loading ? (
        <div className="w-100 h-100 d-flex justify-content-center align-items-start">
          <Loader />
        </div>
      ) : (
        <div className="ahadith-list">
          {ahadith.map((hadith, index) => (
            <div
              key={index}
              className="card p-2 mb-2 border border-secondary d-flex flex-column gap-3"
            >
              <h5 className="hadith-heading">
                {language === "ar"
                  ? hadith.hadithArabic
                  : hadith.hadithEnglish
                  ? hadith.hadithEnglish
                  : "English version not available"}
              </h5>
              <div className="d-flex flex-column flex-lg-row flex-md-row justify-content-between align-items-center gap-2">
                <Chip
                  variant="outlined"
                  color="success"
                  style={{
                    color: getDegreeColor(hadith.status),
                    borderRadius: "5px",
                    backgroundColor: "transparent",
                  }}
                >
                  {language === "ar"
                    ? `درجة الحديث : ${
                        hadith.status === "Sahih" || hadith.status === "sahih"
                          ? "صحيح"
                          : hadith.status
                      }`
                    : `Hadith Status : ${hadith.status}`}
                </Chip>
                <p className="hadith-number">
                  {language === "ar"
                    ? `رقم الحديث: ${hadith.hadithNumber}`
                    : `Hadith Number: ${hadith.hadithNumber}`}
                </p>
                <div className="hadith-options d-flex flex-row gap-2 mb-4">
                  <Button
                    onClick={() =>
                      navigator.clipboard
                        .writeText(
                          language === "ar"
                            ? hadith?.hadithArabic
                            : hadith?.hadithEnglish
                        )
                        .then(() =>
                          toast.success(
                            language === "ar"
                              ? "تم نسخ الحديث بنجاح"
                              : "Hadith copied to clipboard"
                          )
                        )
                    }
                    variant="outlined"
                    color="primary"
                  >
                    <ContentCopyOutlinedIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => fetchHadithExplanation(hadith?.hadithArabic)}
                  >
                    <MenuBookOutlinedIcon />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <>
        {/* Modal component */}
        <Modal open={open} onClose={handleClose}>
          <ModalDialog
            sx={{
              borderRadius: "lg",
              padding: "24px",
              maxWidth: 600,
              minWidth: 300,
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              boxShadow: "md",
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
            className="w-100"
          >
            <div ref={response} className="text-danger w-100 text-center"></div>
            <Typography
              className="w-100 text-center text-success"
              component="h2"
              level="h6"
              sx={{ mb: 2 }}
            >
              {language === "ar" ? "ابحث عن حديث" : "Search Hadiths"}
            </Typography>
            <FormControl>
              <FormLabel
                sx={{
                  color: "var(--text-color)",
                }}
              >
                {language === "ar" ? "اللغة" : "Language"}
              </FormLabel>
              <JoyAutocomplete
                placeholder={
                  language === "ar" ? "اختر اللغة" : "Select language"
                }
                value={getDisplayLangValue(hadithLangs)}
                onChange={(event, newValue) => {
                  setHadithLangs(
                    newValue === "arabic" || newValue === "العربية"
                      ? "ar"
                      : newValue === "english" || newValue === "الإنجليزية"
                      ? "en"
                      : ""
                  );
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
            <FormControl>
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "رقم الحديث" : "Number of Hadith"}
              </FormLabel>
              <Input
                disabled={!selectedBook}
                placeholder={
                  language === "ar" ? "رقم الحديث" : "Number of Hadith"
                }
                defaultValue="1"
                sx={{
                  marginBottom: 2,
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
                onChange={(e) => setHadithNumber(e.target.value)}
              />
            </FormControl>
            {/* FormControl for Selecting Book */}

            <FormControl
              sx={{ minWidth: 200, mb: 2 }}
              disabled={!books.length}
              required
            >
              <FormLabel sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "اختر كتابا" : "Select Book"}
              </FormLabel>
              <JoyAutocomplete
                placeholder={language === "ar" ? "اختر كتابا" : "Select Book"}
                options={books}
                getOptionLabel={(option) =>
                  option && booksList[option.bookSlug]
                    ? language === "ar"
                      ? booksList[option.bookSlug].ar
                      : booksList[option.bookSlug].en
                    : ""
                }
                onChange={(event, newValue) => {
                  setSelectedBook(newValue ? newValue.bookSlug : null);
                  setSelectedChapter(null);
                  setChapters([]);
                  setAhadith([]);
                }}
                value={
                  selectedBook
                    ? books.find((book) => book.bookSlug === selectedBook)
                    : null
                }
                isOptionEqualToValue={(option, value) =>
                  option.bookSlug === value.bookSlug
                }
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                }}
                required
              />
            </FormControl>
            <FormControl className="d-flex flex-row justify-content-center gap-3  align-items-center">
              <Button
                variant="solid"
                color="primary"
                fullWidth
                className="d-flex flex-row justify-content-center  gap-2 align-items-center"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  width: "max-content",
                  border: "1px solid rgba(11,107,203,1)",
                  textAlign: "center",
                }}
                onClick={handleSearch} // Close the modal when the search button is clicked
              >
                <SearchOutlinedIcon className="mt-1 " />{" "}
                {language === "ar" ? "بحث" : "Search"}
              </Button>
              <Button
                className="d-flex justify-content-center gap-2 align-items-center"
                variant="solid"
                color="danger"
                onClick={() => setOpen(false)}
                sx={{ border: "1px solid red" }}
              >
                <CloseOutlinedIcon className="mt-1" />{" "}
                {language === "ar" ? "خروج" : "Exit"}
              </Button>
            </FormControl>
          </ModalDialog>
        </Modal>
      </>
      <React.Fragment>
        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={openHadithModal}
          onClose={() => setOpenHadithModal(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            height: "100%",
            direction: "ltr",
          }}
        >
          <Sheet
            variant="outlined"
            sx={{
              maxWidth: 500,
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
              overflowY: "auto",
              maxHeight: "90%",
              minWidth: "40%",
              textAlign: "center",
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
          >
            <ModalClose variant="plain" sx={{ m: 1 }} />
            <Typography
              component="h2"
              id="modal-title"
              level="h4"
              textColor="inherit"
              sx={{ fontWeight: "lg", mb: 1, color: "blue" }}
            >
              {language === "ar" ? "نبذة عن الحديث" : "Hadith Summary"}
            </Typography>
            <Typography
              sx={{
                minWidth: "250px",
                color: "var(--text-color)",
                direction: "rtl",
                textAlign: "center",
              }}
            >
              {loader ? (
                <Button loading variant="plain">
                  Plain
                </Button>
              ) : (
                <div
                  className="d-flex flex-column justify-content-center align-items-center w-100"
                  dangerouslySetInnerHTML={{
                    __html:
                      language === "en" || hadithLangs === "en"
                        ? "Sorry , Hadith Summary is only available in Arabic version"
                        : hadithExplanation,
                  }}
                  // Make content inside the modal scrollable
                ></div>
              )}
            </Typography>
          </Sheet>
        </Modal>
      </React.Fragment>
    </div>
  );
};

export default Ahadith;
