import { getJSON, TTL } from "../../lib/apiClient";
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

const BACKEND_URL =
  "https://islamic-notifs-backend.onrender.com/api/save-token";

const LS_TOKEN = "deviceToken";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/* -------------------- Helpers -------------------- */
function getBrowserTZ() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

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

  try {
    // Service worker
    let swReg;
    if ("serviceWorker" in navigator) {
      swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      await navigator.serviceWorker.ready;
    }

    // Token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    const oldToken = localStorage.getItem(LS_TOKEN) || "";
    const timezone = getBrowserTZ();

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
