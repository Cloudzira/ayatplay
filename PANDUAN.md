# AyatPlay Kids — Panduan Pasang

## Isi folder
- `index.html` — kerangka halaman (hanya markup: logo, splash, header, menu). Gaya dan skrip dimuat dari folder `css/` dan `js/`
- `css/` — gaya tampilan, dipecah per bagian dan diberi nomor urut (urutannya penting, yang di bawah menimpa yang di atas)
- `js/` — kode aplikasi, dipecah per tugas (lihat bagian "Peta kode" di bawah)
- `manifest.webmanifest`, `sw.js`, `icons/`, `splash/` — agar bisa dipasang di layar utama dan jalan offline
- `firestore.rules` — aturan keamanan Firestore (tambahkan ke aturan Anda, jangan menimpa)
- `firebase.json` — opsional, untuk Firebase Hosting

## 1. Aktifkan Firebase (login + simpan progres)
Konfigurasi proyek `ayatplay-16f8e` sudah terpasang di `js/config.js`. Yang masih perlu dicek di Firebase Console:
- Authentication → Sign-in method: aktifkan Email/Password dan Google.
- Authentication → Settings → Authorized domains: tambahkan `ayatplay.vercel.app` (dan domain lain yang dipakai).
- Firestore Database sudah dibuat, dan aturan dari `firestore.rules` sudah ditambahkan (tanpa menimpa aturan lain).

Langkah umum bila ingin memakai proyek lain:
1. Firebase Console → proyek Anda → **Build → Authentication → Sign-in method**: aktifkan **Email/Password** dan **Google**.
2. **Authentication → Settings → Authorized domains**: tambahkan domain tempat aplikasi ini ditayangkan.
3. **Build → Firestore Database**: buat database bila belum ada.
4. **Firestore → Rules**: tambahkan blok `match /ayatplayUsers/{uid} { ... }` dari `firestore.rules`.
   Jika proyek dipakai aplikasi lain, gabungkan, jangan ganti seluruh aturan.
5. **Project settings → Your apps → Web app → SDK setup**: salin config, lalu tempel ke
   `window.AYATPLAY_FIREBASE = {...}` di file `js/config.js` (ganti semua `ISI_...`).

Selama config belum diisi, tombol/kartu login tidak muncul dan aplikasi berjalan lokal.

## 2. Tayangkan (wajib HTTPS)
Unggah seluruh isi folder ke hosting HTTPS (Firebase Hosting, Netlify, GitHub Pages, dll).
Letakkan di folder atau subdomain tersendiri agar `sw.js` tidak bertabrakan dengan aplikasi lain.

## 3. Level, hadiah, dan sertifikat
- Tiap game punya 10 level (total 100), tiap level 10 soal berbeda dengan kesulitan naik bertahap. Lulus jika benar minimal 6 dari 10.
- Hadiah: stiker per level (100 stiker, 4 tingkat), lencana, bonus XP, dan sertifikat (sertifikat Hafiz Cilik + sertifikat tamat tiap game).
- Aturan lulus ada di konstanta `PASS_MIN` (`js/core/progress.js`), tabel kesulitan per level ada di `LV` pada `js/game/levels.js`.

## 4. Materi (disamakan dengan TalqinKu)
- Daftar surah: Al-Fatihah + seluruh Juz 28, 29, 30 (58 surah, 1.139 ayat) dengan ejaan nama versi Kemenag (At-Tagabun, Al-Muddassir, Asy-Syarh, Al-Kausar, Al-Lahab, dst.).
- Teks Arab dimuat dari api.quran.com (Utsmani) lalu diubah ke gaya Mushaf Standar Indonesia memakai pengolah yang sama dengan TalqinKu, termasuk perbaikan harakat lam-alif. Font: Scheherazade New.
- Terjemah: api.alquran.cloud (id.indonesian). Data disimpan di perangkat sehingga bisa offline setelah pemuatan pertama; bila gagal, dipakai 165 ayat bawaan.
- Audio qari dari EveryAyah.com (gratis, tanpa API key): Misyari Rasyid Al-Afasy (bawaan), Al-Husary, Al-Minshawi, Abdul Basit, Maher Al-Muaiqly, As-Sudais, Asy-Syuraim, Al-Hudhaify, Abu Bakr Asy-Syatiri, Hani Ar-Rifai, dan Muhammad Ayyub. Bila file qari pilihan gagal dimuat, otomatis memakai Misyari.
- Mode Belajar menampilkan Ta'awudz (Al-Fatihah) atau Bismillah (surah lain kecuali At-Taubah) dan simbol nomor ayat ۝.
- Sebelum dirilis publik, sebaiknya ditashih LPMQ Kemenag.

## 5. Game huruf hijaiyyah (game 11-13 dan 17)
- Tebak Huruf, Urutkan Huruf, Ular Hijaiyyah, dan Puzzle Huruf memakai 30 huruf hijaiyyah, bukan ayat, jadi tidak terpengaruh pilihan juz.
- Tebak Huruf, Ular Hijaiyyah, dan Puzzle Huruf punya 10 level x 10 soal. Urutkan Huruf hanya 1 level: semua 30 huruf muncul acak (susunan awal selalu berbeda), anak mengetuk dari Alif sampai Ya. Lulus jika minimal 18 huruf benar pada percobaan pertama; tombol Petunjuk tersedia tetapi huruf itu tidak dihitung.
- Nama dan tulisan Latin memakai penulisan yang lazim di Indonesia (Ba', Ta', Tsa, Kha', Dzal, Shad, Dhad, Tha', Zha', Ghain, Qaf, ...). Sebutan lain ala TPQ (Kho, Shod, Dhod, Tho, Zho, Ghoin, Qof, ...) tampil sebagai keterangan tambahan.
- Urutan: Alif sampai Ya, dengan Lam Alif dan Hamzah sebelum Ya (Ya = huruf ke-30). Sumber di Indonesia berbeda-beda soal letak Lam Alif dan Haa; bila ingin urutan lain, ubah daftar `HIJ` di `js/data/hijaiyyah.js` (nomor `i` menentukan urutan).

### Puzzle Huruf (game 17)
- Satu huruf hijaiyyah dipotong menjadi kepingan lalu diacak. Anak mengetuk satu kepingan, lalu kepingan lain untuk menukar tempatnya, sampai hurufnya utuh. Tiap level berisi 10 puzzle (10 huruf berbeda).
- Kesulitan naik per level: 2x2 kepingan sampai 4x4 kepingan, huruf yang dipakai makin banyak (10 sampai 30 huruf), contoh huruf makin sulit dilihat (level 1-3 contoh selalu terlihat, level 4-6 contoh bisa diintip tetapi tidak dihitung benar, level 7-10 hanya nama huruf), dan mulai level 6 ada batas waktu.
- Kepingan yang tampilannya sama persis (misalnya kepingan kosong pada huruf Alif) dianggap sama, jadi anak tidak perlu menebak kepingan kosong yang mana. Bila hurufnya terlalu sederhana, jumlah kepingan dikurangi otomatis.
- Pengaturan level ada di `LV[17]` (`js/game/levels.js`), logika game di `js/game/games-puzzle.js`, gayanya di `css/21-puzzle-hijaiyyah.css`.

## 6. Layar penuh dan tampilan game satu layar
- Tombol ⛶ ada di header (beranda, belajar, dll.) dan di bar game. Di Android dan laptop langsung masuk layar penuh; di iPhone Safari tidak didukung browser, jadi aplikasi menampilkan petunjuk "Tambahkan ke Layar Utama" (setelah dipasang, aplikasi sudah layar penuh dan tombolnya disembunyikan).
- Saat bermain, header aplikasi dan menu bawah disembunyikan; hanya bar game ringkas (Keluar, judul, skor, layar penuh, suara) dan soal yang tampil.
- Soal selalu muat satu layar tanpa scroll: isi soal diskalakan otomatis (minimal sekitar 56 persen), di landscape dibagi dua kolom (kiri soal, kanan pilihan), dan di layar pendek ayat yang dipakai sebagai soal dipilih yang lebih pendek serta maksimal 4 pilihan.
- Umpan balik jawaban tampil sebagai lembar di bawah (portrait) atau panel di kiri (landscape), jadi soal tidak bergeser.
- Pada HP landscape yang sangat pendek (sekitar 320 px tinggi) teks bisa terlihat kecil; layar hasil di ukuran itu sedikit lebih padat.

## Peta kode (untuk yang ingin belajar atau mengubah)
Skrip dimuat berurutan oleh `index.html`. Urutannya penting: file di bawah boleh memakai isi file di atasnya.

| Folder | Isi |
| --- | --- |
| `js/config.js` | Konfigurasi Firebase (satu-satunya file yang biasanya perlu Anda isi) |
| `js/data/` | Data murni: ayat bawaan, gaya mushaf, katalog surah, huruf hijaiyyah |
| `js/core/` | Inti aplikasi: fungsi bantu, penyusun data, penyimpanan progres, level dan lencana, tombol (ACTIONS) |
| `js/services/` | Layanan: pemuat data Al-Qur'an, suara, audio qari, Firebase, PWA |
| `js/ui/` | Tampilan: komponen bersama, beranda, belajar, hadiah/profil, layar penuh, splash |
| `js/game/` | Mesin game, tabel level, 17 game, dan `registry.js` (daftar GAMES, dimuat paling akhir) |
| `js/main.js` | Titik mulai, dijalankan terakhir |

### Cara menambah game baru
1. Tulis fungsi render `rN(el, cfg, l)` di file game yang sesuai (atau file baru di `js/game/`).
2. Tambahkan pengaturan level di `js/game/levels.js` (`LV[N]`).
3. Daftarkan di `js/game/registry.js`: deskripsi level di `D[N]` dan entri baru di `GAMES`.
4. Tambahkan warna kartu di `GCOL` (`js/ui/home.js`) dan stiker di `MOTIFS` (`js/core/progress.js`).
5. Tambahkan file baru ke `index.html` (sebelum `registry.js`) dan ke daftar `SHELL` di `sw.js`, lalu naikkan nomor `V` di `sw.js`.

## Privasi
Yang disimpan di cloud hanya: nama panggilan, XP, bintang, lencana, dan ayat yang ditandai hafal.
Pengguna bisa menghapus akun dan data cloud dari menu Aku.
