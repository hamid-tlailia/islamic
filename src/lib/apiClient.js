/*
 * One place for every outbound request.
 *
 * The pages each grew their own `fetch` + `.json()` + try/catch, so nothing
 * was cached, a dropped connection failed outright instead of retrying, and a
 * reader who left a page mid-load still paid for the response and got a
 * setState on an unmounted component for it.
 *
 * This client adds the four things every one of those call sites wanted:
 *
 *   caching      — a response is reused for `ttl` ms, in memory and (for
 *                  anything worth surviving a reload) in sessionStorage
 *   deduplication— two components asking for the same URL at once share one
 *                  request rather than racing
 *   retry        — network errors and 5xx are retried with a growing delay,
 *                  which is what a phone switching cells actually needs
 *   abort        — an AbortSignal cancels the wait, and the caller can tell
 *                  an abort apart from a failure
 */

/** Thrown for any non-2xx response; carries the status for the caller. */
export class ApiError extends Error {
  constructor(message, { status = 0, url = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

/** How long a response stays fresh when the caller does not say. */
const DEFAULT_TTL = 5 * 60 * 1000;

/*
 * Named lifetimes, so a call site says what kind of data it is asking for
 * rather than guessing a number.
 *
 *   IMMUTABLE — scripture and reference data that will not change
 *   LONG      — catalogues that change rarely (reciter lists, book indexes)
 *   SHORT     — anything tied to today (prayer times)
 *   NONE      — always refetch
 */
export const TTL = {
  IMMUTABLE: 24 * 60 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  SHORT: 5 * 60 * 1000,
  NONE: 0,
};

const memory = new Map(); // url -> { expires, value }
const inFlight = new Map(); // url -> Promise

const STORE_PREFIX = "api-cache:";

function readStored(key) {
  try {
    const raw = sessionStorage.getItem(STORE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || entry.expires < Date.now()) {
      sessionStorage.removeItem(STORE_PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    // Private mode, a full quota, or a corrupt entry — treat as a miss.
    return null;
  }
}

function writeStored(key, entry) {
  try {
    sessionStorage.setItem(STORE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /*
     * Storage is full or unavailable. The in-memory cache still holds the
     * value for this session, so this is not worth surfacing.
     */
  }
}

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

/*
 * A 4xx means the request itself was wrong, so repeating it changes nothing.
 * Only transport failures and server-side errors are worth another attempt.
 */
const isRetryable = (error) =>
  !(error instanceof ApiError) || error.status === 0 || error.status >= 500;

/**
 * Fetch a URL and parse it as JSON.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]  cancels the request and any retry wait
 * @param {number} [options.ttl]          how long to reuse the response, in ms
 * @param {number} [options.retries]      extra attempts after the first
 * @param {object} [options.headers]
 * @param {boolean} [options.persist]     also cache in sessionStorage
 * @returns {Promise<any>} the parsed body
 * @throws {ApiError} on a non-2xx response or an unrecoverable network error
 */
export async function getJSON(url, options = {}) {
  const {
    signal,
    ttl = DEFAULT_TTL,
    retries = 2,
    headers,
    persist = true,
  } = options;

  if (ttl > 0) {
    const hit = memory.get(url);
    if (hit && hit.expires > Date.now()) return hit.value;

    if (persist) {
      const stored = readStored(url);
      if (stored) {
        memory.set(url, stored);
        return stored.value;
      }
    }
  }

  // A request already on the wire is shared rather than duplicated.
  if (inFlight.has(url)) return inFlight.get(url);

  const request = (async () => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(url, { signal, headers });

        if (!response.ok) {
          throw new ApiError(`HTTP ${response.status}`, {
            status: response.status,
            url,
          });
        }

        const value = await response.json();

        if (ttl > 0) {
          const entry = { expires: Date.now() + ttl, value };
          memory.set(url, entry);
          if (persist) writeStored(url, entry);
        }

        return value;
      } catch (error) {
        // An abort is the caller's decision, never a failure to retry.
        if (error?.name === "AbortError") throw error;

        lastError =
          error instanceof ApiError
            ? error
            : new ApiError(error?.message || "Network error", { url });

        if (attempt === retries || !isRetryable(lastError)) break;

        // 300ms, then 600ms, then 1200ms — long enough to outlast a handover.
        await sleep(300 * 2 ** attempt, signal);
      }
    }

    throw lastError;
  })();

  inFlight.set(url, request);
  try {
    return await request;
  } finally {
    inFlight.delete(url);
  }
}

/**
 * Fetch several URLs at once, returning `null` in place of any that failed.
 *
 * Used where a page shows whatever it managed to load — one missing hadith
 * should not blank the whole list.
 */
export function getAllJSON(urls, options = {}) {
  return Promise.all(
    urls.map((url) =>
      getJSON(url, options).catch((error) => {
        if (error?.name === "AbortError") throw error;
        return null;
      }),
    ),
  );
}

/** Drop cached responses — all of them, or those whose URL contains `match`. */
export function clearCache(match) {
  for (const key of [...memory.keys()]) {
    if (!match || key.includes(match)) memory.delete(key);
  }
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (!key.startsWith(STORE_PREFIX)) continue;
      if (!match || key.includes(match)) sessionStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable; the in-memory cache is already cleared */
  }
}
