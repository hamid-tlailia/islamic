import { parseMishkatReply, normalizeArabic, verifyAyah } from "./mishkat";

/*
 * The reply protocol and the ayah comparison are the two places where a
 * silent change would show a reader wrong evidence, so both are pinned here.
 */

describe("parseMishkatReply", () => {
  const reply = `[د]
يجوز للمسافر أن يجمع بين الظهر والعصر.
###
@عنوان | الجمع في السفر
@باب | فقه الصلاة
@آية | 4 | 101 | وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ | التخفيف على المسافر
@حديث | كان إذا عجل به السير جمع | إذا عجل به السير | متفق عليه | دليل الجمع
@قول | الجمهور | يجوز الجمع في السفر الطويل
@مرجع | المغني لابن قدامة | باب صلاة المسافر
@سؤال | ما مسافة السفر؟`;

  it("reads the scope marker and keeps it out of the prose", () => {
    const parsed = parseMishkatReply(reply);
    expect(parsed.religious).toBe(true);
    expect(parsed.prose).not.toContain("[د]");
    expect(parsed.prose).toContain("يجوز للمسافر");
  });

  it("marks an out-of-scope answer", () => {
    expect(parseMishkatReply("[خ]\nأجيب عن المسائل الشرعية وحدها.\n###").religious)
      .toBe(false);
  });

  it("splits every tagged record into its fields", () => {
    const parsed = parseMishkatReply(reply);

    expect(parsed.title).toBe("الجمع في السفر");
    expect(parsed.topic).toBe("فقه الصلاة");

    expect(parsed.ayat).toHaveLength(1);
    expect(parsed.ayat[0]).toMatchObject({
      surah: 4,
      ayah: 101,
      reasoning: "التخفيف على المسافر",
      status: "pending",
    });

    expect(parsed.ahadith[0]).toMatchObject({
      search: "إذا عجل به السير",
      source: "متفق عليه",
    });
    expect(parsed.views[0]).toEqual({
      who: "الجمهور",
      what: "يجوز الجمع في السفر الطويل",
    });
    expect(parsed.references[0].name).toBe("المغني لابن قدامة");
    expect(parsed.followUps).toEqual(["ما مسافة السفر؟"]);
  });

  it("keeps data lines out of the prose", () => {
    expect(parseMishkatReply(reply).prose).not.toContain("@آية");
  });

  it("handles a half-streamed reply without throwing", () => {
    const partial = parseMishkatReply("[د]\nيجوز للمساف");
    expect(partial.prose).toBe("يجوز للمساف");
    expect(partial.ayat).toEqual([]);
  });

  it("survives empty and malformed input", () => {
    expect(parseMishkatReply("").ayat).toEqual([]);
    expect(parseMishkatReply(null).prose).toBe("");
    expect(parseMishkatReply("###\n@آية | | | |").ayat).toEqual([]);
  });
});

describe("normalizeArabic", () => {
  it("flattens the differences between Uthmani and modern spelling", () => {
    expect(normalizeArabic("ٱلْأَرْضِ")).toBe(normalizeArabic("الأرض"));
    expect(normalizeArabic("فِى")).toBe(normalizeArabic("في"));
    expect(normalizeArabic("رَحْمَةً")).toBe(normalizeArabic("رحمه"));
  });

  it("drops diacritics, tatweel and punctuation", () => {
    expect(normalizeArabic("بِسْمِ ٱللَّهِ")).toBe("بسم الله");
    expect(normalizeArabic("قـــال")).toBe("قال");
  });

  it("does not collapse genuinely different words", () => {
    expect(normalizeArabic("الصلاة")).not.toBe(normalizeArabic("الزكاة"));
  });
});

describe("verifyAyah", () => {
  const mushaf = (text) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { text, surah: { name: "سُورَةُ النِّسَاءِ", number: 4 }, numberInSurah: 101 },
      }),
    });
  };

  afterEach(() => {
    delete global.fetch;
  });

  const UTHMANI =
    "وَإِذَا ضَرَبْتُمْ فِى ٱلْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا۟ مِنَ ٱلصَّلَوٰةِ";

  it("verifies a correct quotation written in modern spelling", async () => {
    mushaf(UTHMANI);
    const result = await verifyAyah({
      surah: 4,
      ayah: 101,
      quoted:
        "وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا مِنَ الصَّلَاةِ",
    });
    expect(result.status).toBe("verified");
    expect(result.text).toBe(UTHMANI);
    expect(result.surahName).toBe("سُورَةُ النِّسَاءِ");
  });

  it("verifies a short fragment of the verse", async () => {
    mushaf(UTHMANI);
    const result = await verifyAyah({
      surah: 4,
      ayah: 101,
      quoted: "فَلَيْسَ عَلَيْكُمْ جُنَاحٌ",
    });
    expect(result.status).toBe("verified");
  });

  it("flags a quotation that is not at that reference", async () => {
    mushaf("شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ");
    const result = await verifyAyah({
      surah: 2,
      ayah: 185,
      quoted: "يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ",
    });
    expect(result.status).toBe("mismatch");
  });

  it("flags invented wording placed at a real reference", async () => {
    mushaf(UTHMANI);
    const result = await verifyAyah({
      surah: 4,
      ayah: 101,
      quoted: "وَأَقِيمُوا الصَّلَاةَ فِي أَوْقَاتِ الْفَجْرِ وَالضُّحَى دَائِمًا",
    });
    expect(result.status).toBe("mismatch");
  });

  it("reports unchecked rather than a false verdict when the lookup fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("offline"));
    const result = await verifyAyah({ surah: 4, ayah: 101, quoted: "أي نص" });
    expect(result.status).toBe("unchecked");
  });
});
