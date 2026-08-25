import { getJSON, getAllJSON, clearCache, ApiError, TTL } from "./apiClient";

/*
 * Caching, deduplication and retry are the kind of thing that looks right and
 * quietly is not, so each behaviour is pinned to an observable request count.
 */

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status) => ({ ok: false, status, json: async () => ({}) });

let url;
beforeEach(() => {
  clearCache();
  // A fresh URL per test keeps one test's cache out of the next one.
  url = `https://example.test/${Math.random()}`;
  jest.useRealTimers();
});

afterEach(() => {
  delete global.fetch;
});

describe("getJSON", () => {
  it("returns the parsed body", async () => {
    global.fetch = jest.fn().mockResolvedValue(ok({ verse: "الحمد لله" }));
    await expect(getJSON(url)).resolves.toEqual({ verse: "الحمد لله" });
  });

  it("serves a repeat call from cache instead of the network", async () => {
    global.fetch = jest.fn().mockResolvedValue(ok({ n: 1 }));

    await getJSON(url, { ttl: TTL.LONG });
    await getJSON(url, { ttl: TTL.LONG });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("refetches when caching is switched off", async () => {
    global.fetch = jest.fn().mockResolvedValue(ok({ n: 1 }));

    await getJSON(url, { ttl: TTL.NONE });
    await getJSON(url, { ttl: TTL.NONE });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("refetches once the entry has expired", async () => {
    global.fetch = jest.fn().mockResolvedValue(ok({ n: 1 }));

    await getJSON(url, { ttl: 1 });
    await new Promise((r) => setTimeout(r, 5));
    await getJSON(url, { ttl: 1 });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("shares one request between callers asking at the same time", async () => {
    let release;
    global.fetch = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        release = () => resolve(ok({ n: 1 }));
      }),
    );

    const both = Promise.all([getJSON(url), getJSON(url)]);
    release();

    await expect(both).resolves.toEqual([{ n: 1 }, { n: 1 }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("retries a network failure and returns the eventual success", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue(ok({ recovered: true }));

    await expect(getJSON(url, { retries: 2 })).resolves.toEqual({
      recovered: true,
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("retries a 5xx but gives up eventually", async () => {
    global.fetch = jest.fn().mockResolvedValue(fail(503));

    await expect(getJSON(url, { retries: 1 })).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 4xx, because repeating it changes nothing", async () => {
    global.fetch = jest.fn().mockResolvedValue(fail(404));

    await expect(getJSON(url, { retries: 3 })).rejects.toBeInstanceOf(ApiError);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("does not cache a failure", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(fail(500))
      .mockResolvedValue(ok({ n: 2 }));

    await expect(getJSON(url, { retries: 0, ttl: TTL.LONG })).rejects.toThrow();
    await expect(getJSON(url, { ttl: TTL.LONG })).resolves.toEqual({ n: 2 });
  });

  it("propagates an abort as an abort, not a failure", async () => {
    const controller = new AbortController();
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );

    const pending = getJSON(url, { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    // An abort must not be retried.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("getAllJSON", () => {
  it("keeps the successes and nulls the failures", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(ok({ id: 1 }))
      .mockResolvedValueOnce(fail(404))
      .mockResolvedValueOnce(ok({ id: 3 }));

    const results = await getAllJSON(
      [`${url}/1`, `${url}/2`, `${url}/3`],
      { retries: 0 },
    );

    expect(results).toEqual([{ id: 1 }, null, { id: 3 }]);
  });
});

describe("clearCache", () => {
  it("drops only the entries whose URL matches", async () => {
    global.fetch = jest.fn().mockResolvedValue(ok({ n: 1 }));

    await getJSON("https://example.test/keep/a", { ttl: TTL.LONG });
    await getJSON("https://example.test/drop/b", { ttl: TTL.LONG });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    clearCache("/drop/");

    await getJSON("https://example.test/keep/a", { ttl: TTL.LONG });
    expect(global.fetch).toHaveBeenCalledTimes(2); // still cached

    await getJSON("https://example.test/drop/b", { ttl: TTL.LONG });
    expect(global.fetch).toHaveBeenCalledTimes(3); // refetched
  });
});
