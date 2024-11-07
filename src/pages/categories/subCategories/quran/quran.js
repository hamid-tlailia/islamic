// Quran.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import "./quran.css";
import { SyncAltOutlined as SyncIcon } from "@mui/icons-material";
import SlowMotionVideoOutlinedIcon from "@mui/icons-material/SlowMotionVideoOutlined";
import { Tabs, Tab, Box, Button } from "@mui/material";
import logo from "../images/logo.png";
import Quran_Tafsir from "./tafsirs/Quran_Tafsir.json";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogContent from "@mui/material/DialogContent";
import ZoomOutMapOutlinedIcon from "@mui/icons-material/ZoomOutMapOutlined";
import { useTranslation } from "../../../../components/languages/provider";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import en_al_jalalayn from "./tafsirs/en-al-jalalayn.json";
import useMediaQuery from "@mui/material/useMediaQuery";

const Quran = ({ src, toTop }) => {
  const [surahs, setSurahs] = useState([]);
  const [allAyahs, setAllAyahs] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [surahData, setSurahData] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [refs, setRefs] = useState([]);
  const [tafseerLangs, setTafseerLangs] = useState("arabe");
  const [apiTranslation, setApiTranslation] = useState([]);
  const [quranLangs, setQuranLangs] = useState("Arabe");
  const [openAyahTafsirModal, setOpenAyahTafsirModal] = useState(false);
  const [signleAyahTafsirText, setSignleAyahTafsirText] = useState("");
  const [layout, setLayout] = useState(undefined);
  const [tafsirLoader, setTafsirLoader] = useState(true);
  const [englishTafsir, setEnglishTafsir] = useState({});
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(null);
  const [prevAyahIndex, setPrevAyahIndex] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [allSurahTafseer, setAllSurahTafseer] = useState([]);
  const isSmallScreen = useMediaQuery("(max-width:500px)");
  const reciterNameMap = {
    "إبراهيم الأخضر": "Ibrahim Al-Akhdar",
    "أكرم العلاقمي": "Akram Al-Alaqmi",
    "ماجد العنزي": "Majed Al-Anzi",
    "مالك شيبة الحمد": "Malik Shebah Al-Hamd",
    "ماهر المعيقلي": "Maher Al-Muaiqly",
    "محمد الأيراوي": "Mohammad Al-Irawi",
    "محمد البراك": "Mohammad Al-Barrak",
    "محمد الطبلاوي": "Mohammad Al-Tablawi",
    "محمد اللحيدان": "Mohammad Al-Luhaidan",
    "محمد المحيسني": "Mohammad Al-Mohaisany",
    "محمد أيوب": "Mohammad Ayyoub",
    "الحسيني العزازي": "Al-Hussaini Al-Azzazi",
    "محمد صالح عالم شاه": "Mohammad Saleh Alam Shah",
    "محمد جبريل": "Mohammad Jibril",
    "محمد صديق المنشاوي": "Mohammad Siddiq Al-Minshawi",
    "محمد عبدالكريم": "Mohammad Abdulkarim",
    "محمد عبدالحكيم سعيد العبدالله": "Mohammad Abdulhakim Saeed Al-Abdullah",
    "محمود خليل الحصري": "Mahmoud Khalil Al-Husary",
    "إدريس أبكر": "Idrees Abkar",
    "محمود علي البنا": "Mahmoud Ali Al-Banna",
    "مشاري العفاسي": "Mishary Al-Afasy",
    "مصطفى إسماعيل": "Mustafa Ismail",
    "مصطفى اللاهوني": "Mustafa Al-Lahouni",
    "مصطفى رعد العزاوي": "Mustafa Raad Al-Azzawi",
    "معمر الأندونيسي": "Muammar Al-Indonesi",
    "مفتاح السلطني": "Miftah Al-Saltany",
    "الزين محمد أحمد": "Al-Zain Mohammad Ahmed",
    "محمد سايد": "Mohammad Said",
    "عبدالرحمن السويّد": "Abdulrahman Al-Suwaid",
    "عبدالإله بن عون": "Abdulilah Bin Awn",
    "أحمد طالب بن حميد": "Ahmed Talib Bin Humaid",
    "نورين محمد صديق": "Noreen Mohammad Siddiq",
    "ماجد الزامل": "Majed Al-Zamil",
    "القارئ ياسين": "Al-Qari Yasin",
    "ماهر شخاشيرو": "Maher Shakhashero",
    "العشري عمران": "Al-Ashri Omran",
    "محمد المنشد": "Mohammad Al-Munshid",
    "محمود الشيمي": "Mahmoud Al-Shimi",
    "ياسر سلامة": "Yasser Salamah",
    "أخيل عبدالحي روا": "Akheel Abdulhay Rawa",
    "أستاذ زامري": "Ustaz Zamri",
    "خالد المهنا": "Khalid Al-Muhana",
    "العيون الكوشي": "Al-Ayoun Al-Kushi",
    "عادل الكلباني": "Adel Al-Kalbani",
    "موسى بلال": "Musa Bilal",
    "حسين آل الشيخ": "Hussein Al-Sheikh",
    "حاتم فريد الواعر": "Hatem Farid Al-Waer",
    "إبراهيم الجرمي": "Ibrahim Al-Jurmi",
    "محمود الرفاعي": "Mahmoud Al-Rifaie",
    "ناصر العبيد": "Nasser Al-Obaid",
    "واصل المذن": "Wasil Al-Muthen",
    "توفيق الصايغ": "Tawfeeq Al-Sayegh",
    "إبراهيم الدوسري": "Ibrahim Al-Dosari",
    "جمال شاكر عبدالله": "Jamal Shaker Abdullah",
    "جمعان العصيمي": "Jamaan Al-Asimi",
    "رضية عبدالرحمن": "Radiyah Abdulrahman",
    "رقية سولونق": "Ruqayya Sulong",
    "سابينة مامات": "Sabina Mamat",
    "سيدين عبدالرحمن": "Saideen Abdulrahman",
    "عبدالغني عبدالله": "Abdulghani Abdullah",
    "عبدالله فهمي": "Abdullah Fahmi",
    "حمد الدغريري": "Hamad Al-Dughairiri",
    "محمد الحافظ": "Mohammad Al-Hafiz",
    "محمد حفص علي": "Mohammad Hafs Ali",
    "محمد خير النور": "Mohammad Khair Al-Noor",
    "يوسف بن نوح أحمد": "Yusuf Bin Nuh Ahmed",
    "جمال الدين الزيلعي": "Jamaluddin Al-Zailai",
    "معيض الحارثي": "Muidh Al-Harithi",
    "محمد رشاد الشريف": "Mohammad Rashad Al-Sharif",
    "إبراهيم الجبرين": "Ibrahim Al-Jebreen",
    "خالد الجليل": "Khalid Al-Jaleel",
    "أحمد الطرابلسي": "Ahmed Al-Trablsi",
    "عبدالله الكندري": "Abdullah Al-Kandari",
    "أحمد عامر": "Ahmed Amer",
    "إبراهيم السعدان": "Ibrahim Al-Saadan",
    "أحمد الحذيفي": "Ahmed Al-Hudhaifi",
    "محمد عثمان خان": "Mohammad Othman Khan",
    "يوسف الدغوش": "Yusuf Al-Daghoush",
    "الدوكالي محمد العالم": "Al-Dokali Mohammad Al-Alam",
    "وشيار حيدر اربيلي": "Washi’ar Haidar Arbili",
    "خالد القحطاني": "Khalid Al-Qahtani",
    "الفاتح محمد الزبير": "Al-Fatih Mohammad Al-Zubair",
    "محمد برهجي": "Mohammad Barhaji",
    "يوسف العيدروس": "Yusuf Al-Aidaroos",
    "طارق عبدالغني دعوب": "Tariq Abdulghani Doob",
    "عثمان الأنصاري": "Othman Al-Ansari",
    "بندر بليله": "Bandar Baleelah",
    "خالد الشريمي": "Khalid Al-Shuraimi",
    "وديع اليمني": "Wadih Al-Yamani",
    "خالد عبدالكافي": "Khalid Abdulkafi",
    "رعد محمد الكردي": "Raad Mohammad Al-Kurdi",
    "عبدالرحمن العوسي": "Abdulrahman Al-Ausi",
    "خالد الغامدي": "Khalid Al-Ghamdi",
    "رمضان شكور": "Ramadan Shakoor",
    "عبدالمجيد الأركاني": "Abdulmajid Al-Arkani",
    "محمد خليل القارئ": "Mohammad Khalil Al-Qari",
    "خالد الوهيبي": "Khalid Al-Wuhaibi",
    "رامي الدعيس": "Rami Al-Duais",
    "هزاع البلوشي": "Hazaa Al-Balushi",
    "عبدالرحمن الماجد": "Abdulrahman Al-Majed",
    "مروان العكري": "Marwan Al-Ukri",
    "خليفة الطنيجي": "Khalifa Al-Tunaiji",
    "سلمان العتيبي": "Salman Al-Otaibi",
    "محمد رفعت": "Mohammad Rifaat",
    "عبدالله الموسى": "Abdullah Al-Mousa",
    "عبدالله الخلف": "Abdullah Al-Khalaf",
    "منصور السالمي": "Mansour Al-Salmi",
    "صلاح مصلي": "Salah Musalli",
    "خالد الشارخ": "Khalid Al-Sharikh",
    "ناصر العصفور": "Nasser Al-Asfour",
    "داود حمزة": "Dawood Hamza",
    "محمد البخيت": "Mohammad Al-Bukheet",
    "ناصر الماجد": "Nasser Al-Majed",
    "أحمد السويلم": "Ahmed Al-Suwailim",
    "إسلام صبحي": "Islam Sobhi",
    "بدر التركي": "Badr Al-Turki",
    "هيثم الجدعاني": "Haitham Al-Jadani",
    "أحمد خليل شاهين": "Ahmed Khalil Shaheen",
    "سعد المقرن": "Saad Al-Mogren",
    "أحمد النفيس": "Ahmed Al-Nafees",
    "رشيد إفراد": "Rachid Ifraad",
    "عمر الدريويز": "Omar Al-Derwaiz",
    "عبدالعزيز العسيري": "Abdulaziz Al-Aseeri",
    "يونس اسويلص": "Younes Asweils",
    "أحمد ديبان": "Ahmed Deeban",
    "عبدالله كامل": "Abdullah Kamel",
    "بيشه وا قادر الكردي": "Peshawa Qader Al-Kurdi",
    "رشيد بلعالية": "Rachid Belalia",
    "نذير المالكي": "Natheer Al-Maliki",
    "عكاشة كميني": "Okasha Kameny",
    "هيثم الدخين": "Haitham Al-Dukhin",
    "محمد أبو سنينة": "Mohammad Abu Sunaineh",
    "محمد الأمين قنيوة": "Mohammad Al-Amin Qaniwa",
    "محمود عبدالحكم": "Mahmoud Abdulhakam",
    "أحمد عيسى المعصراوي": "Ahmed Issa Al-Maasrawi",
    "إبراهيم كشيدان": "Ibrahim Kishidan",
    "زكريا حمامة": "Zakaria Hamama",
    "هاشم أبو دلال": "Hashem Abu Dalal",
    "فؤاد الخامري": "Fuad Al-Khamri",
    "سيد أحمد هاشمي": "Sayed Ahmed Hashemi",
    "خالد كريم محمدي": "Khalid Karim Mohammadi",
    "مال الله عبدالرحمن الجابر": "Malallah Abdulrahman Al-Jaber",
    "سلمان الصديق": "Salman Al-Siddiq",
    "حسن صالح": "Hassan Saleh",
    "عبدالرحمن الشحات": "Abdulrahman Al-Shahat",
    "عيسى عمر سناكو": "Isa Omar Sanako",
    "هارون بقائي": "Haroon Baqai",
    "عبدالله بخاري": "Abdullah Bukhari",
    "صالح القريشي": "Saleh Al-Quraishi",
    "إبراهيم العسيري": "Ibrahim Al-Aseeri",
    "سعد الغامدي": "Saad Al-Ghamdi",
    "صالح الشمراني": "Saleh Al-Shamrani",
    "فيصل الهاجري": "Faisal Al-Hajri",
    "أنس العمادي": "Anas Al-Emadi",
    "عبدالملك العسكر": "Abdulmalik Al-Askir",
    "عبدالكريم الحازمي": "Abdulkarim Al-Hazmi",
    "هشام الهراز": "Hisham Al-Harraz",
    "عبدالله المشعل": "Abdullah Al-Meshaal",
    "عبدالعزيز سحيم": "Abdulaziz Suhaim",
    "سعود الشريم": "Saud Al-Shuraim",
    "سهل ياسين": "Sahl Yasin",
    "زكي داغستاني": "Zaki Dagestani",
    "سامي الحسن": "Sami Al-Hassan",
    "سامي الدوسري": "Sami Al-Dosari",
    "سيد رمضان": "Sayed Ramadan",
    "شعبان الصياد": "Shabaan Al-Sayyad",
    "شيرزاد عبدالرحمن طاهر": "Shirzad Abdulrahman Taher",
    "صابر عبدالحكم": "Saber Abdulhakam",
    "شيخ أبو بكر الشاطري": "Sheikh Abu Bakr Al-Shatri",
    "صالح الصاهود": "Saleh Al-Sahood",
    "صالح آل طالب": "Saleh Al-Taleb",
    "صالح الهبدان": "Saleh Al-Habdan",
    "صلاح البدير": "Salah Al-Budair",
    "صلاح الهاشم": "Salah Al-Hashim",
    "صلاح بو خاطر": "Salah Bukhatir",
    "مختار الحاج": "Mukhtar Al-Hajj",
    "عادل ريان": "Adel Ryan",
    "عبدالبارئ الثبيتي": "Abdulbaree Al-Thubaity",
    "أحمد بن علي العجمي": "Ahmed Bin Ali Al-Ajmi",
    "عبدالبارئ محمد": "Abdulbaree Mohammad",
    "عبدالباسط عبدالصمد": "Abdulbasit Abdulsamad",
    "عبدالرحمن السديس": "Abdulrahman Al-Sudais",
    "عبدالعزيز الأحمد": "Abdulaziz Al-Ahmad",
    "عبدالعزيز الزهراني": "Abdulaziz Al-Zahrani",
    "عبدالله البريمي": "Abdullah Al-Buraimi",
    "عبدالله البعيجان": "Abdullah Al-Buaijan",
    "عبدالله المطرود": "Abdullah Al-Matrood",
    "أحمد الحواشي": "Ahmed Al-Hawashi",
    "عبدالله بصفر": "Abdullah Basfar",
    "عبدالله خياط": "Abdullah Khayyat",
    "عبدالله عواد الجهني": "Abdullah Awad Al-Juhani",
    "عبدالله غيلان": "Abdullah Gheelan",
    "عبدالرشيد صوفي": "Abdulrasheed Soufi",
    "عبدالمحسن الحارثي": "Abdulmohsen Al-Harthi",
    "عبدالمحسن القاسم": "Abdulmohsen Al-Qasim",
    "عبدالمحسن العسكر": "Abdulmohsen Al-Askar",
    "عبدالمحسن العبيكان": "Abdulmohsen Al-Obaikan",
    "أحمد سعود": "Ahmed Saud",
    "عبدالهادي أحمد كناكري": "Abdulhadi Ahmed Kanakri",
    "عبدالودود حنيف": "Abdulwadud Haneef",
    "عبدالولي الأركاني": "Abdulwali Al-Arkani",
    "علي أبو هاشم": "Ali Abu Hashim",
    "علي بن عبدالرحمن الحذيفي": "Ali Bin Abdulrahman Al-Hudhaifi",
    "علي جابر": "Ali Jaber",
    "علي حجاج السويسي": "Ali Hajjaj Al-Suisi",
    "عماد زهير حافظ": "Imad Zuhair Hafiz",
    "عبدالعزيز التركي": "Abdulaziz Al-Turki",
    "أحمد صابر": "Ahmed Saber",
    "عمر القزابري": "Omar Al-Qazabri",
    "فارس عباد": "Fares Abbad",
    "فهد العتيبي": "Fahad Al-Otaibi",
    "فهد الكندري": "Fahad Al-Kandari",
    "فواز الكعبي": "Fawaz Al-Kaabi",
    "لافي العوني": "Lafi Al-Awni",
    "ناصر القطامي": "Nasser Al-Qatami",
    "نبيل الرفاعي": "Nabil Al-Rifaie",
    "نعمة الحسان": "Neamah Al-Hassan",
    "هاني الرفاعي": "Hani Al-Rifaie",
    "أحمد نعينع": "Ahmed Nuaina",
    "وليد الدليمي": "Walid Al-Dulaimi",
    "وليد النائحي": "Walid Al-Naahi",
    "ياسر الدوسري": "Yasser Al-Dosari",
    "ياسر القرشي": "Yasser Al-Qurashi",
    "ياسر الفيلكاوي": "Yasser Al-Failakawi",
    "ياسر المزروعي": "Yasser Al-Mazrouei",
    "يحيى حوا": "Yahya Hawwa",
    "يوسف الشويعي": "Yusuf Al-Shwehy",
    "عبدالله عبدل": "Abdullah Abdul",
  };
  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(false);
  const { translations, language } = useTranslation();
  const surahsRef = useRef(null);
  const ayahsRef = useRef(null);

  // Pagination state variables for Explanation Tab
  const [currentPageExplanation, setCurrentPageExplanation] = useState(1);
  const itemsPerPageExplanation = 10; // Number of Ayahs per page

  // Pagination state variables for Reading Tab
  const [currentPageReading, setCurrentPageReading] = useState(1);
  const itemsPerPageReading = 10; // Number of Ayahs per page in Reading Tab

  // Pagination state variables for Full-Screen Modal
  const [currentPageModal, setCurrentPageModal] = useState(1);
  const itemsPerPageModal = 10; // Number of Ayahs per page in Modal

  // Effect to handle errors
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

  // Fetch Quran data on mount
  useEffect(() => {
    const fetchQuran = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.alquran.cloud/v1/quran/quran-uthmani"
        );
        const data = await response.json();
        if (data?.data?.surahs) {
          setSurahs(data.data.surahs);
        }
      } catch (error) {
        setIsErrorFetching(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuran();
  }, []);

  // Effect to load saved Surah and pages from localStorage after surahs are fetched
  useEffect(() => {
    if (surahs.length > 0) {
      // Check localStorage for saved Surah
      const savedSurah = localStorage.getItem("quranSurah");
      if (savedSurah) {
        const parsedSurah = JSON.parse(savedSurah);
        const foundSurah = surahs.find((s) => s.number === parsedSurah.number);
        if (foundSurah) {
          setAllAyahs(foundSurah);
          setSelectedSurah(foundSurah.number);

          // Load saved pages
          const savedPageExplanation = parseInt(
            localStorage.getItem("explainedPage"),
            10
          );
          if (!isNaN(savedPageExplanation)) {
            setCurrentPageExplanation(savedPageExplanation);
          }

          const savedPageModal = parseInt(
            localStorage.getItem("quranModalPage"),
            10
          );
          if (!isNaN(savedPageModal)) {
            setCurrentPageModal(savedPageModal);
          }

          // Automatically show the Ayahs view
          if (ayahsRef.current) {
            ayahsRef.current.classList.add("active");
          }
          if (surahsRef.current) {
            surahsRef.current.classList.add("d-none");
          }
        } else {
          // If saved Surah is not found in fetched Surahs, remove from localStorage
          localStorage.removeItem("quranSurah");
          localStorage.removeItem("explainedPage");
          localStorage.removeItem("quranModalPage");
        }
      }
    }
    // eslint-disable-next-line
  }, [surahs, selectedSurah]);

  const selectReciter = useRef(null);

  const handleSurahClick = (e, surah) => {
    setAllAyahs(surah);
    if (ayahsRef.current) {
      ayahsRef.current.classList.add("active");
    }
    if (surahsRef.current) {
      surahsRef.current.classList.add("d-none");
    }
    if (ayahsRef.current) {
      ayahsRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSelectedSurah(surah.number);
    if (selectReciter.current) selectReciter.current.value = "default";

    // Save selected Surah to localStorage
    localStorage.setItem("quranSurah", JSON.stringify(surah));

    if (selectedSurah !== surah.number) {
      // Reset pagination and save to localStorage
      setCurrentPageReading(1);
      setCurrentPageModal(1);
      setCurrentPageExplanation(1);
      localStorage.setItem("explainedPage", 1);
      localStorage.setItem("quranModalPage", 1);
    } else {
      const savedExplanationPage = localStorage.getItem("explainedPage");
      const savedModalPage = localStorage.getItem("quranModalPage");
      setCurrentPageModal(parseInt(savedModalPage), 10);
      setCurrentPageExplanation(parseInt(savedExplanationPage), 10);
    }
  };

  useEffect(() => {
    // Load English tafsir from JSON file when Surah is selected
    const surahNumber = allAyahs?.number;
    const surahTafsir = en_al_jalalayn[surahNumber - 1];
    if (surahTafsir) {
      setEnglishTafsir(surahTafsir?.ayahs);
      setTafsirLoader(false);
    } else {
      setEnglishTafsir({});
      setTafsirLoader(false);
    }
    // eslint-disable-next-line
  }, [selectedSurah]);

  const goBack = () => {
    if (ayahsRef.current) {
      ayahsRef.current.classList.remove("active");
    }
    if (surahsRef.current) {
      surahsRef.current.classList.remove("d-none");
    }
    setCurrentPageReading(1); // Reset pagination when going back
    setCurrentPageModal(1);
    setCurrentPageExplanation(1);
  };

  const toggleVisibility = () => setIsOpen(!isOpen);

  const reverseSurahs = () => setIsReversed(!isReversed);

  useEffect(() => {
    if (selectedSurah) {
      const surahTfsir = Quran_Tafsir.Surahs.find(
        (surah) => surah.number === Number(selectedSurah)
      );
      setSurahData(surahTfsir);
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (selectedSurah > 0) {
      const getSurahData = async () => {
        try {
          const translationResponse = await fetch(
            `https://api.alquran.cloud/v1/surah/${selectedSurah}/en.asad`
          );
          const translationData = await translationResponse.json();
          if (translationData?.data?.ayahs) {
            setApiTranslation(translationData.data.ayahs);
          }
        } catch (error) {
          console.log("Error fetching surah data:", error);
          setIsErrorFetching(true);
        }
      };
      getSurahData();
    }
  }, [selectedSurah]);

  // Pagination logic for Explanation Tab
  const totalAyahsExplanation = surahData?.ayahs.length || 0;
  const totalPagesExplanation = Math.ceil(
    totalAyahsExplanation / itemsPerPageExplanation
  );

  const indexOfLastAyahExplanation =
    currentPageExplanation * itemsPerPageExplanation;
  const indexOfFirstAyahExplanation =
    indexOfLastAyahExplanation - itemsPerPageExplanation;
  const currentAyahsExplanation = useMemo(
    () =>
      surahData?.ayahs.slice(
        indexOfFirstAyahExplanation,
        indexOfLastAyahExplanation
      ) || [],
    [surahData, indexOfFirstAyahExplanation, indexOfLastAyahExplanation]
  );

  // Pagination logic for Reading Tab
  const totalAyahsReading = allAyahs?.ayahs.length || 0;
  const totalPagesReading = Math.ceil(totalAyahsReading / itemsPerPageReading);

  const indexOfLastAyahReading = currentPageReading * itemsPerPageReading;
  const indexOfFirstAyahReading = indexOfLastAyahReading - itemsPerPageReading;
  const currentAyahsReading = useMemo(
    () =>
      allAyahs?.ayahs.slice(indexOfFirstAyahReading, indexOfLastAyahReading) ||
      [],
    [allAyahs, indexOfFirstAyahReading, indexOfLastAyahReading]
  );

  // Pagination logic for Full-Screen Modal
  const totalAyahsModal = allAyahs?.ayahs.length || 0;
  const totalPagesModal = Math.ceil(totalAyahsModal / itemsPerPageModal);

  const indexOfLastAyahModal = currentPageModal * itemsPerPageModal;
  const indexOfFirstAyahModal = indexOfLastAyahModal - itemsPerPageModal;
  const currentAyahsModal = useMemo(
    () =>
      allAyahs?.ayahs.slice(indexOfFirstAyahModal, indexOfLastAyahModal) || [],
    [allAyahs, indexOfFirstAyahModal, indexOfLastAyahModal]
  );

  // Adjust refs to correspond to the currentAyahsExplanation
  useEffect(() => {
    setRefs(currentAyahsExplanation.map(() => React.createRef()));
  }, [currentPageExplanation, currentAyahsExplanation]);

  const scrollToRef = (index) => {
    if (refs[index] && refs[index].current) {
      // Remove 'scrolled-ayah' from previous ayah
      if (
        prevAyahIndex !== null &&
        refs[prevAyahIndex] &&
        refs[prevAyahIndex].current
      ) {
        refs[prevAyahIndex].current.parentElement.classList.remove(
          "scrolled-ayah"
        );
      }

      // Scroll to the selected ayah
      refs[isSmallScreen ? index : index - 1].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Add 'scrolled-ayah' class to the selected ayah
      refs[index].current.parentElement.classList.add("scrolled-ayah");

      // Update prevAyahIndex
      setPrevAyahIndex(index);
      setCurrentAyahIndex(null);
    }
  };

  const handleDropdownChange = (event) => {
    const index = parseInt(event.target.value, 10);
    setCurrentAyahIndex(index);
    scrollToRef(index);
  };

  const getSingleAyahTafsir = (ayahNumber) => {
    const surahNumber = allAyahs.number;
    const ayahTfasir = Quran_Tafsir.Surahs?.find(
      (tafsir) => tafsir.number === Number(surahNumber)
    );

    if (ayahTfasir) {
      let tafsirContent = "";
      const ayahArabicTafsir = ayahTfasir.ayahs[ayahNumber]?.tafsir || "";
      const surahTafsir = englishTafsir;
      let ayahEnglishTafsir = "";
      if (surahTafsir) {
        ayahEnglishTafsir =
          surahTafsir.find(
            (ayah) => ayah.ayah_number === (ayahNumber + 1).toString()
          )?.text || "";
      }

      if (quranLangs === "Arabe") {
        tafsirContent = `<p class='dr-rtl'>${ayahArabicTafsir}</p>`;
      } else if (quranLangs === "English") {
        tafsirContent = `<p class='dr-ltr my-2'>${ayahEnglishTafsir}</p>`;
      } else if (quranLangs === "Together") {
        tafsirContent = `<div>
          <p class='dr-rtl my-2'>${ayahArabicTafsir}</p>
          <hr />
          <p class='dr-ltr my-2'>${ayahEnglishTafsir}</p>
        </div>`;
      } else {
        // Default to Arabic tafsir if quranLangs is neither "Arabe" nor "English" nor "Together"
        tafsirContent = `<p class='dr-rtl'>${ayahArabicTafsir}</p>`;
      }

      const cleanContent = DOMPurify.sanitize(tafsirContent);
      setSignleAyahTafsirText(cleanContent);
      setOpenAyahTafsirModal(true);
    }
  };

  // Set Arabic tafsir for Explanation Tab
  useEffect(() => {
    const surahNumber = allAyahs?.number;
    const ayahTfasir = Quran_Tafsir.Surahs?.find(
      (tafsir) => tafsir.number === Number(surahNumber)
    );
    setAllSurahTafseer(ayahTfasir);
  }, [allAyahs]);

  useEffect(() => {
    const fetchReciters = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://www.mp3quran.net/api/v3/reciters"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReciters(data.reciters);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reciters:", error);
        setLoading(false);
        setIsErrorFetching(true);
      }
    };

    fetchReciters();
  }, []);

  useEffect(() => {
    if (language === "en") {
      setQuranLangs("English");
      setTafseerLangs("english");
    } else {
      setQuranLangs("Arabe");
      setTafseerLangs("arabe");
    }
  }, [language]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Pagination handlers for Explanation Tab
  const handleNextPageExplanation = () => {
    setCurrentPageExplanation((prev) => {
      const newPage = Math.min(prev + 1, totalPagesExplanation);
      localStorage.setItem("explainedPage", newPage);
      return newPage;
    });
    toTop(); // Scroll to top when changing pages
  };

  const handlePrevPageExplanation = () => {
    setCurrentPageExplanation((prev) => {
      const newPage = Math.max(prev - 1, 1);
      localStorage.setItem("explainedPage", newPage);
      return newPage;
    });
    toTop(); // Scroll to top when changing pages
  };

  // Pagination handlers for Reading Tab
  const handleNextPageReading = () => {
    setCurrentPageReading((prev) => {
      const newPage = Math.min(prev + 1, totalPagesReading);
      // Optionally, save reading page if needed
      return newPage;
    });
    toTop(); // Scroll to top when changing pages
  };

  const handlePrevPageReading = () => {
    setCurrentPageReading((prev) => {
      const newPage = Math.max(prev - 1, 1);
      // Optionally, save reading page if needed
      return newPage;
    });
    toTop(); // Scroll to top when changing pages
  };
  const modalContainer = useRef(null);
  // Pagination handlers for Full-Screen Modal
  const handleNextPageModal = () => {
    setCurrentPageModal((prev) => {
      const newPage = Math.min(prev + 1, totalPagesModal);
      localStorage.setItem("quranModalPage", newPage);
      return newPage;
    });
    if (modalContainer.current)
      modalContainer.current.parentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  };

  const handlePrevPageModal = () => {
    setCurrentPageModal((prev) => {
      const newPage = Math.max(prev - 1, 1);
      localStorage.setItem("quranModalPage", newPage);
      return newPage;
    });
    if (modalContainer.current)
      modalContainer.current.parentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  };

  // Define constants for the texts in different languages
  const arabicText = "🌸 بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ 🌸";
  const englishText =
    "In the name of God, The Most Gracious, The Dispenser of Grace";

  // Define a function to determine the text to display
  const getQuranText = (quranLangs, language) => {
    if (quranLangs === "English" && language === "en") {
      return englishText;
    }
    if (quranLangs === "Arabe" && language === "ar") {
      return arabicText;
    }
    if (quranLangs === "English" && language === "ar") {
      return englishText;
    }
    if (quranLangs === "Arabe" && language === "en") {
      return arabicText;
    }
    // Default to displaying both texts
    return (
      <div className="d-flex flex-column gap-2">
        <span>{arabicText}</span>
        <span>{englishText}</span>
      </div>
    );
  };

  return (
    <div className="quran">
      {isLoading ? (
        <div className="loader-container">
          <div className="loader">
            <div className="spinner"></div>
            <img src={logo} alt="Loading..." />
          </div>
        </div>
      ) : (
        <React.Fragment>
          {/* Data Container */}
          <div className="data-container shadow-4 card mb-5 p-2">
            <div className="metaData" style={{ position: "relative" }}>
              <span>{translations.numberOfAyahs}</span>
              <span>{translations.numberOfSurahs}</span>
              <span>{translations.numberOfSajdahs}</span>
            </div>
            <div
              id="additional-info"
              className={`additional-infos mb-3 ${isOpen && "show"}`}
            >
              <span>{translations.numberOfRukoos}</span>
              <span>{translations.numberOfPages}</span>
              <span>{translations.numberOfManazil}</span>
              <span>{translations.numberOfQuarterHizbs}</span>
              <span>{translations.numberOfJuz}</span>
            </div>
            <button
              className="btn btn-coral text-light metaData-btns p-1 text-center"
              onClick={toggleVisibility}
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "42px",
                transform: "translateX(-50%)",
              }}
            >
              <p
                className={`w-100 text-center ${
                  isOpen ? "text-warning" : "text-light"
                }`}
              >
                {isOpen
                  ? language === "ar"
                    ? "أقل"
                    : "Less"
                  : language === "ar"
                  ? "المزيد"
                  : "More"}
              </p>
            </button>
            <button
              className="btn btn-coral rounded-3 shadow-2-strong p-1 mt-2 text-light"
              onClick={reverseSurahs}
              style={{
                position: "absolute",
                bottom: "-16px",
                right: "10px",
                transform: "translateX(-50%) rotate(90deg)",
              }}
            >
              {isReversed ? (
                <SyncIcon className="text-warning" />
              ) : (
                <SyncIcon className="text-light" />
              )}
            </button>
          </div>

          {/* Surahs List */}
          <div className="surahs" ref={surahsRef}>
            {surahs.length > 0 ? (
              (isReversed ? [...surahs].reverse() : surahs).map(
                (surah, index) => (
                  <div
                    className="surah"
                    key={index}
                    data-name={index + 1}
                    onClick={(e) => handleSurahClick(e, surah)}
                  >
                    <div className="surah-number pe-none"> {surah.number} </div>
                    <div className="surah-names pe-none">
                      <div className="surah-arabic-name">
                        {" "}
                        {language === "ar"
                          ? surah.name
                          : surah.englishName}{" "}
                      </div>
                      <h5 className="surah-english-name">
                        {language === "ar" ? surah.englishName : surah.name}
                      </h5>
                    </div>
                    <div className="surah-infos pe-none mx-2">
                      <p className="surah-ayahs mb-1">
                        <span> {surah.ayahs.length} </span>{" "}
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
                )
              )
            ) : (
              <span>
                {language === "ar"
                  ? "الرجاء المحاولة مرة أخرى"
                  : "No Data, please try again"}
              </span>
            )}
          </div>

          {/* Ayahs */}
          <div className="ayahs p-0" ref={ayahsRef}>
            <div className="back" onClick={goBack}>
              X
            </div>
            {allAyahs && (
              <Box className="w-100">
                <div className="surah-title mt-2 w-100 text-center fs-3">
                  ✧ {language === "ar" ? allAyahs.name : allAyahs.englishName} ✧
                </div>
                <div className="d-flex flex-column flex-lg-row flex-md-row justify-content-between align-items-center gap-2 my-2 p-2">
                  <div className="d-flex flex-row gap-3 justify-content-start align-items-center d-none d-lg-flex d-md-flex">
                    <p className="quran-listen-btn">
                      <SlowMotionVideoOutlinedIcon className="mx-2" />
                      <span style={{ textWrap: "nowrap" }}>
                        {language === "ar"
                          ? "سيتم تشغيل التلاوة بمجرد اختيار القارئ"
                          : "The recitation will start as soon as the reciter is selected"}
                      </span>
                    </p>
                  </div>
                  <div className="dropdown">
                    <select
                      className="form-select"
                      style={{ minWidth: "310px", width: "100%" }}
                      onChange={src}
                      ref={selectReciter}
                    >
                      <option className="pe-none" value="default">
                        {language === "ar" ? "اختر القارئ" : "Choose reciter"}
                      </option>
                      {!loading &&
                        reciters?.map((reciter, index) => {
                          const surahIndex = `${
                            selectedSurah < 10
                              ? "00"
                              : selectedSurah < 100
                              ? "0"
                              : ""
                          }${selectedSurah}`;
                          const surahUrl = `${reciter.moshaf[0].server}${surahIndex}.mp3`;

                          if (
                            reciter.moshaf[0].surah_list
                              .split(",")
                              .includes(String(selectedSurah))
                          ) {
                            const reciterName =
                              language === "en"
                                ? reciterNameMap[reciter.name] || reciter.name
                                : `${reciter.name} - ${reciter.moshaf[0].name}`;

                            return (
                              <option
                                key={index}
                                value={surahUrl}
                                data-name={
                                  language === "ar"
                                    ? allAyahs.name
                                    : allAyahs.englishName
                                }
                              >
                                {reciterName}
                              </option>
                            );
                          }
                          return null;
                        })}
                    </select>
                  </div>
                </div>
                <Box className="my-2 w-100">
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Quran Tabs"
                    className="navs shadow-1-strong rounded-2 mx-2"
                    variant="fullWidth"
                  >
                    {/* First Tab: Reading */}
                    <Tab
                      label={language === "ar" ? "القراءة" : "Reading"}
                      sx={{
                        color:
                          tabValue === 0
                            ? "mediumvioletred !important"
                            : "var(--text-color)",
                        fontWeight: tabValue === 0 ? "bold" : "normal",
                      }}
                      className="quranTabs"
                      value={0}
                    />
                    {/* Second Tab: Explanation */}
                    <Tab
                      label={language === "ar" ? "التفسير" : "Explanation"}
                      sx={{
                        color:
                          tabValue === 1
                            ? "mediumvioletred !important"
                            : "var(--text-color)",
                        fontWeight: tabValue === 1 ? "bold" : "normal",
                      }}
                      className="quranTabs"
                      value={1}
                    />
                  </Tabs>

                  <TabPanel value={tabValue} index={0}>
                    {/* Reading Tab Content */}
                    <div className="w-100 h-100">
                      <div className="w-100 text-center d-flex justify-content-between dr-rtl align-items-center langs gap-2 py-2">
                        <select
                          className="form-select"
                          value={quranLangs}
                          onChange={(event) =>
                            setQuranLangs(event.target.value)
                          }
                          style={{ minWidth: "220px" }}
                        >
                          <option value="Arabe">العربية/Arabe</option>
                          <option value="English">الانجليزية/English</option>
                          <option value="Together">Together</option>
                        </select>
                        <button
                          className="btn btn-outline-light text-primary"
                          onClick={() => setLayout("fullscreen")}
                        >
                          <ZoomOutMapOutlinedIcon />
                        </button>
                      </div>

                      <div
                        className={
                          allAyahs.number === 1 || allAyahs.number === 9
                            ? "d-none"
                            : "w-100 text-center me-3 mt-3 mb-3"
                        }
                      >
                        {getQuranText(quranLangs, language)}
                      </div>

                      <div className="ayah w-100">
                        {totalAyahsReading > itemsPerPageReading
                          ? currentAyahsReading.map((ayah, index) => (
                              <div
                                className={
                                  ayah.text ===
                                    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" &&
                                  allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                    ? "d-none"
                                    : quranLangs === "English"
                                    ? "ayah-text dr-ltr text-start"
                                    : "ayah-text"
                                }
                                key={index}
                                onClick={() =>
                                  getSingleAyahTafsir(
                                    index + indexOfFirstAyahReading
                                  )
                                }
                              >
                                <p className="pe-none mt-3">
                                  {quranLangs === "Arabe" ||
                                  quranLangs === "Together" ? (
                                    <>
                                      {allAyahs.number !== 1
                                        ? ayah.text.replace(
                                            "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                            ""
                                          )
                                        : ayah.text}
                                      {quranLangs === "Together" && <br />}
                                    </>
                                  ) : null}
                                  {quranLangs === "English" ||
                                  quranLangs === "Together" ? (
                                    apiTranslation.length > 0 ? (
                                      <span
                                        style={{ color: "var(--text-color)" }}
                                        className="dr-ltr"
                                      >
                                        {apiTranslation[
                                          index + indexOfFirstAyahReading
                                        ]?.text.replace(/^[;:!]/, "")}
                                        {quranLangs === "Together" && <br />}
                                      </span>
                                    ) : (
                                      <span>Loading...</span>
                                    )
                                  ) : null}
                                </p>

                                <p
                                  className={`ayah-number ${
                                    quranLangs === "English" && "ltr"
                                  } ${language === "en" && "ltr"}`}
                                >
                                  {index + 1 + indexOfFirstAyahReading}
                                </p>
                              </div>
                            ))
                          : currentAyahsReading.map((ayah, index) => (
                              <div
                                className={
                                  ayah.text ===
                                    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" &&
                                  allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                    ? "d-none"
                                    : quranLangs === "English"
                                    ? "ayah-text dr-ltr text-start"
                                    : "ayah-text"
                                }
                                key={index}
                                onClick={() =>
                                  getSingleAyahTafsir(
                                    index + indexOfFirstAyahReading
                                  )
                                }
                              >
                                <p className="pe-none">
                                  {quranLangs === "Arabe" ||
                                  quranLangs === "Together" ? (
                                    <>
                                      {allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                        ? ayah.text.replace(
                                            "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                            ""
                                          )
                                        : ayah.text}
                                      {quranLangs === "Together" && <br />}
                                    </>
                                  ) : null}
                                  {quranLangs === "English" ||
                                  quranLangs === "Together" ? (
                                    apiTranslation.length > 0 ? (
                                      <span
                                        style={{ color: "var(--text-color)" }}
                                        className="dr-ltr"
                                      >
                                        {apiTranslation[
                                          index + indexOfFirstAyahReading
                                        ]?.text.replace(/^[;:!]/, "")}
                                        {quranLangs === "Together" && <br />}
                                      </span>
                                    ) : (
                                      <span>Loading...</span>
                                    )
                                  ) : null}
                                </p>

                                <p
                                  className={`ayah-number ${
                                    quranLangs === "English" && "ltr"
                                  } ${language === "en" && "ltr"}`}
                                >
                                  {index + 1 + indexOfFirstAyahReading}
                                </p>
                              </div>
                            ))}
                      </div>

                      {/* Pagination Controls for Reading Tab */}
                      {totalAyahsReading > itemsPerPageReading && (
                        <div
                          className="pagination-controls d-flex justify-content-between align-items-center mt-4"
                          style={{
                            direction:
                              language === "ar" && quranLangs === "Arabe"
                                ? "rlt"
                                : "ltr",
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={handlePrevPageReading}
                            disabled={currentPageReading === 1}
                          >
                            {language === "ar" && quranLangs === "Arabe"
                              ? "السابق"
                              : "Previous"}
                          </Button>
                          <span>
                            {language === "ar" && quranLangs === "Arabe"
                              ? `صفحة ${currentPageReading} من ${totalPagesReading}`
                              : `Page ${currentPageReading} of ${totalPagesReading}`}
                          </span>
                          <Button
                            variant="outlined"
                            onClick={handleNextPageReading}
                            disabled={currentPageReading === totalPagesReading}
                          >
                            {language === "ar" && quranLangs === "Arabe"
                              ? "التالي"
                              : "Next"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    {/* Explanation Tab Content */}
                    <div className="tafseer-controls d-flex flex-row gap-3 w-100">
                      <select
                        className="form-select"
                        value={tafseerLangs}
                        onChange={(event) =>
                          setTafseerLangs(event.target.value)
                        }
                      >
                        <option value="arabe">العربية/Arabe</option>
                        <option value="english">الانجليزية/English</option>
                      </select>
                      <select
                        className="form-select"
                        onChange={handleDropdownChange}
                        value={
                          currentAyahIndex !== null ? currentAyahIndex : -1
                        }
                      >
                        <option value={-1}>
                          {language === "en" || tafseerLangs === "english"
                            ? "To Ayah"
                            : "الى الأية"}
                        </option>
                        {currentAyahsExplanation.map((ayah, index) => {
                          const globalIndex =
                            indexOfFirstAyahExplanation + index;
                          return (
                            <option key={index} value={index}>
                              {globalIndex + 1}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {surahData !== null && (
                      <div
                        className="tafseer"
                        style={{
                          direction: tafseerLangs === "arabe" ? "rtl" : "ltr",
                        }}
                      >
                        {currentAyahsExplanation.map((ayah, index) => {
                          const globalIndex =
                            indexOfFirstAyahExplanation + index;
                          // Get Arabic tafsir
                          let arabicTafsir = "";
                          if (tafseerLangs === "arabe") {
                            const currentTafsir = allSurahTafseer?.ayahs?.find(
                              (t) => t.number === globalIndex + 1
                            );
                            arabicTafsir =
                              currentTafsir?.tafsir || "التفسير غير متاح";
                          }

                          // Get English tafsir
                          let englishTafsirText = "";
                          if (tafseerLangs === "english") {
                            const ayahNumber = (globalIndex + 1).toString();
                            const englishText = englishTafsir?.find(
                              (a) => a.ayah_number === ayahNumber
                            );
                            englishTafsirText =
                              englishText?.text || "Explanation not available";
                          }

                          return (
                            <div key={ayah.number}>
                              <div
                                className="ayah-text mb-3"
                                style={{
                                  textAlign:
                                    tafseerLangs === "arabe" ? "right" : "left",
                                }}
                              >
                                <p
                                  className="w-100 ayah-in-tafseer"
                                  ref={refs[index]}
                                >
                                  ۞{" "}
                                  {tafseerLangs === "arabe" &&
                                  allAyahs.name !== "سُورَةُ ٱلْفَاتِحَةِ"
                                    ? allAyahs?.ayahs[
                                        globalIndex
                                      ]?.text.replace(
                                        "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                        ""
                                      )
                                    : tafseerLangs === "arabe"
                                    ? allAyahs?.ayahs[globalIndex]?.text
                                    : apiTranslation[globalIndex]?.text.replace(
                                        /^[;:!]/,
                                        ""
                                      )}
                                  ۞
                                </p>
                                <p
                                  className={`ayah-number ${
                                    tafseerLangs === "english" && "ltr"
                                  } ${language === "en" && "ltr"}`}
                                >
                                  {globalIndex + 1}
                                </p>
                              </div>

                              {tafsirLoader ? (
                                <span>
                                  {language === "ar"
                                    ? "جاري العمل..."
                                    : "Loading..."}
                                </span>
                              ) : (
                                <div>
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

                    {/* Pagination Controls for Explanation Tab */}
                    {totalPagesExplanation > 1 && (
                      <div
                        className="pagination-controls d-flex justify-content-between align-items-center mt-4"
                        style={{
                          direction:
                            language === "ar" && tafseerLangs === "arabe"
                              ? "rtl"
                              : "ltr",
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={handlePrevPageExplanation}
                          disabled={currentPageExplanation === 1}
                        >
                          {language === "ar" && tafseerLangs === "arabe"
                            ? "السابق"
                            : "Previous"}
                        </Button>
                        <span>
                          {language === "ar" && tafseerLangs === "arabe"
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
                          {language === "ar" && tafseerLangs === "arabe"
                            ? "التالي"
                            : "Next"}
                        </Button>
                      </div>
                    )}
                  </TabPanel>
                </Box>
                {/* Full-Screen Quran Reading Modal */}
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
                      <div
                        style={{
                          backgroundColor: "var(--card-color)",
                          color: "var(--text-color)",
                          overflowX: "hidden",
                          width: "100%",
                        }}
                        ref={modalContainer}
                      >
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
                          {currentPageModal < 2 ? (
                            quranLangs === "English" ? (
                              "In the name of God, The Most Gracious, The Dispenser of Grace"
                            ) : quranLangs === "Arabe" ? (
                              " بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ "
                            ) : (
                              <div className="d-flex flex-column gap-2">
                                <p> بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ </p>
                                <p>
                                  In the name of God, The Most Gracious, The
                                  Dispenser of Grace
                                </p>
                              </div>
                            )
                          ) : null}
                        </div>
                        <section
                          style={{
                            borderRadius: "4px",
                            fontSize: "1.5rem",
                            textAlign: "justify",
                            position: "relative",
                            lineHeight: "2",
                            direction:
                              quranLangs === "Arabe"
                                ? "rtl"
                                : quranLangs === "English"
                                ? "ltr"
                                : "rtl",
                            unicodeBidi: "embed",
                            width: "100%",
                          }}
                        >
                          <p
                            className="modal-ayahs-container"
                            style={{ margin: 0 }}
                          >
                            {totalAyahsModal > itemsPerPageModal
                              ? currentAyahsModal.map((ayah, index) => (
                                  <span
                                    key={index}
                                    id={index}
                                    onClick={() =>
                                      getSingleAyahTafsir(
                                        index + indexOfFirstAyahModal
                                      )
                                    }
                                    className="modal-ayah"
                                  >
                                    <span>
                                      {/* Display the Ayah text */}
                                      {quranLangs === "Arabe" ||
                                      quranLangs === "Together" ? (
                                        <>
                                          {allAyahs.name !==
                                          "سُورَةُ ٱلْفَاتِحَةِ"
                                            ? ayah.text.replace(
                                                "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                                ""
                                              )
                                            : ayah.text}
                                          {quranLangs === "Together" && <br />}
                                        </>
                                      ) : null}

                                      {/* Display the Ayah number inside the symbol */}
                                      <span
                                        style={{
                                          marginLeft: "5px",
                                          marginRight: "5px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                            position: "relative",
                                            width: "1.5rem",
                                            height: "1.5rem",
                                            borderRadius: "50%",
                                            lineHeight: "1.5rem",
                                            textAlign: "center",
                                            color: "green",
                                          }}
                                        >
                                          ۝
                                          <span
                                            style={{
                                              position: "absolute",
                                              fontSize: "0.75rem",
                                              top: "50%",
                                              left: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                            }}
                                          >
                                            {index + 1 + indexOfFirstAyahModal}
                                          </span>
                                        </span>
                                      </span>

                                      {/* For English or combined languages */}
                                      {quranLangs === "English" ||
                                      quranLangs === "Together" ? (
                                        <span className="">
                                          {apiTranslation[
                                            index + indexOfFirstAyahModal
                                          ]?.text.replace(/^[;:!]/, "")}
                                          {quranLangs === "Together" && <hr />}
                                        </span>
                                      ) : null}
                                    </span>
                                  </span>
                                ))
                              : currentAyahsModal.map((ayah, index) => (
                                  <span
                                    key={index}
                                    id={index}
                                    onClick={() =>
                                      getSingleAyahTafsir(
                                        index + indexOfFirstAyahModal
                                      )
                                    }
                                    className="modal-ayah"
                                  >
                                    <span>
                                      {/* Display the Ayah text */}
                                      {quranLangs === "Arabe" ||
                                      quranLangs === "Together" ? (
                                        <>
                                          {allAyahs.number !== 1
                                            ? ayah.text.replace(
                                                "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                                                ""
                                              )
                                            : ayah.text}
                                          {quranLangs === "Together" && <br />}
                                        </>
                                      ) : null}

                                      {/* Display the Ayah number inside the symbol */}
                                      <span
                                        style={{
                                          marginLeft: "5px",
                                          marginRight: "5px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                            position: "relative",
                                            width: "1.5rem",
                                            height: "1.5rem",
                                            borderRadius: "50%",
                                            lineHeight: "1.5rem",
                                            textAlign: "center",
                                            color: "green",
                                          }}
                                        >
                                          ۝
                                          <span
                                            style={{
                                              position: "absolute",
                                              fontSize: "0.75rem",
                                              top: "50%",
                                              left: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                            }}
                                          >
                                            {index + 1 + indexOfFirstAyahModal}
                                          </span>
                                        </span>
                                      </span>

                                      {/* For English or combined languages */}
                                      {quranLangs === "English" ||
                                      quranLangs === "Together" ? (
                                        <span className="">
                                          {apiTranslation[
                                            index + indexOfFirstAyahModal
                                          ]?.text.replace(/^[;:!]/, "")}
                                          {quranLangs === "Together" && <hr />}
                                        </span>
                                      ) : null}
                                    </span>
                                  </span>
                                ))}
                          </p>
                        </section>

                        {/* Pagination Controls for Full-Screen Modal */}
                        {totalAyahsModal > itemsPerPageModal && (
                          <div
                            className="pagination-controls d-flex justify-content-between align-items-center mt-4"
                            style={{
                              direction:
                                language === "ar" && quranLangs === "Arabe"
                                  ? "rtl"
                                  : "ltr",
                            }}
                          >
                            <Button
                              variant="outlined"
                              onClick={handlePrevPageModal}
                              disabled={currentPageModal === 1}
                            >
                              {language === "ar" && quranLangs === "Arabe"
                                ? "السابق"
                                : "Previous"}
                            </Button>
                            <span>
                              {language === "ar" && quranLangs === "Arabe"
                                ? `صفحة ${currentPageModal} من ${totalPagesModal}`
                                : `Page ${currentPageModal} of ${totalPagesModal}`}
                            </span>
                            <Button
                              variant="outlined"
                              onClick={handleNextPageModal}
                              disabled={currentPageModal === totalPagesModal}
                            >
                              {language === "ar" && quranLangs === "Arabe"
                                ? "التالي"
                                : "Next"}
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
        </React.Fragment>
      )}
      {/* Single Ayah Tafsir Modal */}
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={openAyahTafsirModal}
        onClose={() => setOpenAyahTafsirModal(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
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
              {language === "ar" && quranLangs === "Arabe"
                ? "التفسير الميسر"
                : "The Easy Explanation"}
            </Typography>
          </div>
          <Typography
            id="modal-desc"
            textColor="text.tertiary"
            sx={{ color: "var(--text-color)", textAlign: "justify" }}
          >
            {tafsirLoader ? (
              language === "ar" ? (
                "جاري العمل..."
              ) : (
                "Working..."
              )
            ) : signleAyahTafsirText ? (
              <span
                className="alert mb-4 p-0 d-flex flex-column gap-2 text-align-justify"
                dangerouslySetInnerHTML={{ __html: signleAyahTafsirText }}
              ></span>
            ) : (
              <span>{language === "ar" ? "جاري العمل..." : "Loading..."}</span>
            )}
          </Typography>
        </Sheet>
      </Modal>
    </div>
  );
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index } = props;

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
