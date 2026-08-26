import { surahName, SURAH_COUNT } from "./surahNames";

describe("surahName", () => {
  it("covers the whole mushaf", () => {
    expect(SURAH_COUNT).toBe(114);
    for (let n = 1; n <= 114; n += 1) {
      expect(surahName(n, "ar")).not.toBe("");
      expect(surahName(n, "en")).not.toBe("");
    }
  });

  it("returns the right names at both ends", () => {
    expect(surahName(1, "ar")).toBe("الفاتحة");
    expect(surahName(18, "ar")).toBe("الكهف");
    expect(surahName(114, "ar")).toBe("الناس");
    expect(surahName(1, "en")).toBe("Al-Fâtihah");
  });

  it("accepts a numeric string, as localStorage hands it over", () => {
    expect(surahName("18", "ar")).toBe("الكهف");
  });

  it("returns empty for anything outside the mushaf", () => {
    for (const bad of [0, 115, -1, null, undefined, "x"]) {
      expect(surahName(bad, "ar")).toBe("");
    }
  });

  it("defaults to Arabic", () => {
    expect(surahName(2)).toBe("البقرة");
  });
});
