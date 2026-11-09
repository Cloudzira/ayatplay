/* =====================================================================
   Daftar game (GAMES)
   Judul, penjelasan, dan fungsi render tiap game. Dimuat PALING AKHIR di antara file game karena memanggil fungsi r1..rN.
   ===================================================================== */
'use strict';

/* ---------- daftar game ---------- */
const tm = (t) => t ? ` · ${t} detik` : '';
const D = {
    1: i => `ayat ≤${LV[1].maxw[i]} kata · ${LV[1].opts[i]} pilihan${tm(LV[1].timer[i])}`,
    2: i => LV[2].frac[i] ? `sambung kata · ${Math.round(LV[2].frac[i] * 100)}% ayat tampil · ${LV[2].opts[i]} pilihan${tm(LV[2].timer[i])}` : `tebak ayat berikutnya · ${LV[2].opts[i]} pilihan${tm(LV[2].timer[i])}`,
    3: i => `urutkan ${LV[3].k[i]} ayat`,
    4: i => `ayat ${LV[4].min[i]}-${LV[4].max[i]} kata · ${LV[4].hide[i] ? 'ayat disamarkan, baca dari ingatan' : 'ayat terlihat'}`,
    5: i => `${LV[5].nb[i]} kata hilang · ${LV[5].opts[i]} pilihan${LV[5].same[i] ? ' mirip' : ''}`,
    6: i => `${LV[6].pairs[i]} pasang kartu · intip ${LV[6].peek[i]} detik`,
    7: i => `ayat ${LV[7].min[i]}-${LV[7].max[i]} kata · ${LV[7].mean[i] ? 'ada arti' : 'tanpa arti'}`,
    8: i => `${LV[8].opts[i]} pilihan · ${LV[8].rev[i] ? Math.round(LV[8].rev[i] * 100) + '% soal dari arti ke ayat' : 'ayat ke arti'}${tm(LV[8].timer[i])}`,
    9: i => `${LV[9].opts[i]} pilihan · ${['acak', 'satu surah', 'satu surah, panjang mirip'][LV[9].mode[i]]}${tm(LV[9].timer[i])}`,
    11: i => `${LV[11].n[i]} huruf pertama · ${LV[11].opts[i]} pilihan${LV[11].rev[i] ? ' · kadang nama ke huruf' : ''}${LV[11].form[i] ? ' · bentuk sambung' : ''}${tm(LV[11].timer[i])}`,
    12: () => 'susun semua 30 huruf dari Alif sampai Ya · urutan acak tiap main · lulus jika 18 posisi benar',
    13: i => `kecepatan ${i + 1}/10 · ${LV[13].board[i]} huruf di papan · ${({ 2: 'huruf yang dicari terlihat', 1: 'hanya nama huruf', 0: 'tebak huruf berikutnya' })[LV[13].hint[i]]}${tm(LV[13].timer[i])}`,
    10: i => `${LV[10].n[i]} tahap · ayat ${LV[10].min[i]}-${LV[10].max[i]} kata`,
    14: i => `${LV[14].rules[i]} hukum · ${LV[14].opts[i]} pilihan · ${LV[14].hl[i] ? 'huruf diberi warna' : 'tanpa warna petunjuk'}${tm(LV[14].timer[i])}`,
    15: i => `${LV[15].rules[i]} hukum · ${LV[15].opts[i]} contoh · ${LV[15].hl[i] ? 'huruf diberi warna' : 'tanpa warna petunjuk'}${tm(LV[15].timer[i])}`,
    16: i => `${LV[16].pairs[i]} pasang · ${['contoh ke nama', 'huruf & ciri ke nama', 'campuran'][LV[16].mode[i]]} · salah maksimal ${LV[16].err[i]}${tm(LV[16].timer[i])}`,
    17: i => `${LV[17].cols[i]}×${LV[17].rows[i]} kepingan · ${['hanya nama huruf', 'contoh bisa diintip (tidak dihitung)', 'contoh huruf terlihat'][LV[17].hint[i]]}${tm(LV[17].timer[i])}`,
    18: i => `${LV[18].ghosts[i]} si Nakal · ${LV[18].board[i]} huruf di labirin · ${({ 2: 'huruf yang dicari terlihat', 1: 'hanya nama huruf', 0: 'tebak huruf berikutnya' })[LV[18].hint[i]]}${tm(LV[18].timer[i])}`
};

const mkLevels = id => Array.from({ length: (GAMES[id - 1].maxL || MAXL) }, (_, i) => ({ q: LV[id].q || 10, opts: LV[id].opts && LV[id].opts[i], timer: (LV[id].timer && LV[id].timer[i]) || 0, desc: D[id](i) }));
const GAMES = [
    { id: 1, emoji: '❓', name: 'Tebak Surah', short: 'Ayat ini dari surah apa? Baca, dengar, lalu tebak!', how: 'Lihat atau dengarkan potongan ayat, lalu pilih nama surahnya.', tip: 'Dengarkan ayatnya, lalu ingat kata pertama dan bunyi akhirnya.', render: r1 },
    { id: 2, emoji: '🔗', name: 'Sambung Ayat', short: 'Lanjutkan potongan ayat atau tebak ayat berikutnya.', how: 'Pilih sambungan yang tepat. Di level akhir kamu menebak ayat yang datang setelahnya.', tip: 'Ucapkan potongan ayat berulang-ulang, biasanya lanjutannya langsung terasa.', render: r2 },
    { id: 3, emoji: '🔢', name: 'Urutkan Ayat', short: 'Susun ayat-ayat acak menjadi urutan yang benar.', how: 'Ketuk ayat satu per satu mulai dari ayat yang pertama.', tip: 'Cari dulu ayat pembuka surah, lalu tebak ayat yang datang setelahnya.', render: r3 },
    { id: 4, emoji: '🎤', name: 'Bacakan Ayat', short: 'Baca dengan suaramu, mikrofon ikut mendengarkan.', how: 'Dengarkan contoh qari, lalu bacakan ayatnya. Di level tinggi ayat disamarkan.', tip: 'Dengarkan contoh qari 3 kali dulu, lalu tirukan pelan-pelan.', render: r4 },
    { id: 5, emoji: '🕵️', name: 'Detektif Kata', short: 'Temukan kata yang hilang di dalam ayat.', how: 'Ketuk kata yang tepat untuk mengisi kotak yang hilang.', tip: 'Baca ayatnya dari awal, kata yang hilang biasanya terasa janggal saat dilewati.', render: r5 },
    { id: 6, emoji: '🃏', name: 'Kartu Ingatan', short: 'Balik kartu, pasangkan ayat dengan artinya.', how: 'Ingat posisi kartu, lalu cocokkan ayat Arab dengan terjemahannya.', tip: 'Ucapkan isi kartu dalam hati saat kartu terbuka supaya mudah diingat.', render: r6 },
    { id: 7, emoji: '🧩', name: 'Susun Kata', short: 'Rangkai kata-kata acak menjadi ayat utuh.', how: 'Ketuk kata-kata sesuai urutan bacaan, mulai dari kata pertama.', tip: 'Tekan Dengarkan, lalu susun kata sesuai urutan bunyinya.', render: r7 },
    { id: 8, emoji: '💡', name: 'Tebak Arti', short: 'Pahami makna ayat supaya hafalan makin kuat.', how: 'Pilih arti yang cocok dengan ayat, atau ayat yang cocok dengan arti.', tip: 'Baca arti ayat di menu Belajar. Kalau paham maknanya, hafalan jadi lebih mudah.', render: r8 },
    { id: 9, emoji: '🎧', name: 'Dengar & Pilih', short: 'Dengarkan qari, lalu pilih ayat yang dibaca.', how: 'Putar suara, simak baik-baik, lalu pilih tulisan ayat yang sama.', tip: 'Perhatikan kata pertama yang dibaca qari, lalu cocokkan dengan tulisannya.', render: r9 },
    { id: 10, emoji: '🪄', name: 'Kata Menghilang', short: 'Kata-kata lenyap bertahap sampai kamu hafal.', how: 'Baca bersama qari. Tiap tahap, makin banyak kata yang menghilang. Ucapkan dari ingatan!', tip: 'Baca ayat keras-keras 3 kali sebelum mulai, lalu coba ucapkan tanpa mengintip.', render: r10 },
    { id: 11, emoji: '🔤', hij: true, name: 'Tebak Huruf', short: 'Kenali 30 huruf hijaiyyah dan namanya. Materi: huruf, bukan ayat.', how: 'Lihat hurufnya lalu pilih nama yang benar, atau sebaliknya. Nama dan tulisan Latin memakai penulisan yang lazim di Indonesia. Materi game ini tidak terpengaruh pilihan juz.', tip: 'Buka Belajar, lalu Huruf Hijaiyyah. Lihat bentuknya dan ucapkan namanya tiga kali.', render: r11 },
    { id: 12, emoji: '🧮', hij: true, maxL: 1, name: 'Urutkan Huruf', short: 'Susun 30 huruf acak dari Alif sampai Ya.', how: 'Semua 30 huruf hijaiyyah muncul dalam urutan acak. Ketuk satu per satu mulai dari Alif sampai Ya. Urutannya berbeda setiap kali main. Materi game ini tidak terpengaruh pilihan juz.', passText: 'Ada 30 huruf. Lulus jika minimal 18 huruf kamu ketuk dengan benar pada percobaan pertama, lalu kamu mendapat stiker dan sertifikat game ini.', tip: 'Nyanyikan urutannya dari Alif, Ba, Ta, Tsa, lalu cari hurufnya. Buka Belajar, Huruf Hijaiyyah untuk melihat urutan lengkap.', render: r12 },
    { id: 13, emoji: '🐍', hij: true, name: 'Ular Hijaiyyah', short: 'Makan huruf sesuai urutan, jangan sampai salah!', how: 'Gerakkan ular dengan tombol panah atau geser layar. Makan huruf yang dicari sesuai urutan hijaiyyah. Memakan huruf lain dihitung salah. Materi game ini tidak terpengaruh pilihan juz.', tip: 'Hafalkan dulu urutan hurufnya di menu Belajar, lalu arahkan ular pelan-pelan.', render: r13 },
    { id: 14, emoji: '🔔', taj: true, name: 'Tebak Hukum Tajwid', short: 'Nun sukun atau tanwin ini hukumnya apa? Pilih namanya!', how: 'Lihat contoh bacaan dengan huruf berwarna, lalu pilih nama hukum bacaannya: Izhar Halqi, Idgham Bighunnah, Idgham Bilaghunnah, Iqlab, atau Ikhfa Haqiqi. Materi game ini tidak terpengaruh pilihan juz.', tip: 'Buka Belajar, lalu Tajwid. Lihat huruf sesudah nun sukun atau tanwin, lalu cocokkan dengan kelompok hurufnya.', render: r14 },
    { id: 15, emoji: '🔎', taj: true, name: 'Cari Hukum Tajwid', short: 'Cari contoh bacaan yang sesuai dengan hukum yang diminta.', how: 'Sebuah nama hukum bacaan diberikan. Pilih contoh bacaan yang hukumnya sama. Di level tinggi, huruf berwarna tidak ditampilkan lagi. Materi game ini tidak terpengaruh pilihan juz.', tip: 'Hafalkan kelompok hurufnya: 6 huruf halqi, يَنْمُو, ل ر, ب, dan sisanya ikhfa.', render: r15 },
    { id: 16, emoji: '🤝', taj: true, name: 'Pasangkan Hukum', short: 'Cocokkan contoh, huruf, atau ciri bacaan dengan nama hukumnya.', how: 'Ketuk satu kartu di kiri, lalu ketuk nama hukum yang cocok di kanan. Setiap babak punya batas kesalahan, makin tinggi level makin ketat. Materi game ini tidak terpengaruh pilihan juz.', passText: 'Tiap level berisi 6 babak mencocokkan. Satu babak dihitung benar jika kesalahannya tidak melebihi batas level. Lulus jika minimal 4 babak benar, lalu kamu mendapat stiker dan level berikutnya terbuka.', tip: 'Mulai dari pasangan yang paling kamu yakini, supaya pilihan yang tersisa makin sedikit.', render: r16 },
    { id: 17, emoji: '🖼️', hij: true, name: 'Puzzle Huruf', short: 'Susun kepingan acak menjadi huruf hijaiyyah yang utuh.', how: 'Sebuah huruf hijaiyyah dipotong menjadi beberapa kepingan lalu diacak. Ketuk satu kepingan, lalu ketuk kepingan lain untuk menukar tempatnya sampai hurufnya utuh kembali. Makin tinggi level, kepingan makin banyak dan contoh huruf makin sulit dilihat. Materi game ini huruf hijaiyyah, bukan ayat, jadi tidak terpengaruh pilihan juz.', tip: 'Cari dulu kepingan yang mudah dikenali, seperti titik atau lengkungan, lalu susun dari pojok.', render: r17 },
    { id: 18, emoji: '👻', hij: true, name: 'Petualangan Huruf', short: 'Jelajahi labirin neon, makan huruf sesuai urutan, hindari si Nakal!', how: 'Gerakkan si Bulan Emas di labirin dengan tombol panah, keyboard, atau geser layar. Makan huruf hijaiyyah yang dicari sesuai urutan. Memakan huruf lain dihitung salah. Hindari si Nakal: kalau tertangkap, nyawa berkurang. Ambil bintang ⭐ agar si Nakal takut dan bisa diusir. Materi game ini tidak terpengaruh pilihan juz.', tip: 'Lihat dulu letak huruf yang dicari, lalu pilih jalan yang jauh dari si Nakal. Bintang membuatmu aman beberapa detik.', render: r18 }
];
GAMES.forEach(G => {
    G.levels = mkLevels(G.id);
});
