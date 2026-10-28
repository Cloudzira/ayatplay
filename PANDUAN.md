# AyatPlay Kids — Panduan Pasang

## Isi folder
- `index.html` — aplikasi (sudah memuat semua game, logo, dan splash screen)
- `manifest.webmanifest`, `sw.js`, `icons/`, `splash/` — agar bisa dipasang di layar utama dan jalan offline
- `firestore.rules` — aturan keamanan Firestore (tambahkan ke aturan Anda, jangan menimpa)
- `firebase.json` — opsional, untuk Firebase Hosting

## 1. Aktifkan Firebase (login + simpan progres)
Konfigurasi proyek `ayatplay-16f8e` sudah terpasang di `index.html`. Yang masih perlu dicek di Firebase Console:
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
   `window.AYATPLAY_FIREBASE = {...}` di bagian `<head>` pada `index.html` (ganti semua `ISI_...`).

Selama config belum diisi, tombol/kartu login tidak muncul dan aplikasi berjalan lokal.

## 2. Tayangkan (wajib HTTPS)
Unggah seluruh isi folder ke hosting HTTPS (Firebase Hosting, Netlify, GitHub Pages, dll).
Letakkan di folder atau subdomain tersendiri agar `sw.js` tidak bertabrakan dengan aplikasi lain.

## 3. Level, hadiah, dan sertifikat
- Tiap game punya 10 level (total 100), tiap level 10 soal berbeda dengan kesulitan naik bertahap. Lulus jika benar minimal 6 dari 10.
- Hadiah: stiker per level (100 stiker, 4 tingkat), lencana, bonus XP, dan sertifikat (sertifikat Hafiz Cilik + sertifikat tamat tiap game).
- Aturan lulus ada di konstanta `PASS_MIN`, tabel kesulitan per level ada di `LV` pada `index.html`.

## 4. Materi (disamakan dengan TalqinKu)
- Daftar surah: Al-Fatihah + seluruh Juz 28, 29, 30 (58 surah, 1.139 ayat) dengan ejaan nama versi Kemenag (At-Tagabun, Al-Muddassir, Asy-Syarh, Al-Kausar, Al-Lahab, dst.).
- Teks Arab dimuat dari api.quran.com (Utsmani) lalu diubah ke gaya Mushaf Standar Indonesia memakai pengolah yang sama dengan TalqinKu, termasuk perbaikan harakat lam-alif. Font: Scheherazade New.
- Terjemah: api.alquran.cloud (id.indonesian). Data disimpan di perangkat sehingga bisa offline setelah pemuatan pertama; bila gagal, dipakai 165 ayat bawaan.
- Audio/qari sama dengan TalqinKu: Anak (bawaan, dari repo GitHub), Misyari Rasyid, Al-Husary, Al-Minshawi. Bila audio "Anak" belum ada, otomatis memakai Misyari.
- Mode Belajar menampilkan Ta'awudz (Al-Fatihah) atau Bismillah (surah lain kecuali At-Taubah) dan simbol nomor ayat ۝.
- Sebelum dirilis publik, sebaiknya ditashih LPMQ Kemenag.

## 5. Game huruf hijaiyyah (game 11-13)
- Tebak Huruf, Urutkan Huruf, dan Ular Hijaiyyah memakai 30 huruf hijaiyyah, bukan ayat, jadi tidak terpengaruh pilihan juz.
- Tebak Huruf dan Ular Hijaiyyah punya 10 level x 10 soal. Urutkan Huruf hanya 1 level: semua 30 huruf muncul acak (susunan awal selalu berbeda), anak mengetuk dari Alif sampai Ya. Lulus jika minimal 18 huruf benar pada percobaan pertama; tombol Petunjuk tersedia tetapi huruf itu tidak dihitung.
- Nama dan tulisan Latin memakai penulisan yang lazim di Indonesia (Ba', Ta', Tsa, Kha', Dzal, Shad, Dhad, Tha', Zha', Ghain, Qaf, ...). Sebutan lain ala TPQ (Kho, Shod, Dhod, Tho, Zho, Ghoin, Qof, ...) tampil sebagai keterangan tambahan.
- Urutan: Alif sampai Ya, dengan Lam Alif dan Hamzah sebelum Ya (Ya = huruf ke-30). Sumber di Indonesia berbeda-beda soal letak Lam Alif dan Haa; bila ingin urutan lain, ubah daftar `HIJ` di `index.html` (nomor `i` menentukan urutan).

## 6. Layar penuh dan tampilan game satu layar
- Tombol ⛶ ada di header (beranda, belajar, dll.) dan di bar game. Di Android dan laptop langsung masuk layar penuh; di iPhone Safari tidak didukung browser, jadi aplikasi menampilkan petunjuk "Tambahkan ke Layar Utama" (setelah dipasang, aplikasi sudah layar penuh dan tombolnya disembunyikan).
- Saat bermain, header aplikasi dan menu bawah disembunyikan; hanya bar game ringkas (Keluar, judul, skor, layar penuh, suara) dan soal yang tampil.
- Soal selalu muat satu layar tanpa scroll: isi soal diskalakan otomatis (minimal sekitar 56 persen), di landscape dibagi dua kolom (kiri soal, kanan pilihan), dan di layar pendek ayat yang dipakai sebagai soal dipilih yang lebih pendek serta maksimal 4 pilihan.
- Umpan balik jawaban tampil sebagai lembar di bawah (portrait) atau panel di kiri (landscape), jadi soal tidak bergeser.
- Pada HP landscape yang sangat pendek (sekitar 320 px tinggi) teks bisa terlihat kecil; layar hasil di ukuran itu sedikit lebih padat.

## Privasi
Yang disimpan di cloud hanya: nama panggilan, XP, bintang, lencana, dan ayat yang ditandai hafal.
Pengguna bisa menghapus akun dan data cloud dari menu Aku.
