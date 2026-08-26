const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  window.location.hostname === "[::1]" ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
  ),
);

/*
 * Earlier builds registered /firebase-messaging-sw.js at the root scope,
 * which displaced the Workbox worker and left the app with no offline cache.
 * That file is gone, but a browser that already registered it keeps the
 * registration until it is removed, so any install still carrying it is
 * healed here before the real worker is registered.
 */
async function removeStaleFirebaseWorker() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => {
          const url =
            registration.active?.scriptURL ||
            registration.waiting?.scriptURL ||
            registration.installing?.scriptURL ||
            "";
          return url.endsWith("/firebase-messaging-sw.js");
        })
        .map((registration) => registration.unregister()),
    );
  } catch {
    /* nothing we can do; the fresh registration below still applies */
  }
}

/*
 * Reload once when a new service worker takes control of this page.
 *
 * The worker calls skipWaiting() and clientsClaim(), so a new build activates
 * and claims open tabs straight away, and Workbox then drops the previous
 * build's precache. The page itself is still the old build, and every route in
 * this app is lazily imported — so the next navigation asks for a chunk
 * filename that no longer exists either in the cache or on the server. That
 * rejected import is what turns the app into a blank screen.
 *
 * Reloading at the moment control changes swaps the page over to the build its
 * worker is already serving. The guard matters: without it, a controller that
 * changes during startup reloads forever.
 */
function reloadOnControllerChange() {
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(
      process.env.PUBLIC_URL || "/",
      window.location.href,
    );
    if (publicUrl.origin !== window.location.origin) return;

    window.addEventListener("load", async () => {
      await removeStaleFirebaseWorker();
      reloadOnControllerChange();

      const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
      const swUrl = publicPath
        ? `${publicPath}/service-worker.js`
        : "/service-worker.js";

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log("✅ App is served cache-first by a service worker.");
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              console.log(
                "♻️ New content is available; it will be used after all tabs close.",
              );
              if (config && config.onUpdate) config.onUpdate(registration);
            } else {
              console.log("✅ Content is cached for offline use.");
              if (config && config.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("❌ Error during service worker registration:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type") || "";
      if (response.status === 404 || !contentType.includes("javascript")) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "📴 No internet connection found. App is running in offline mode.",
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error.message));
  }
}
