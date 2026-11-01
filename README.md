# SIGAP

**Sistem Informasi dan Gerak Aksi Penanggulangan Bencana** adalah aplikasi komunitas untuk melihat informasi kebencanaan, memilih lokasi pada peta, dan mengirim laporan warga.

## Fitur

- Autentikasi email dan Google melalui Supabase Auth.
- Role warga dan moderator dari profil Supabase.
- Formulir laporan dengan pemilihan lokasi di peta dan foto pendukung.
- Informasi cuaca berdasarkan lokasi perangkat melalui Open-Meteo.
- Berita kebencanaan dari feed berita eksternal.
- Build Android melalui Expo Application Services (EAS).

> **Status data:** tabel Supabase yang disiapkan saat ini adalah `profiles`. Laporan dan beberapa informasi bantuan masih memakai data lokal/contoh; laporan belum tersimpan atau tersinkron ke tabel Supabase.

## Persyaratan

- Node.js dan npm.
- Akun Supabase untuk autentikasi.
- Akun Expo untuk membuat build dengan EAS.
- Android Studio atau perangkat Android untuk menjalankan aplikasi.

## Menjalankan aplikasi

```sh
npm ci
npm start
```

Untuk menjalankan di web atau emulator, gunakan salah satu perintah berikut:

```sh
npm run web
npm run android
```

## Konfigurasi Supabase

1. Salin `.env.example` menjadi `.env`.
2. Isi URL proyek dan publishable key (atau anon key lama):

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
   ```

3. Jalankan ulang server Expo setelah mengubah `.env`.
4. Di Supabase, aktifkan penyedia **Email** dan **Google** pada **Authentication → Providers**.
5. Jalankan [`supabase/schema.sql`](supabase/schema.sql) di **SQL Editor**. Skrip ini membuat tabel `profiles` dan kebijakan akses profil.

Jangan masukkan `service_role` key atau Google OAuth Client Secret ke aplikasi maupun variabel `EXPO_PUBLIC_*`. Simpan Google Client ID dan Secret pada pengaturan penyedia Google di Supabase.

### Redirect URL OAuth

Tambahkan URL callback aplikasi ke **Authentication → URL Configuration → Redirect URLs** di Supabase:

- Development build: `sigap://auth/callback`
- Expo Go: `exp://**` (khusus pengujian Expo Go)
- Web: URL web yang digunakan, misalnya `http://localhost:8081/auth/callback`

Untuk Google OAuth, masukkan callback URL yang diberikan Supabase ke daftar redirect URI pada Google Cloud Console. Development build disarankan untuk menguji OAuth karena memakai skema `sigap://` yang stabil.

### Role moderator

Akun baru otomatis mendapat role `warga`. Untuk mengangkat akun yang sudah diverifikasi menjadi moderator, jalankan di Supabase SQL Editor:

```sql
update public.profiles
set role = 'moderator'
where email = 'alamat-moderator@example.com';
```

Role tidak dapat diubah oleh pengguna melalui aplikasi. Moderator dapat membuka tampilan moderator menggunakan kontrol role di header.

## Build Android dengan EAS

Konfigurasi profil build tersedia di [`eas.json`](eas.json):

| Profil | Kegunaan | Hasil Android |
| --- | --- | --- |
| `development` | Pengembangan dengan development client | APK |
| `preview` | Uji coba/internal distribution | APK |
| `production` | Rilis Google Play | AAB |

Login dan tautkan proyek Expo (gunakan akun yang sesuai dengan `owner` di [`app.json`](app.json)):

```sh
npx eas-cli login
npm run eas:init
```

Tambahkan `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` pada environment EAS yang digunakan (`development`, `preview`, atau `production`). Setelah itu, buat build:

```sh
npm run build:dev:android
npm run build:preview:android
npm run build:production:android
```

Untuk build development, pasang APK di perangkat lalu jalankan Metro:

```sh
npm run start:dev-client
```

Preview APK dapat dipasang langsung untuk pengujian. Build production menghasilkan Android App Bundle untuk distribusi melalui Google Play.

### Melihat build EAS

```sh
npx eas-cli build:list --platform android
npx eas-cli build:view <BUILD_ID>
```

## Catatan Android release

Aturan ProGuard untuk constructor Room dan WorkManager sudah ditambahkan pada konfigurasi Expo dan [`android/app/proguard-rules.pro`](android/app/proguard-rules.pro). Jika mengubah aturan native atau menghadapi hasil build lama, buat build baru dengan cache bersih:

```sh
npx eas-cli build --platform android --profile preview --clear-cache
```

## Layanan dan komponen pihak ketiga

SIGAP menggunakan layanan dan komponen berikut:

| Layanan/komponen | Tujuan | Data atau interaksi |
| --- | --- | --- |
| Supabase Auth | Pendaftaran dan login email/Google serta profil akun | Email dan informasi profil yang diberikan pengguna. Saat ini tabel `profiles` digunakan; laporan belum dikirim ke Supabase. |
| Open-Meteo | Mengambil prakiraan cuaca | Koordinat lokasi perangkat dikirim sebagai parameter permintaan cuaca. |
| Google News RSS | Menampilkan tautan berita kebencanaan | Aplikasi meminta feed pencarian berita; ketika berita dibuka, pengguna diarahkan ke penerbit terkait. |
| OpenStreetMap | Menampilkan peta dan ubin peta | Permintaan ubin peta dapat mengungkap alamat IP dan area peta yang dimuat ke penyedia ubin. |
| Leaflet melalui unpkg | Kode pustaka untuk menggambar peta di WebView/web | Browser/WebView mengunduh berkas JavaScript dan CSS Leaflet dari CDN unpkg. |
| Expo dan EAS | Kerangka aplikasi, modul perangkat, dan layanan build | EAS menerima kode proyek serta konfigurasi build saat proses build dijalankan. |

SIGAP juga memakai pustaka sumber terbuka, termasuk React Native, Expo, Supabase JavaScript client, dan Leaflet. Nama dan merek pihak ketiga tetap menjadi milik pemiliknya masing-masing. Layanan pihak ketiga dapat memiliki ketentuan penggunaan dan kebijakan privasi sendiri.

## Deklarasi penggunaan AI

AI generatif digunakan sebagai alat bantu selama pengembangan SIGAP, termasuk untuk membantu menyusun dan memperbaiki kode, meninjau pesan error, serta merapikan dokumentasi. Pengembang tetap bertanggung jawab untuk meninjau, menguji, dan menyetujui perubahan sebelum dirilis.

Tidak ada integrasi model AI atau layanan AI generatif yang dipanggil oleh aplikasi saat berjalan. Berdasarkan kode aplikasi saat ini, data pengguna tidak dikirim ke layanan AI.
