import React, { useEffect, useState } from "react";
import "./times.css";
import Typography from "@mui/joy/Typography";
import Grid from "@mui/joy/Grid";
import Card from "@mui/joy/Card";
import CircularProgress from "@mui/joy/CircularProgress";
import { AccessTime, LocationOn, CalendarToday } from "@mui/icons-material";
import { useTranslation } from "../../../../components/languages/provider";
import countries from "i18n-iso-countries";
import countryDataEn from "i18n-iso-countries/langs/en.json";
import countryDataAr from "i18n-iso-countries/langs/ar.json";
import { toast } from "react-toastify";
import moment from "moment-hijri"; // Import moment-hijri for Hijri dates

countries.registerLocale(countryDataEn);
countries.registerLocale(countryDataAr);

// Define days in both English and Arabic
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

const Times = () => {
  const { translations, language } = useTranslation();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hijriDate, setHijriDate] = useState("");
  const [todayDate, setTodayDate] = useState(null);
  const [isErrorFetching, setIsErrorFetching] = useState(false);

  // Fetch current location when the component mounts
  useEffect(() => {
    fetchCurrentLocation();
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "حدث خطأ ما، سنقوم بإصلاحه قريبًا"
          : "Something happened, we'll fix it soon"
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching]);

  // Fetch prayer times whenever currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      fetchPrayerTimesByCity(currentLocation.city, currentLocation.country);
    }
    // eslint-disable-next-line
  }, [currentLocation]);

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}`
            );
            const geocodeData = await geocodeResponse.json();

            const city =
              geocodeData.address.city ||
              geocodeData.address.town ||
              geocodeData.address.village ||
              "";
            const country = geocodeData.address.country || "";

            if (city && country) {
              const countryCode =
                geocodeData.address.country_code.toUpperCase();
              const countryName = countries.getName(countryCode, language);
              const location = { city, country: countryName, countryCode };
              setCurrentLocation(location);
            } else {
              setFallbackLocation();
            }
          } catch (error) {
            setFallbackLocation();
            setIsErrorFetching(true);
          }
        },
        (error) => {
          setFallbackLocation();
        }
      );
    } else {
      setFallbackLocation();
    }
  };

  const setFallbackLocation = () => {
    const countryCode = "SA"; // Saudi Arabia
    const fallbackCity = language === "ar" ? "مكة" : "Makkah";
    const countryName = countries.getName(countryCode, language);
    const fallback = { city: fallbackCity, country: countryName, countryCode };
    setCurrentLocation(fallback);
  };

  const fetchPrayerTimesByCity = async (city, country) => {
    setLoading(true); // Show loader while fetching data
    try {
      const today = new Date();

      // Get day name, month name, and year based on language
      const dayName = days[language][today.getDay()];
      const monthName = months[language][today.getMonth()];
      const year = today.getFullYear();

      // Format the Gregorian date based on the language
      const formattedTodayDate = `${dayName}, ${today.getDate()} ${monthName} ${year}`;
      setTodayDate(formattedTodayDate);

      // Fetch prayer times and hijri date
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
      if (data && data.code === 200 && data.data && data.data.timings) {
        setPrayerTimes(data.data.timings);
        const hijri = moment().format("iYYYY/iM/iD");
        setHijriDate(hijri);
      } else {
        setPrayerTimes(null);
      }
    } catch (error) {
      setPrayerTimes(null);
      setIsErrorFetching(true);
    }
    setLoading(false); // Hide loader after fetching
  };

  return (
    <div className="container-fluid text-center position-relative py-4 times-container">
      <Typography level="h4" sx={{ mb: 2, color: "crimson" }}>
        {language === "ar" ? "مواقيت الصلاة اليوم :" : "Today's Prayer Times:"}{" "}
        {todayDate ? todayDate : "--/--/----"}
      </Typography>
      {currentLocation && (
        <Typography
          level="h5"
          sx={{ mb: 2, color: "green", textAlign: "center", width: "100%" }}
          className="text-center"
        >
          <LocationOn /> {currentLocation.city}, {currentLocation.country}
        </Typography>
      )}

      {loading ? (
        <div className="w-100 text-center loader-manager">
          <CircularProgress />
        </div>
      ) : prayerTimes ? (
        <div className="times">
          <div className="d-flex flex-column flex-lg-row flex-md-row justify-content-center align-items-center gap-2 mb-4">
            <Typography
              className="badge border border-secondary text-secondary text-center"
              level="h6"
              sx={{ mt: 2, px: 3, py: 1 }}
            >
              <CalendarToday />{" "}
              {language === "ar" ? "التاريخ الهجري" : "Hijri Date"}: {hijriDate}
            </Typography>
          </div>

          <Grid
            container
            spacing={4}
            sx={{
              mt: 2,
              px: { xs: 2, md: 4 },
            }}
            className="times-grid"
          >
            {Object.entries(prayerTimes).map(([key, time]) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 3,
                    textAlign: "center",
                    backgroundColor: "var(--card-color)",
                    color: "var(--text-color)",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    borderRadius: "10px",
                  }}
                  className="times"
                >
                  <div style={{ marginBottom: "10px" }}>
                    <AccessTime
                      style={{ color: "#ff9800", fontSize: "2rem" }}
                    />
                  </div>
                  <Typography level="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                    {translations[key]}
                  </Typography>
                  <Typography level="h6" sx={{ color: "#555" }}>
                    {time}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      ) : (
        <Typography
          sx={{ mt: 4, textAlign: "center", width: "100%" }}
          className="text-center"
        >
          {language === "ar"
            ? "جاري تحميل مواقيت الصلاة..."
            : "Loading prayer times..."}
        </Typography>
      )}
    </div>
  );
};

export default Times;
