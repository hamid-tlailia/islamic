// notifications.js

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB_RZPaSTSKyQFs53p1aAmj29qtsQhWGzw",
  authDomain: "islamic-app-90797.firebaseapp.com",
  projectId: "islamic-app-90797",
  storageBucket: "islamic-app-90797.firebasestorage.app",
  messagingSenderId: "638328114408",
  appId: "1:638328114408:web:e19eb1f1abd71b67160d5d",
  measurementId: "G-2KV5EG6D9",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Your VAPID key from the Firebase console:
const VAPID_KEY =
  "BFYeYcvYDn_s4o0DRF1Htrp-WhyjZ6bHt_CKz0Md3x2C1TFiiBIQARhOL-9snvL4rZIZ-KktaSFnZ2ZB_Bl6KjY";

/**
 * Call this once (e.g. in a top-level useEffect).
 * It will:
 *  • Skip if already registered
 *  • Ask permission
 *  • Get FCM token
 *  • POST { token } to your /api/save-token
 *  • Store token in localStorage
 */
export async function registerDeviceToken() {
  // 1. Already registered?
  if (localStorage.getItem("deviceToken")) return;

  // 2. Ask permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    // 3. Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      console.warn("No FCM token retrieved.");
      return;
    }

    // 4. Send to backend (your endpoint will lookup geo by IP)
    const res = await fetch(
      "https://islamic-notifs-backend.onrender.com/api/save-token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );
    const json = await res.json();
    console.log("save-token response:", json);

    // 5. Store locally
    localStorage.setItem("deviceToken", token);
  } catch (err) {
    console.error("FCM registration failed:", err);
  }
}
