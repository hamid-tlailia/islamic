/*
 * What is worth doing right now.
 *
 * The home page opened on a carousel of hadiths regardless of the hour, so a
 * reader arriving after Fajr and a reader arriving after Isha were shown the
 * same thing. These helpers turn the clock — and the day's prayer times, when
 * the reader has set a location — into one concrete suggestion and the wait
 * until the next prayer.
 *
 * They are pure functions over an explicit `now`, so every branch is testable
 * without waiting for the hour to come round.
 */

/** Where a resolved location is kept, so the home page can reuse it. */
export const LOCATION_KEY = "prayer-location";

/*
 * The five prayers, in the order they fall.
 *
 * Sunrise is deliberately absent: it marks the end of Fajr's window and the
 * start of the forenoon, but it is not a prayer, so counting down to it under
 * the heading "next prayer" states something false. It is still read from the
 * timings for the suggestion logic below.
 */
const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

/**
 * Format a date the way aladhan's path parameter expects it.
 *
 * The endpoint is /v1/timingsByCity/DD-MM-YYYY. Both callers were building
 * YYYY-MM-DD from `toLocaleDateString("en-GB")` reversed, which the API does
 * not read as the requested day — so the times came back for the wrong date.
 */
export function formatApiDate(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
}

/**
 * The prayer-times request for a saved location.
 *
 * Built in one place so the home card and the prayer-times page cannot drift
 * apart and show a reader two different answers for the same day.
 */
export function buildTimingsUrl({ city, country }, now = new Date()) {
  return (
    `https://api.aladhan.com/v1/timingsByCity/${formatApiDate(now)}` +
    `?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
  );
}

/**
 * Turn an aladhan "HH:MM" (sometimes "HH:MM (UTC)") into a Date on `now`'s
 * calendar day. Returns null for anything unparseable.
 */
export function parseTiming(value, now) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value || "").trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const at = new Date(now);
  at.setHours(hours, minutes, 0, 0);
  return at;
}

/**
 * The next prayer and how long until it.
 *
 * After Isha the next one is tomorrow's Fajr, so the remaining time rolls
 * over the midnight boundary rather than going negative.
 *
 * @returns {{name: string, at: Date, msRemaining: number}|null}
 */
export function nextPrayer(timings, now = new Date()) {
  if (!timings) return null;

  const scheduled = PRAYER_ORDER.map((name) => ({
    name,
    at: parseTiming(timings[name], now),
  })).filter((entry) => entry.at);

  if (!scheduled.length) return null;

  const upcoming = scheduled.find((entry) => entry.at > now);
  if (upcoming) {
    return { ...upcoming, msRemaining: upcoming.at - now };
  }

  // Past Isha: the next prayer is Fajr tomorrow.
  const fajr = scheduled.find((entry) => entry.name === "Fajr") || scheduled[0];
  const tomorrow = new Date(fajr.at);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { name: fajr.name, at: tomorrow, msRemaining: tomorrow - now };
}

/**
 * Format a duration as Arabic-agnostic "H:MM" / "MM:SS" for a countdown.
 * Under an hour it counts minutes and seconds, which reads as more urgent.
 */
export function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/*
 * The suggestions, in the order they are tested. Each names a page that
 * actually exists, so the card never offers something it cannot open.
 */
const SUGGESTIONS = {
  kahf: { id: "kahf", route: "/categories/quran" },
  morning: { id: "morning", route: "/categories/adhkar" },
  evening: { id: "evening", route: "/categories/adhkar" },
  night: { id: "night", route: "/categories/tasbih" },
  wird: { id: "wird", route: "/categories/quran" },
};

/**
 * Pick the one thing to suggest for this moment.
 *
 * With prayer times it uses them; without a saved location it falls back to
 * the clock, which is coarser but still better than showing the same card all
 * day. Friday between Fajr and Maghrib always wins, since Al-Kahf is read
 * across that whole window.
 *
 * @returns {{id: string, route: string}}
 */
export function pickSuggestion(timings, now = new Date()) {
  const isFriday = now.getDay() === 5;

  const fajr = parseTiming(timings?.Fajr, now);
  const sunrise = parseTiming(timings?.Sunrise, now);
  const asr = parseTiming(timings?.Asr, now);
  const maghrib = parseTiming(timings?.Maghrib, now);
  const isha = parseTiming(timings?.Isha, now);

  const haveTimings = fajr && sunrise && asr && maghrib && isha;

  if (haveTimings) {
    if (isFriday && now >= fajr && now < maghrib) return SUGGESTIONS.kahf;
    if (now >= fajr && now < sunrise) return SUGGESTIONS.morning;
    if (now >= asr && now < maghrib) return SUGGESTIONS.evening;
    if (now >= isha || now < fajr) return SUGGESTIONS.night;
    return SUGGESTIONS.wird;
  }

  // No location set: approximate from the hour.
  const hour = now.getHours();
  if (isFriday && hour >= 5 && hour < 18) return SUGGESTIONS.kahf;
  if (hour >= 4 && hour < 8) return SUGGESTIONS.morning;
  if (hour >= 16 && hour < 19) return SUGGESTIONS.evening;
  if (hour >= 20 || hour < 4) return SUGGESTIONS.night;
  return SUGGESTIONS.wird;
}

/** Read the location the prayer-times page saved, or null. */
export function readSavedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const location = JSON.parse(raw);
    return location?.city && location?.country ? location : null;
  } catch {
    return null;
  }
}

/** Remember a resolved location so the home page can reuse it. */
export function saveLocation(location) {
  try {
    if (location?.city && location?.country) {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    }
  } catch {
    /* storage unavailable; the card simply falls back to the clock */
  }
}
