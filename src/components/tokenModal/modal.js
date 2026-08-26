import { getJSON, TTL } from "../../lib/apiClient";
import { methodForCountry, schoolForCountry } from "../../lib/calcMethod";
import { browserTimeZone } from "../../lib/prayerContext";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCNYvDi7lQdSmnmnwiQX4fHkWSRJZYxS0A",
  authDomain: "my-islam-9c165.firebaseapp.com",
  projectId: "my-islam-9c165",
  storageBucket: "my-islam-9c165.firebasestorage.app",
  messagingSenderId: "201721918025",
  appId: "1:201721918025:web:6126bde4f558e1f8624598",
};

const VAPID_KEY =
  "BMIkZIuU4vOSNanHXz100XatwSraU421Jh5Z8AlD07Js8OFJghIjmDjgVn4Xxk856zQEDM5zWCiVU5IQRs7XiCQ";

/*
 * The notifications backend moved off Render — which stopped the service — to
 * a Cloudflare Worker. Set REACT_APP_NOTIFS_API to the deployed Worker's
 * origin (no trailing slash); the fallback below is only there so a checkout
 * without the variable still builds.
 */
const NOTIFS_API =
  process.env.REACT_APP_NOTIFS_API ||
  "https://islamic-notifs-backend.workers.dev";

const BACKEND_URL = `${NOTIFS_API.replace(/\/+$/, "")}/api/save-token`;

const LS_TOKEN = "deviceToken";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/* -------------------- Helpers -------------------- */
function getCoords(options = { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: Number(pos.coords.latitude),
          longitude: Number(pos.coords.longitude),
          accuracy: Number(pos.coords.accuracy || 0),
        }),
      () => resolve(null),
      options,
    );
  });
}

/**
 * Optional reverse geocode for nicer city/country display.
 * If you don’t want any extra request, you can delete this function + calls.
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const j = await getJSON(url, {
      headers: { Accept: "application/json" },
      ttl: TTL.IMMUTABLE,
    });
    const a = j?.address || {};
    return {
      city: a.city || a.town || a.village || a.suburb || "",
      country: a.country_code ? a.country_code.toUpperCase() : "",
    };
  } catch {
    return { city: "", country: "" };
  }
}

/* -------------------- Main -------------------- */
export async function registerDeviceToken() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  if (!("serviceWorker" in navigator)) return;

  try {
    /*
     * Messaging attaches to the app's own service worker.
     *
     * This used to register /firebase-messaging-sw.js, which claims the same
     * root scope as the Workbox worker and therefore replaced it — and that
     * file has no fetch handler, so the app stopped working offline entirely
     * the moment notifications were allowed. The Workbox worker already
     * initialises messaging and handles onBackgroundMessage, so it does both
     * jobs and there is nothing to register here.
     *
     * A registration must always be passed: given none, Firebase goes looking
     * for /firebase-messaging-sw.js and registers it itself, which is the
     * behaviour being avoided. So when no worker is active — in development,
     * where CRA registers none — the token is simply skipped.
     */
    const swReg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
    if (!swReg) return;

    // Token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    const oldToken = localStorage.getItem(LS_TOKEN) || "";
    const timezone = browserTimeZone() || "UTC";

    // Coordinates (precise)
    const coords = await getCoords();

    // Optional place details
    let place = { city: "", country: "" };
    if (coords?.latitude && coords?.longitude) {
      place = await reverseGeocode(coords.latitude, coords.longitude);
    }

    // Send to backend
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        oldToken: oldToken && oldToken !== token ? oldToken : undefined,

        // ✅ new: timezone + coords (main accuracy upgrade)
        timezone,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        accuracy: coords?.accuracy,

        // optional: helps display / fallback
        city: place.city || undefined,
        country: place.country || undefined,

        /*
         * The same convention the prayer-times page renders with. Without it
         * the backend falls back to its own guess, and a notification can
         * announce a minute the screen never showed.
         */
        method: place.country ? methodForCountry(place.country) : undefined,
        school: place.country ? schoolForCountry(place.country) : undefined,
      }),
    });

    const data = await res.json().catch(() => null);

    // store latest token locally (for change detection only)
    localStorage.setItem(LS_TOKEN, token);

    console.log("[FCM] sent token:", token.slice(0, 25) + "...");
    if (data) console.log("[FCM] backend:", data);
  } catch (err) {
    console.error("FCM registerDeviceToken failed:", err);
  }
}
