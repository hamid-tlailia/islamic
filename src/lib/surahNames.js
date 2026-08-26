/*
 * The 114 surah names.
 *
 * Small enough to ship (about 4 KB) and worth it: the tajweed page saves only
 * a surah number, so without this the resume link could say nothing more
 * useful than "surah 18". English names come from the Jalalayn index served
 * at /APIs/en-al-jalalayn.json, so the two agree.
 */
const SURAH_NAMES = [
  ["الفاتحة", "Al-Fâtihah"], // 1
  ["البقرة", "Al-Baqarah"], // 2
  ["آل عمران", "Al ‘Imrân"], // 3
  ["النساء", "An-Nisâ’"], // 4
  ["المائدة", "Al-Mâ’idah"], // 5
  ["الأنعام", "Al-An‘âm"], // 6
  ["الأعراف", "Al-A‘râf"], // 7
  ["الأنفال", "Al-Anfâl"], // 8
  ["التوبة", "At-Tawbah"], // 9
  ["يونس", "Yûnus"], // 10
  ["هود", "Hûd"], // 11
  ["يوسف", "Yûsuf"], // 12
  ["الرعد", "Ar-Ra‘d"], // 13
  ["إبراهيم", "Ibrâhîm"], // 14
  ["الحجر", "Al-Hijr "], // 15
  ["النحل", "An-Nahl"], // 16
  ["الإسراء", "Al-Isrâ’"], // 17
  ["الكهف", "Al-Kahf"], // 18
  ["مريم", "Maryam"], // 19
  ["طه", "Tâ-Hâ"], // 20
  ["الأنبياء", "Al-Anbiyâ’"], // 21
  ["الحج", "Al-Hajj"], // 22
  ["المؤمنون", "Al-Mu’minûn"], // 23
  ["النور", "An-Nûr"], // 24
  ["الفرقان", "Al-Furqân"], // 25
  ["الشعراء", "Ash-Shu‘arâ’ "], // 26
  ["النمل", "An-Naml"], // 27
  ["القصص", "Al-Qasas"], // 28
  ["العنكبوت", "Al-‘Ankabût"], // 29
  ["الروم", "Ar-Rûm "], // 30
  ["لقمان", "Luqmân"], // 31
  ["السجدة", "As-Sajdah "], // 32
  ["الأحزاب", "Al-Ahzâb "], // 33
  ["سبأ", "Saba’"], // 34
  ["فاطر", "Fâtir"], // 35
  ["يس", "Yâ-Sîn"], // 36
  ["الصافات", "As-Sâffât"], // 37
  ["ص", "Sâd"], // 38
  ["الزمر", "Az-Zumar"], // 39
  ["غافر", "Ghâfir"], // 40
  ["فصلت", "Fussilat"], // 41
  ["الشورى", "Ash-shûrâ "], // 42
  ["الزخرف", "Az-Zukhruf "], // 43
  ["الدخان", "Ad-Dukhân"], // 44
  ["الجاثية", "Al-Jâthiyah"], // 45
  ["الأحقاف", "Al-Ahqâf"], // 46
  ["محمد", "Muhammad"], // 47
  ["الفتح", "Al-Fath"], // 48
  ["الحجرات", "Al-Hujurât "], // 49
  ["ق", "Qâf"], // 50
  ["الذاريات", "Adh-Dhâriyât "], // 51
  ["الطور", "At-Tûr"], // 52
  ["النجم", "An-Najm"], // 53
  ["القمر", "Al-Qamar"], // 54
  ["الرحمن", "Ar-Rahmân"], // 55
  ["الواقعة", "Al-Wâqi‘ah"], // 56
  ["الحديد", "Al-Hadîd"], // 57
  ["المجادلة", "Al-Mujâdilah"], // 58
  ["الحشر", "Al-Hashr"], // 59
  ["الممتحنة", "Al-Mumtahanah"], // 60
  ["الصف", "As-Saff"], // 61
  ["الجمعة", "Al-Jumu‘ah"], // 62
  ["المنافقون", "Al-Munâfiqûn"], // 63
  ["التغابن", "At-Taghâbun"], // 64
  ["الطلاق", "At-Talâq"], // 65
  ["التحريم", "At-Tahrîm"], // 66
  ["الملك", "Al-Mulk"], // 67
  ["القلم", "Al-Qalam"], // 68
  ["الحاقة", "Al-Hâqqah"], // 69
  ["المعارج", "Al-Ma‘ârij"], // 70
  ["نوح", "Nûh"], // 71
  ["الجن", "Al-Jinn"], // 72
  ["المزمل", "Al-Muzzammil"], // 73
  ["المدثر", "Al-Muddaththir"], // 74
  ["القيامة", "Al-Qiyâmah"], // 75
  ["الإنسان", "Al-Insân"], // 76
  ["المرسلات", "Al-Mursalât"], // 77
  ["النبأ", "An-Naba’"], // 78
  ["النازعات", "An-Nâzi‘ât"], // 79
  ["عبس", "‘Abasa"], // 80
  ["التكوير", "At-Takwîr"], // 81
  ["الانفطار", "Al-Infitâr"], // 82
  ["المطففين", "Al-Mutaffifîn"], // 83
  ["الانشقاق", "Al-Inshiqâq"], // 84
  ["البروج", "Al-Burûj"], // 85
  ["الطارق", "At-Târiq"], // 86
  ["الأعلى", "Al-A‘lâ"], // 87
  ["الغاشية", "Al-Ghâshiyah"], // 88
  ["الفجر", "Al-Fajr"], // 89
  ["البلد", "Al-Balad"], // 90
  ["الشمس", "Ash-Shams "], // 91
  ["الليل", "Al-Layl "], // 92
  ["الضحى", "Ad-Dhuhâ"], // 93
  ["الشرح", "Al-Sharh"], // 94
  ["التين", "At-Tîn"], // 95
  ["العلق", "Al-‘Alaq"], // 96
  ["القدر", "Al-Qadr"], // 97
  ["البينة", "Al-Bayyinah"], // 98
  ["الزلزلة", "Al-Zalzalah"], // 99
  ["العاديات", "Al-‘Adiyât"], // 100
  ["القارعة", "Al-Qâri‘ah"], // 101
  ["التكاثر", "At-Takâthur"], // 102
  ["العصر", "Al-‘Asr"], // 103
  ["الهمزة", "Al-Humazah"], // 104
  ["الفيل", "Al-Fîl"], // 105
  ["قريش", "Quraysh"], // 106
  ["الماعون", "Al-Mâ‘ûn"], // 107
  ["الكوثر", "Al-Kawthar"], // 108
  ["الكافرون", "Al-Kâfirûn"], // 109
  ["النصر", "An-Nasr"], // 110
  ["المسد", "Al-Masad"], // 111
  ["الإخلاص", "Al-Ikhlâs"], // 112
  ["الفلق", "Al-Falaq"], // 113
  ["الناس", "An-Nâs"], // 114
];

/**
 * The name of a surah by its number, in the given language.
 * Returns an empty string for anything outside 1–114.
 */
export function surahName(number, language = "ar") {
  const entry = SURAH_NAMES[Number(number) - 1];
  if (!entry) return "";
  return language === "en" ? entry[1] : entry[0];
}

export const SURAH_COUNT = SURAH_NAMES.length;
