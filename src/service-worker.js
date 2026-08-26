/* eslint-disable no-restricted-globals */

// --------------------
// ✅ CRA / Workbox Offline
// --------------------
import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
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

/*
 * The reference APIs the pages read from.
 *
 * Precaching covers the app's own code and data, but the mushaf, the hadith
 * collections and the article trees all live on other origins — so without
 * this, opening the Quran page with no connection showed an empty list. They
 * are served from cache and refreshed in the background, which also makes a
 * repeat visit instant.
 */
const REFERENCE_API_HOSTS = [
  "api.alquran.cloud",
  "api.quran.com",
  "api.qurancdn.com",
  "hadeethenc.com",
  "hadithapi.com",
  "api3.islamhouse.com",
  "api.quran-tafseer.com",
];

registerRoute(
  ({ url, request }) =>
    request.method === "GET" && REFERENCE_API_HOSTS.includes(url.hostname),
  new StaleWhileRevalidate({
    cacheName: "islamic-reference-api",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 400,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

/*
 * Prayer times and the reciter catalogue change, so the network wins when it
 * is there; the cached copy is the fallback rather than the default —
 * yesterday's timings still beat an error.
 */
registerRoute(
  ({ url, request }) =>
    request.method === "GET" &&
    (url.hostname === "api.aladhan.com" ||
      url.hostname.endsWith("mp3quran.net") ||
      url.hostname === "nominatim.openstreetmap.org"),
  new NetworkFirst({
    cacheName: "islamic-live-api",
    networkTimeoutSeconds: 6,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 7 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
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

const SITE = "https://myislam-steel.vercel.app";

/*
 * How the notification is drawn.
 *
 * The backend sends data-only messages, so nothing appears unless this handler
 * calls showNotification — which means every visual choice is made here.
 *
 * `badge` is the one that matters most. Android masks it to a flat silhouette
 * by its alpha channel and draws it in the status bar; it used to be handed the
 * full-colour icon, which masks down to an unreadable smear, so the launcher
 * showed its generic bell instead. It now gets a purpose-drawn crescent.
 */
onBackgroundMessage(messaging, (payload) => {
  const d = payload?.data || {};

  const title = d.title || "🕌 دين الله";
  const lang = d.lang === "en" ? "en" : "ar";
  const url = d.url || `${SITE}/categories/times`;

  self.registration.showNotification(title, {
    body: d.body || "",
    icon: d.icon || `${SITE}/search.png`,
    badge: d.badge || `${SITE}/notification-badge.png`,

    /*
     * Without an explicit direction the renderer applies bidi to the whole
     * line, so "⏰ 19:29 — بعد 5 دقائق • 📍 Al Wukair" came out reordered
     * around its Latin city name and digits. Stating the direction keeps the
     * line reading the way it was written.
     */
    lang,
    dir: d.dir || (lang === "ar" ? "rtl" : "ltr"),

    /*
     * One prayer alert at a time. `tag` replaces the previous notification
     * rather than stacking a fifth one on the shade by evening; `renotify`
     * keeps the replacement audible instead of swapping it in silently.
     */
    tag: d.tag || "prayer",
    renotify: true,

    // A prayer reminder that vanishes after twenty seconds has not reminded
    // anyone. It stays until it is dismissed.
    requireInteraction: true,
    vibrate: [180, 90, 180],

    actions: lang === "ar"
      ? [
          { action: "times", title: "🕌 الأوقات" },
          { action: "adhkar", title: "📿 الأذكار" },
        ]
      : [
          { action: "times", title: "🕌 Prayer times" },
          { action: "adhkar", title: "📿 Adhkar" },
        ],

    data: { url, adhkar: `${SITE}/categories/adhkar` },
  });
});

// ✅ Click open URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  const urlToOpen =
    event.action === "adhkar"
      ? data.adhkar || `${SITE}/categories/adhkar`
      : data.url || `${SITE}/categories/times`;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((arr) => {
        // Reuse a tab already on the target rather than opening a duplicate.
        for (const client of arr) {
          if (client.url === urlToOpen && "focus" in client) return client.focus();
        }
        return self.clients.openWindow(urlToOpen);
      }),
  );
});
