import React from "react";
import ReactDOM from "react-dom/client";
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
  onUpdate: () => console.log("♻️ New version available, close tabs to update"),
});
