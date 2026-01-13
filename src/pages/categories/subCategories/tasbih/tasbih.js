import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "../../../../components/languages/provider";
import "./tasbih.css";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import LinearProgress from "@mui/joy/LinearProgress";
import Alert from "@mui/joy/Alert";
import Tooltip from "@mui/joy/Tooltip";

import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

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
    total: 10,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من صلى عليّ حين يصبح وحين يمسي أدركته شفاعتي يوم القيامة. (رواه الطبراني)",
      en: "The Messenger of Allah (PBUH) said: 'Whoever sends peace upon me in the morning and in the evening will receive my intercession on the Day of Judgment.' (Narrated by Al-Tabarani)",
    },
  },
  {
    ar: "سبحان الله وبحمده",
    en: "Subhan Allah wa bihamdihi",
    total: 100,
    description: {
      ar: "قال رسول الله صلى الله عليه وسلم: من قال سبحان الله وبحمده مائة مرة حُطت خطاياه وإن كانت مثل زبد البحر. (رواه البخاري ومسلم)",
      en: "The Messenger of Allah (PBUH) said: 'Whoever says Subhan Allah wa bihamdihi one hundred times, their sins will be forgiven, even if they are as much as the foam of the sea.' (Narrated by Bukhari and Muslim)",
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
    total: 3,
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
    total: 70,
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
  const isAr = language === "ar";

  const [currentTasbihIndex, setCurrentTasbihIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishedAllTasbihs, setFinishedAllTasbihs] = useState(false);

  const [showDesc, setShowDesc] = useState(false);
  const [copied, setCopied] = useState(false);

  // Direction-aware icons
  const PrevIcon = isAr ? ArrowForwardRoundedIcon : ArrowBackRoundedIcon;
  const NextIcon = isAr ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon;

  // Direction-aware labels (optional)
  const prevLabel = isAr ? "التالي" : "Back";
  const nextLabel = isAr ? "السابق" : "Next";

  const isInitialRender = useRef(true);

  useEffect(() => {
    const savedState = localStorage.getItem("tasbihState");
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setCurrentTasbihIndex(parsed.currentTasbihIndex ?? 0);
      setCount(parsed.count ?? 0);
      setFinishedAllTasbihs(parsed.finishedAllTasbihs ?? false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const stateToSave = { currentTasbihIndex, count, finishedAllTasbihs };
    localStorage.setItem("tasbihState", JSON.stringify(stateToSave));
  }, [currentTasbihIndex, count, finishedAllTasbihs]);

  useEffect(() => {
    if (finishedAllTasbihs) localStorage.removeItem("tasbihState");
  }, [finishedAllTasbihs]);

  const currentTasbih = combinedTasbihAndIstighfar[currentTasbihIndex];

  const totalForCurrent = Math.max(1, currentTasbih.total || 1);
  const progressValue = Math.min(
    100,
    Math.round((count / totalForCurrent) * 100)
  );
  const remaining = Math.max(0, totalForCurrent - count);

  const titleText = useMemo(() => {
    const text = isAr ? currentTasbih.ar : currentTasbih.en;
    const timesLabel =
      totalForCurrent < 2
        ? isAr
          ? "(مرة واحدة)"
          : "(one time)"
        : isAr
        ? `(${totalForCurrent} مرة)`
        : `(${totalForCurrent} times)`;
    return `${text} ${timesLabel}`;
  }, [currentTasbih, isAr, totalForCurrent]);

  const handleTasbihClick = () => {
    if (navigator.vibrate) navigator.vibrate(35);

    if (count < totalForCurrent) setCount((c) => c + 1);

    if (count + 1 === totalForCurrent) {
      setTimeout(() => {
        if (currentTasbihIndex + 1 < combinedTasbihAndIstighfar.length) {
          setCurrentTasbihIndex((i) => i + 1);
          setCount(0);
          setShowDesc(false);
        } else {
          setFinishedAllTasbihs(true);
        }
      }, 650);
    }
  };

  const goNext = () => {
    if (currentTasbihIndex + 1 < combinedTasbihAndIstighfar.length) {
      setCurrentTasbihIndex((i) => i + 1);
      setCount(0);
      setShowDesc(false);
    }
  };

  const goPrev = () => {
    if (currentTasbihIndex > 0) {
      setCurrentTasbihIndex((i) => i - 1);
      setCount(0);
      setShowDesc(false);
    }
  };

  const resetToday = () => {
    localStorage.removeItem("tasbihState");
    setCurrentTasbihIndex(0);
    setCount(0);
    setFinishedAllTasbihs(false);
    setShowDesc(false);
  };

  const copyText = async () => {
    try {
      const text = isAr ? currentTasbih.ar : currentTasbih.en;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };
  const isRTL = language === "ar";

  return (
    <div className={`tasbih-page ${isAr ? "rtl" : ""}`}>
      {loading ? (
        <div className="loader-manager">
          <CircularProgress />
          <Typography
            level="body-sm"
            sx={{ mt: 1, opacity: 0.8, color: "var(--text-color)" }}
          >
            {isAr ? "جاري التحميل..." : "Loading..."}
          </Typography>
        </div>
      ) : finishedAllTasbihs ? (
        <Card
          variant="soft"
          className="tasbih-card"
          sx={{
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            border: "1px solid rgba(127,127,127,0.25)",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <CheckCircleRoundedIcon className="done-icon" />
            <Typography level="h2" sx={{ mt: 1 }}>
              {isAr ? "تم بحمد الله ✅" : "Completed ✅"}
            </Typography>
            <Typography level="body-lg" sx={{ mt: 1, opacity: 0.9 }}>
              {isAr
                ? "تهانينا! لقد أكملت جميع التسبيحات لهذا اليوم."
                : "Congratulations! You have completed all tasbihs for today."}
            </Typography>

            <Button
              sx={{ mt: 2 }}
              startDecorator={<ReplayRoundedIcon />}
              onClick={resetToday}
            >
              {isAr ? "إعادة من البداية" : "Start again"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="tasbih-shell">
          {/* header */}
          <Card
            variant="soft"
            className="tasbih-hero"
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              border: "1px solid rgba(127,127,127,0.25)",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={1.2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Stack gap={0.3}>
                  <Typography
                    level="title-lg"
                    sx={{ opacity: 0.9, color: "var(--text-color)" }}
                  >
                    {isAr ? "التقدم" : "Progress"}
                  </Typography>
                  <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Chip
                      variant="soft"
                      sx={{
                        backgroundColor: "rgba(127,127,127,0.12)",
                        color: "var(--text-color)",
                        border: "1px solid rgba(127,127,127,0.18)",
                      }}
                    >
                      {isAr ? "الذكر" : "Item"}: {currentTasbihIndex + 1} /{" "}
                      {combinedTasbihAndIstighfar.length}
                    </Chip>

                    <Chip
                      variant="soft"
                      sx={{
                        backgroundColor: "rgba(127,127,127,0.12)",
                        color: "var(--text-color)",
                        border: "1px solid rgba(127,127,127,0.18)",
                      }}
                    >
                      {isAr ? "المتبقي" : "Remaining"}: {remaining}
                    </Chip>
                  </Stack>
                </Stack>

                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Tooltip title={isAr ? "نسخ الذكر" : "Copy dhikr"}>
                    <IconButton
                      variant="soft"
                      onClick={copyText}
                      sx={{
                        backgroundColor: "rgba(127,127,127,0.12)",
                        color: "var(--text-color)",
                        border: "1px solid rgba(127,127,127,0.18)",
                      }}
                    >
                      <ContentCopyRoundedIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={isAr ? "إعادة ضبط اليوم" : "Reset today"}>
                    <IconButton
                      variant="soft"
                      onClick={resetToday}
                      sx={{
                        backgroundColor: "rgba(127,127,127,0.12)",
                        color: "var(--text-color)",
                        border: "1px solid rgba(127,127,127,0.18)",
                      }}
                    >
                      <ReplayRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {copied && (
                <Alert
                  variant="soft"
                  color="success"
                  sx={{ mt: 1.2, backgroundColor: "rgba(76,175,80,0.14)" }}
                >
                  {isAr ? "تم النسخ ✅" : "Copied ✅"}
                </Alert>
              )}

              <Divider sx={{ my: 1.5, opacity: 0.25 }} />

              <Stack direction="row" alignItems="center" gap={1.5}>
                <CircularProgress
                  determinate
                  value={progressValue}
                  size="lg"
                  sx={{
                    "--CircularProgress-trackThickness": "8px",
                    "--CircularProgress-progressThickness": "8px",
                    color: "rgba(255,152,0,0.95)",
                  }}
                >
                  <Typography
                    level="body-sm"
                    sx={{ color: "var(--text-color)" }}
                  >
                    {progressValue}%
                  </Typography>
                </CircularProgress>

                <Stack sx={{ flex: 1 }}>
                  <Typography
                    level="title-lg"
                    sx={{ color: "var(--text-color)" }}
                  >
                    {titleText}
                  </Typography>

                  <LinearProgress
                    determinate
                    value={progressValue}
                    sx={{
                      mt: 1,
                      backgroundColor: "rgba(127,127,127,0.16)",
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* main */}
          <Card
            variant="outlined"
            className="tasbih-card"
            sx={{
              mt: 2,
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              border: "1px solid rgba(127,127,127,0.25)",
            }}
          >
            <CardContent>
              <Stack gap={1.2} alignItems="center">
                <Typography
                  level="h3"
                  className="tasbih-main-text"
                  sx={{ textAlign: "center", color: "var(--text-color)" }}
                >
                  {isAr ? currentTasbih.ar : currentTasbih.en}
                </Typography>

                <Typography
                  level="body-sm"
                  sx={{ opacity: 0.8, textAlign: "center" }}
                >
                  {isAr
                    ? "اضغط على الزر للتسبيح — يتم الحفظ تلقائيًا"
                    : "Tap the button to count — progress is saved automatically"}
                </Typography>

                <Button
                  onClick={handleTasbihClick}
                  className="tasbih-button"
                  disabled={count >= totalForCurrent}
                  sx={{
                    width: { xs: 160, sm: 190 },
                    height: { xs: 160, sm: 190 },
                    borderRadius: "50%",
                    fontSize: 44,
                    mt: 1,
                    backgroundColor: "rgba(127,127,127,0.14)",
                    color: "var(--text-color)",
                    border: "1px solid rgba(127,127,127,0.25)",
                    "&:hover": {
                      backgroundColor: "rgba(127,127,127,0.20)",
                    },
                    "&:disabled": {
                      opacity: 0.65,
                      color: "var(--text-color)",
                    },
                  }}
                >
                  {count < 1
                    ? isAr
                      ? "ابدأ"
                      : "Start"
                    : count >= totalForCurrent
                    ? isAr
                      ? "تم"
                      : "Done"
                    : count}
                </Button>

                <Stack
                  direction={isRTL ? "row-reverse" : "row"}
                  gap={1}
                  sx={{
                    mt: 0.5,
                    direction: isRTL ? "rtl" : "ltr",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="soft"
                    startDecorator={isRTL ? <NextIcon /> : <PrevIcon />}
                    onClick={goPrev}
                    disabled={currentTasbihIndex === 0}
                    sx={{
                      backgroundColor: "rgba(127,127,127,0.12)",
                      color: "var(--text-color)",
                      border: "1px solid rgba(127,127,127,0.18)",
                    }}
                  >
                    {isRTL ? nextLabel : prevLabel}
                  </Button>
                  <Button
                    variant="soft"
                    endDecorator={isRTL ? <PrevIcon /> : <NextIcon />}
                    onClick={goNext}
                    disabled={
                      currentTasbihIndex + 1 >=
                      combinedTasbihAndIstighfar.length
                    }
                    sx={{
                      backgroundColor: "rgba(127,127,127,0.12)",
                      color: "var(--text-color)",
                      border: "1px solid rgba(127,127,127,0.18)",
                    }}
                  >
                    {isRTL ? prevLabel : nextLabel}
                  </Button>
                </Stack>

                <Divider sx={{ my: 1.5, opacity: 0.25, width: "100%" }} />

                {/* Description */}
                <Stack sx={{ width: "100%" }} gap={0.8}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Stack direction="row" gap={1} alignItems="center">
                      <InfoOutlinedIcon fontSize="small" />
                      <Typography level="title-md">
                        {isAr ? "الشرح / الدليل" : "Description / Proof"}
                      </Typography>
                    </Stack>

                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => setShowDesc(!showDesc)}
                      endDecorator={
                        showDesc ? (
                          <ExpandLessRoundedIcon />
                        ) : (
                          <ExpandMoreRoundedIcon />
                        )
                      }
                      sx={{ color: "var(--text-color)" }}
                    >
                      {showDesc
                        ? isAr
                          ? "إخفاء"
                          : "Hide"
                        : isAr
                        ? "عرض"
                        : "Show"}
                    </Button>
                  </Stack>

                  <Typography
                    level="body-md"
                    className={`tasbih-desc ${showDesc ? "open" : ""}`}
                    sx={{
                      color: "var(--text-color)",
                      opacity: 0.9,
                      lineHeight: 1.9,
                      textAlign: isAr ? "right" : "left",
                    }}
                  >
                    {isAr
                      ? currentTasbih.description.ar
                      : currentTasbih.description.en}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tasbih;
