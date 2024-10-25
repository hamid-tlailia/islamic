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
import "./tajweed.css";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { useMediaQuery } from "@mui/material";
import { useSwipeable } from "react-swipeable";
import RestoreIcon from "@mui/icons-material/Restore";

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
      "Al-Madd Al-'Aridh (Incidental Madd) occurs when a vowel letter or a soft letter is followed by a consonant that becomes silent due to a pause. It is called 'incidental' because the final letter in the word becomes silent as a result of the pause; if it were connected, it would become a normal Madd. Its ruling allows for three possibilities: shortening (two counts), medium lengthening (four counts), and full lengthening (six counts), such as the 'yaa' in Alhamdu lillahi rabbil 'aalameen",
    description_ar:
      "المد العارض هو أن يقع بعد حرف المد أو حرف اللين ساكن سكونه عارض لأجل الوقف ، وسمي عارضا لتعرض الحرف الأخير في الكلمة للسكون نتيجة الوقف لأنه لو وصل لصار مدا طبيعيا. وحكمه : يجوز فيه ثلاثة أوجه : القصر حركتان, والتوسط أربع حركات, والإشباع ست حركات مثل الياء في (الحمد لله رب العالمين).",
    letters: "",
    color: "#4050FF",
  },
  madda_necessary: {
    en: "Necessary Madd",
    ar: "مد لازم",
    description_en:
      "Extending the vowel sound for six counts obligatorily when followed by a sukoon in the same word.",
    description_ar:
      "وهو أن يأتي بعد حرف المد سكون لازم وصلا ووقفا سواء كان ذلك في كلمة مثل (الحآقة ـ الضآلين ـ آلآن) أو حرف مثل الحروف التي في أوائل السور, وسمي لازما للزوم مده ست حركات من غير تفاوت , وأيضا للزوم سببه وهو السكون وصلا ووقفا.",
    letters: "",
    color: "#000EBC",
  },
  qalaqah: {
    en: "Qalqalah",
    ar: "قلقلة",
    description_en:
      "A vibration or echoing sound produced when pronouncing specific letters (ق، ط، ب، ج، د). It adds a bouncing effect to the pronunciation, which gives the recitation a rhythmic touch.",
    description_ar:
      "هي اهتزاز أو تردد الصوت عند نطق بعض الحروف (قطب جد)، مما يعطي تأثيرًا إيقاعيًا للنطق.",
    letters: "[ق، ط، ب، ج، د]",
    color: "#DD0008",
  },
  madda_obligatory: {
    en: "Obligatory Madd",
    ar: "مد واجب",
    description_en:
      "It is the Madd (elongation) that must be extended for four or five counts when there is a reason, such as a Hamzah in the same word or in the following word. It is called Madd Muttasil if the Hamzah is in the same word, or Madd Munfasil if the Hamzah is in the immediately following word.",
    description_ar:
      "هو المد الذي يجب مده أربع أو خمس حركات عند وجود سبب مثل الهمزة في نفس الكلمة أو في الكلمة التالية و يسمى متصلا في حال كانت الهمزة في نفس الكلمة أو منفصلا في حال كانت الهمزة في الكلمة التي تليها مباشرة.",
    letters: "",
    color: "#2144C1",
  },
  ikhafa_shafawi: {
    en: "Ikhfā’ Shafawī",
    ar: "إخفاء شفوي",
    description_en:
      "Concealing the 'Mīm Sākinah' when followed by 'Bā’ (ب)' with nasalization. This rule ensures a smooth transition between the two letters while maintaining clarity.",
    description_ar:
      "إخفاء الميم الساكنة عند ملاقاتها بحرف الباء (ب) مع الغنة، مما يضمن انتقالاً سلسًا بين الحرفين مع الحفاظ على الوضوح.",
    letters: "ب",
    color: "#D500B7",
  },
  ikhafa: {
    en: "Ikhfā’",
    ar: "إخفاء",
    description_en:
      "Concealing the 'Nūn Sākinah' or 'Tanwīn' with nasalization when followed by specific letters. This blending creates a more harmonious recitation.",
    description_ar:
      "إخفاء النون الساكنة أو التنوين مع الغنة عند ملاقاتها بحروف الإخفاء، مما يضفي على التلاوة انسجامًا أكثر - مجموعة في قولك (صف - ذا - ثنا - كم - جاد - شخص - قد - سما - دم - طالبا - زد - في - تقى - ضع - ظالما) حيث يأخذ الحرف الأول من كل كلمة..",
    letters: "[ت، ث، ج، د، ذ، ز، س، ش، ص، ض، ط، ظ، ف، ق، ك]",
    color: "#9400A8",
  },
  idgham_shafawi: {
    en: "Idghām Shafawī",
    ar: "إدغام شفوي",
    description_en:
      "Merging 'Mīm Sākinah' into the following 'Mīm' with nasalization, which helps in maintaining the fluency of recitation.",
    description_ar:
      "إدغام الميم الساكنة في الميم التالية مع الغنة، مما يساعد في الحفاظ على سلاسة التلاوة.",
    letters: "م",
    color: "green",
  },
  iqlab: {
    en: "Iqlāb",
    ar: "إقلاب",
    description_en:
      "Changing 'Nūn Sākinah' or 'Tanwīn' into 'Mīm' when followed by 'Bā’ (ب)' with nasalization. This rule allows for a more fluid transition between these letters.",
    description_ar:
      "قلب النون الساكنة أو التنوين إلى ميم عند ملاقاتها بحرف الباء (ب) مع الغنة، مما يسمح بانتقال أكثر سلاسة بين هذه الحروف.",
    letters: "ب",
    color: "#26BFFD",
  },
  idgham_ghunnah: {
    en: "Idghām with Ghunnah",
    ar: "إدغام بغنة",
    description_en:
      "Merging 'Nūn Sākinah' or 'Tanwīn' into specific letters with nasalization. This rule applies to the letters 'ي', 'م', 'ن', and 'و'.",
    description_ar:
      " 'إدغام النون الساكنة أو التنوين في بعض الحروف مع الغنة، ويطبق هذا الحكم على الحروف 'ي', 'م', 'ن', 'و - مجموعة في قولك (ينمو)'.",
    letters: "[ي، م، ن، و]",
    color: "#FF7E1E",
  },
  idgham_wo_ghunnah: {
    en: "Idghām without Ghunnah",
    ar: "إدغام بلا غنة",
    description_en:
      "Merging 'Nūn Sākinah' or 'Tanwīn' into 'Lām (ل)' and 'Rā’ (ر)' without nasalization. This creates a seamless flow in recitation.",
    description_ar:
      "إدغام النون الساكنة أو التنوين في اللام (ل) والراء (ر) بلا غنة، مما يخلق تدفقًا سلسًا في التلاوة.",
    letters: "ل، ر",
    color: "rgb(142, 121, 5)",
  },
  idgham_mutajanisayn: {
    en: "Idghām Mutajānishayn",
    ar: "إدغام متماثلين",
    description_en:
      "Merging two letters with the same articulation point but different characteristics. This rule helps maintain the fluency of the recitation.",
    description_ar:
      "إدغام حرفين اتفقا مخرجًا واختلفا صفة، مما يساعد في الحفاظ على سلاسة التلاوة.",
    letters: "",
    color: "#A1A1A1",
  },
  idgham_mutaqaribayn: {
    en: "Idghām Mutaqāribayn",
    ar: "إدغام متقاربين",
    description_en:
      "Merging two letters that are close in articulation point and characteristics, making the recitation smoother.",
    description_ar: "إدغام حرفين تقاربا مخرجًا وصفة لتسهيل النطق.",
    letters: "",
    color: "#A1A1A1",
  },
  ghunnah: {
    en: "Ghunnah",
    ar: "غنة",
    description_en:
      "A nasal sound that accompanies the pronunciation of certain letters, giving the recitation a distinct sound.",
    description_ar:
      "صوت يخرج من الخيشوم يصاحب نطق بعض الحروف، مما يضفي على التلاوة صوتًا مميزًا و هما (الميم و النون).",
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

  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);

  const [surahPageInfo, setSurahPageInfo] = useState({});

  const isSmallScreen = useMediaQuery("(max-width:500px)");
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
  // Detect if user change saved page to not saved one
  useEffect(() => {
    const savedSurah = localStorage.getItem("savedTajweedSurah");
    const savedPage = localStorage.getItem("savedPage");
    const currentSavedSurah = parseInt(savedSurah, 10);
    const currentSavedPage = parseInt(savedPage, 10);
    if (savedSurah && savedPage) {
      if (
        currentSavedPage !== currentPage &&
        currentSavedSurah !== savedSurah
      ) {
        // user change saved page
        setSavedPageChanged(true);
      } else {
        //   user still in saved page
        setSavedPageChanged(false);
      }
    }
  }, [currentPage, currentSurah, saved]);
  // Restore saved page and surah

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
  };
  // Swipe handlers for small media
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handlePrev();
    },
    onSwipedRight: () => {
      handleNext();
    },
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
        const response = await fetch(
          "https://api.quran.com/api/v4/chapters?language=en"
        );
        const data = await response.json();
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

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.verses && data.verses.length > 0) {
          const processedVerses = data.verses.map((verse) => ({
            ...verse,
            text_uthmani: processAyahText(
              verse.text_uthmani_tajweed
                .replace(/<tajweed([^>]*)>/g, "<span$1>")
                .replace(/<\/tajweed>/g, "</span>")
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
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateSurahBasedOnPage(newPage);
    } else {
      toast.info(
        language === "ar"
          ? "أنت بالفعل في أول صفحة"
          : "You are in the first page"
      );
    }
    checkSavedPage();
  };

  const handleNext = () => {
    if (currentPage && currentPage < 604) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateSurahBasedOnPage(newPage);
    } else {
      toast.info(
        language === "ar" ? "لقد وصلت الى اخر صفحة" : "You are in the last page"
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
      if (startPage) {
        setCurrentPage(startPage);
      } else {
        setCurrentPage(null);
      }
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
          : "Unable to get audio please try again"
      );
    }
  };

  const handleSave = () => {
    if (currentSurah && currentPage && !saved) {
      localStorage.setItem("savedTajweedSurah", currentSurah);
      localStorage.setItem("savedPage", currentPage);
      toast.success(
        language === "ar" ? "تم حفظ السورة والصفحة!" : "Surah and Page saved!"
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
          if (tajweedRules[cls]) {
            classes.add(cls);
          }
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

  const handleAudioLoadedMetadata = () => {
    setAudioLoading(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("loadedmetadata", handleAudioLoadedMetadata);
    }
    return () => {
      if (audio) {
        audio.removeEventListener("loadedmetadata", handleAudioLoadedMetadata);
      }
    };
  }, [ayahAudioSRC]);

  const renderSurahName = (verse, index) => {
    const surahNumber = verse.verse_key.split(":")[0]; // Extract Surah number
    const currentAyahNumber = verse.verse_key.split(":")[1];
    if (
      index === 0 ||
      quranData[index - 1].verse_key.split(":")[0] !== surahNumber
    ) {
      // If it's the first verse or the Surah number is different from the previous verse
      const surahName = surahList.find(
        (surah) => surah.id === parseInt(surahNumber)
      );
      return (
        <Typography
          key={`surah-${surahNumber}`}
          variant="h6"
          sx={{
            textAlign: "center",
            margin: "20px 0",
          }}
          className="w-100 d-flex justify-content-center align-items-center mb-3"
        >
          <span className="surah_name">
            {parseInt(currentAyahNumber) === 1
              ? language === "ar"
                ? `【 سورة ${surahName?.name_arabic} 】`
                : `[ ${surahName?.name_simple} ]`
              : ""}
          </span>
        </Typography>
      );
    }
    return null;
  };

  useEffect(() => {
    const storedPage = parseInt(localStorage.getItem("savedPage"));
    const storedSurah = parseInt(localStorage.getItem("savedTajweedSurah"));
    if (storedPage && storedSurah) {
      if (storedPage === currentPage && storedSurah === currentSurah) {
        setSaved(true);
      } else {
        setSaved(false);
      }
    } else {
      setSaved(false);
    }
  }, [currentPage, currentSurah]);

  // Function to detect if page changed
  const checkSavedPage = () => {
    const storedPage = parseInt(localStorage.getItem("savedPage"));
    const storedSurah = parseInt(localStorage.getItem("savedTajweedSurah"));
    if (storedPage && storedSurah) {
      if (storedPage === currentPage && storedSurah === currentSurah) {
        setSaved(true);
      } else {
        setSaved(false);
      }
    } else {
      setSaved(false);
    }
  };

  return (
    <Box
      {...swipeHandlers}
      sx={{
        p: 0,
        width: "100%",
        backgroundColor: "var(--card-color)",
        color: "var(--text-color)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {savedPageChanged && (
          <RestoreIcon
            color="primary"
            onClick={restoreSavedInfos}
            style={{ cursor: "pointer" }}
          />
        )}
        <Select
          placeholder={language === "ar" ? "اختر سورة" : "Select Surah"}
          onChange={handleSurahSelect}
          value={currentSurah}
          sx={{
            width: 250,
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
          className="surahs-select"
        >
          {surahList.map((surah) => (
            <Option key={surah.id} value={surah.id}>
              {language === "ar"
                ? `سورة ${surah?.name_arabic}`
                : surah.name_simple}
            </Option>
          ))}
        </Select>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ mr: 1, color: "var(--text-color)" }}>
            {language === "ar" ? "الصفحة" : "Page"}:
          </Typography>
          <input
            type="number"
            value={currentPage || ""}
            onChange={handlePageInput}
            style={{
              width: "max-content",
              textAlign: "center",
              padding: "0.25em",
              borderRadius: "4px",
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              border: "none",
              outline: "none",
              direction: "ltr",
            }}
            min="1"
            max="606"
            placeholder="1"
          />{" "}
          /
          <Typography sx={{ mx: 1, color: "var(--text-color)" }}>
            {" "}
            604
          </Typography>
        </Box>

        <Button
          variant="outlined"
          sx={{ fontSize: "17px" }}
          onClick={handleSave}
          color={saved && !savedPageChanged ? "success" : "primary"}
        >
          {saved && !savedPageChanged ? (
            <>
              <DoneOutlinedIcon className="fs-5 mt-1 mx-1" />
              {language === "ar" ? "محفوظة" : "Saved"}
            </>
          ) : (
            <>
              <BookmarksOutlinedIcon className="fs-5 mt-1 mx-1" />
              {language === "ar" ? "حفظ" : "Save"}
            </>
          )}
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {!isSmallScreen && (
          <IconButton
            variant="plain"
            color="primary"
            onClick={handlePrev}
            disabled={currentPage <= 1}
          >
            {language === "ar" ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
          </IconButton>
        )}
        <Typography sx={{ fontSize: "1rem", color: "var(--text-color)" }}>
          {language === "ar" ? "السورة" : "Surah"} {currentSurah || "-"} /{" "}
          {surahList.length} | {language === "ar" ? "الصفحة" : "Page"}{" "}
          {currentPage || "-"} / 604
        </Typography>
        {!isSmallScreen && (
          <IconButton
            variant="plain"
            color="primary"
            onClick={handleNext}
            disabled={currentPage >= 604}
          >
            {language === "ar" ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
          </IconButton>
        )}
      </Box>

      <Box
        {...swipeHandlers}
        ref={contentRef}
        sx={{
          mb: 2,
          overflowY: "auto",
          position: "relative",
          border: "1px solid #ddd",
          padding: "1em",
          borderRadius: "8px",
          backgroundColor: "var(--card-color)",
          maxHeight: "max-content",
          width: "100%",
          direction: "rtl",
        }}
      >
        {loading && (
          <Typography
            textAlign="center"
            sx={{ my: 4, fontSize: "1.2rem", color: "var(--text-color)" }}
          >
            {language === "ar" ? "جار التحميل..." : "Loading..."}
          </Typography>
        )}

        {error && (
          <Typography color="danger" textAlign="center" sx={{ my: 4 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <div
            style={{
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
              fontSize: "1.5rem",
              textAlign: "justify",
            }}
            className="tajweed-parent"
          >
            {quranData.map((ayah, index) => (
              <React.Fragment key={ayah.id}>
                {renderSurahName(ayah, index)}
                <span
                  onClick={() => handleAyahClick(ayah)}
                  style={{
                    cursor: "pointer",
                    display: "inline",
                  }}
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

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAyahAudioSRC(null);
          setAudioLoading(false);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          className="modal-content"
          sx={{
            maxWidth: "90%",
            maxHeight: "72%",
            overflowY: "auto",
            position: "relative",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.2em",
              borderBottom: "1px solid #ccc",
            }}
          >
            <Typography
              level="h4"
              sx={{
                fontSize: "1.8rem",
                textAlign: "center",
                flex: 1,
                color: "green",
              }}
            >
              {language === "ar" ? "نص الآية" : "Ayah Text"}
            </Typography>
            <IconButton
              onClick={() => {
                setModalOpen(false);
                setAyahAudioSRC(null);
                setAudioLoading(false);
              }}
              sx={{ position: "absolute", left: "0.5em" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <div
            mb={3}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(selectedAyah?.text_uthmani),
            }}
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "1.5rem",
              padding: "1em",
              textAlign: "justify",
            }}
          />
          {selectedAyah && ayahAudioSRC && (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                flexDirection: "row",
                padding: "1em",
                textAlign: "center",
              }}
            >
              <audio ref={audioRef} src={ayahAudioSRC} preload="auto" />
              {audioLoading ? (
                <CircularProgress />
              ) : (
                <IconButton
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    paddingInline: 1,
                    width: isSmallScreen ? "100%" : "max-content",
                    border: "1px solid green",
                  }}
                  variant="outlined"
                  color="success"
                  onClick={handleAudioPlayPause}
                >
                  <IconButton
                    color="primary"
                    sx={{ fontSize: "2rem", pointerEvents: "none" }}
                  >
                    <SlowMotionVideoOutlinedIcon color="success" />
                  </IconButton>
                  <Typography color="success">
                    {language === "ar" ? "استمع الى الأية" : "Listen to Ayah"}
                  </Typography>
                </IconButton>
              )}
            </Box>
          )}
          <hr />
          <Typography
            level="h5"
            mb={1}
            sx={{
              fontSize: "1.3rem",
              textAlign: "center",
              color: "var(--main-color)",
            }}
          >
            {language === "ar" ? "أحكام التجويد" : "Tajweed Rules"}
          </Typography>

          <Box>
            {selectedAyah && (
              <ul
                className="list-unstyled"
                style={{
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap",
                  fontSize: "1.1rem",
                  textAlign: "justify",
                }}
              >
                {getTranslatedTajweedRules(
                  extractTajweedClasses(selectedAyah.text_uthmani)
                ).map((rule, index) => (
                  <li
                    key={index}
                    className={`tajweed-rule ${rule.className}  rounded-3 p-2 ms-2`}
                    style={{
                      color: rule.color,
                      cursor: "pointer",
                      width: "max-content",
                      border: `2px solid ${rule.color}`,
                    }}
                    onClick={() => handleRuleClick(rule)}
                  >
                    <strong>{rule.name}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Box>
        </Card>
      </Modal>

      <Modal
        open={nestedModalOpen}
        onClose={() => setNestedModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          className="modal-content"
          sx={{
            maxWidth: 500,
            maxHeight: "80vh",
            overflowY: "auto",
            position: "relative",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5em",
              borderBottom: "1px solid #ccc",
            }}
          >
            <Typography
              level="h5"
              sx={{
                fontSize: "1.5rem",
                color: selectedRule?.color,
                flex: 1,
                textAlign: "center",
              }}
            >
              {selectedRule?.name}
            </Typography>
            <IconButton
              onClick={() => setNestedModalOpen(false)}
              sx={{ position: "absolute", left: "0.5em" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography
            sx={{
              fontSize: "1rem",
              whiteSpace: "pre-wrap",
              padding: "1em",
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
            }}
          >
            {selectedRule?.description}
          </Typography>
          {selectedRule?.letters && (
            <Typography
              sx={{
                fontSize: "1.2rem",
                mt: 2,
                color: selectedRule?.color,
                textAlign: "center",
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
