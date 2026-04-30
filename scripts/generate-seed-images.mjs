import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";

const outputDir = join(process.cwd(), "public", "seed-images");

const assets = [
  {
    file: "momo-window.png",
    title: "Momo",
    subtitle: "sunny window nap",
    palette: ["#dbeafe", "#fef3c7", "#fb7185"],
    pet: "cat",
  },
  {
    file: "latte-walk.png",
    title: "Latte",
    subtitle: "first park walk",
    palette: ["#dcfce7", "#bfdbfe", "#f97316"],
    pet: "dog",
  },
  {
    file: "tuanzi-meal.png",
    title: "Tuanzi",
    subtitle: "meal tracking",
    palette: ["#fef9c3", "#fed7aa", "#22c55e"],
    pet: "cat",
  },
  {
    file: "biscuit-clinic.png",
    title: "Biscuit",
    subtitle: "clinic notes",
    palette: ["#e0f2fe", "#fce7f3", "#2563eb"],
    pet: "dog",
  },
  {
    file: "peach-adoption.png",
    title: "Peach",
    subtitle: "looking for home",
    palette: ["#ffe4e6", "#fef3c7", "#db2777"],
    pet: "cat",
  },
  {
    file: "coco-guide.png",
    title: "Coco",
    subtitle: "grooming checklist",
    palette: ["#ccfbf1", "#e0e7ff", "#0f766e"],
    pet: "dog",
  },
];

function createPng(width, height, asset) {
  const data = Buffer.alloc((width * 4 + 1) * height);
  const [start, end, accent] = asset.palette.map(hexToRgb);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    data[rowStart] = 0;

    for (let x = 0; x < width; x++) {
      const ratio = (x / width) * 0.72 + (y / height) * 0.28;
      const wave = Math.sin((x + y) / 42) * 9;
      let color = lerpColor(start, end, ratio);
      color = color.map((value) => clamp(value + wave));

      drawSoftCircle(color, x, y, width * 0.18, height * 0.2, 240, accent, 0.2);
      drawSoftCircle(color, x, y, width * 0.82, height * 0.18, 210, accent, 0.14);
      drawSoftCircle(color, x, y, width * 0.72, height * 0.78, 300, [255, 255, 255], 0.26);

      const petColor = asset.pet === "cat" ? [255, 255, 255] : [37, 99, 235];
      const petAccent = asset.pet === "cat" ? accent : [255, 255, 255];
      if (asset.pet === "cat") {
        drawCat(color, x, y, width, height, petColor, petAccent);
      } else {
        drawDog(color, x, y, width, height, petColor, petAccent);
      }

      drawTextBars(color, x, y, width, height, accent);

      const offset = rowStart + 1 + x * 4;
      data[offset] = color[0];
      data[offset + 1] = color[1];
      data[offset + 2] = color[2];
      data[offset + 3] = 255;
    }
  }

  addBitmapText(data, width, height, asset.title.toUpperCase(), 74, 72, 5, [15, 23, 42]);
  addBitmapText(data, width, height, asset.subtitle.toUpperCase(), 78, 154, 3, [51, 65, 85]);

  return Buffer.concat([
    pngSignature(),
    pngChunk("IHDR", ihdr(width, height)),
    pngChunk("IDAT", deflateSync(data, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawCat(color, x, y, width, height, fill, accent) {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const dx = x - cx;
  const dy = y - cy;
  const head = dx * dx / 155 ** 2 + dy * dy / 135 ** 2 <= 1;
  const leftEar = pointInTriangle(x, y, cx - 118, cy - 86, cx - 68, cy - 226, cx - 16, cy - 96);
  const rightEar = pointInTriangle(x, y, cx + 118, cy - 86, cx + 68, cy - 226, cx + 16, cy - 96);
  const body = dx * dx / 220 ** 2 + (y - (cy + 190)) ** 2 / 190 ** 2 <= 1;
  if (head || leftEar || rightEar || body) blend(color, fill, 0.9);
  if ((x - (cx - 58)) ** 2 + (y - (cy - 20)) ** 2 < 13 ** 2) blend(color, accent, 0.95);
  if ((x - (cx + 58)) ** 2 + (y - (cy - 20)) ** 2 < 13 ** 2) blend(color, accent, 0.95);
  if (Math.abs(y - (cy + 42)) < 4 && Math.abs(x - cx) < 36) blend(color, accent, 0.75);
}

function drawDog(color, x, y, width, height, fill, accent) {
  const cx = width * 0.5;
  const cy = height * 0.53;
  const head = (x - cx) ** 2 / 165 ** 2 + (y - cy) ** 2 / 125 ** 2 <= 1;
  const leftEar = (x - (cx - 150)) ** 2 / 74 ** 2 + (y - (cy - 8)) ** 2 / 142 ** 2 <= 1;
  const rightEar = (x - (cx + 150)) ** 2 / 74 ** 2 + (y - (cy - 8)) ** 2 / 142 ** 2 <= 1;
  const body = (x - cx) ** 2 / 230 ** 2 + (y - (cy + 204)) ** 2 / 178 ** 2 <= 1;
  if (head || leftEar || rightEar || body) blend(color, fill, 0.9);
  if ((x - (cx - 58)) ** 2 + (y - (cy - 16)) ** 2 < 12 ** 2) blend(color, accent, 0.95);
  if ((x - (cx + 58)) ** 2 + (y - (cy - 16)) ** 2 < 12 ** 2) blend(color, accent, 0.95);
  if ((x - cx) ** 2 + (y - (cy + 36)) ** 2 < 20 ** 2) blend(color, accent, 0.85);
}

function drawTextBars(color, x, y, width, height, accent) {
  const bars = [
    [74, height - 160, 300, 18],
    [74, height - 118, 420, 18],
    [74, height - 76, 220, 18],
  ];
  for (const [bx, by, bw, bh] of bars) {
    if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) blend(color, accent, 0.45);
  }
}

function drawSoftCircle(base, x, y, cx, cy, radius, target, alpha) {
  const distance = Math.hypot(x - cx, y - cy);
  if (distance < radius) {
    blend(base, target, alpha * (1 - distance / radius));
  }
}

function addBitmapText(buffer, width, height, text, x, y, scale, color) {
  let cursor = x;
  for (const char of text) {
    const glyph = FONT[char] ?? FONT[" "];
    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col] !== "1") continue;
        fillRect(buffer, width, height, cursor + col * scale, y + row * scale, scale, scale, color);
      }
    }
    cursor += 6 * scale;
  }
}

function fillRect(buffer, width, height, x, y, w, h, color) {
  for (let py = Math.max(0, y); py < Math.min(height, y + h); py++) {
    for (let px = Math.max(0, x); px < Math.min(width, x + w); px++) {
      const offset = py * (width * 4 + 1) + 1 + px * 4;
      buffer[offset] = color[0];
      buffer[offset + 1] = color[1];
      buffer[offset + 2] = color[2];
      buffer[offset + 3] = 255;
    }
  }
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const area = Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay));
  const a1 = Math.abs((ax - px) * (by - py) - (bx - px) * (ay - py));
  const a2 = Math.abs((bx - px) * (cy - py) - (cx - px) * (by - py));
  const a3 = Math.abs((cx - px) * (ay - py) - (ax - px) * (cy - py));
  return Math.abs(area - (a1 + a2 + a3)) < 0.5;
}

function blend(base, target, alpha) {
  base[0] = clamp(base[0] * (1 - alpha) + target[0] * alpha);
  base[1] = clamp(base[1] * (1 - alpha) + target[1] * alpha);
  base[2] = clamp(base[2] * (1 - alpha) + target[2] * alpha);
}

function lerpColor(a, b, t) {
  return [
    clamp(a[0] + (b[0] - a[0]) * t),
    clamp(a[1] + (b[1] - a[1]) * t),
    clamp(a[2] + (b[2] - a[2]) * t),
  ];
}

function hexToRgb(hex) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function pngSignature() {
  return Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
}

function ihdr(width, height) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  return buffer;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const FONT = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};

await mkdir(dirname(join(outputDir, "placeholder")), { recursive: true });

for (const asset of assets) {
  await writeFile(join(outputDir, asset.file), createPng(1200, 900, asset));
}
