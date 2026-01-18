// notifications.js
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

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY =
  "BMIkZIuU4vOSNanHXz100XatwSraU421Jh5Z8AlD07Js8OFJghIjmDjgVn4Xxk856zQEDM5zWCiVU5IQRs7XiCQ";

export async function registerDeviceToken() {
  // Already registered?
  if (localStorage.getItem("deviceToken")) return;
 console.trace("[FCM] registerDeviceToken CALLED"); // ✅ important
  // Ask permission (must be called from a click)
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    // Ensure SW for background messages (recommended)
    let swReg;
    if ("serviceWorker" in navigator) {
      swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      await navigator.serviceWorker.ready;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    const res = await fetch(
      "https://islamic-notifs-backend.onrender.com/api/save-token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      },
    );

    // optional: handle server response
    await res.json().catch(() => null);
    localStorage.setItem("deviceToken", token);
  } catch (err) {
    console.error("FCM registration failed:", err);
  }
}
