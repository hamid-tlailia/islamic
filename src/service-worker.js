/* eslint-disable no-restricted-globals */

// --------------------
// ✅ CRA / Workbox Offline
// --------------------
import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

clientsClaim();
self.skipWaiting();

// Precache everything built by CRA (JS/CSS/assets)
precacheAndRoute(self.__WB_MANIFEST);

/*
 * The large tafsir files are served from /APIs/ rather than bundled, so they
 * are not in the precache manifest. Cache them the first time they are read
 * and serve them from the cache afterwards, which is what keeps the Quran
 * page usable offline.
 */
registerRoute(
  ({ url }) => url.pathname.startsWith(process.env.PUBLIC_URL + "/APIs/"),
  new StaleWhileRevalidate({
    cacheName: "islamic-json-data",
    plugins: [new ExpirationPlugin({ maxEntries: 16 })],
  }),
);

// SPA navigation fallback (so /categories/times works offline)
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/_")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html"),
);

// --------------------
// ✅ Firebase Messaging (FCM) Background Push
// --------------------
initializeApp({
  apiKey: "AIzaSyCNYvDi7lQdSmnmnwiQX4fHkWSRJZYxS0A",
  authDomain: "my-islam-9c165.firebaseapp.com",
  projectId: "my-islam-9c165",
  storageBucket: "my-islam-9c165.firebasestorage.app",
  messagingSenderId: "201721918025",
  appId: "1:201721918025:web:6126bde4f558e1f8624598",
});

const messaging = getMessaging();

// ✅ This assumes you send DATA-ONLY from backend (recommended)
onBackgroundMessage(messaging, (payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload?.data?.title || "🕌 Prayer Time";
  const body = payload?.data?.body || "";

  const url =
    payload?.data?.url || "https://myislam-steel.vercel.app/categories/times";

  const icon =
    payload?.data?.icon || "https://myislam-steel.vercel.app/search.png";

  const badge =
    payload?.data?.badge || "https://myislam-steel.vercel.app/search.png";

  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    data: { url },
  });
});

// ✅ Click open URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen =
    event.notification?.data?.url ||
    "https://myislam-steel.vercel.app/categories/times";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((arr) => {
        for (const client of arr) {
          if (client.url === urlToOpen && "focus" in client)
            return client.focus();
        }
        return self.clients.openWindow(urlToOpen);
      }),
  );
});
