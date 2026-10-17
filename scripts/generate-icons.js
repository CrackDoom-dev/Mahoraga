import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const outDir = path.resolve('public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Create clean SVG icon matching the user prompt:
// "Logo: cincin progres ungu (#7c6cf5) tebal terisi sebagian di dalam kotak membulat gelap (#15132f), tanpa teks di ikon."
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d1850"/>
      <stop offset="50%" stop-color="#15132f"/>
      <stop offset="100%" stop-color="#0e0d22"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8f81ff"/>
      <stop offset="100%" stop-color="#7c6cf5"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <rect width="510" height="510" x="1" y="1" rx="109" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  
  <!-- Subtle background ring -->
  <circle cx="256" cy="256" r="140" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="36"/>
  
  <!-- Thick purple progress ring filled ~75% -->
  <circle cx="256" cy="256" r="140" fill="none" stroke="url(#ringGrad)" stroke-width="36"
    stroke-linecap="round"
    stroke-dasharray="879.6"
    stroke-dashoffset="220"
    transform="rotate(-90 256 256)"
    filter="url(#glow)"/>

  <!-- Inner glowing center dot -->
  <circle cx="256" cy="256" r="32" fill="#7c6cf5" opacity="0.3"/>
  <circle cx="256" cy="256" r="16" fill="#8f81ff"/>
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent, 'utf8');

// Function to calculate CRC32
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

// Generate RGBA PNG buffer
function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rows = [];
  
  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.28 : width * 0.32;
  const thickness = isMaskable ? width * 0.07 : width * 0.08;

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter type None
    
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Background: deep navy #15132f
      let r = 21, g = 19, b = 47, a = 255;
      
      // Calculate angle from 12 o'clock (-PI/2) clockwise
      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) angle += 2 * Math.PI;
      const progressAngle = angle + Math.PI / 2; // 0 to 2*PI
      
      // Progress ring condition (around 75% complete = 1.5 * Math.PI)
      if (Math.abs(dist - radius) <= thickness / 2) {
        if (progressAngle <= 1.5 * Math.PI) {
          // #8f81ff to #7c6cf5
          r = 140;
          g = 125;
          b = 250;
        } else {
          // background ring track
          r = 45;
          g = 40;
          b = 85;
        }
      } else if (dist <= width * 0.04) {
        // center dot
        r = 143;
        g = 129;
        b = 255;
      }

      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rows.push(row);
  }

  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData);

  // PNG structure
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBody = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBody), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), createPng(512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180));
console.log('Icons successfully generated!');
