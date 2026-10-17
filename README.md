# Core Mahoraga - Aplikasi Pencatatan Keuangan Mingguan PWA

Aplikasi web Progressive Web App (PWA) Core Mahoraga: pencatatan keuangan mingguan mobile-first dengan format Rupiah (`Rp1.000.000`), pelacakan 5 pilar finansial, latar gradasi ungu-navy bergaya kartu kaca (*frosted glass*), penyimpanan lokal aman (IndexedDB + LocalStorage), dan dukungan offline penuh.

---

## 📱 Fitur Utama & Alur Aplikasi

1. **Alur Buka Aplikasi**:
   - **Splash / Loading**: Animasi cincin ungu menggambar dirinya (*stroke-dashoffset*), nama aplikasi memudar masuk, transisi halus fade out.
   - **Buat Profilmu** (Saat pertama kali buka): Isi nama, target tujuan, dan tanggal target. Data tersimpan di HP dan otomatis dimuat setiap aplikasi dibuka.

2. **Gaya Desain (Sesuai Referensi)**:
   - Latar gradasi ungu-navy (`#1d1850` ➔ `#15132f` ➔ `#0e0d22`) dengan aksen ungu kebiruan (`#7c6cf5` / `#8f81ff`).
   - Kartu dan tombol semi-transparan (*glassmorphism* `backdrop-filter: blur(12px)`), sudut melengkung 20–24px.
   - Header profil dengan avatar lingkaran berpendar, level rank (`Lv.11 F-Rank` dsb), dan sapaan waktu otomatis (*Selamat Pagi/Siang/Sore/Malam*).
   - Navigasi bawah melayang berbentuk pil gelap dengan 4 tombol: **Beranda**, **Catat**, **Riwayat**, **Pengaturan**.

3. **5 Pilar Finansial (Rumus Otomatis 0–100%)**:
   - 🟣 **Income Konsisten (#8f81ff)**: Rata-rata profit (finis − modal) 4 minggu terakhir dibagi target income per minggu.
   - 🟢 **Kebutuhan Tercukupi (#3fc9b0)**: Rata-rata kebutuhan terpenuhi 4 minggu terakhir dibagi target kebutuhan mingguan.
   - 🔵 **Pengeluaran Stabil (#5aa9ff)**: 100 dikurangi koefisien variasi (CV) modal antar minggu.
   - 🟠 **Lepas dari Gali Lubang (#ffb454)**: Total bayar utang dibagi total utang.
   - 🌸 **Tabungan (#ff7aa8)**: Total disisihkan dibagi target tabungan.
   - **Progres Keseluruhan**: Rata-rata dari kelima aspek di atas.
   - **Rata-rata Grow**: Rata-rata persentase pertumbuhan (`finis / modal − 1`).

4. **Background Kustom (Foto, GIF, Video)**:
   - Disimpan langsung di **IndexedDB** sebagai file Blob lokal (tidak membebani localStorage).
   - Pengaturan slider kegelapan lapisan (*overlay*) dan tingkat blur kartu kaca.
   - Peringatan baterai untuk media video besar.

5. **Backup & Unduh Mandiri**:
   - **Ekspor & Impor JSON**: Cadangkan seluruh catatan dan target.
   - **Unduh Paket Statis (ZIP)**: Tombol unduh langsung di menu Pengaturan yang berisi paket statis siap unggah atau dijadikan APK.

---

## 📲 Cara Memasang ke Layar Utama HP (Install PWA / APK)

### Di HP Android (Google Chrome / Brave / Edge):
1. Buka aplikasi di browser Chrome HP.
2. Ketuk ikon titik tiga (⋮) di pojok kanan atas, atau tekan tombol **"Pasang Aplikasi"** di banner atas menu Pengaturan.
3. Pilih **"Tambahkan ke Layar Utama"** (*Install App*).
4. Aplikasi akan terpasang di HP Anda dengan ikon dan nama CuanMinggu, tanpa batas bar browser (*fullscreen/standalone*).

### Di iPhone / iPad (Safari):
1. Buka aplikasi di browser Safari.
2. Ketuk ikon **Share / Bagikan** (kotak dengan panah ke atas) di bar navigasi bawah Safari.
3. Gulir ke bawah lalu pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
4. Ketuk **Add** di pojok kanan atas.

### Untuk Mengubah Menjadi File APK Asli (.apk):
- **Nama Package (Application ID)**: `com.MahorgaCore.Rija`
1. Unggah website ini ke hosting gratis seperti [Vercel](https://vercel.com) atau [Netlify](https://netlify.com).
2. Kunjungi situs gratis [PWABuilder.com](https://www.pwabuilder.com).
3. Masukkan link website Anda (nama package otomatis terdeteksi: `com.MahorgaCore.Rija`).
4. Pilih **Android** lalu klik **Build APK**.
5. Unduh file `.apk` dengan package `com.MahorgaCore.Rija` dan pasang di ponsel Android Anda!

---

## ✏️ Cara Mengganti Nama & Ikon Aplikasi

1. **Mengganti Nama Aplikasi**:
   - Buka file `public/manifest.json`, ubah `"name"` dan `"short_name"`.
   - Buka file `index.html`, ubah tag `<title>` dan meta tags.
2. **Mengganti Ikon**:
   - Ganti file di folder `public/icons/`:
     - `icon-192.png` (ukuran 192x192 piksel)
     - `icon-512.png` (ukuran 512x512 piksel)
     - `icon.svg` (versi vektor SVG)

Selamat mengelola keuangan mingguan menuju target finansial impian Anda! 🚀
