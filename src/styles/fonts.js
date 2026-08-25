/*
 * Fonts are self-hosted (bundled) instead of pulled from the Google Fonts CDN:
 * the PWA then renders correctly offline and drops a render-blocking request.
 *
 * Only Cairo — the default UI font — is loaded eagerly. The optional font
 * themes from the settings panel are fetched on demand by `loadFontTheme`,
 * so a reader who never opens the panel never pays for them.
 */
import "@fontsource/cairo/arabic-400.css";
import "@fontsource/cairo/arabic-600.css";
import "@fontsource/cairo/arabic-700.css";
import "@fontsource/cairo/latin-400.css";
import "@fontsource/cairo/latin-600.css";
import "@fontsource/cairo/latin-700.css";

// Each entry maps a `font-*` body class to the chunk that defines its family.
const FONT_THEMES = {
  "font-default": null, // Cairo, already loaded above
  "font-amiri": () =>
    Promise.all([
      import("@fontsource/amiri/arabic-400.css"),
      import("@fontsource/amiri/arabic-700.css"),
    ]),
  "font-uthmanic": () => import("@fontsource/amiri-quran/arabic-400.css"),
  "font-noto-arabic": () =>
    Promise.all([
      import("@fontsource/noto-naskh-arabic/arabic-400.css"),
      import("@fontsource/noto-naskh-arabic/arabic-700.css"),
    ]),
  "font-scheherazade": () =>
    import("@fontsource/scheherazade-new/arabic-400.css"),
  "font-lateef": () => import("@fontsource/lateef/arabic-400.css"),
  "font-modern": () =>
    Promise.all([
      import("@fontsource/ibm-plex-sans-arabic/arabic-400.css"),
      import("@fontsource/ibm-plex-sans-arabic/arabic-600.css"),
    ]),
  "font-roboto": () =>
    Promise.all([
      import("@fontsource/roboto/latin-400.css"),
      import("@fontsource/roboto/latin-700.css"),
    ]),
  // Arial, Times, Georgia, Calibri and Tahoma ship with the operating system.
  "font-arial": null,
  "font-times": null,
  "font-georgia": null,
  "font-calibri": null,
  "font-tahoma": null,
};

const loaded = new Set();

/**
 * Load the webfont behind a `font-*` body class. Safe to call repeatedly and
 * with an unknown class; a failed chunk leaves the CSS fallback in place.
 */
export function loadFontTheme(themeClass) {
  const load = FONT_THEMES[themeClass];
  if (!load || loaded.has(themeClass)) return Promise.resolve();
  loaded.add(themeClass);
  return Promise.resolve(load()).catch(() => {
    loaded.delete(themeClass);
  });
}

export const FONT_THEME_CLASSES = Object.keys(FONT_THEMES);
