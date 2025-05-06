// src/serviceWorkerRegistration.js

// NOTE: this file lives in your src/ folder, *not* in public/
// It registers /service-worker.js at the root of your domain.

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 IPv4 localhost.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // Derive the public URL (same origin check)
    const publicUrl = new URL(
      process.env.PUBLIC_URL || "/",
      window.location.href
    );
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URL is on a different origin; skip SW.
      return;
    }

    window.addEventListener("load", () => {
      // Build a normalized path to /service-worker.js at your site root
      const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
      const swUrl = publicPath
        ? `${publicPath}/service-worker.js`
        : "/service-worker.js";

      if (isLocalhost) {
        // On localhost, check if SW exists & valid
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service worker."
          );
        });
      } else {
        // In production, just register
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
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) {
              console.log(
                "New content is available and will be used when all tabs are closed."
              );
              if (config && config.onUpdate) config.onUpdate(registration);
            } else {
              console.log("Content is cached for offline use.");
              if (config && config.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Fetch SW script to make sure it's there and is JS, not an HTML redirect
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type") || "";
      if (response.status === 404 || !contentType.includes("javascript")) {
        // No SW found or served HTML; unregister & reload.
        navigator.serviceWorker.ready.then((reg) => {
          reg.unregister().then(() => window.location.reload());
        });
      } else {
        // SW script is valid; proceed.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.unregister())
      .catch((err) => console.error(err.message));
  }
}
