import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../../../components/languages/provider";
import Card from "@mui/joy/Card";
import CircularProgress from "@mui/joy/CircularProgress";
import Button from "@mui/joy/Button";

const combinedTasbihAndIstighfar = [
  {
    ar: "سبحان الله وبحمده، سبحان الله العظيم",
    en: "Subhan Allah wa bihamdihi, Subhan Allah Al-Azeem",
    total: 1,
    description: {
      ar: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم. (متفق عليه)",
      en: "Two phrases that are light on the tongue, heavy in the balance, and beloved to the Most Merciful: Subhan Allah wa bihamdihi, Subhan Allah Al-Azeem. (Agreed upon - Bukhari and Muslim)",
    },
  },
  {
    ar: "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
    en: "Subhan Allah, Alhamdulillah, La ilaha illallah, Allahu Akbar",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: لأَنْ أَقُولَ سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، أَحَبُّ إِلَيَّ مِمَّا طَلَعَتْ عَلَيْهِ الشَّمسُ. (رواه مسلم)",
      en: "The Messenger of Allah (PBUH) said: 'To say Subhan Allah, Alhamdulillah, La ilaha illallah, and Allahu Akbar is dearer to me than everything the sun has risen upon.' (Narrated by Muslim)",
    },
  },
  {
    ar: "الحمد لله",
    en: "Alhamdulillah",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: أفضل الدعاء الحمد لله. (رواه الترمذي)",
      en: "The Messenger of Allah (PBUH) said: 'The best supplication is Alhamdulillah.' (Narrated by Tirmidhi)",
    },
  },
  {
    ar: "لا إله إلا الله",
    en: "La ilaha illallah",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: أفضل الذكر لا إله إلا الله. (رواه النسائي)",
      en: "The Messenger of Allah (PBUH) said: 'The best remembrance is La ilaha illallah.' (Narrated by Nasa'i)",
    },
  },
  {
    ar: "اللهم صل وسلم على نبينا محمد",
    en: "O Allah, send Your peace and blessings upon our Prophet Muhammad.",
    total: 100,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من صلى عليّ حين يصبح وحين يمسي أدركته شفاعتي يوم القيامة. (رواه الطبراني)",
      en: "The Messenger of Allah (PBUH) said: 'Whoever sends peace upon me in the morning and in the evening will receive my intercession on the Day of Judgment.' (Narrated by Al-Tabarani)",
    },
  },
  {
    ar: "سبحان الله العظيم وبحمده",
    en: "Subhan Allah Al-Azeem wa bihamdihi",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من قال سبحان الله العظيم وبحمده غُرست له نخلة في الجنة. (رواه الترمذي)",
      en: "The Messenger of Allah (PBUH) said: 'Whoever says Subhan Allah Al-Azeem wa bihamdihi, a palm tree will be planted for them in Paradise.' (Narrated by Tirmidhi)",
    },
  },
  {
    ar: "لا حول ولا قوة إلا بالله",
    en: "La hawla wa la quwwata illa billah",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: لا حول ولا قوة إلا بالله كنز من كنوز الجنة. (رواه البخاري)",
      en: "The Messenger of Allah (PBUH) said: 'La hawla wa la quwwata illa billah is a treasure from the treasures of Paradise.' (Narrated by Bukhari)",
    },
  },
  {
    ar: "اللهم أنت ربي، لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء لك بذنبي، فاغفر لي فإنه لا يغفر الذنوب إلا أنت",
    en: "O Allah, You are my Lord, there is no god but You. You created me, and I am Your servant. I am faithful to my covenant and my promise to You as much as I can. I seek refuge in You from the evil I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for there is no one who forgives sins except You.",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من قالها موقناً بها في النهار ومات قبل المساء فهو من أهل الجنة، ومن قالها في الليل ومات قبل الصباح فهو من أهل الجنة. (رواه البخاري)",
      en: "The Messenger of Allah (PBUH) said: 'Whoever says this with certainty during the day and dies before the evening will be among the people of Paradise, and whoever says it at night and dies before morning will be among the people of Paradise.' (Narrated by Bukhari)",
    },
  },

  {
    ar: "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه",
    en: "I seek forgiveness from Allah the Great, there is no god but He, the Ever-Living, the Sustainer, and I repent to Him.",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من قالها غفر له وإن كان فر من الزحف. (رواه الترمذي)",
      en: "The Messenger of Allah (PBUH) said: 'Whoever says this will be forgiven even if they had fled from the battlefield.' (Narrated by Tirmidhi)",
    },
  },
  {
    ar: "اللهم إني ظلمت نفسي ظلما كثيرا، ولا يغفر الذنوب إلا أنت، فاغفر لي مغفرة من عندك وارحمني، إنك أنت الغفور الرحيم",
    en: "O Allah, I have greatly wronged myself, and none forgives sins but You. So grant me forgiveness from You and have mercy on me. Indeed, You are the Oft-Forgiving, Most Merciful.",
    total: 1,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: دعاء علمه النبي صلى الله عليه وسلم لأبي بكر الصديق رضي الله عنه. (رواه البخاري ومسلم)",
      en: "The Messenger of Allah (PBUH) taught this supplication to Abu Bakr As-Siddiq (RA). (Narrated by Bukhari and Muslim)",
    },
  },
  {
    ar: "أستغفر الله وأتوب إليه",
    en: "I seek Allah’s forgiveness and repent to Him.",
    total: 100,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: إني لأستغفر الله وأتوب إليه في اليوم مائة مرة. (رواه مسلم)",
      en: "The Messenger of Allah (PBUH) said: 'Indeed, I seek Allah's forgiveness and repent to Him one hundred times a day.' (Narrated by Muslim)",
    },
  },
  {
    ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير",
    en: "There is no god but Allah, alone without any partner, to Him belongs the dominion, to Him belongs all praise, and He is over all things capable.",
    total: 100,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من قال: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، في يوم مائة مرة؛ كانت له عدل عشر رقاب، وكُتب له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حرزا من الشيطان يومه ذلك حتى يمسي، ولم يأت أحد بأفضل مما جاء به إلا رجل عمل أكثر منه. (متفق عليه)",
      en: 'The Messenger of Allah (PBUH) said: "Whoever says: ‘There is no god but Allah, alone without any partner, to Him belongs the dominion, to Him belongs all praise, and He is over all things capable,’ a hundred times in a day, it will be as if they have freed ten slaves, a hundred good deeds will be recorded for them, a hundred sins will be wiped away, and it will be a protection for them from the devil that day until evening. No one will have done anything better than what they have done, except someone who does more." (Agreed upon - Bukhari and Muslim)',
    },
  },
];

const Tasbih = () => {
  const { language } = useTranslation();
  const [currentTasbihIndex, setCurrentTasbihIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishedAllTasbihs, setFinishedAllTasbihs] = useState(false);

  // Ref to track if it's the initial render
  const isInitialRender = useRef(true);

  useEffect(() => {
    // Load saved state from localStorage if it exists
    const savedState = localStorage.getItem("tasbihState");
    if (savedState) {
      const { currentTasbihIndex, count, finishedAllTasbihs } =
        JSON.parse(savedState);
      setCurrentTasbihIndex(currentTasbihIndex);
      setCount(count);
      setFinishedAllTasbihs(finishedAllTasbihs);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Skip saving to localStorage during the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    // Save state to localStorage whenever it changes
    const stateToSave = {
      currentTasbihIndex,
      count,
      finishedAllTasbihs,
    };
    localStorage.setItem("tasbihState", JSON.stringify(stateToSave));
  }, [currentTasbihIndex, count, finishedAllTasbihs]);

  useEffect(() => {
    if (finishedAllTasbihs) {
      localStorage.removeItem("tasbihState");
    }
  }, [finishedAllTasbihs]);

  const currentTasbih = combinedTasbihAndIstighfar[currentTasbihIndex];

  // Handle button click to increase count
  const handleTasbihClick = () => {
    // Trigger a short vibration (e.g., 50ms)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (count < currentTasbih.total) {
      setCount(count + 1);
    }

    if (count + 1 === currentTasbih.total) {
      setTimeout(() => {
        if (currentTasbihIndex + 1 < combinedTasbihAndIstighfar.length) {
          // Move to the next tasbih if not at the last one
          setCurrentTasbihIndex(currentTasbihIndex + 1);
          setCount(0); // Reset count for the new tasbih
        } else {
          // If all tasbihs are completed, show the success message
          setFinishedAllTasbihs(true);
        }
      }, 1000); // Small delay for user feedback
    }
  };

  return (
    <div className="tasbih-container">
      {loading ? (
        <div className="w-100 text-center loader-manager mt-5">
          <CircularProgress />
        </div>
      ) : finishedAllTasbihs ? (
        <div
          className="success-message"
          style={{
            textAlign: "center",
            color: "#388e3c",
            fontSize: "24px",
            padding: "20px",
          }}
        >
          {language === "ar"
            ? "تهانينا! لقد أكملت جميع التسبيحات لهذا اليوم."
            : "Congratulations! You have completed all tasbihs for today."}
        </div>
      ) : (
        <Card
          variant="outlined"
          sx={{
            padding: 2,
            textAlign: "center",
            fontWeight: "bold",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
        >
          {/* Tasbih Word */}
          <div
            className="tasbih-word"
            style={{ color: "#00695c", fontSize: "20px", marginBottom: "20px" }}
          >
            {language === "ar"
              ? currentTasbih.total < 2
                ? `${currentTasbih.ar} (مرة واحدة)`
                : `${currentTasbih.ar} (${currentTasbih.total} مرة)`
              : currentTasbih.total < 2
              ? `${currentTasbih.en} (one time)`
              : `${currentTasbih.en} (${currentTasbih.total} times)`}
          </div>

          {/* Tasbih Button */}
          <Button
            variant="contained"
            onClick={handleTasbihClick}
            sx={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              backgroundColor:
                count < currentTasbih.total ? "#909090" : "green",
              color:
                count < currentTasbih.total && count < 1 ? "crimson" : "blue",
              fontSize: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "20px auto",
              pointerEvents: count < currentTasbih.total ? "all" : "none",
              border: "1px solid #909090",
            }}
          >
            {count < currentTasbih.total
              ? count < 1
                ? language === "ar"
                  ? "ابدأ"
                  : "Start"
                : count
              : language === "ar"
              ? "تم"
              : "End"}
          </Button>

          {/* Tasbih Description */}
          <div
            className="tasbih-description"
            style={{
              color: "#455a64",
              fontSize: "16px",
              marginBottom: "20px",
              maxHeight: "max-content",
              overflow: "hidden",
              lineHeight: "1.8em",
              textAlign: "justify",
            }}
          >
            {language === "ar"
              ? currentTasbih.description.ar
              : currentTasbih.description.en}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Tasbih;
