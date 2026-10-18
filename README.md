# Core Mahoraga - Aplikasi Pencatatan Keuangan

Aplikasi Core Mahoraga: pencatatan keuangan mingguan mobile-first dengan format Rupiah (`Rp1.000.000`), pelacakan 5 pilar finansial, latar gradasi ungu-navy bergaya kartu kaca (*frosted glass*), penyimpanan lokal aman dan dukungan offline penuh.



## 📱 Fitur Utama & Alur Aplikasi

1. **Alur Buka Aplikasi**:
   - **Splash / Loading**: Animasi cincin ungu menggambar dirinya (*stroke-dashoffset*), nama aplikasi memudar masuk, transisi halus fade out.
   - **Buat Profilmu** (Saat pertama kali buka): Isi nama, target tujuan, dan tanggal target. Data tersimpan di HP dan otomatis dimuat setiap aplikasi dibuka.

2. **Gaya Desain**:
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
   - **Unduh Paket Statis (ZIP)**: Tombol unduh langsung di menu Pengaturan


Selamat mengelola keuangan mingguan menuju target finansial impian Anda! 🚀
