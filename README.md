# SIGAP
Sistem Informasi dan Gerak Aksi Penanggulangan Bencana

## Autentikasi dan Supabase

Salin `.env.example` menjadi `.env`, lalu isi URL proyek Supabase dan **publishable/anon key**. Jangan pernah menaruh `service_role` key di aplikasi. Jalankan ulang Expo setelah mengubah environment variable.

Di Supabase, aktifkan penyedia Email dan Google pada **Authentication → Providers**. Untuk Google, masukkan Google OAuth Client ID dan Secret, lalu tambahkan callback URL yang ditampilkan Supabase ke daftar redirect URI di Google Cloud. Tambahkan redirect aplikasi `sigap://auth/callback` di **Authentication → URL Configuration → Redirect URLs**. Untuk web, tambahkan URL web aplikasi (misalnya `http://localhost:8081/auth/callback`) ke daftar yang sama.

Jalankan [supabase/schema.sql](supabase/schema.sql) di Supabase SQL Editor. Baris profil dibuat otomatis saat akun baru dibuat, dan tiap pengguna hanya bisa membaca atau mengubah profilnya sendiri.

Email/password and Google sign-in both create an entry in Supabase Auth; the trigger keeps `public.profiles` in sync. Email confirmation behavior is controlled by the Supabase project's Auth settings.
