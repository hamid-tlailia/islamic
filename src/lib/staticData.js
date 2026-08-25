/*
 * Loaders for the large JSON files served from `public/APIs/`.
 *
 * These used to be `import`ed directly into the Quran page, which welded
 * ~5.9 MB of tafsir into its JavaScript chunk (1.6 MB gzipped) and made the
 * page unusable on a slow connection. Fetching them instead keeps the chunk
 * small, lets the browser cache them separately from the app code, and lets
 * the service worker keep them offline once they have been read.
 *
 * Each loader memoises its promise, so several components asking at once
 * share a single request.
 */
const base = process.env.PUBLIC_URL || "";
const cache = new Map();

function loadJSON(path) {
  if (!cache.has(path)) {
    const request = fetch(`${base}${path}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        // Drop the rejected promise so a later attempt can retry.
        cache.delete(path);
        throw error;
      });
    cache.set(path, request);
  }
  return cache.get(path);
}

/** Arabic tafsir, shaped `{ Surahs: [{ number, ayahs: [...] }] }`. */
export const loadArabicTafsir = () => loadJSON("/APIs/quran-tafsir-ar.json");

/** English Jalalayn tafsir, an array indexed by surah number minus one. */
export const loadEnglishTafsir = () => loadJSON("/APIs/en-al-jalalayn.json");
