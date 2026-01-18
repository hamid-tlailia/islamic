// firebase-messaging-sw.js

// ✅ Load Firebase SDK for service workers (compat)
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// ✅ Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCNYvDi7lQdSmnmnwiQX4fHkWSRJZYxS0A",
  authDomain: "my-islam-9c165.firebaseapp.com",
  projectId: "my-islam-9c165",
  storageBucket: "my-islam-9c165.firebasestorage.app",
  messagingSenderId: "201721918025",
  appId: "1:201721918025:web:6126bde4f558e1f8624598",
});

const messaging = firebase.messaging();

// ✅ Always handle background messages yourself (more reliable)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  // Title/body from either notification or data payload
  const title =
    payload?.notification?.title || payload?.data?.title || "🕌 Prayer Time";

  const body = payload?.notification?.body || payload?.data?.body || "";

  const url =
    payload?.data?.url ||
    payload?.fcmOptions?.link ||
    "https://myislam-steel.vercel.app";

  const options = {
    body,
    icon: "/search.png",
    badge: "/search.png",
    data: { url }, // ✅ always available for click
  };

  self.registration.showNotification(title, options);
});

// ✅ Handle notification click (robust for FCM)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Most reliable: our own stored data.url
  let urlToOpen = event.notification?.data?.url;

  // Fallbacks for some FCM formats
  if (!urlToOpen) {
    urlToOpen =
      event.notification?.data?.FCM_MSG?.data?.url ||
      event.notification?.data?.FCM_MSG?.notification?.click_action;
  }

  if (!urlToOpen) {
    urlToOpen = "https://myislam-steel.vercel.app";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url === urlToOpen && "focus" in client)
            return client.focus();
        }
        return clients.openWindow(urlToOpen);
      }),
  );
});

// ✅ Auto-update SW
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
