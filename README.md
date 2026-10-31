# SIGAP
Sistem Informasi dan Gerak Aksi Penanggulangan Bencana

## Autentikasi dan Supabase

Salin `.env.example` menjadi `.env`, lalu isi URL proyek Supabase dan **publishable/anon key**. Jangan pernah menaruh `service_role` key di aplikasi. Jalankan ulang Expo setelah mengubah environment variable.

Di Supabase, aktifkan penyedia Email dan Google pada **Authentication → Providers**. Untuk Google, masukkan Google OAuth Client ID dan Secret, lalu tambahkan callback URL yang ditampilkan Supabase ke daftar redirect URI di Google Cloud. Tambahkan `sigap://auth/callback` dan `exp://**` di **Authentication → URL Configuration → Redirect URLs**. `exp://**` hanya untuk pengujian Expo Go; build aplikasi memakai skema `sigap://`. Untuk web, tambahkan URL web aplikasi yang sedang digunakan (misalnya `http://localhost:3000/auth/callback`) ke daftar yang sama.

Login Google di Expo Go memakai URL sementara `exp://` yang berbeda sesuai alamat Metro. Kode aplikasi membentuk URL ini otomatis. Expo merekomendasikan development build untuk menguji OAuth dengan skema aplikasi yang stabil; setelah memakai development build, pastikan `sigap://auth/callback` diizinkan di Supabase.

Jalankan [supabase/schema.sql](supabase/schema.sql) di Supabase SQL Editor. Baris profil dibuat otomatis saat akun baru dibuat, dan tiap pengguna hanya bisa membaca atau mengubah profilnya sendiri.

Email/password and Google sign-in both create an entry in Supabase Auth; the trigger keeps `public.profiles` in sync. Email confirmation behavior is controlled by the Supabase project's Auth settings.

## EAS development build Android

Konfigurasi build ada di `eas.json`. Untuk menyiapkan dan memasang development build di Android:

```sh
npx eas-cli login
npm run eas:init
npm run build:dev:android
npm run start:dev-client
```

Saat `eas:init`, masuk ke akun Expo yang sama dengan nilai `owner` di `app.json`; proses ini menautkan proyek dan menambahkan `extra.eas.projectId`. Setelah APK development terpasang di ponsel, jalankan server dengan `start:dev-client` lalu buka aplikasi SIGAP yang baru dipasang (bukan Expo Go). Di dashboard EAS, tambahkan `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` sebagai environment variables untuk environment `development`, `preview`, dan `production` yang digunakan build. Nilai ini adalah konfigurasi publik aplikasi; jangan masukkan Google Client Secret ke sana.
