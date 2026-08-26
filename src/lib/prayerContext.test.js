import {
  parseTiming,
  nextPrayer,
  formatRemaining,
  pickSuggestion,
  formatApiDate,
  buildTimingsUrl,
} from "./prayerContext";

/*
 * These decide what the home page offers a reader at a given hour, and the
 * boundaries are exactly where it would go wrong unnoticed — so each one is
 * pinned with an explicit `now`.
 */

const TIMINGS = {
  Fajr: "04:30",
  Sunrise: "06:00",
  Dhuhr: "12:30",
  Asr: "16:00",
  Maghrib: "19:00",
  Isha: "20:30",
};

// A Wednesday and a Friday, so the Al-Kahf branch can be isolated.
const at = (day, hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2026, 7, day, h, m, 0, 0);
};
const WED = 26;
const FRI = 28;

describe("parseTiming", () => {
  it("places the time on the given day", () => {
    const parsed = parseTiming("04:30", at(WED, "13:00"));
    expect(parsed.getHours()).toBe(4);
    expect(parsed.getMinutes()).toBe(30);
    expect(parsed.getDate()).toBe(WED);
  });

  it("ignores a trailing timezone note", () => {
    expect(parseTiming("19:05 (UTC)", at(WED, "01:00")).getHours()).toBe(19);
  });

  it("returns null for junk", () => {
    expect(parseTiming("", new Date())).toBeNull();
    expect(parseTiming("noon", new Date())).toBeNull();
    expect(parseTiming("25:00", new Date())).toBeNull();
  });
});

describe("nextPrayer", () => {
  it("finds the next prayer later the same day", () => {
    const next = nextPrayer(TIMINGS, at(WED, "13:00"));
    expect(next.name).toBe("Asr");
    expect(next.msRemaining).toBe(3 * 60 * 60 * 1000);
  });

  it("never counts down to sunrise, which is not a prayer", () => {
    // 05:00 sits between Fajr (04:30) and sunrise (06:00).
    expect(nextPrayer(TIMINGS, at(WED, "05:00")).name).toBe("Dhuhr");
  });

  it("rolls over to tomorrow's Fajr after Isha", () => {
    const next = nextPrayer(TIMINGS, at(WED, "22:00"));
    expect(next.name).toBe("Fajr");
    expect(next.at.getDate()).toBe(WED + 1);
    expect(next.msRemaining).toBeGreaterThan(0);
  });

  it("counts to Fajr in the small hours without going negative", () => {
    const next = nextPrayer(TIMINGS, at(WED, "02:00"));
    expect(next.name).toBe("Fajr");
    expect(next.msRemaining).toBe(2.5 * 60 * 60 * 1000);
  });

  it("returns null when there is nothing usable", () => {
    expect(nextPrayer(null, new Date())).toBeNull();
    expect(nextPrayer({ Fajr: "oops" }, new Date())).toBeNull();
  });
});

describe("formatRemaining", () => {
  it("counts hours and minutes when over an hour away", () => {
    expect(formatRemaining(3 * 3600 * 1000 + 5 * 60 * 1000)).toBe("3:05");
  });

  it("counts minutes and seconds when under an hour", () => {
    expect(formatRemaining(9 * 60 * 1000 + 7 * 1000)).toBe("09:07");
  });

  it("never shows a negative countdown", () => {
    expect(formatRemaining(-5000)).toBe("00:00");
  });
});

describe("pickSuggestion with prayer times", () => {
  const pick = (day, hhmm) => pickSuggestion(TIMINGS, at(day, hhmm)).id;

  it("suggests the morning adhkar between Fajr and sunrise", () => {
    expect(pick(WED, "04:31")).toBe("morning");
    expect(pick(WED, "05:59")).toBe("morning");
  });

  it("suggests the evening adhkar between Asr and Maghrib", () => {
    expect(pick(WED, "16:00")).toBe("evening");
    expect(pick(WED, "18:59")).toBe("evening");
  });

  it("suggests remembrance through the night", () => {
    expect(pick(WED, "20:30")).toBe("night");
    expect(pick(WED, "03:00")).toBe("night");
  });

  it("suggests the daily Quran reading through the middle of the day", () => {
    expect(pick(WED, "07:00")).toBe("wird");
    expect(pick(WED, "13:00")).toBe("wird");
  });

  it("suggests Al-Kahf all Friday daytime, overriding the rest", () => {
    expect(pick(FRI, "04:31")).toBe("kahf");
    expect(pick(FRI, "13:00")).toBe("kahf");
    expect(pick(FRI, "18:59")).toBe("kahf");
  });

  it("returns to the night suggestion once Friday's Maghrib has passed", () => {
    expect(pick(FRI, "21:00")).toBe("night");
  });
});

describe("pickSuggestion without prayer times", () => {
  const pick = (day, hhmm) => pickSuggestion(null, at(day, hhmm)).id;

  it("falls back to the clock", () => {
    expect(pick(WED, "05:00")).toBe("morning");
    expect(pick(WED, "17:00")).toBe("evening");
    expect(pick(WED, "23:00")).toBe("night");
    expect(pick(WED, "12:00")).toBe("wird");
  });

  it("still catches Friday", () => {
    expect(pick(FRI, "12:00")).toBe("kahf");
  });

  it("ignores partial timings rather than trusting them", () => {
    expect(pickSuggestion({ Fajr: "04:30" }, at(WED, "05:00")).id).toBe(
      "morning",
    );
  });
});

describe("every suggestion points at a page that exists", () => {
  it("only routes into known sections", () => {
    const known = [
      "/categories/quran",
      "/categories/adhkar",
      "/categories/tasbih",
    ];
    for (const hour of ["02:00", "05:00", "09:00", "13:00", "17:00", "21:00"]) {
      for (const day of [WED, FRI]) {
        expect(known).toContain(pickSuggestion(TIMINGS, at(day, hour)).route);
      }
    }
  });
});

describe("formatApiDate", () => {
  it("uses the DD-MM-YYYY the aladhan path expects", () => {
    expect(formatApiDate(at(WED, "12:00"))).toBe("26-08-2026");
  });

  it("pads single-digit days and months", () => {
    expect(formatApiDate(new Date(2026, 0, 5, 12))).toBe("05-01-2026");
  });
});

describe("buildTimingsUrl", () => {
  const DOHA = { city: "الدوحة", country: "قطر", countryCode: "QA" };

  it("builds one URL both callers can share", () => {
    const url = buildTimingsUrl(DOHA, at(WED, "12:00"));
    expect(url).toContain("/timingsByCity/26-08-2026?");
    // Arabic city names have to survive the query string.
    expect(url).toContain(`city=${encodeURIComponent("الدوحة")}`);
  });

  /*
   * Sending no method meant every reader got aladhan's default rather than
   * their country's calendar, which moves Fajr and Isha by twenty minutes or
   * more. This is the assertion that keeps the times honest.
   */
  it("asks for the country's own calculation method", () => {
    expect(buildTimingsUrl(DOHA, at(WED, "12:00"))).toContain("method=10");
    expect(
      buildTimingsUrl({ ...DOHA, countryCode: "EG" }, at(WED, "12:00")),
    ).toContain("method=5");
  });

  it("uses the Hanafi Asr only where it is the local convention", () => {
    expect(
      buildTimingsUrl({ ...DOHA, countryCode: "PK" }, at(WED, "12:00")),
    ).toContain("school=1");
    expect(buildTimingsUrl(DOHA, at(WED, "12:00"))).toContain("school=0");
  });

  /*
   * The country name is localised — "قطر" when the reader is reading Arabic —
   * and aladhan's geocoder resolves an ISO code far more reliably.
   */
  it("sends the ISO country code rather than the translated name", () => {
    const url = buildTimingsUrl(DOHA, at(WED, "12:00"));
    expect(url).toContain("country=QA");
    expect(url).not.toContain(encodeURIComponent("قطر"));
  });

  it("falls back to the country name when no code was resolved", () => {
    const url = buildTimingsUrl(
      { city: "Doha", country: "Qatar" },
      at(WED, "12:00"),
    );
    expect(url).toContain("country=Qatar");
  });

  /*
   * A city centroid is fine in Doha and noticeably wrong across a country the
   * size of Algeria, so coordinates win when the reader has granted them.
   */
  it("prefers coordinates over the city when they are known", () => {
    const url = buildTimingsUrl(
      { ...DOHA, latitude: 25.2854, longitude: 51.531 },
      at(WED, "12:00"),
    );
    expect(url).toContain("/timings/26-08-2026?");
    expect(url).toContain("latitude=25.2854");
    expect(url).toContain("longitude=51.531");
    expect(url).not.toContain("city=");
  });

  it("survives a location with nothing resolved yet", () => {
    expect(() => buildTimingsUrl(null, at(WED, "12:00"))).not.toThrow();
    expect(() => buildTimingsUrl({}, at(WED, "12:00"))).not.toThrow();
  });
});
