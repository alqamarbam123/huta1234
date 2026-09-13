const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard uncompressed/deflated RGBA PNG encoder
function createPNG(width, height, getPixel) {
  // Each scanline begins with a filter byte (0 = None), followed by RGBA pixels
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    // CRC32 calculation
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: RGBA (6)
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method (none)

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC-32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Color palette
const COLOR_BG = [17, 18, 23, 255]; // #111217
const COLOR_ORANGE = [255, 90, 54, 255]; // #FF5A36
const COLOR_WHITE = [255, 255, 255, 255];

function renderHutaIcon(x, y, width, height, isMaskable = false) {
  // Normalize coords to 0..100
  const pad = isMaskable ? 18 : 8; // Maskable icons have safe padding
  const scale = (100 - pad * 2) / 100;
  
  const nx = ((x / width) * 100 - pad) / scale;
  const ny = ((y / height) * 100 - pad) / scale;

  // Background
  if (nx < 0 || nx > 100 || ny < 0 || ny > 100) {
    return isMaskable ? COLOR_BG : [0, 0, 0, 0];
  }

  // Rounded squircle background if not maskable
  if (!isMaskable) {
    const r = 24;
    const dx = Math.max(0, Math.max(r - nx, nx - (100 - r)));
    const dy = Math.max(0, Math.max(r - ny, ny - (100 - r)));
    if (dx * dx + dy * dy > r * r) {
      return [0, 0, 0, 0]; // Transparent outside corner
    }
  }

  // Left orange bar: x from 20 to 38, y from 16 to 84 (rx=9)
  const inLeftBar = nx >= 20 && nx <= 38 && ny >= 16 && ny <= 84;
  // Right orange bar: x from 62 to 80, y from 16 to 84 (rx=9)
  const inRightBar = nx >= 62 && nx <= 80 && ny >= 16 && ny <= 84;

  // Diagonal slash: line from (24, 64) to (76, 28) with thickness
  // Distance from point to line segment
  const x1 = 24, y1 = 64, x2 = 76, y2 = 28;
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((nx - x1) * dx + (ny - y1) * dy) / len2));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  const dist = Math.hypot(nx - px, ny - py);

  const inSlash = dist <= 6.5 && nx >= 22 && nx <= 78 && ny >= 26 && ny <= 66;

  // Small top-right white triangle
  const inTriangle = nx >= 66 && nx <= 88 && ny >= 16 && ny <= 28;

  if (inSlash || inTriangle) {
    return COLOR_WHITE;
  }

  if (inLeftBar || inRightBar) {
    return COLOR_ORANGE;
  }

  return COLOR_BG;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate 192x192 PNG
const png192 = createPNG(192, 192, (x, y, w, h) => renderHutaIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 2. Generate 512x512 PNG
const png512 = createPNG(512, 512, (x, y, w, h) => renderHutaIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 3. Generate 512x512 Maskable PNG (safe margin)
const pngMaskable = createPNG(512, 512, (x, y, w, h) => renderHutaIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// 4. Generate 180x180 Apple Touch Icon PNG
const png180 = createPNG(180, 180, (x, y, w, h) => renderHutaIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

// 5. Generate clean SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="24" fill="#111217"/>
  <rect x="20" y="16" width="18" height="68" rx="9" fill="#FF5A36"/>
  <rect x="62" y="16" width="18" height="68" rx="9" fill="#FF5A36"/>
  <path d="M 24 64 L 76 28 L 76 42 L 24 78 Z" fill="#FFFFFF"/>
  <polygon points="66,16 88,26 74,28" fill="#FFFFFF"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

console.log('Successfully generated all PWA icons: 192x192, 512x512, 512x512 maskable, apple-touch-icon, and icon.svg');
