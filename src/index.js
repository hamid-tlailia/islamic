import React from "react";
import ReactDOM from "react-dom/client";
/*
 * Bootstrap and the fonts are imported before App so that App.css — pulled in
 * by App itself — still wins the cascade, exactly as it did when both came
 * from <link> tags in index.html.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/fonts";
import "./styles/primitives.css";
import "./styles/sheets.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ✅ ONLY ONE SW: CRA/Workbox service-worker.js
serviceWorkerRegistration.register({
  onSuccess: () => console.log("✅ SW registered (offline ready)"),
  /*
   * The new worker calls skipWaiting(), so it activates on its own and the
   * controllerchange handler in serviceWorkerRegistration reloads the page
   * onto the build being served. Nothing to prompt the reader about.
   */
  onUpdate: () => console.log("♻️ New version installed; reloading."),
});
