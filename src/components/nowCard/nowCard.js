import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./nowCard.css";

import { useTranslation } from "../languages/provider";
import { getJSON, TTL } from "../../lib/apiClient";
import {
  buildTimingsUrl,
  formatRemaining,
  nextPrayer,
  pickSuggestion,
  readSavedLocation,
} from "../../lib/prayerContext";
import { surahName } from "../../lib/surahNames";

import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import WbTwilightRoundedIcon from "@mui/icons-material/WbTwilightRounded";
import NightsStayRoundedIcon from "@mui/icons-material/NightsStayRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";

const SUGGESTION_COPY = {
  morning: {
    Icon: WbTwilightRoundedIcon,
    ar: { title: "أذكار الصباح", body: "وقتها من الفجر إلى طلوع الشمس.", cta: "افتح الأذكار" },
    en: { title: "Morning remembrance", body: "Its time runs from Fajr to sunrise.", cta: "Open adhkar" },
  },
  evening: {
    Icon: NightsStayRoundedIcon,
    ar: { title: "أذكار المساء", body: "وقتها من العصر إلى المغرب.", cta: "افتح الأذكار" },
    en: { title: "Evening remembrance", body: "Its time runs from Asr to Maghrib.", cta: "Open adhkar" },
  },
  night: {
    Icon: NightsStayRoundedIcon,
    ar: { title: "تسبيح واستغفار", body: "خير ما يُختم به اليوم.", cta: "افتح التسبيح" },
    en: { title: "Glorification and istighfar", body: "A good way to close the day.", cta: "Open tasbih" },
  },
  kahf: {
    Icon: AutoStoriesRoundedIcon,
    ar: { title: "سورة الكهف", body: "من قرأها يوم الجمعة أضاء له من النور ما بين الجمعتين.", cta: "افتح المصحف" },
    en: { title: "Surat Al-Kahf", body: "Read on Friday, it lights the way between the two Fridays.", cta: "Open the mushaf" },
  },
  wird: {
    Icon: MenuBookRoundedIcon,
    ar: { title: "وِرد القرآن", body: "صفحة أو أكثر تُبقي عهدك بالمصحف.", cta: "افتح المصحف" },
    en: { title: "Your Quran portion", body: "A page or more keeps your bond with the mushaf.", cta: "Open the mushaf" },
  },
};

const COPY = {
  ar: {
    now: "الآن",
    nextPrayer: "الصلاة القادمة",
    remaining: "متبقٍ على الصلاة",
    setLocation: "حدّد موقعك لعرض المواقيت",
    continueReading: "تابع القراءة",
    continueTajweed: "تابع التجويد",
    surah: "سورة",
    page: "صفحة",
    prayers: {
      Fajr: "الفجر",
      Sunrise: "الشروق",
      Dhuhr: "الظهر",
      Asr: "العصر",
      Maghrib: "المغرب",
      Isha: "العشاء",
    },
  },
  en: {
    now: "Now",
    nextPrayer: "Next prayer",
    remaining: "Time left until the prayer",
    setLocation: "Set your location to see prayer times",
    continueReading: "Continue reading",
    continueTajweed: "Continue tajweed",
    surah: "Surah",
    page: "Page",
    prayers: {
      Fajr: "Fajr",
      Sunrise: "Sunrise",
      Dhuhr: "Dhuhr",
      Asr: "Asr",
      Maghrib: "Maghrib",
      Isha: "Isha",
    },
  },
};

/*
 * Where the reader left off, in either section that keeps a position.
 *
 * The two pages store different things — the Quran page saves the whole surah
 * object, the tajweed page only a number and a page — so each is read on its
 * own terms and normalised here.
 */
function readResumePoints(lang) {
  const points = [];

  try {
    const raw = localStorage.getItem("quranSurah");
    const surah = raw ? JSON.parse(raw) : null;
    if (surah?.number) {
      points.push({
        key: "quran",
        route: "/categories/quran",
        labelKey: "continueReading",
        title: surah.name || surahName(surah.number, lang),
        detail: "",
      });
    }
  } catch {
    /* a corrupt entry just means no resume point */
  }

  try {
    const number = parseInt(localStorage.getItem("savedTajweedSurah"), 10);
    if (number >= 1 && number <= 114) {
      const page = parseInt(localStorage.getItem("savedPage"), 10);
      points.push({
        key: "tajweed",
        route: "/categories/tajweed",
        labelKey: "continueTajweed",
        title: surahName(number, lang),
        detail: page >= 1 ? String(page) : "",
      });
    }
  } catch {
    /* same */
  }

  return points;
}

/**
 * A card at the top of the home page saying what is worth doing at this hour:
 * the worship the moment calls for, how long until the next prayer, and the
 * surah the reader left off at.
 */
const NowCard = () => {
  const { language } = useTranslation();
  const lang = language === "en" ? "en" : "ar";
  const copy = COPY[lang];

  const [timings, setTimings] = useState(null);
  const [tick, setTick] = useState(() => Date.now());

  const location = useMemo(() => readSavedLocation(), []);
  const resumePoints = useMemo(() => readResumePoints(lang), [lang]);
  const abortRef = useRef(null);

  /*
   * Prayer times only load when the reader has already set a location on the
   * prayer-times page. The home page never asks for geolocation itself — a
   * permission prompt on arrival is exactly the wrong first impression.
   */
  useEffect(() => {
    if (!location) return undefined;

    const controller = new AbortController();
    abortRef.current = controller;

    getJSON(buildTimingsUrl(location), {
      ttl: TTL.SHORT,
      signal: controller.signal,
    })
      .then((data) => {
        if (data?.data?.timings) setTimings(data.data.timings);
      })
      .catch(() => {
        // The card still works from the clock alone.
      });

    return () => controller.abort();
  }, [location]);

  // One tick a second, only while a countdown is on screen.
  useEffect(() => {
    if (!timings) return undefined;
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [timings]);

  const now = useMemo(() => new Date(tick), [tick]);
  const suggestion = useMemo(() => pickSuggestion(timings, now), [timings, now]);
  const upcoming = useMemo(() => nextPrayer(timings, now), [timings, now]);

  const { Icon, ...copyByLang } = SUGGESTION_COPY[suggestion.id];
  const text = copyByLang[lang];

  return (
    <section className="nowCard" aria-label={copy.now}>
      <div className="nowCard__main">
        <span className="nowCard__eyebrow">{copy.now}</span>

        <h2 className="nowCard__title">
          <Icon fontSize="small" aria-hidden="true" />
          {text.title}
        </h2>

        <p className="nowCard__body">{text.body}</p>

        <Link className="u-btn u-btn--primary nowCard__cta" to={suggestion.route}>
          {text.cta}
        </Link>
      </div>

      <div className="nowCard__side">
        {upcoming ? (
          <div className="nowCard__stat">
            <span className="nowCard__statLabel">
              <AccessTimeRoundedIcon fontSize="small" aria-hidden="true" />
              {copy.nextPrayer}
            </span>
            <span className="nowCard__statValue">
              {copy.prayers[upcoming.name] || upcoming.name}
            </span>
            {/*
              The countdown says in words what it is counting. On its own,
              "المغرب" over "01:23" reads as the time Maghrib is called, not
              as the time left until it.

              A live region would announce every second, so the number is left
              out of the accessibility tree and the label carries it.
            */}
            <span className="nowCard__remaining" aria-hidden="true">
              {copy.remaining}
            </span>
            <span className="nowCard__countdown" aria-hidden="true">
              {formatRemaining(upcoming.msRemaining)}
            </span>
          </div>
        ) : (
          <Link className="nowCard__stat nowCard__stat--link" to="/categories/times">
            <span className="nowCard__statLabel">
              <AccessTimeRoundedIcon fontSize="small" aria-hidden="true" />
              {copy.nextPrayer}
            </span>
            <span className="nowCard__hint">{copy.setLocation}</span>
          </Link>
        )}

        {resumePoints.map((point) => (
          <Link
            key={point.key}
            className="nowCard__stat nowCard__stat--link"
            to={point.route}
          >
            <span className="nowCard__statLabel">
              <BookmarkRoundedIcon fontSize="small" aria-hidden="true" />
              {copy[point.labelKey]}
            </span>
            <span className="nowCard__statValue nowCard__statValue--surah">
              {point.title}
            </span>
            {point.detail && (
              <span className="nowCard__statDetail">
                {copy.page} {point.detail}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NowCard;
