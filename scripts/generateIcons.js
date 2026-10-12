import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

function createPNG(width, height, getPixel) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (rowSize + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = (byte ^ crc) & 1;
        crc >>>= 1;
        if (bit) crc ^= 0xEDB88320;
        byte >>>= 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const chunks = [
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

// Procedural renderer for Math Mastery icon
// Royal blue / indigo background, gold/pink accents, glowing math crest
function renderMathIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / (w / 2);
  const ny = (y - cy) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background gradient: Deep Midnight Indigo to Royal Blue & Magenta hint
  const bgR = Math.round(22 + (40 - 22) * ((ny + 1) / 2));
  const bgG = Math.round(28 + (30 - 28) * ((nx + 1) / 2));
  const bgB = Math.round(79 + (140 - 79) * ((ny + 1) / 2));

  // If not maskable, round corners with smooth antialiasing
  if (!isMaskable) {
    const cornerRadius = 0.22; // smooth squircle / rounded rect
    const qx = Math.max(0, Math.abs(nx) - (1 - cornerRadius));
    const qy = Math.max(0, Math.abs(ny) - (1 - cornerRadius));
    const cornerDist = Math.sqrt(qx * qx + qy * qy);
    if (cornerDist > cornerRadius) {
      return [0, 0, 0, 0];
    }
  }

  // Safe zone scale
  const scale = isMaskable ? 0.72 : 0.85;
  const snx = nx / scale;
  const sny = ny / scale;
  const sdist = Math.sqrt(snx * snx + sny * sny);

  // Glowing Outer Gold Ring (radius ~ 0.82)
  const ringWidth = 0.045;
  const ringDist = Math.abs(sdist - 0.78);
  if (ringDist < ringWidth) {
    const intensity = 1 - ringDist / ringWidth;
    return [
      Math.round(245 * intensity + bgR * (1 - intensity)),
      Math.round(180 * intensity + bgG * (1 - intensity)),
      Math.round(50 * intensity + bgB * (1 - intensity)),
      255
    ];
  }

  // Inner Pink/Rose Accent Ring (radius ~ 0.68)
  const innerRingDist = Math.abs(sdist - 0.68);
  if (innerRingDist < 0.02) {
    const intensity = 1 - innerRingDist / 0.02;
    return [
      Math.round(236 * intensity + bgR * (1 - intensity)),
      Math.round(72 * intensity + bgG * (1 - intensity)),
      Math.round(153 * intensity + bgB * (1 - intensity)),
      255
    ];
  }

  // Draw Sigma Σ symbol in the center
  // Centered roughly in [-0.4, 0.4]
  const sigX = snx;
  const sigY = sny;
  const isSigma =
    // Top horizontal bar
    (sigY >= -0.42 && sigY <= -0.32 && sigX >= -0.32 && sigX <= 0.35) ||
    // Bottom horizontal bar
    (sigY >= 0.32 && sigY <= 0.42 && sigX >= -0.32 && sigX <= 0.35) ||
    // Upper diagonal (from (-0.3, -0.35) to (0.05, 0))
    (sigY >= -0.35 && sigY <= 0.02 && Math.abs((sigY - (-0.35)) - (sigX - (-0.3)) * (0.35 / 0.35)) < 0.07) ||
    // Lower diagonal (from (0.05, 0) to (-0.3, 0.35))
    (sigY >= -0.02 && sigY <= 0.35 && Math.abs((sigY - 0) - (- (sigX - 0.05)) * (0.35 / 0.35)) < 0.07);

  if (isSigma) {
    // Golden gradient on Sigma
    const goldGrad = (sigY + 0.4) / 0.8;
    return [
      Math.round(255 - 15 * goldGrad),
      Math.round(215 - 40 * goldGrad),
      Math.round(70 - 20 * goldGrad),
      255
    ];
  }

  // Central ambient radial glow
  if (sdist < 0.65) {
    const glow = (1 - sdist / 0.65) * 0.35;
    return [
      Math.min(255, Math.round(bgR + 180 * glow)),
      Math.min(255, Math.round(bgG + 60 * glow)),
      Math.min(255, Math.round(bgB + 160 * glow)),
      255
    ];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });

// 1. Generate PNGs
console.log('Generating pwa-192x192.png...');
const pwa192 = createPNG(192, 192, (x, y, w, h) => renderMathIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

console.log('Generating pwa-512x512.png...');
const pwa512 = createPNG(512, 512, (x, y, w, h) => renderMathIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

console.log('Generating pwa-maskable-512x512.png...');
const pwaMaskable = createPNG(512, 512, (x, y, w, h) => renderMathIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

console.log('Generating apple-touch-icon.png (180x180)...');
const appleTouch = createPNG(180, 180, (x, y, w, h) => renderMathIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// 2. Generate SVG Brand Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161c4f"/>
      <stop offset="50%" stop-color="#222b78"/>
      <stop offset="100%" stop-color="#3b1b6a"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe259"/>
      <stop offset="100%" stop-color="#ffa751"/>
    </linearGradient>
    <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Rounded App Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>

  <!-- Radial Halo -->
  <circle cx="256" cy="256" r="180" fill="url(#pinkGrad)" opacity="0.12" filter="url(#glow)"/>

  <!-- Gold Ring -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round" stroke-dasharray="880 40"/>

  <!-- Pink Inner Ring -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#pinkGrad)" stroke-width="4" stroke-opacity="0.6"/>

  <!-- Central Sigma & Math Crest -->
  <path d="M 330 160 L 180 160 L 265 256 L 180 352 L 330 352 L 330 326 L 225 326 L 285 256 L 225 186 L 330 186 Z"
        fill="url(#goldGrad)" filter="url(#glow)"/>

  <!-- Star Sparkles -->
  <circle cx="370" cy="140" r="8" fill="#ffd700" filter="url(#glow)"/>
  <circle cx="140" cy="370" r="6" fill="#f43f5e" filter="url(#glow)"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

// Copy 192 as favicon.ico fallback
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pwa192);

console.log('All PWA icons generated in public/ directory!');
