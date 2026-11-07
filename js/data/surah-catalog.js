/* =====================================================================
   Katalog surah
   Al-Fatihah + seluruh surah Juz 28, 29, 30 (58 surah) dengan ejaan nama versi Kemenag.
   ===================================================================== */
'use strict';

/* =====================================================================
   PENGATURAN SURAH — disamakan dengan TalqinKu:
   Al-Fatihah + seluruh surah Juz 28, 29, 30 (58-114), ejaan nama versi Kemenag.
   Teks Arab : api.quran.com (Utsmani) -> diubah ke gaya Mushaf Standar Indonesia
   Terjemah  : api.alquran.cloud (id.indonesian)
   Data bawaan (RAW) hanya cadangan bila belum pernah memuat.
   ===================================================================== */
const ALL_SURAHS = [
    { num: 1, name: "Al-Fatihah", ar: "سُورَةُ ٱلْفَاتِحَةِ", ayahs: 7, mean: "Pembukaan" },
    { num: 58, name: "Al-Mujadilah", ar: "سُورَةُ ٱلْمُجَادَلَةِ", ayahs: 22, mean: "Wanita yang Menggugat" },
    { num: 59, name: "Al-Hasyr", ar: "سُورَةُ ٱلْحَشْرِ", ayahs: 24, mean: "Pengusiran" },
    { num: 60, name: "Al-Mumtahanah", ar: "سُورَةُ ٱلْمُمْتَحَنَةِ", ayahs: 13, mean: "Wanita yang Diuji" },
    { num: 61, name: "As-Saff", ar: "سُورَةُ ٱلصَّفِّ", ayahs: 14, mean: "Barisan" },
    { num: 62, name: "Al-Jumu'ah", ar: "سُورَةُ ٱلجُمُعَةِ", ayahs: 11, mean: "Hari Jumat" },
    { num: 63, name: "Al-Munafiqun", ar: "سُورَةُ ٱلنَّافِقُونَ", ayahs: 11, mean: "Orang-orang Munafik" },
    { num: 64, name: "At-Tagabun", ar: "سُورَةُ ٱلتَّغَابُنِ", ayahs: 18, mean: "Hari Dinampakkan Kesalahan" },
    { num: 65, name: "At-Talaq", ar: "سُورَةُ ٱلطَّلَاقِ", ayahs: 12, mean: "Talak" },
    { num: 66, name: "At-Tahrim", ar: "سُورَةُ ٱلتَّحْرِيمِ", ayahs: 12, mean: "Mengharamkan" },
    { num: 67, name: "Al-Mulk", ar: "سُورَةُ ٱلْمُلْكِ", ayahs: 30, mean: "Kerajaan" },
    { num: 68, name: "Al-Qalam", ar: "سُورَةُ ٱلْقَلَمِ", ayahs: 52, mean: "Pena" },
    { num: 69, name: "Al-Haqqah", ar: "سُورَةُ ٱلْحَاقَّةِ", ayahs: 52, mean: "Hari Kiamat yang Pasti" },
    { num: 70, name: "Al-Ma'arij", ar: "سُورَةُ ٱلْمَعَارِجِ", ayahs: 44, mean: "Tempat-tempat Naik" },
    { num: 71, name: "Nuh", ar: "سُورَةُ نُوحٍ", ayahs: 28, mean: "Nabi Nuh" },
    { num: 72, name: "Al-Jinn", ar: "سُورَةُ ٱلْجِنِّ", ayahs: 28, mean: "Jin" },
    { num: 73, name: "Al-Muzzammil", ar: "سُورَةُ ٱلْمُزَّمِّلِ", ayahs: 20, mean: "Orang yang Berselimut" },
    { num: 74, name: "Al-Muddassir", ar: "سُورَةُ ٱلْمُدَّثِّرِ", ayahs: 56, mean: "Orang yang Berkemul" },
    { num: 75, name: "Al-Qiyamah", ar: "سُورَةُ ٱلْقِيَامَةِ", ayahs: 40, mean: "Hari Kiamat" },
    { num: 76, name: "Al-Insan", ar: "سُورَةُ ٱلْإِنسَانِ", ayahs: 31, mean: "Manusia" },
    { num: 77, name: "Al-Mursalat", ar: "سُورَةُ ٱلْمُرْسَلَاتِ", ayahs: 50, mean: "Malaikat yang Diutus" },
    { num: 78, name: "An-Naba'", ar: "سُورَةُ ٱلنَّبَإِ", ayahs: 40, mean: "Berita Besar" },
    { num: 79, name: "An-Nazi'at", ar: "سُورَةُ ٱلنَّازِعَاتِ", ayahs: 46, mean: "Malaikat yang Mencabut" },
    { num: 80, name: "'Abasa", ar: "سُورَةُ عَبَسَ", ayahs: 42, mean: "Ia Bermuka Masam" },
    { num: 81, name: "At-Takwir", ar: "سُورَةُ ٱلتَّكْوِيرِ", ayahs: 29, mean: "Menggulung" },
    { num: 82, name: "Al-Infitar", ar: "سُورَةُ ٱلْإِنْفِطَارِ", ayahs: 19, mean: "Terbelah" },
    { num: 83, name: "Al-Mutaffifin", ar: "سُورَةُ ٱلْمُطَفِّفِينَ", ayahs: 36, mean: "Orang yang Curang" },
    { num: 84, name: "Al-Insyiqaq", ar: "سُورَةُ ٱلْإِنْشِقَاقِ", ayahs: 25, mean: "Terbelah" },
    { num: 85, name: "Al-Buruj", ar: "سُورَةُ ٱلْبُرُوجِ", ayahs: 22, mean: "Gugusan Bintang" },
    { num: 86, name: "At-Tariq", ar: "سُورَةُ ٱلطَّارِقِ", ayahs: 17, mean: "Yang Datang di Malam Hari" },
    { num: 87, name: "Al-A'la", ar: "سُورَةُ ٱلْأَعْلَىٰ", ayahs: 19, mean: "Yang Mahatinggi" },
    { num: 88, name: "Al-Gasyiyah", ar: "سُورَةُ ٱلْغَاشِيَةِ", ayahs: 26, mean: "Hari Pembalasan" },
    { num: 89, name: "Al-Fajr", ar: "سُورَةُ ٱلْفَجْرِ", ayahs: 30, mean: "Fajar" },
    { num: 90, name: "Al-Balad", ar: "سُورَةُ ٱلْبَلَدِ", ayahs: 20, mean: "Negeri" },
    { num: 91, name: "Asy-Syams", ar: "سُورَةُ ٱلشَّمْسِ", ayahs: 15, mean: "Matahari" },
    { num: 92, name: "Al-Lail", ar: "سُورَةُ ٱلَّيْلِ", ayahs: 21, mean: "Malam" },
    { num: 93, name: "Ad-Duha", ar: "سُورَةُ ٱلضُّحَىٰ", ayahs: 11, mean: "Waktu Duha" },
    { num: 94, name: "Asy-Syarh", ar: "سُورَةُ ٱلشَّرْحِ", ayahs: 8, mean: "Kelapangan" },
    { num: 95, name: "At-Tin", ar: "سُورَةُ ٱلتِّينِ", ayahs: 8, mean: "Buah Tin" },
    { num: 96, name: "Al-'Alaq", ar: "سُورَةُ ٱلْعَلَقِ", ayahs: 19, mean: "Segumpal Darah" },
    { num: 97, name: "Al-Qadr", ar: "سُورَةُ ٱلْقَدْرِ", ayahs: 5, mean: "Kemuliaan" },
    { num: 98, name: "Al-Bayyinah", ar: "سُورَةُ ٱلْبَيِّنَةِ", ayahs: 8, mean: "Bukti yang Nyata" },
    { num: 99, name: "Az-Zalzalah", ar: "سُورَةُ ٱلزَّلْزَلَةِ", ayahs: 8, mean: "Guncangan" },
    { num: 100, name: "Al-'Adiyat", ar: "سُورَةُ ٱلْعَادِيَاتِ", ayahs: 11, mean: "Kuda Perang" },
    { num: 101, name: "Al-Qari'ah", ar: "سُورَةُ ٱلْقَارِعَةِ", ayahs: 11, mean: "Hari Kiamat" },
    { num: 102, name: "At-Takasur", ar: "سُورَةُ ٱلتَّكَاثُرِ", ayahs: 8, mean: "Bermegah-megahan" },
    { num: 103, name: "Al-'Asr", ar: "سُورَةُ ٱلْعَصْرِ", ayahs: 3, mean: "Masa" },
    { num: 104, name: "Al-Humazah", ar: "سُورَةُ ٱلْهُمَزَةِ", ayahs: 9, mean: "Pengumpat" },
    { num: 105, name: "Al-Fil", ar: "سُورَةُ ٱلْفِيلِ", ayahs: 5, mean: "Gajah" },
    { num: 106, name: "Quraisy", ar: "سُورَةُ قُرَيْشٍ", ayahs: 4, mean: "Suku Quraisy" },
    { num: 107, name: "Al-Ma'un", ar: "سُورَةُ ٱلْمَاعُونِ", ayahs: 7, mean: "Barang yang Berguna" },
    { num: 108, name: "Al-Kausar", ar: "سُورَةُ ٱلْكَوْثَرِ", ayahs: 3, mean: "Nikmat yang Banyak" },
    { num: 109, name: "Al-Kafirun", ar: "سُورَةُ ٱلْكَافِرُونَ", ayahs: 6, mean: "Orang-orang Kafir" },
    { num: 110, name: "An-Nasr", ar: "سُورَةُ ٱلنَّصْرِ", ayahs: 3, mean: "Pertolongan" },
    { num: 111, name: "Al-Lahab", ar: "سُورَةُ ٱللَّهَبِ", ayahs: 5, mean: "Api yang Bergejolak" },
    { num: 112, name: "Al-Ikhlas", ar: "سُورَةُ ٱلْإِخْلَاصِ", ayahs: 4, mean: "Memurnikan Keesaan Allah" },
    { num: 113, name: "Al-Falaq", ar: "سُورَةُ ٱلْفَلَقِ", ayahs: 5, mean: "Waktu Subuh" },
    { num: 114, name: "An-Nas", ar: "سُورَةُ ٱلنَّاسِ", ayahs: 6, mean: "Manusia" }
];
const AYAT_COUNT = {}, SURAH_META = {};
ALL_SURAHS.forEach(s => {
    AYAT_COUNT[s.num] = s.ayahs;
    SURAH_META[s.num] = [s.name, s.ar, s.mean];
});

const juzOf = no => no === 1 ? 1 : no >= 78 ? 30 : no >= 67 ? 29 : 28;
const TOTAL_AYAT = ALL_SURAHS.reduce((a, s) => a + s.ayahs, 0); // 1139
