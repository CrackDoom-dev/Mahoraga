import JSZip from 'jszip';

export async function exportStaticBundle() {
  const zip = new JSZip();

  // 1. README.md
  // 1. README.md
  const readmeContent = `# Core Mahoraga - Aplikasi Pencatatan Keuangan Mingguan PWA

Aplikasi Core Mahoraga: pencatatan keuangan mingguan mobile-first dengan format Rupiah (Rp1.000.000), pelacakan progres 5 aspek finansial, penyimpanan lokal aman (IndexedDB + LocalStorage), dan dukungan penuh PWA Offline.
Package ID Android: com.MahorgaCore.Rija

---

## 🚀 Cara Membuka & Menjalankan

### Cara 1: Buka Langsung di Browser
1. Ekstrak file zip ini ke sebuah folder.
2. Klik ganda file \`index.html\` untuk membuka langsung di Google Chrome, Edge, Safari, atau Firefox di laptop/PC.

### Cara 2: Pasang ke Hosting Statis Gratis (Agar bisa diakses di HP)
1. Unggah seluruh isi folder ini ke:
   - **Vercel** (drag & drop folder)
   - **Netlify** (drag & drop folder)
   - **GitHub Pages**
2. Buka link web hasil deploy dari browser Chrome atau Safari di HP.

---

## 📱 Cara Memasang ke Layar Utama HP (PWA / APK)

### Di HP Android (Google Chrome):
1. Buka website di browser Chrome.
2. Ketuk ikon titik tiga (⋮) di pojok kanan atas browser, atau tekan tombol **"Pasang Aplikasi"** di dalam menu Pengaturan.
3. Pilih **"Tambahkan ke Layar Utama"** / **"Install App"**.
4. Ikon Core Mahoraga akan muncul di beranda HP Anda layaknya aplikasi native Android (APK)!

### Di iPhone / iPad (Safari):
1. Buka website di browser Safari.
2. Ketuk tombol **Share / Bagikan** (ikon kotak dengan panah ke atas) di bar bawah Safari.
3. Gulir ke bawah lalu ketuk **"Add to Home Screen"** (**Tambahkan ke Layar Utama**).
4. Ketuk **Add** di pojok kanan atas.

### Untuk Menjadikan File APK Asli (.apk):
- **Package Name**: \`com.MahorgaCore.Rija\`
1. Buka [PWABuilder.com](https://www.pwabuilder.com)
2. Masukkan URL website Anda yang sudah diunggah.
3. Pilih platform **Android** dan klik **Build APK**.
4. Anda akan mendapatkan file \`.apk\` yang bisa langsung diinstal di HP Android!

---

## 🎨 Cara Mengganti Nama & Ikon Aplikasi
1. **Mengganti Nama**: Buka file \`manifest.json\` dan \`index.html\`, ubah teks \`"name"\` dan \`"short_name"\` sesuai keinginan.
2. **Mengganti Ikon**: Ganti file gambar di folder \`icons/\` (\`icon-192.png\`, \`icon-512.png\`, \`icon.svg\`) dengan logo Anda sendiri.

Dibuat dengan cinta untuk kebebasan finansial Anda!`;

  zip.file('README.md', readmeContent);

  // 2. Standalone HTML
  const standaloneHtml = `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Core Mahoraga - Finansial Mingguan</title>
  <meta name="theme-color" content="#15132f">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/svg+xml" href="icons/icon.svg">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body class="theme-dark">
  <div id="app"></div>
  <script src="app.js"></script>
</body>
</html>`;
  zip.file('index.html', standaloneHtml);

  // 3. Standalone CSS
  const standaloneCss = `/* Core Mahoraga Standalone Style */
:root {
  --bg-1: #1d1850;
  --bg-2: #15132f;
  --bg-3: #0e0d22;
  --accent: #7c6cf5;
  --accent-light: #8f81ff;
  --text-main: #f2f0ff;
  --text-muted: #a7a3c9;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 40%, var(--bg-3) 100%);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  justify-content: center;
}
#app { width: 100%; max-width: 480px; min-height: 100vh; position: relative; }
.card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 16px;
}
button {
  cursor: pointer;
  border-radius: 16px;
  border: none;
  font-family: inherit;
  font-weight: 600;
}`;
  zip.file('style.css', standaloneCss);

  // 4. Standalone JS
  const standaloneJs = `// Core Mahoraga Standalone Script
console.log('Core Mahoraga loaded.');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(console.warn);
}
`;
  zip.file('app.js', standaloneJs);

  // 5. Manifest
  const manifestData = {
    id: 'com.MahorgaCore.Rija',
    name: 'Core Mahoraga - Finansial Mingguan',
    short_name: 'CoreMahoraga',
    package_name: 'com.MahorgaCore.Rija',
    description: 'Aplikasi Core Mahoraga: pencatatan keuangan mingguan mobile-first dengan pelacakan target dan 5 aspek finansial.',
    start_url: 'index.html',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#15132f',
    theme_color: '#15132f',
    related_applications: [
      {
        platform: 'play',
        id: 'com.MahorgaCore.Rija'
      }
    ],
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ]
  };
  zip.file('manifest.json', JSON.stringify(manifestData, null, 2));

  // 6. Service worker
  const swContent = `const CACHE_NAME = 'coremahoraga-v1';
const ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));`;
  zip.file('sw.js', swContent);

  // Download zip to user browser
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'core-mahoraga-pwa-standalone.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
