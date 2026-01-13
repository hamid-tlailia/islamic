import React, { useEffect, useMemo, useState } from "react";
import "./times.css";

import Typography from "@mui/joy/Typography";
import Grid from "@mui/joy/Grid";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CircularProgress from "@mui/joy/CircularProgress";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import Input from "@mui/joy/Input";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import Alert from "@mui/joy/Alert";
import IconButton from "@mui/joy/IconButton";

import {
  AccessTime,
  LocationOn,
  CalendarToday,
  Refresh,
  Search,
} from "@mui/icons-material";

import { useTranslation } from "../../../../components/languages/provider";
import countries from "i18n-iso-countries";
import countryDataEn from "i18n-iso-countries/langs/en.json";
import countryDataAr from "i18n-iso-countries/langs/ar.json";
import { toast } from "react-toastify";
import moment from "moment-hijri";

countries.registerLocale(countryDataEn);
countries.registerLocale(countryDataAr);

const days = {
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
};

const months = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  ar: [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
};

// All timings we want to show (API may include some of them)
const ALL_KEYS = [
  "Imsak",
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Sunset",
  "Maghrib",
  "Isha",
  "Midnight",
  "Firstthird",
  "Lastthird",
  // computed fallback:
  "LastThirdComputed",
];

const customLabels = {
  en: {
    Imsak: "Imsak",
    Sunrise: "Sunrise",
    Sunset: "Sunset",
    Midnight: "Midnight",
    Firstthird: "First Third of Night",
    Lastthird: "Last Third of Night",
    LastThirdComputed: "Last Third of Night",
  },
  ar: {
    Imsak: "الإمساك",
    Sunrise: "الشروق",
    Sunset: "الغروب",
    Midnight: "منتصف الليل",
    Firstthird: "ثلث الليل الأول",
    Lastthird: "ثلث الليل الأخير",
    LastThirdComputed: "ثلث الليل الأخير",
  },
};

function cleanHHMM(timeStr) {
  // "05:12 (AST)" -> "05:12"
  if (!timeStr) return null;
  return String(timeStr).split(" ")[0].trim();
}

function toMinutes(hhmm) {
  const t = cleanHHMM(hhmm);
  if (!t) return null;
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function minutesToTime(mins) {
  const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function secondsToHMS(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

const Times = () => {
  const { translations, language } = useTranslation();
  const isAr = language === "ar";

  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [hijriDate, setHijriDate] = useState("");
  const [todayDate, setTodayDate] = useState(null);
  const [isErrorFetching, setIsErrorFetching] = useState(false);

  const [manualCity, setManualCity] = useState("");
  const [manualCountry, setManualCountry] = useState("");

  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    fetchCurrentLocation();
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        isAr
          ? "حدث خطأ ما، سنقوم بإصلاحه قريبًا"
          : "Something happened, we'll fix it soon"
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching]);

  useEffect(() => {
    if (currentLocation) {
      fetchPrayerTimesByCity(currentLocation.city, currentLocation.country);
    }
    // eslint-disable-next-line
  }, [currentLocation]);

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchCurrentLocation = () => {
    setIsErrorFetching(false);
    setPrayerTimes(null);

    if (!navigator.geolocation) {
      setFallbackLocation();
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}`,
            { headers: { "Accept-Language": language } }
          );
          const geocodeData = await geocodeResponse.json();

          const city =
            geocodeData?.address?.city ||
            geocodeData?.address?.town ||
            geocodeData?.address?.village ||
            "";

          const country = geocodeData?.address?.country || "";

          if (city && country) {
            const countryCode = String(
              geocodeData?.address?.country_code || ""
            ).toUpperCase();
            const countryName =
              countries.getName(countryCode, language) || country;

            const location = { city, country: countryName, countryCode };
            setCurrentLocation(location);

            setManualCity(city);
            setManualCountry(countryName);
          } else {
            setFallbackLocation();
          }
        } catch (e) {
          setFallbackLocation();
          setIsErrorFetching(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setFallbackLocation();
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const setFallbackLocation = () => {
    const countryCode = "SA";
    const fallbackCity = isAr ? "مكة" : "Makkah";
    const countryName =
      countries.getName(countryCode, language) ||
      (isAr ? "السعودية" : "Saudi Arabia");

    const fallback = { city: fallbackCity, country: countryName, countryCode };
    setCurrentLocation(fallback);

    setManualCity(fallbackCity);
    setManualCountry(countryName);
  };

  const fetchPrayerTimesByCity = async (city, country) => {
    setLoading(true);
    setIsErrorFetching(false);
    setPrayerTimes(null);

    try {
      const today = new Date();

      const dayName = days[language][today.getDay()];
      const monthName = months[language][today.getMonth()];
      const year = today.getFullYear();
      setTodayDate(`${dayName}, ${today.getDate()} ${monthName} ${year}`);

      const formattedDate = today
        .toLocaleDateString("en-GB")
        .split("/")
        .reverse()
        .join("-");

      const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${encodeURIComponent(
        city
      )}&country=${encodeURIComponent(country)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data?.code === 200 && data?.data?.timings) {
        setPrayerTimes(data.data.timings);
        setHijriDate(moment().format("iYYYY/iM/iD"));
      } else {
        setIsErrorFetching(true);
      }
    } catch (e) {
      setIsErrorFetching(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    const city = manualCity.trim();
    const country = manualCountry.trim();

    if (!city || !country) {
      toast.error(isAr ? "اكتب المدينة والدولة" : "Enter city and country");
      return;
    }

    setCurrentLocation({
      city,
      country,
      countryCode: currentLocation?.countryCode || "",
    });
  };

  // Compute last third of night if missing:
  // Night = from Maghrib to Fajr (next day if needed).
  // Last third starts at Maghrib + 2/3 of night length.
  const computedTimes = useMemo(() => {
    if (!prayerTimes) return {};

    const fajrM = toMinutes(prayerTimes.Fajr);
    const maghribM = toMinutes(prayerTimes.Maghrib);

    if (fajrM == null || maghribM == null) return {};

    // if Fajr is "earlier" minutes than Maghrib => Fajr is next day
    let fajrNext = fajrM;
    if (fajrM <= maghribM) fajrNext = fajrM + 24 * 60;

    const nightLength = fajrNext - maghribM;
    const lastThirdStart = maghribM + Math.floor((2 * nightLength) / 3);

    return {
      LastThirdComputed: minutesToTime(lastThirdStart),
    };
  }, [prayerTimes]);

  const mergedTimings = useMemo(() => {
    if (!prayerTimes) return null;
    return { ...prayerTimes, ...computedTimes };
  }, [prayerTimes, computedTimes]);

  const normalizedList = useMemo(() => {
    if (!mergedTimings) return [];

    return ALL_KEYS.filter((key) => mergedTimings[key])
      .map((key) => {
        const label =
          translations?.[key] || customLabels?.[language]?.[key] || key;

        return {
          key,
          label,
          time: cleanHHMM(mergedTimings[key]),
          minutes: toMinutes(mergedTimings[key]),
        };
      })
      .filter((x) => x.time && x.minutes != null);
  }, [mergedTimings, translations, language]);

  // Next "event" (from all cards)
  const nextInfo = useMemo(() => {
    if (!normalizedList.length) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowSeconds = now.getSeconds();

    const todayCandidates = normalizedList
      .map((x) => ({ ...x }))
      .sort((a, b) => a.minutes - b.minutes);

    let next = todayCandidates.find((x) => x.minutes > nowMinutes);
    if (!next) next = todayCandidates[0];

    let diffMinutes = next.minutes - nowMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60;

    const remainingSeconds = diffMinutes * 60 - nowSeconds;

    return { ...next, remainingSeconds };
    // eslint-disable-next-line
  }, [normalizedList, tick]);

  // Loader logic: show loader while we don’t have location or while loading/fetching
  const shouldShowLoader =
    loading || !currentLocation || (!isErrorFetching && !mergedTimings);

  return (
    <div className={`times-page ${isAr ? "rtl" : ""}`}>
      <div className="times-hero">
        <div className="times-hero__content">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1.5}
          >
            <Typography
              level="h3"
              className="times-title"
              sx={{ color: "var(--text-color)" }}
            >
              {isAr ? "مواقيت الصلاة" : "Prayer Times"}
            </Typography>

            <Stack direction="row" gap={1} alignItems="center">
              <Chip
                variant="soft"
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                  border: "1px solid rgba(127,127,127,0.25)",
                  padding: "6px",
                }}
                startDecorator={<CalendarToday />}
              >
                {todayDate ? todayDate : "--/--/----"}
              </Chip>

              <IconButton
                variant="soft"
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                  border: "1px solid rgba(127,127,127,0.25)",
                }}
                onClick={() => {
                  if (currentLocation?.city && currentLocation?.country) {
                    fetchPrayerTimesByCity(
                      currentLocation.city,
                      currentLocation.country
                    );
                  } else {
                    fetchCurrentLocation();
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={1.2}
            sx={{ mt: 1.5 }}
            alignItems={{ md: "center" }}
          >
            <Chip
              variant="soft"
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                border: "1px solid rgba(127,127,127,0.25)",
                padding: "6px",
              }}
              startDecorator={<LocationOn />}
            >
              {currentLocation
                ? `${currentLocation.city}, ${currentLocation.country}`
                : isAr
                ? "جاري تحديد الموقع..."
                : "Detecting location..."}
            </Chip>

            <Chip
              variant="soft"
              sx={{
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                border: "1px solid rgba(127,127,127,0.25)",
                padding: "6px",
              }}
              startDecorator={<CalendarToday />}
            >
              {isAr ? "التاريخ الهجري" : "Hijri Date"}:{" "}
              {hijriDate || "--/--/----"}
            </Chip>

            {nextInfo && (
              <Chip
                variant="soft"
                sx={{
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                  border: "1px solid rgba(127,127,127,0.25)",
                  padding: "6px",
                }}
                startDecorator={<AccessTime />}
              >
                {isAr ? "القادم" : "Next"}: {nextInfo.label} —{" "}
                {secondsToHMS(nextInfo.remainingSeconds)}
              </Chip>
            )}
          </Stack>

          <Divider sx={{ my: 2, opacity: 0.25 }} />

          <Card
            variant="soft"
            className="search-card"
            sx={{
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              border: "1px solid rgba(127,127,127,0.25)",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                gap={1.2}
                alignItems={{ md: "center" }}
              >
                <Input
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder={isAr ? "المدينة" : "City"}
                  sx={{
                    flex: 1,
                    "--Input-focusedThickness": "2px",
                    backgroundColor: "var(--dropdown-bg-color)",
                  }}
                />
                <Input
                  value={manualCountry}
                  onChange={(e) => setManualCountry(e.target.value)}
                  placeholder={isAr ? "الدولة" : "Country"}
                  sx={{
                    flex: 1,
                    "--Input-focusedThickness": "2px",
                    backgroundColor: "var(--dropdown-bg-color)",
                  }}
                />
                <Button
                  onClick={handleManualSearch}
                  startDecorator={<Search />}
                  sx={{ minWidth: 160 }}
                >
                  {isAr ? "بحث" : "Search"}
                </Button>
              </Stack>

              <Typography level="body-sm" sx={{ mt: 1, opacity: 0.8 }}>
                {isAr
                  ? "ملاحظة: إذا لم يكن تحديد الموقع دقيقًا، يمكنك تعديل المدينة والدولة يدويًا."
                  : "Tip: If location is not accurate, you can override city and country."}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="times-body">
        {isErrorFetching && !loading && (
          <Alert variant="soft" color="danger" sx={{ mb: 2 }}>
            {isAr
              ? "تعذر جلب البيانات الآن. جرّب إعادة التحميل."
              : "Couldn't fetch data right now. Try refreshing."}
          </Alert>
        )}

        {shouldShowLoader ? (
          <div className="loader-manager">
            <CircularProgress />
            <Typography
              level="body-sm"
              sx={{ mt: 1, opacity: 0.8, color: "var(--text-color)" }}
            >
              {isAr ? "جاري تحميل المواقيت..." : "Loading timings..."}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={2.2}>
            {normalizedList.map((item) => {
              const isActive = nextInfo?.key === item.key;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.key}>
                  <Card
                    variant="outlined"
                    className={`time-card ${
                      isActive ? "time-card--active" : ""
                    }`}
                    sx={{
                      backgroundColor: !isActive
                        ? "var(--card-color)"
                        : "rgb(101 87 22 / 92%)",
                      color: isActive && "white",
                      border: isActive
                        ? "1px solid rgba(255, 152, 0, 0.55)"
                        : "1px solid rgba(127,127,127,0.25)",
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          <div
                            className={`time-icon ${
                              isActive ? "time-icon--active" : ""
                            }`}
                          >
                            <AccessTime fontSize="small" />
                          </div>
                          <Typography
                            level="title-lg"
                            fontWeight="lg"
                            className={
                              isActive ? "time-label--active" : "time-label"
                            }
                            sx={{
                              color: "var(--text-color)",
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Stack>

                        {isActive && (
                          <Chip
                            size="sm"
                            variant="soft"
                            sx={{
                              backgroundColor: "rgba(255,152,0,0.15)",
                              color: "white",
                              border: "1px solid rgba(255,152,0,0.35)",
                            }}
                          >
                            {isAr ? "القادم" : "Next"}
                          </Chip>
                        )}
                      </Stack>

                      <Typography
                        level="h2"
                        className="time-value"
                        sx={{ color: isActive ? "white" : "var(--text-color)" }}
                      >
                        {item.time}
                      </Typography>

                      {item.key === "LastThirdComputed" && (
                        <Typography level="body-sm" sx={{ opacity: 0.85 }}>
                          {isAr
                            ? "محسوبة من المغرب إلى الفجر"
                            : "Calculated from Maghrib to Fajr"}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
    </div>
  );
};

export default Times;
