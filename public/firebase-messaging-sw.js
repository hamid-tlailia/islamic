// ✅ Load Firebase SDK for service workers
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// ✅ Initialize Firebase (replace with your own config)
firebase.initializeApp({
  apiKey: "AIzaSyB_RZPaSTSKyQFs53p1aAmj29qtsQhWGzw",
  authDomain: "islamic-app-90797.firebaseapp.com",
  projectId: "islamic-app-90797",
  storageBucket: "islamic-app-90797.appspot.com",
  messagingSenderId: "638328114408",
  appId: "1:638328114408:web:e19eb1f1abd71b67160d5d",
  measurementId: "G-2KV5EGH6D9",
});

// ✅ Initialize messaging
const messaging = firebase.messaging();

// ✅ Handle background push message
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  // If notification is already shown by Firebase, do nothing
  if (payload.notification) {
    // Let Firebase handle it automatically
    return;
  }

  // Manual fallback if it's a data-only message
  const notificationTitle = payload.data?.title;
  const notificationOptions = {
    body: payload.data?.body,
    icon: "./search.png",
    badge: "./search.png",
    data: {
      url: payload.data?.url || "https://myislam-steel.vercel.app",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ✅ Auto-update service worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
