const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Solid rounded-corner-ish square with a simple "L" mark, drawn manually per-pixel.
function makePng(size, { bg, fg, maskable = false }) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  const bgR = parseInt(bg.slice(1, 3), 16);
  const bgG = parseInt(bg.slice(3, 5), 16);
  const bgB = parseInt(bg.slice(5, 7), 16);
  const fgR = parseInt(fg.slice(1, 3), 16);
  const fgG = parseInt(fg.slice(3, 5), 16);
  const fgB = parseInt(fg.slice(5, 7), 16);

  const safeMargin = maskable ? Math.round(size * 0.2) : 0;
  const barX = Math.round(size * 0.34);
  const barTop = Math.round(size * 0.28) + safeMargin * 0;
  const barBottom = Math.round(size * 0.72);
  const barWidth = Math.round(size * 0.1);
  const footRight = Math.round(size * 0.66);
  const footHeight = Math.round(size * 0.1);

  for (let y = 0; y < size; y++) {
    let rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const inVerticalBar =
        x >= barX && x < barX + barWidth && y >= barTop && y < barBottom;
      const inFoot =
        y >= barBottom - footHeight &&
        y < barBottom &&
        x >= barX &&
        x < footRight;
      const isMark = inVerticalBar || inFoot;

      const idx = rowStart + 1 + x * 4;
      if (isMark) {
        raw[idx] = fgR;
        raw[idx + 1] = fgG;
        raw[idx + 2] = fgB;
        raw[idx + 3] = 255;
      } else {
        raw[idx] = bgR;
        raw[idx + 1] = bgG;
        raw[idx + 2] = bgB;
        raw[idx + 3] = 255;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const bg = "#16151f";
const fg = "#818cf8";

fs.writeFileSync(path.join(outDir, "icon-192.png"), makePng(192, { bg, fg }));
fs.writeFileSync(path.join(outDir, "icon-512.png"), makePng(512, { bg, fg }));
fs.writeFileSync(
  path.join(outDir, "icon-maskable-512.png"),
  makePng(512, { bg, fg, maskable: true })
);
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), makePng(180, { bg, fg }));

console.log("Icons generated in", outDir);

// --- favicon.ico (wraps a 32x32 PNG in a minimal ICO container) ---
function makeIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width
  entry[1] = size >= 256 ? 0 : size; // height
  entry[2] = 0; // color palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // image data size
  entry.writeUInt32LE(6 + 16, 12); // offset

  return Buffer.concat([header, entry, pngBuffer]);
}

const favicon32 = makePng(32, { bg, fg });
fs.writeFileSync(
  path.join(__dirname, "..", "src", "app", "favicon.ico"),
  makeIco(favicon32, 32)
);
console.log("favicon.ico generated");
