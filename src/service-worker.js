/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

import favIcon from "./pages/images/quran.png";

// استيلاء سريع على النوافذ المفتوحة
clientsClaim();

// تحمّل كل أصول البنية الأساسية
precacheAndRoute(self.__WB_MANIFEST);

// App Shell routing
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(({ request, url }) => {
  if (request.mode !== "navigate") return false;
  if (url.pathname.startsWith("/_")) return false;
  if (url.pathname.match(fileExtensionRegexp)) return false;
  return true;
}, createHandlerBoundToURL("/index.html"));

// كاش للصور مثلاً
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin && url.pathname.endsWith(".png"),
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

// استجابة لأوامر الانتظار
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// التعامل مع push
self.addEventListener("push", (event) => {
  const payload = event.data
    ? event.data.text()
    : "You have a new notification";
  const options = {
    body: payload,
    icon: favIcon,
    // يمكن إضافة actions إلخ
  };
  event.waitUntil(self.registration.showNotification(" ", options));
});

// التعامل مع النقر على الإشعار
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
