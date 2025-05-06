importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB_RZPaSTSKyQFs53p1aAmj29qtsQhWGzw",
  authDomain: "islamic-app-90797.firebaseapp.com",
  projectId: "islamic-app-90797",
  storageBucket: "islamic-app-90797.firebasestorage.app",
  messagingSenderId: "638328114408",
  appId: "1:638328114408:web:e19eb1f1abd71b67160d5d",
  measurementId: "G-2KV5EGH6D9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./search.png", // Replace with your Islamic app icon
    badge: "./search.png", // Optional badge icon
    priority: "high",
    data: {
      url: payload?.data?.url || "https://myislam-steel.vercel.app", // fallback URL
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
});
