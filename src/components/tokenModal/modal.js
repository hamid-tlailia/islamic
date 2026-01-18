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

export async function registerDeviceToken() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    // ⚠️ IMPORTANT:
    // If you still use /firebase-messaging-sw.js keep this.
    // If you merged into CRA Workbox SW, use: const swReg = await navigator.serviceWorker.ready;
    let swReg;
    if ("serviceWorker" in navigator) {
      swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      await navigator.serviceWorker.ready;
    }

    // ✅ Firebase will return existing token OR generate a new one if needed
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    const oldToken = localStorage.getItem(LS_TOKEN) || "";

    // ✅ ALWAYS send token to backend (backend decides save/ignore)
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        oldToken: oldToken && oldToken !== token ? oldToken : undefined,
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
