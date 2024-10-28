import React, { useState, useEffect } from "react";
import "./names.css";
import { useTranslation } from "../../../../components/languages/provider";
import Card from "@mui/joy/Card";
import CircularProgress from "@mui/joy/CircularProgress";
import { toast } from "react-toastify";

// Replace the API data with the local object namesOfAllah
const namesOfAllah = {
  Allah: {
    ar: "الله",
    en: "Allah",
  },
  "Al-Ahad": {
    ar: "الأحد",
    en: "The One",
  },
  "Al-A'la": {
    ar: "الأعلى",
    en: "The Most High",
  },
  "Al-Akram": {
    ar: "الأكرم",
    en: "The Most Generous",
  },
  "Al-Ilah": {
    ar: "الإله",
    en: "The God",
  },
  "Al-Awwal": {
    ar: "الأول",
    en: "The First",
  },
  "Al-Akhir": {
    ar: "الآخر",
    en: "The Last",
  },
  "Az-Zahir": {
    ar: "الظاهر",
    en: "The Manifest",
  },
  "Al-Batin": {
    ar: "الباطن",
    en: "The Hidden",
  },
  "Al-Bari": {
    ar: "البارئ",
    en: "The Evolver",
  },
  "Al-Barr": {
    ar: "البر",
    en: "The Source of All Goodness",
  },
  "Al-Basir": {
    ar: "البصير",
    en: "The All-Seeing",
  },
  "At-Tawwab": {
    ar: "التواب",
    en: "The Acceptor of Repentance",
  },
  "Al-Jabbar": {
    ar: "الجبار",
    en: "The Compeller",
  },
  "Al-Hafez": {
    ar: "الحافظ",
    en: "The Preserver",
  },
  "Al-Hasib": {
    ar: "الحسيب",
    en: "The Reckoner",
  },
  "Al-Hafiz": {
    ar: "الحفيظ",
    en: "The Guardian",
  },
  "Al-Haqq": {
    ar: "الحق",
    en: "The Truth",
  },
  "Al-Mubin": {
    ar: "المبين",
    en: "The Clear",
  },
  "Al-Hakim": {
    ar: "الحكيم",
    en: "The Wise",
  },
  "Al-Halim": {
    ar: "الحليم",
    en: "The Forbearing",
  },
  "Al-Hamid": {
    ar: "الحميد",
    en: "The Praiseworthy",
  },
  "Al-Hayy": {
    ar: "الحي",
    en: "The Ever-Living",
  },
  "Al-Qayyum": {
    ar: "القيوم",
    en: "The Sustainer",
  },
  "Al-Khabir": {
    ar: "الخبير",
    en: "The All-Aware",
  },
  "Al-Khaliq": {
    ar: "الخالق",
    en: "The Creator",
  },
  "Al-Khallaq": {
    ar: "الخلاق",
    en: "The Supreme Creator",
  },
  "Ar-Ra'uf": {
    ar: "الرءوف",
    en: "The Compassionate",
  },
  "Ar-Rahman": {
    ar: "الرحمن",
    en: "The Beneficent",
  },
  "Ar-Rahim": {
    ar: "الرحيم",
    en: "The Merciful",
  },
  "Ar-Razzaq": {
    ar: "الرزاق",
    en: "The Provider",
  },
  "Ar-Raqib": {
    ar: "الرقيب",
    en: "The Watchful",
  },
  "As-Salam": {
    ar: "السلام",
    en: "The Source of Peace",
  },
  "As-Sami'": {
    ar: "السميع",
    en: "The All-Hearing",
  },
  "Ash-Shakir": {
    ar: "الشاكر",
    en: "The Appreciative",
  },
  "Ash-Shakur": {
    ar: "الشكور",
    en: "The Most Grateful",
  },
  "Ash-Shahid": {
    ar: "الشهيد",
    en: "The Witness",
  },
  "As-Samad": {
    ar: "الصمد",
    en: "The Eternal",
  },
  "Al-‘Alem": {
    ar: "العالم",
    en: "The All-Knowing",
  },
  "Al-‘Aziz": {
    ar: "العزيز",
    en: "The Almighty",
  },
  "Al-‘Azim": {
    ar: "العظيم",
    en: "The Magnificent",
  },
  "Al-‘Afuww": {
    ar: "العفو",
    en: "The Pardoner",
  },
  "Al-‘Alim": {
    ar: "العليم",
    en: "The All-Knowing",
  },
  "Al-‘Aliyy": {
    ar: "العلي",
    en: "The Most High",
  },
  "Al-Ghaffar": {
    ar: "الغفار",
    en: "The Great Forgiver",
  },
  "Al-Ghafur": {
    ar: "الغفور",
    en: "The Great Forgiver",
  },
  "Al-Ghaniyy": {
    ar: "الغني",
    en: "The Self-Sufficient",
  },
  "Al-Fattah": {
    ar: "الفتاح",
    en: "The Opener",
  },
  "Al-Qader": {
    ar: "القادر",
    en: "The Omnipotent",
  },
  "Al-Qahir": {
    ar: "القاهر",
    en: "The All-Subduer",
  },
  "Al-Quddus": {
    ar: "القدوس",
    en: "The Most Sacred",
  },
  "Al-Qadir": {
    ar: "القدير",
    en: "The Powerful",
  },
  "Al-Qarib": {
    ar: "القريب",
    en: "The Near",
  },
  "Al-Qawiyy": {
    ar: "القوي",
    en: "The Strong",
  },
  "Al-Qahhar": {
    ar: "القهار",
    en: "The All-Subduer",
  },
  "Al-Kabir": {
    ar: "الكبير",
    en: "The Great",
  },
  "Al-Karim": {
    ar: "الكريم",
    en: "The Generous",
  },
  "Al-Latif": {
    ar: "اللطيف",
    en: "The Gentle",
  },
  "Al-Mu’min": {
    ar: "المؤمن",
    en: "The Guardian of Faith",
  },
  "Al-Muta’ali": {
    ar: "المتعالي",
    en: "The Self Exalted",
  },
  "Al-Mutakabbir": {
    ar: "المتكبر",
    en: "The Majestic",
  },
  "Al-Matin": {
    ar: "المتين",
    en: "The Firm One",
  },
  "Al-Mujib": {
    ar: "المجيب",
    en: "The Responsive",
  },
  "Al-Majid": {
    ar: "المجيد",
    en: "The Glorious",
  },
  "Al-Muhit": {
    ar: "المحيط",
    en: "The All-Embracing",
  },
  "Al-Musawwir": {
    ar: "المصور",
    en: "The Fashioner",
  },
  "Al-Muqtadir": {
    ar: "المقتدر",
    en: "The Creator of Power",
  },
  "Al-Muqit": {
    ar: "المقيت",
    en: "The Sustainer",
  },
  "Al-Malek": {
    ar: "الملك",
    en: "The King",
  },
  "Al-Malik": {
    ar: "المليك",
    en: "The Sovereign Lord",
  },
  "Al-Mawla": {
    ar: "المولى",
    en: "The Master",
  },
  "Al-Muhaymin": {
    ar: "المهيمن",
    en: "The Protector",
  },
  "An-Nasir": {
    ar: "النصير",
    en: "The Helper",
  },
  "Al-Wahid": {
    ar: "الواحد",
    en: "The One",
  },
  "Al-Warith": {
    ar: "الوارث",
    en: "The Inheritor",
  },
  "Al-Wasi’": {
    ar: "الواسع",
    en: "The All-Encompassing",
  },
  "Al-Wadud": {
    ar: "الودود",
    en: "The Most Loving",
  },
  "Al-Wakil": {
    ar: "الوكيل",
    en: "The Trustee",
  },
  "Al-Waliyy": {
    ar: "الولي",
    en: "The Protecting Friend",
  },
  "Al-Wahhab": {
    ar: "الوهاب",
    en: "The Giver of Gifts",
  },
  // Names from the Sunnah
  "Al-Jamil": {
    ar: "الجميل",
    en: "The Beautiful",
  },
  "Al-Jawad": {
    ar: "الجواد",
    en: "The Generous",
  },
  "Al-Hakam": {
    ar: "الحكم",
    en: "The Judge",
  },
  "Al-Hayyi": {
    ar: "الحيي",
    en: "The Modest",
  },
  "Ar-Rabb": {
    ar: "الرب",
    en: "The Lord",
  },
  "Ar-Rafiq": {
    ar: "الرفيق",
    en: "The Gentle",
  },
  "As-Subooh": {
    ar: "السبوح",
    en: "The All-Pure",
  },
  "As-Sayyid": {
    ar: "السيد",
    en: "The Master",
  },
  "Ash-Shafi": {
    ar: "الشافي",
    en: "The Healer",
  },
  "At-Tayyib": {
    ar: "الطيب",
    en: "The Pure",
  },
  "Al-Qabid": {
    ar: "القابض",
    en: "The Withholder",
  },
  "Al-Basit": {
    ar: "الباسط",
    en: "The Extender",
  },
  "Al-Muqaddim": {
    ar: "المقدم",
    en: "The Expediter",
  },
  "Al-Mu’akhkhir": {
    ar: "المؤخر",
    en: "The Delayer",
  },
  "Al-Muhsin": {
    ar: "المحسن",
    en: "The Benefactor",
  },
  "Al-Mu'ti": {
    ar: "المعطي",
    en: "The Giver",
  },
  "Al-Mannan": {
    ar: "المنان",
    en: "The Bestower",
  },
  "Al-Witr": {
    ar: "الوتر",
    en: "The One",
  },
};

const Names = () => {
  const { language } = useTranslation();
  const [namesData, setNamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isErrorFetching, setIsErrorFetching] = useState(false);

  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "هناك خطأ ما سيتم معالجة الأمر قريبا "
          : "Something happend , w'll fix it soon"
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching]);

  useEffect(() => {
    // Simulate fetching data by directly using the local object
    const fetchNames = async () => {
      try {
        // Since we are using the local object, no need to fetch from API
        const data = Object.entries(namesOfAllah).map(([key, value]) => ({
          key,
          ...value,
        }));
        setNamesData(data); // Use the local object data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching names:", error);
        setLoading(false);
        setIsErrorFetching(true);
      }
    };

    fetchNames();
  }, []);

  return (
    <div className="names-container">
      {loading ? (
        <div className="w-100 text-center loader-manager mt-5">
          <CircularProgress />
        </div>
      ) : namesData.length > 0 ? (
        namesData.map((item, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              bgcolor: "var(--card-color)",
              color: "var(--text-color)",
              padding: 2,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {/* Display the name based on the selected language */}
            <div className="name">
              {index + 1} - {item.ar}
            </div>
            {/* Display the meaning in English, which remains the same regardless of language */}
            <div className="meaning">{item.en}</div>
          </Card>
        ))
      ) : (
        <div className="w-100 text-center loader-manager mt-5">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default Names;
