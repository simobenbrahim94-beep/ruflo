#!/usr/bin/env node
// Generates assets/icon.png — arc reactor icon for J.A.R.V.I.S.
// Zero external dependencies (uses built-in zlib only)
'use strict';
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const SIZE = 256;
const cx = SIZE / 2;
const cy = SIZE / 2;
const px = new Uint8ClampedArray(SIZE * SIZE * 4);

// ── Pixel helpers ─────────────────────────────────────────────────────────────
function idx(x, y) { return (y * SIZE + x) * 4; }

function blend(x, y, r, g, b, a) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = idx(x, y);
  const fa = a / 255;
  px[i]   = Math.min(255, px[i]   + r * fa) | 0;
  px[i+1] = Math.min(255, px[i+1] + g * fa) | 0;
  px[i+2] = Math.min(255, px[i+2] + b * fa) | 0;
  px[i+3] = 255;
}

// ── Background ────────────────────────────────────────────────────────────────
for (let i = 0; i < SIZE * SIZE; i++) {
  px[i*4]   = 8;
  px[i*4+1] = 10;
  px[i*4+2] = 20;
  px[i*4+3] = 255;
}

// ── Draw antialiased circle ring ──────────────────────────────────────────────
function drawRing(radius, width, r, g, b, alpha = 255) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const dist = Math.abs(d - radius);
      if (dist <= width / 2 + 1) {
        const a = Math.max(0, 1 - Math.max(0, dist - width / 2));
        blend(x, y, r, g, b, (a * alpha) | 0);
      }
    }
  }
}

// ── Draw radial glow ──────────────────────────────────────────────────────────
function drawGlow(radius, spread, r, g, b, strength = 1) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= radius + spread) {
        const t = d <= radius
          ? 1
          : 1 - (d - radius) / spread;
        const a = (Math.pow(t, 1.8) * 180 * strength) | 0;
        blend(x, y, r, g, b, a);
      }
    }
  }
}

// ── Draw radial blade ─────────────────────────────────────────────────────────
function drawBlade(angleDeg, innerR, outerR, halfW, r, g, b) {
  const angle = (angleDeg * Math.PI) / 180;
  const perp = angle + Math.PI / 2;
  for (let t = innerR; t <= outerR; t += 0.4) {
    const bx = cx + Math.cos(angle) * t;
    const by = cy + Math.sin(angle) * t;
    const progress = (t - innerR) / (outerR - innerR);
    const w = halfW * (1 - progress * 0.5);
    for (let s = -w; s <= w; s += 0.4) {
      const px_ = bx + Math.cos(perp) * s;
      const py_ = by + Math.sin(perp) * s;
      const aa = Math.max(0, 1 - Math.abs(s) / w);
      blend(px_ | 0, py_ | 0, r, g, b, (aa * 220) | 0);
    }
  }
}

// ── Draw dashed ring ──────────────────────────────────────────────────────────
function drawDashedRing(radius, width, dashAngle, gapAngle, r, g, b) {
  const total = dashAngle + gapAngle;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const dist = Math.abs(d - radius);
      if (dist <= width / 2 + 1) {
        let ang = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        if (ang % total < dashAngle) {
          const a = Math.max(0, 1 - Math.max(0, dist - width / 2));
          blend(x, y, r, g, b, (a * 200) | 0);
        }
      }
    }
  }
}

// ── Draw hexagon outline ──────────────────────────────────────────────────────
function drawHex(radius, lineW, r, g, b) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * Math.PI / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  });
  for (let s = 0; s < 6; s++) {
    const [x1, y1] = pts[s];
    const [x2, y2] = pts[(s + 1) % 6];
    const steps = Math.ceil(Math.sqrt((x2-x1)**2 + (y2-y1)**2) * 2);
    for (let t = 0; t <= steps; t++) {
      const f = t / steps;
      const x = (x1 + (x2 - x1) * f) | 0;
      const y = (y1 + (y2 - y1) * f) | 0;
      for (let ow = -lineW; ow <= lineW; ow++) {
        blend(x + ow, y, r, g, b, 160);
        blend(x, y + ow, r, g, b, 160);
      }
    }
  }
}

// ── Compose the arc reactor ───────────────────────────────────────────────────
// Ambient outer glow
drawGlow(100, 60, 0, 100, 200, 0.35);

// Outer dashed ring
drawDashedRing(115, 3, 28, 14, 0, 200, 240);

// Main rings
drawRing(95, 4, 0, 200, 255, 200);
drawRing(72, 5, 0, 220, 255, 220);
drawRing(50, 3.5, 0, 200, 240, 200);

// Inner hex
drawHex(62, 1, 0, 180, 220);

// 6 radial blades
for (let i = 0; i < 6; i++) drawBlade(i * 60, 55, 90, 3.5, 0, 210, 255);

// Core glow
drawGlow(28, 30, 0, 200, 255, 0.8);
drawGlow(14, 16, 180, 230, 255, 1);

// Inner ring tight
drawRing(34, 2.5, 0, 230, 255, 240);

// White hot center
drawGlow(10, 6, 255, 255, 255, 1.2);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (d <= 8) {
      const i = idx(x, y);
      px[i] = px[i+1] = px[i+2] = 255;
      px[i+3] = 255;
    }
  }
}

// ── PNG encoder ───────────────────────────────────────────────────────────────
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (1 + w * 4) + 1);
  }
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Write file ────────────────────────────────────────────────────────────────
const out = path.join(__dirname, '..', 'assets', 'icon.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, encodePNG(SIZE, SIZE, px));
console.log('✅ Icon generated: assets/icon.png');
