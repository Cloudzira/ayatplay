# AyatPlay Kids — Panduan Pasang

## Isi folder
- `index.html` — aplikasi (sudah memuat semua game, logo, dan splash screen)
- `manifest.webmanifest`, `sw.js`, `icons/`, `splash/` — agar bisa dipasang di layar utama dan jalan offline
- `firestore.rules` — aturan keamanan Firestore (tambahkan ke aturan Anda, jangan menimpa)
- `firebase.json` — opsional, untuk Firebase Hosting

## 1. Aktifkan Firebase (login + simpan progres)
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

## 3. Materi Juz 28, 29, 30
Saat pertama dibuka dengan internet, aplikasi mengunduh seluruh 57 surah (1.132 ayat: teks Utsmani + terjemah Indonesia)
dari api.alquran.cloud, memeriksa jumlah ayat tiap surah, lalu menyimpannya di perangkat (bisa offline).
Bila gagal atau data tidak lengkap, aplikasi memakai 165 ayat bawaan.
Sebelum dirilis, mohon dicek sampel ayatnya oleh guru ngaji/ahli tahsin.

## Privasi
Yang disimpan di cloud hanya: nama panggilan, XP, bintang, lencana, dan ayat yang ditandai hafal.
Pengguna bisa menghapus akun dan data cloud dari menu Aku.
