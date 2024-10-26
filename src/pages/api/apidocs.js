import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Card, List, ListItem, Link } from "@mui/joy";
import { useTranslation } from "../../components/languages/provider";
import { toast } from "react-toastify";

const apiList = [
  {
    id: 1,
    name_en: "Select Reciter API",
    name_ar: "واجهة برمجة تطبيقات اختيار القارئ",
    description_en: "Get details of a specific reciter.",
    description_ar: "الحصول على تفاصيل قارئ معين و يليها قائمة جمييع القراء.",
    // eslint-disable-next-line
    url: "https://www.mp3quran.net/api/v3/reciters?reciter={reciter_id}",
  },
  {
    id: 2,
    name_en: "All Reciters API",
    name_ar: "واجهة برمجة تطبيقات جميع القراء",
    description_en: "Get a list of all reciters.",
    description_ar: "الحصول على قائمة بجميع القراء.",
    url: "https://www.mp3quran.net/api/v3/reciters",
  },
  {
    id: 3,
    name_en: "Quran Tafsir APIs",
    name_ar: "واجهات برمجة تطبيقات تفسير القرآن",
    description_en:
      "The Official Site for Tafsir (For development purpose only)",
    description_ar: "الموقع الرسمي للتفاسير (لغرض التطوير فقط)",
    url: "http://api.quran-tafseer.com",
    additional_urls: [
      {
        name_en: "Available Tafsirs",
        name_ar: "التفاسير المتاحة",
        description_en: "Get a list of available Tafsirs.",
        description_ar: "الحصول على قائمة بالتفاسير المتاحة.",
        url: "https://api.qurancdn.com/api/v4/resources/tafsirs",
      },
    ],
    tafsirs: [
      {
        name_en: "Tafsir Al-Wasit Arabic",
        name_ar: "تفسير الوسيط باللغة العربية",
        description_en: "Get Tafsir Al-Wasit for a specific Ayah in Arabic.",
        description_ar: "الحصول على تفسير الوسيط لآية محددة باللغة العربية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/93/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Ibn Kathir Tafsir Arabic",
        name_ar: "تفسير ابن كثير باللغة العربية",
        description_en: "Get Tafsir Ibn Kathir for a specific Ayah in Arabic.",
        description_ar: "الحصول على تفسير ابن كثير لآية محددة باللغة العربية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/14/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Ibn Kathir Tafsir English",
        name_ar: "تفسير ابن كثير باللغة الإنجليزية",
        description_en: "Get Tafsir Ibn Kathir for a specific Ayah in English.",
        description_ar:
          "الحصول على تفسير ابن كثير لآية محددة باللغة الإنجليزية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/169/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Al-Tabari Tafsir Arabic",
        name_ar: "تفسير الطبري باللغة العربية",
        description_en: "Get Tafsir Al-Tabari for a specific Ayah in Arabic.",
        description_ar: "الحصول على تفسير الطبري لآية محددة باللغة العربية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/15/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Ma'arif Al-Quran English",
        name_ar: "معارف القرآن باللغة الإنجليزية",
        description_en:
          "Get Ma'arif Al-Quran Tafsir for a specific Ayah in English.",
        description_ar:
          "الحصول على تفسير معارف القرآن لآية محددة باللغة الإنجليزية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/168/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Al-Baghawi Tafsir Arabic",
        name_ar: "تفسير البغوي باللغة العربية",
        description_en: "Get Tafsir Al-Baghawi for a specific Ayah in Arabic.",
        description_ar: "الحصول على تفسير البغوي لآية محددة باللغة العربية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/94/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Al-Saadi Tafsir Arabic",
        name_ar: "تفسير السعدي باللغة العربية",
        description_en: "Get Tafsir Al-Saadi for a specific Ayah in Arabic.",
        description_ar: "الحصول على تفسير السعدي لآية محددة باللغة العربية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/91/by_ayah/surah_number:ayah_number?words=false",
      },
      {
        name_en: "Al-Qurtubi Tafsir Arabic",
        name_ar: "تفسير القرطبي باللغة العربية",
        description_en: "Get Tafsir Al-Qurtubi for a specific Ayah in Arabic.",
        description_ar:
          "الحصول على تفسير القرطبي لآية محددة باللغة العربية و يليها قائمة جميع التفاسير المتاحة باللغة العربية و الأنجليزية.",
        url: "https://api.qurancdn.com/api/v4/tafsirs/90/by_ayah/surah_number:ayah_number?words=false",
      },
    ],
  },
  {
    id: 4,
    name_en: "Adhkar API - Morning, Evening, After Prayer",
    name_ar: "واجهة برمجة تطبيقات الأذكار - الصباح، المساء، بعد الصلاة",
    description_en: "Get Adhkar for morning, evening, and after prayer.",
    description_ar: "الحصول على أذكار الصباح والمساء وما بعد الصلاة.",
    adhkar: [
      {
        name_en: "Morning Adhkar in arabic",
        name_ar: "أذكار الصباح باللغة العربية",
        url: "https://ahegazy.github.io/muslimKit/json/azkar_sabah.json",
      },
      {
        name_en: "Evening Adhkar in arabic",
        name_ar: "أذكار المساء باللغة العربية",
        url: "https://ahegazy.github.io/muslimKit/json/azkar_massa.json",
      },
      {
        name_en: "After Prayer Adhkar in arabic",
        name_ar: " أذكار بعد الصلاة باللغة العربية",
        url: "https://ahegazy.github.io/muslimKit/json/PostPrayer_azkar.json",
      },
      {
        name_en:
          "Morning , Evening and after Prayer Adhkar in arabic and english ",
        name_ar:
          "أذكار الصباح و المساء و ما بعد الصلاة باللغة العربية و الانجليزية",
        url: "/APIs/adhkar.json",
      },
    ],
  },
  {
    id: 5,
    name_en: "Hadith API",
    name_ar: "واجهة برمجة تطبيقات الحديث",
    description_en:
      "Access Hadith collections and data and your {API_key} from here.",
    description_ar:
      "الوصول إلى مجموعات الأحاديث والبيانات و من هنا يمكنك الحصول على ال(API_key).",
    url: "https://hadithapi.com",
  },
  {
    id: 6,
    name_en: "Ahadith Books List",
    name_ar: "قائمة كتب الأحاديث",
    description_en: "Get a list of Hadith books.",
    description_ar: "الحصول على قائمة بكتب الأحاديث.",
    url: "https://hadithapi.com/api/books?apiKey={api_key}",
  },
  {
    id: 7,
    name_en: "Chapters of Hadiths List",
    name_ar: "قائمة أبواب الأحاديث",
    description_en: "Get a list of chapters in a Hadith book.",
    description_ar: "الحصول على قائمة بالأبواب في كتاب حديث.",
    url: "https://hadithapi.com/api/{bookSlug}/chapters?apiKey={api_key}",
  },
  {
    id: 8,
    name_en: "Get All Hadiths of Chapter in  hadith book",
    name_ar: "الحصول على جميع الأحاديث في باب من كتاب الحديث",
    description_en: "Get all Hadiths in a specific chapter and specific book.",
    description_ar: "الحصول على جميع الأحاديث في كتاب محدد و باب محدد",
    // eslint-disable-next-line
    url: "https://hadithapi.com/api/hadiths?&apiKey={API_KEY}&book={bookSlug}&chapter={chapter_number}",
  },
  {
    id: 9,
    name_en: "Hadith Info API",
    name_ar: "واجهة برمجة تطبيقات معلومات الحديث",
    description_en: "Get information about a Hadith.",
    description_ar: "الحصول على معلومات عن حديث.",
    // eslint-disable-next-line
    url: "https://dorar.net/dorar_api.json?skey={hadithText}",
  },
  {
    id: 10,
    name_en: "Single Hadith Text API",
    name_ar: "واجهة برمجة تطبيقات نص حديث مفرد",
    description_en: "Get the text of a single Hadith.",
    description_ar: "الحصول على نص حديث مفرد.",
    // eslint-disable-next-line
    url: "https://hadithapi.com/api/hadiths?apiKey={API_KEY}&book={bookSlug}&hadithNumber={hadithNumber}",
  },
  {
    id: 11,
    name_en: "Get All Hadiths Per Page API",
    name_ar: "واجهة برمجة تطبيقات الحصول على جميع الأحاديث لكل صفحة",
    description_en: "Get all Hadiths per page in a book and chapter.",
    description_ar: "الحصول على جميع الأحاديث لكل صفحة في كتاب وباب.",
    // eslint-disable-next-line
    url: "https://hadithapi.com/api/hadiths?&apiKey={API_KEY}&book={bookSlug}&chapter={chapter_number}&page={page_number}",
  },
  {
    id: 12,
    name_en: "Get All Chapters of a Book",
    name_ar: "واجهة برمجة تطبيقات الحصول على جميع أبواب كتاب",
    description_en: "Get all chapters of a Hadith book.",
    description_ar: "الحصول على جميع الأبواب في كتاب حديث.",
    // eslint-disable-next-line
    url: "https://hadithapi.com/api/{bookSlug}/chapters?&apiKey={API_KEY}",
  },
  {
    id: 13,
    name_en: "Get All Hadith Books",
    name_ar: "الحصول على جميع كتب الأحاديث",
    description_en: "Get all Hadith books.",
    description_ar: "الحصول على جميع كتب الأحاديث.",
    // eslint-disable-next-line
    url: "https://hadithapi.com/api/books?apiKey={API_KEY}",
  },
  {
    id: 14,
    name_en: "Hadiths interpretation",
    name_ar: "أحاديث مع الشرح",
    description_en: "Get Hadiths with interpretation.",
    description_ar: "الحصول على  أحاديث مع الشرح.",
    // eslint-disable-next-line
    url: "https://hadeethenc.com/api/v1/categories/list/?language={language}",
  },
  {
    id: 15,
    name_en: "Get Ayahs of Surah",
    name_ar: "الحصول على آيات السورة",
    description_en: "Get Ayahs of a Surah with Tafsir.",
    description_ar: "الحصول على آيات سورة مع التفسير.",
    // eslint-disable-next-line
    url: "http://api.quran-tafseer.com/tafseer/{tafsir_id}/{surah_number}/ayah_from/ayah_to",
  },
  {
    id: 16,
    name_en: "Get a Surah in English",
    name_ar: "الحصول على  سورة باللغة الإنجليزية",
    description_en: "Get a Surah text with English translation.",
    description_ar: "الحصول على نص سورة مع الترجمة الإنجليزية.",
    // eslint-disable-next-line
    url: "https://api.alquran.cloud/v1/surah/{surah_number}/en.asad",
  },
  {
    id: 17,
    name_en: "Get All Quran Arabic Version API",
    name_ar: "واجهة برمجة تطبيقات الحصول على جميع القرآن باللغة العربية",
    description_en: "Get the entire Quran in Arabic.",
    description_ar: "الحصول على القرآن الكريم كاملاً باللغة العربية.",
    url: "https://api.alquran.cloud/v1/quran/quran-uthmani",
  },
  {
    id: 18,
    name_en: "Get All Quran English Version API",
    name_ar: "واجهة برمجة تطبيقات الحصول على جميع القرآن باللغة الإنجليزية",
    description_en: "Get the entire Quran in English.",
    description_ar: "الحصول على القرآن الكريم كاملاً باللغة الإنجليزية.",
    url: "https://api.alquran.cloud/v1/quran/en.asad",
  },
  {
    id: 19,
    name_en: "Quran API",
    name_ar: "واجهة برمجة تطبيقات القرآن",
    description_en: "Access various Quran data.",
    description_ar: "الوصول إلى بيانات مختلفة عن القرآن.",
    url: "https://alquran.cloud/api",
  },
  {
    id: 20,
    name_en: "Quran single Ayah mp3 audio file API",
    name_ar: "واجهة برمجة تطبيقات الحصول على  آية مرتلة",
    description_en:
      "Access to an audio file of a specific Ayah in the voice of Sheikh Mishary Rashid Alafasy..",
    description_ar:
      "الوصول إلى ملف صوتي لآية معينة بصوت الشيخ مشاري راشد العفاسي.",
    // eslint-disable-next-line
    url: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/{ayah_Id}.mp3",
  },
  {
    id: 21,
    name_en: "Simplified interpretation in Arabic.",
    name_ar: "التفسير الميسر بالعربية",
    description_en:
      "Get the simplified interpretation of a specific Surah in Arabic.",
    description_ar: "الحصول على التفسير الميسر لسورة معينة باللغة العربية",
    // eslint-disable-next-line
    url: "https://api.alquran.cloud/v1/surah/{surah_number}/editions/ar.muyassar",
  },
  {
    id: 22,
    name_en: "Asmaa Al-Husna, Prayer Times, and More API",
    name_ar: "أسماء الله الحسنى، مواقيت الصلاة والمزيد",
    description_en: "Get Asmaa Al-Husna, prayer times, and more.",
    description_ar: "الحصول على أسماء الله الحسنى، مواقيت الصلاة، والمزيد.",
    url: "https://aladhan.com",
  },
  {
    id: 23,
    name_en: "Fatawa API",
    name_ar: "واجهة برمجة تطبيقات الفتاوى",
    description_en: "Get Fatawa (Islamic rulings) content.",
    description_ar: "الحصول على محتوى الفتاوى.",
    url: "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-category-items/816379/showall/ar/ar/1/25/json",
  },
  {
    id: 24,
    name_en: "Arabic Language Science API",
    name_ar: "واجهة برمجة تطبيقات علوم اللغة العربية",
    description_en: "Get content related to Arabic language sciences.",
    description_ar: "الحصول على محتوى متعلق بعلوم اللغة العربية.",
    url: "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-category-items/276190/showall/ar/ar/1/25/json",
  },
  {
    id: 25,
    name_en: "Islamic Books and Audio Files",
    name_ar: "كتب إسلامية وملفات صوتية",
    description_en: "Get Islamic books and audio files.",
    description_ar: "الحصول على كتب إسلامية وملفات صوتية.",
    url: "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-author-items/6842/showall/ar/ar/1/50/json",
  },
  {
    id: 26,
    name_en: "Animals Stories in Islam",
    name_ar: "قصص الحيوانات في الإسلام",
    description_en: "Get stories of animals in Islam.",
    description_ar: "الحصول على قصص الحيوانات في الإسلام.",
    url: "/APIs/animals.json",
  },
  {
    id: 27,
    name_en: "Prophets Stories",
    name_ar: "قصص الأنبياء",
    description_en: "Get stories of the Prophets.",
    description_ar: "الحصول على قصص الأنبياء.",
    url: "/APIs/stories.json",
  },
  {
    id: 28,
    name_en: "Books API",
    name_ar: "واجهة برمجة تطبيقات الكتب",
    description_en: "Access Islamic books data.",
    description_ar: "الوصول إلى بيانات الكتب الإسلامية.",
    url: "/APIs/books.json",
  },
  {
    id: 29,
    name_en: "Quran Tafsir in Arabic",
    name_ar: "تفسير القرآن باللغة العربية",
    description_en: "Get Quran Tafsir in Arabic.",
    description_ar: "الحصول على تفسير القرآن باللغة العربية.",
    url: "/APIs/Quran_Tafsir.json",
  },
  {
    id: 30,
    name_en: "Tafsir Al-Jalalayn in English",
    name_ar: "تفسير الجلالين باللغة الانجليزية",
    description_en: "Get Tafsir Al-Jalalayn in English.",
    description_ar: "الحصول على تفسير الجلالين باللغة الانجليزية.",
    url: "/APIs/en-al-jalalayn.json",
  },
  {
    id: 31,
    name_en: "Access religious sciences API",
    name_ar: "الحصول على  علوم دينية",
    description_en: "Access a comprehensive encyclopedia of religious sciences",
    description_ar: "الحصول على موسوعة شاملة من العلوم الدينية",
    url: "https://documenter.getpostman.com/view/7929737/TzkyMfPc#intro",
  },
];

const Api = ({ showScrillBtn, hideScrollBtn, back }) => {
  const { language } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    localStorage.removeItem("last-category-position");
  }, []);

  useEffect(() => {
    // Set a new title and store it in localStorage
    const newTitle =
      language === "ar"
        ? "دين الله | واجهة التطبيقات"
        : "God's religion | API Docs";

    // Always update the title (to ensure it's consistent with your desired page title)
    document.title = newTitle;

    // Store the title in localStorage so it persists across reloads
    localStorage.setItem("pageTitle", newTitle);
  }, [isReady, language]); // Keep the empty dependency array

  useEffect(() => {
    setIsReady(true);
  }, []);
  const scrollApis = (e) => {
    const scrollTop = e.target.scrollTop > 300;
    if (scrollTop) showScrillBtn();
    else hideScrollBtn();
  };

  const apiListRef = useRef(null);

  useEffect(() => {
    const apiListContainer = apiListRef.current;
    if (apiListContainer) {
      apiListContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [back]);

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    const full_url = text.startsWith("/")
      ? `${window.location.href.replace("/api-docs", "")}${text}`
      : text;
    navigator.clipboard
      .writeText(full_url)
      .then(() => {
        toast.success(
          language === "ar"
            ? "تم نسخ الرابط إلى الحافظة"
            : "URL copied to clipboard"
        );
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error(
          language === "ar"
            ? "يرجى المحاولة لاحقا , شكرا"
            : "Failed to copy , try again"
        );
      });
  };

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: "var(--card-color)",
        color: "var(--text-color)",
        height : "max-content",
        direction: language === "ar" ? "rtl" : "ltr",
      }}
    >
      <Typography
        level="h4"
        sx={{ mb: 2, textAlign: "center", color: "var(--main-color)" }}
      >
        {language === "ar"
          ? "توثيق واستخدام واجهات برمجة التطبيقات"
          : "API Documentation and Usage"}
      </Typography>

      <List
        sx={{
          maxHeight: "100%",
          overflowY: "auto",
          backgroundColor: "var(--card-color)",
          color: "var(--text-color)",
          borderRadius: "8px",
          p: 0,
          width: "100%",
        }}
        onScroll={scrollApis}
        ref={apiListRef}
      >
        {apiList.map((api) => (
          <ListItem key={api.id} sx={{ mb: 2 }}>
            <Card
              variant="outlined"
              sx={{
                p: 2,
                width: "100%",
                backgroundColor: "var(--api-card)",
                color: "var(--text-color)",
                borderRadius: "8px",
              }}
            >
              <Typography level="h5" sx={{ mb: 1, color: "#169777" }}>
                {language === "ar"
                  ? `${api.id}: ${api.name_ar}`
                  : `${api.id}: ${api.name_en}`}
              </Typography>
              <Typography sx={{ mb: 1, color: "var(--text-color)" }}>
                {language === "ar" ? api.description_ar : api.description_en}
              </Typography>

              {/* Main API URL */}
              {api.url && (
                <Link
                  onClick={() => copyToClipboard(api.url)}
                  sx={{
                    wordBreak: "break-all",
                    display: "block",
                    mb: 1,
                    cursor: "pointer",
                  }}
                >
                  {api.url}
                </Link>
              )}
              {/* Render additional URLs if any */}
              {api.additional_urls && api.additional_urls.length > 0 && (
                <div>
                  <Typography
                    sx={{ fontWeight: "bold", mt: 2, color: "#169777" }}
                  ></Typography>
                  {api.additional_urls.map((item, index) => (
                    <div key={index}>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: "#169777",
                        }}
                      >
                        {language === "ar" ? item.name_ar : item.name_en}:
                      </Typography>
                      <Typography sx={{ mb: 1, color: "var(--text-color)" }}>
                        {language === "ar"
                          ? item.description_ar
                          : item.description_en}
                      </Typography>
                      <Link
                        onClick={() => copyToClipboard(item.url)}
                        sx={{
                          wordBreak: "break-all",
                          display: "block",
                          mb: 1,
                          ml: language === "ar" ? 0 : 2,
                          mr: language === "ar" ? 2 : 0,
                          cursor: "pointer",
                        }}
                      >
                        {item.url}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              {/* Render tafsirs if any */}
              {api.tafsirs && api.tafsirs.length > 0 && (
                <div>
                  <Typography
                    sx={{ fontWeight: "bold", mt: 2, color: "#169777" }}
                  >
                    {language === "ar"
                      ? "التفاسير المختارة"
                      : "Selected Tafsir"}{" "}
                    :
                  </Typography>
                  {api.tafsirs.map((tafsir, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 1,
                        backgroundColor: "var(--card-color)",
                        color: "var(--text-color)",
                        borderRadius: "8px",
                      }}
                    >
                      <Typography level="h6" sx={{ mb: 1, color: "#169777" }}>
                        {language === "ar" ? tafsir.name_ar : tafsir.name_en}
                      </Typography>
                      <Typography sx={{ mb: 1, color: "var(--text-color)" }}>
                        {language === "ar"
                          ? tafsir.description_ar
                          : tafsir.description_en}
                      </Typography>
                      <Link
                        onClick={() => copyToClipboard(tafsir.url)}
                        sx={{
                          wordBreak: "break-all",
                          display: "block",
                          mb: 1,
                          cursor: "pointer",
                        }}
                      >
                        {tafsir.url}
                      </Link>
                    </Card>
                  ))}
                </div>
              )}

              {/* Render Adhkar if any */}
              {api.adhkar && api.adhkar.length > 0 && (
                <div>
                  <Typography
                    sx={{ fontWeight: "bold", mt: 2, color: "#169777" }}
                  >
                    {language === "ar" ? "الأذكار" : "Adhkar"} :
                  </Typography>
                  {api.adhkar.map((adhkarItem, index) => (
                    <div key={index}>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: "var(--text-color)",
                        }}
                      >
                        {language === "ar"
                          ? adhkarItem.name_ar
                          : adhkarItem.name_en}
                      </Typography>
                      <Link
                        onClick={() => copyToClipboard(adhkarItem.url)}
                        sx={{
                          wordBreak: "break-all",
                          display: "block",
                          mb: 1,
                          ml: language === "ar" ? 0 : 2,
                          mr: language === "ar" ? 2 : 0,
                          cursor: "pointer",
                        }}
                      >
                        {adhkarItem.url}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Api;
