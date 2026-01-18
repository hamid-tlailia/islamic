// notifications.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, deleteToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCNYvDi7lQdSmnmnwiQX4fHkWSRJZYxS0A",
  authDomain: "my-islam-9c165.firebaseapp.com",
  projectId: "my-islam-9c165",
  storageBucket: "my-islam-9c165.firebasestorage.app",
  messagingSenderId: "201721918025",
  appId: "1:201721918025:web:6126bde4f558e1f8624598",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY =
  "BMIkZIuU4vOSNanHXz100XatwSraU421Jh5Z8AlD07Js8OFJghIjmDjgVn4Xxk856zQEDM5zWCiVU5IQRs7XiCQ";

// ⏱️ 5 days
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

// localStorage keys
const LS_TOKEN = "deviceToken";
const LS_SAVED_AT = "deviceTokenSavedAt";
const LS_RESET_ONCE = "fcmResetOnceDone";

export async function registerDeviceToken() {
  console.trace("[FCM] registerDeviceToken CALLED");

  // Ask permission (must be called from a click)
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    // Ensure SW for background messages (KEEP YOUR LOGIC)
    let swReg;
    if ("serviceWorker" in navigator) {
      swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      await navigator.serviceWorker.ready;
    }

    /* ------------------------------------------------------------------
       ✅ ADD 1: one-time delete if token already exists (ONLY ONCE EVER)
    ------------------------------------------------------------------ */
    const hasToken = !!localStorage.getItem(LS_TOKEN);
    const resetOnceDone = localStorage.getItem(LS_RESET_ONCE) === "1";

    if (hasToken && !resetOnceDone) {
      console.log("[FCM] One-time reset: deleting old token");
      try {
        await deleteToken(messaging);
      } catch (_) {}

      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_SAVED_AT);
      localStorage.setItem(LS_RESET_ONCE, "1");
    }

    /* ------------------------------------------------------------------
       ✅ ADD 2: renew token every 5 days
    ------------------------------------------------------------------ */
    const savedAt = Number(localStorage.getItem(LS_SAVED_AT) || "0");
    const tooOld = !savedAt || Date.now() - savedAt > FIVE_DAYS_MS;

    if (tooOld) {
      console.log("[FCM] Token too old -> rotating...");
      try {
        await deleteToken(messaging);
      } catch (_) {}

      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_SAVED_AT);
    }

    /* ------------------------------------------------------------------
       ORIGINAL LOGIC (UNCHANGED)
    ------------------------------------------------------------------ */
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    // Save to backend ONLY if new
    const oldToken = localStorage.getItem(LS_TOKEN);
    if (!oldToken || oldToken !== token) {
      const res = await fetch("https://islamic-notifs-backend.onrender.com/api/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      await res.json().catch(() => null);

      localStorage.setItem(LS_TOKEN, token);
      localStorage.setItem(LS_SAVED_AT, String(Date.now()));

      console.log("[FCM] Token saved:", token.slice(0, 25) + "...");
    } else {
      console.log("[FCM] Same token, not re-saving");
    }
  } catch (err) {
    console.error("FCM registration failed:", err);
  }
}
