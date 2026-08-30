import fs from 'fs';
import zlib from 'zlib';

function createPNG(w: number, h: number) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // Filter none
    for (let x = 0; x < w; x++) {
      const idx = y * (w * 4 + 1) + 1 + x * 4;
      const nx = (x / w) * 2 - 1; // -1 to 1
      const ny = (y / h) * 2 - 1; // -1 to 1
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Rounded squircle background for PWA / Apple Touch Icon
      const isSquircle = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4) < 0.85;

      // Dumbbell & Flame / Lightning geometric shape
      const isBar = Math.abs(ny) < 0.12 && Math.abs(nx) < 0.55;
      const isLeftWeight = Math.abs(nx + 0.42) < 0.12 && Math.abs(ny) < 0.42;
      const isRightWeight = Math.abs(nx - 0.42) < 0.12 && Math.abs(ny) < 0.42;
      const isInnerLeft = Math.abs(nx + 0.28) < 0.08 && Math.abs(ny) < 0.3;
      const isInnerRight = Math.abs(nx - 0.28) < 0.08 && Math.abs(ny) < 0.3;
      const isDumbbell = isBar || isLeftWeight || isRightWeight || isInnerLeft || isInnerRight;

      if (isDumbbell) {
        // Dumbbell icon: Emerald gradient
        raw[idx] = 0x10;     // R (Emerald #10b981)
        raw[idx + 1] = 0xb9; // G
        raw[idx + 2] = 0x81; // B
        raw[idx + 3] = 0xff; // A
      } else if (isSquircle) {
        // Dark Slate metallic background (#0f172a / #1e293b gradient)
        const darkGradient = Math.floor(15 + (1 - dist) * 15);
        raw[idx] = 0x0f + darkGradient;     // R
        raw[idx + 1] = 0x17 + darkGradient; // G
        raw[idx + 2] = 0x2a + darkGradient; // B
        raw[idx + 3] = 0xff;                // A
      } else {
        // Transparent border for circular cutouts
        raw[idx] = 0x00;
        raw[idx + 1] = 0x00;
        raw[idx + 2] = 0x00;
        raw[idx + 3] = 0x00;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);

  function makeChunk(type: string, data: Buffer) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const body = Buffer.concat([chunkType, data]);
    const crcTable: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      crcTable[n] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < body.length; i++) {
      crc = crcTable[(crc ^ body[i]) & 0xff] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Generate favicon, apple-touch-icon, and PWA icons
fs.writeFileSync('public/favicon.ico', createPNG(32, 32));
fs.writeFileSync('public/favicon.png', createPNG(32, 32));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));
fs.writeFileSync('public/icons/icon-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/icons/icon-512x512.png', createPNG(512, 512));

// Generate clean SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <rect x="22" y="22" width="468" height="468" rx="106" fill="none" stroke="#334155" stroke-width="4"/>
  <!-- Dumbbell Icon Graphic -->
  <g fill="url(#emerald)">
    <!-- Central Bar -->
    <rect x="160" y="236" width="192" height="40" rx="8"/>
    <!-- Inner Plates -->
    <rect x="180" y="196" width="32" height="120" rx="10"/>
    <rect x="300" y="196" width="32" height="120" rx="10"/>
    <!-- Outer Main Plates -->
    <rect x="110" y="156" width="46" height="200" rx="14"/>
    <rect x="356" y="156" width="46" height="200" rx="14"/>
    <!-- Collars -->
    <rect x="80" y="186" width="22" height="140" rx="6"/>
    <rect x="410" y="186" width="22" height="140" rx="6"/>
  </g>
</svg>`;

fs.writeFileSync('public/icons/icon.svg', svgContent);
fs.writeFileSync('public/icon.svg', svgContent);

console.log('✨ All browser and mobile app icons generated successfully!');
