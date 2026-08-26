/*
 * Which prayer-time convention a country actually follows.
 *
 * aladhan's `method` parameter selects the twilight angles used for Fajr and
 * Isha, and countries genuinely disagree: Qatar uses 18° for Fajr and
 * Maghrib+90min for Isha, Umm al-Qura uses 18.5°/90min, ISNA uses 15°/15°.
 * Picking the wrong one moves Fajr and Isha by twenty minutes or more — far
 * enough that a reader in Doha praying by these times prays at the wrong hour.
 *
 * Both requests were sending no `method` at all, so every reader got aladhan's
 * default rather than the calendar their mosque follows.
 *
 * This table is mirrored in the notifications backend
 * (islamic-notifs-backend/src/calcMethod.js) so the times on screen and the
 * times in the push notification can never disagree. Change one, change both.
 *
 * Method ids: https://aladhan.com/calculation-methods
 */

const MWL = 3; // Muslim World League — the safe default elsewhere

const METHOD_BY_COUNTRY = {
  // Gulf
  QA: 10, // Qatar
  SA: 4, // Umm al-Qura, Makkah
  AE: 16, // Dubai
  KW: 9, // Kuwait
  BH: 8, // Gulf region
  OM: 8,
  YE: 4,

  // Levant and Iraq
  JO: 23, // Jordan
  PS: 5,
  LB: MWL,
  SY: MWL,
  IQ: MWL,

  // North and East Africa
  EG: 5, // Egyptian General Authority of Survey
  SD: 5,
  LY: 5,
  TN: 18, // Tunisia
  DZ: 19, // Algeria
  MA: 21, // Morocco
  MR: 21,
  SO: MWL,

  // Asia
  TR: 13, // Diyanet
  IR: 7, // Tehran
  PK: 1, // Karachi
  IN: 1,
  BD: 1,
  AF: 1,
  MY: 17, // JAKIM
  SG: 11, // MUIS
  ID: 20, // KEMENAG
  BN: 17,

  // Europe and the Americas
  RU: 14,
  FR: 12,
  PT: 22,
  US: 2, // ISNA
  CA: 2,
};

/* Where the Hanafi position on Asr is the local convention. */
const HANAFI_ASR = ["PK", "IN", "BD", "AF", "LK", "NP"];

/** aladhan calculation method for an ISO-3166 alpha-2 country code. */
export function methodForCountry(countryCode) {
  const code = String(countryCode || "").toUpperCase();
  return METHOD_BY_COUNTRY[code] ?? MWL;
}

/** 0 = Shafi'i/Maliki/Hanbali Asr, 1 = Hanafi Asr. */
export function schoolForCountry(countryCode) {
  return HANAFI_ASR.includes(String(countryCode || "").toUpperCase()) ? 1 : 0;
}
