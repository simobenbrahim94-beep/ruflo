/**
 * Cinematic renderer for MBF Cosmetics — Sérum S1 viral promotional video.
 * Visual DNA: Dior Capture Totale × Charlotte Tilbury × La Mer.
 * Tech: Sharp SVG frames → FFmpeg zoompan animation → xfade assembly.
 */

import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

Ffmpeg.setFfmpegPath(ffmpegStatic);

const W = 1080, H = 1920, FPS = 30;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  black:   '#060608',
  night:   '#0A0810',
  deep:    '#0D0B18',
  amber:   '#150D05',
  copper:  '#B87333',
  gold:    '#D4AF37',
  shine:   '#F0DC82',
  cream:   '#FAF5E6',
  white:   '#FFFFFF',
};

// ── SVG helpers ───────────────────────────────────────────────────────────────

const shine = (id = 'shine', color = C.gold) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${color}" stop-opacity="0"/>
    <stop offset="50%"  stop-color="${color}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>`;

const glowFilter = (id = 'glow', blur = 6) => `
  <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="${blur}" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

function dividerSvg(y, opacity = 0.55, id = 'shine') {
  return `<rect x="${W * 0.22}" y="${y}" width="${W * 0.56}" height="0.7" fill="url(#${id})" opacity="${opacity}"/>`;
}

function tagText(text, y, color = C.gold, spacing = 8, size = 24) {
  return `<text x="${W / 2}" y="${y}" font-family="Liberation Sans,sans-serif" font-size="${size}"
    fill="${color}" text-anchor="middle" letter-spacing="${spacing}" opacity="0.8">${text}</text>`;
}

function headlineText(text, y, color = C.gold, size = 108, spacing = 8, filter = 'glow') {
  return `<text x="${W / 2}" y="${y}" font-family="DejaVu Serif,Georgia,serif" font-size="${size}"
    font-weight="bold" fill="${color}" text-anchor="middle" letter-spacing="${spacing}"
    filter="url(#${filter})">${text}</text>`;
}

function bodyText(text, y, color = C.cream, size = 38, spacing = 4, opacity = 0.88) {
  return `<text x="${W / 2}" y="${y}" font-family="Liberation Sans,sans-serif" font-size="${size}"
    fill="${color}" text-anchor="middle" letter-spacing="${spacing}" opacity="${opacity}">${text}</text>`;
}

function brandMark(y = H - 200) {
  return `<text x="${W / 2}" y="${y}" font-family="Liberation Sans,sans-serif" font-size="20"
    fill="${C.gold}" text-anchor="middle" letter-spacing="12" opacity="0.5">MBF COSMETICS</text>`;
}

function arabesque(cx = W / 2, cy = H / 2, r = 90, color = C.gold, opacity = 0.07) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(' ');
  return `<g opacity="${opacity}" stroke="${color}" stroke-width="0.7" fill="none">
    <polygon points="${pts}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.6}"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * r * 1.4}" y2="${cy + Math.sin(a) * r * 1.4}"/>`;
    }).join('')}
  </g>`;
}

// ── Scene definitions ─────────────────────────────────────────────────────────

function buildScenes(brief = {}) {
  const prod  = brief.produit  ?? 'SERUM S1';
  const brand = brief.marque   ?? 'MBF Cosmetics';
  const target = brief.cible   ?? 'femmes 25-45';

  const cy = H / 2;

  return [
    // 1 — Hook : L'Éveil (5s)
    {
      id: 'hook', duration: 5,
      zoom: 'in', // slow push in
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s1')} ${shine('s2', C.shine)}
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stop-color="#1A1408"/>
            <stop offset="100%" stop-color="${C.black}"/>
          </radialGradient>
          ${glowFilter('glow', 10)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <rect width="${W}" height="200" fill="black" opacity="0.6"/>
        <rect y="${H - 200}" width="${W}" height="200" fill="black" opacity="0.6"/>
        ${arabesque(W / 2, cy, 200, C.gold, 0.05)}
        ${arabesque(W / 2, cy, 120, C.shine, 0.08)}
        ${dividerSvg(cy - 160, 0.5, 's1')}
        ${tagText('L\'OR VIVANT', cy - 100, C.gold, 10, 26)}
        ${headlineText('SERUM', cy + 10, C.gold, 130, 14, 'glow')}
        ${headlineText('S1', cy + 130, C.shine, 160, 20, 'glow')}
        ${dividerSvg(cy + 200, 0.5, 's1')}
        ${bodyText('MBF COSMETICS', cy + 280, C.gold, 26, 12, 0.6)}
        ${brandMark()}
      </svg>`,
    },

    // 2 — La Promesse (7s)
    {
      id: 'promesse', duration: 7,
      zoom: 'slow-up',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s')}
          <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%"   stop-color="#0C0A18"/>
            <stop offset="100%" stop-color="#08060E"/>
          </linearGradient>
          ${glowFilter('g', 6)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <rect width="${W}" height="160" fill="black" opacity="0.55"/>
        <rect y="${H - 160}" width="${W}" height="160" fill="black" opacity="0.55"/>
        ${arabesque(W / 2, cy - 80, 280, C.gold, 0.04)}
        ${dividerSvg(cy - 220, 0.45)}
        ${tagText('SÉRUM VISAGE', cy - 160, C.gold, 8, 22)}
        ${headlineText('RÉGÉNÈRE', cy - 60, C.gold, 112, 6, 'g')}
        ${headlineText('&amp; ÉCLAIRE', cy + 60, C.shine, 80, 4, 'g')}
        ${dividerSvg(cy + 140, 0.45)}
        ${bodyText('Formule Or Liquide — 94% actifs naturels', cy + 220, C.cream, 34, 2, 0.82)}
        ${bodyText('Concu pour la peau marocaine', cy + 280, C.gold, 28, 4, 0.55)}
        ${brandMark()}
      </svg>`,
    },

    // 3 — La Science (8s)
    {
      id: 'science', duration: 8,
      zoom: 'drift',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s', C.shine)}
          <linearGradient id="bg" x1="0" y1="0" x2="0.1" y2="1">
            <stop offset="0%"   stop-color="#0F0C04"/>
            <stop offset="100%" stop-color="#070608"/>
          </linearGradient>
          ${glowFilter('g', 8)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        ${arabesque(W / 2, cy, 340, C.copper, 0.06)}
        ${dividerSvg(cy - 300, 0.4, 's')}
        ${tagText('LA FORMULE', cy - 240, C.shine, 8, 24)}
        <text x="${W / 2}" y="${cy - 100}" font-family="DejaVu Serif,serif" font-size="180"
          font-weight="bold" fill="${C.gold}" text-anchor="middle" filter="url(#g)" opacity="0.95">94%</text>
        ${bodyText('D\'ACTIFS NATURELS', cy + 20, C.cream, 36, 5, 0.88)}
        ${dividerSvg(cy + 80, 0.35, 's')}
        ${bodyText('Huile d\'Argan du Maroc', cy + 160, C.gold, 30, 4, 0.65)}
        ${bodyText('Acide Hyaluronique · Peptides Or', cy + 210, C.gold, 28, 2, 0.5)}
        ${bodyText('Eau de Rose de Damas', cy + 258, C.gold, 28, 2, 0.5)}
        ${brandMark()}
      </svg>`,
    },

    // 4 — Régénère (8s)
    {
      id: 'regenere', duration: 8,
      zoom: 'in',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s', C.copper)}
          <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%"   stop-color="#150A02"/>
            <stop offset="100%" stop-color="#0A0608"/>
          </linearGradient>
          ${glowFilter('g', 6)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <rect width="${W}" height="180" fill="black" opacity="0.5"/>
        <rect y="${H - 180}" width="${W}" height="180" fill="black" opacity="0.5"/>
        ${arabesque(W / 2, cy + 40, 260, C.copper, 0.07)}
        ${dividerSvg(cy - 240, 0.4, 's')}
        ${tagText('EFFET VISIBLE', cy - 185, C.copper, 8, 24)}
        ${headlineText('RÉGÉNÈRE', cy - 60, C.copper, 100, 5, 'g')}
        ${dividerSvg(cy + 50, 0.35, 's')}
        ${bodyText('Visiblement en 7 jours', cy + 130, C.cream, 36, 3, 0.9)}
        ${bodyText('Rides réduites · Fermeté +38%', cy + 185, C.cream, 28, 2, 0.62)}
        ${bodyText('Testé sur 200 femmes', cy + 233, C.gold, 24, 4, 0.5)}
        ${brandMark()}
      </svg>`,
    },

    // 5 — Illumine (8s)
    {
      id: 'illumine', duration: 8,
      zoom: 'slow-up',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s', C.shine)}
          <radialGradient id="bg" cx="50%" cy="45%" r="60%">
            <stop offset="0%"   stop-color="#201A08"/>
            <stop offset="100%" stop-color="${C.black}"/>
          </radialGradient>
          ${glowFilter('g', 12)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <!-- light burst -->
        <ellipse cx="${W / 2}" cy="${H * 0.42}" rx="320" ry="200"
          fill="${C.shine}" opacity="0.03" filter="url(#g)"/>
        <ellipse cx="${W / 2}" cy="${H * 0.42}" rx="180" ry="110"
          fill="${C.gold}" opacity="0.05" filter="url(#g)"/>
        ${arabesque(W / 2, cy - 20, 300, C.gold, 0.05)}
        ${dividerSvg(cy - 230, 0.45, 's')}
        ${tagText('LE RITUEL DE L\'ECLAT', cy - 175, C.shine, 6, 22)}
        ${headlineText('ILLUMINE', cy - 50, C.shine, 120, 8, 'g')}
        ${dividerSvg(cy + 70, 0.4, 's')}
        ${bodyText('Teint lumineux · Glow naturel', cy + 150, C.cream, 34, 3, 0.88)}
        ${bodyText('Rougeurs estompées · Éclat immédiat', cy + 200, C.cream, 26, 2, 0.6)}
        ${brandMark()}
      </svg>`,
    },

    // 6 — Le Rituel (9s)
    {
      id: 'rituel', duration: 9,
      zoom: 'drift',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s')} ${shine('s2', C.copper)}
          <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%"   stop-color="#10080E"/>
            <stop offset="100%" stop-color="#050408"/>
          </linearGradient>
          ${glowFilter('g', 5)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        ${arabesque(W / 2, cy, 220, C.gold, 0.06)}
        ${arabesque(W / 2, cy, 350, C.copper, 0.03)}
        ${dividerSvg(cy - 260, 0.4)}
        ${tagText('CHAQUE MATIN', cy - 205, C.gold, 8, 22)}
        ${headlineText('LE RITUEL', cy - 70, C.gold, 105, 8, 'g')}
        ${dividerSvg(cy + 50, 0.35)}
        ${bodyText('2 gouttes · Massez en cercles', cy + 130, C.cream, 34, 2, 0.88)}
        ${bodyText('Le matin et le soir', cy + 180, C.cream, 28, 4, 0.6)}
        <!-- Darija line -->
        <text x="${W / 2}" y="${cy + 250}" font-family="Liberation Sans,sans-serif" font-size="28"
          fill="${C.gold}" text-anchor="middle" opacity="0.6" letter-spacing="3">Taʿala mʿa S1...</text>
        ${brandMark()}
      </svg>`,
    },

    // 7 — Résultats (8s)
    {
      id: 'resultats', duration: 8,
      zoom: 'in',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s')} ${shine('s2', C.shine)}
          <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%"   stop-color="#0C0A10"/>
            <stop offset="100%" stop-color="#060508"/>
          </linearGradient>
          ${glowFilter('g', 7)}
          <linearGradient id="split" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="${C.amber}"/>
            <stop offset="50%"  stop-color="transparent"/>
            <stop offset="100%" stop-color="${C.deep}"/>
          </linearGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <!-- Vertical split line -->
        <rect x="${W / 2 - 0.4}" y="${H * 0.2}" width="0.8" height="${H * 0.6}" fill="${C.gold}" opacity="0.25"/>
        <!-- Labels -->
        ${tagText('AVANT', H * 0.32, C.cream, 8, 22)}
        <text x="${W * 0.75}" y="${H * 0.32}" font-family="Liberation Sans,sans-serif" font-size="22"
          fill="${C.gold}" text-anchor="middle" letter-spacing="8" opacity="0.8">APRÈS</text>
        ${arabesque(W / 2, cy, 200, C.gold, 0.05)}
        ${dividerSvg(cy - 200, 0.4)}
        ${headlineText('TRANSFORMÉE', cy - 40, C.gold, 85, 4, 'g')}
        ${dividerSvg(cy + 80, 0.4)}
        <!-- Stats row -->
        ${bodyText('+38% FERMETE', cy + 160, C.shine, 30, 3, 0.85)}
        ${bodyText('+56% HYDRATATION · -42% RIDES', cy + 210, C.cream, 24, 2, 0.62)}
        ${brandMark()}
      </svg>`,
    },

    // 8 — Grand Finale (16s)
    {
      id: 'finale', duration: 16,
      zoom: 'slow-up',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          ${shine('s')} ${shine('s2', C.shine)}
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stop-color="#1C1508"/>
            <stop offset="100%" stop-color="${C.black}"/>
          </radialGradient>
          ${glowFilter('g', 12)}
          ${glowFilter('g2', 5)}
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <rect width="${W}" height="160" fill="black" opacity="0.7"/>
        <rect y="${H - 160}" width="${W}" height="160" fill="black" opacity="0.7"/>
        ${arabesque(W / 2, cy - 60, 360, C.gold, 0.05)}
        ${arabesque(W / 2, cy - 60, 240, C.shine, 0.04)}
        ${arabesque(W / 2, cy - 60, 120, C.copper, 0.07)}
        ${dividerSvg(cy - 360, 0.5)}
        <!-- Monogram MBF -->
        <text x="${W / 2}" y="${cy - 220}" font-family="DejaVu Serif,serif" font-size="170"
          font-weight="bold" fill="${C.gold}" text-anchor="middle" opacity="0.92"
          filter="url(#g)">MBF</text>
        ${dividerSvg(cy - 130, 0.6, 's2')}
        <text x="${W / 2}" y="${cy - 60}" font-family="Liberation Sans,sans-serif" font-size="30"
          fill="${C.shine}" text-anchor="middle" letter-spacing="16" opacity="0.85">COSMETICS</text>
        ${dividerSvg(cy, 0.45)}
        ${headlineText('SÉRUM S1', cy + 110, C.gold, 100, 10, 'g')}
        ${dividerSvg(cy + 200, 0.45)}
        ${bodyText('Régénérant &amp; Éclat', cy + 280, C.cream, 34, 4, 0.85)}
        ${bodyText('Disponible maintenant', cy + 340, C.gold, 26, 6, 0.65)}
        ${bodyText('@mbfcosmetics.ma', cy + 400, C.shine, 28, 4, 0.7)}
        ${brandMark(H - 110)}
      </svg>`,
    },
  ];
}

// ── FFmpeg animation ──────────────────────────────────────────────────────────

function zoompanFilter(style, duration) {
  const d = duration * FPS;
  switch (style) {
    case 'in':
      return `zoompan=z='if(lte(zoom,1.0),1.0,zoom+0.0012)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${d}:s=${W}x${H}:fps=${FPS}`;
    case 'slow-up':
      return `zoompan=z='1.04':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)-(${H}*0.002*on)':d=${d}:s=${W}x${H}:fps=${FPS}`;
    case 'drift':
      return `zoompan=z='1.03':x='iw/2-(iw/zoom/2)+(${W}*0.001*on)':y='ih/2-(ih/zoom/2)':d=${d}:s=${W}x${H}:fps=${FPS}`;
    default:
      return `scale=${W}:${H}`;
  }
}

async function renderScene(scene, tmpFiles) {
  const imgPath = join(tmpdir(), `mbf-frame-${scene.id}-${Date.now()}.jpg`);
  const vidPath = join(tmpdir(), `mbf-scene-${scene.id}-${Date.now()}.mp4`);
  tmpFiles.push(imgPath, vidPath);

  // 1. Render SVG → JPEG
  await sharp(Buffer.from(scene.svg())).jpeg({ quality: 96 }).toFile(imgPath);

  // 2. Animate with zoompan
  const vf = [
    zoompanFilter(scene.zoom, scene.duration),
    `scale=${W}:${H}`,
    // Cinematic vignette via eq
    'vignette=PI/5',
  ].join(',');

  await new Promise((resolve, reject) => {
    Ffmpeg()
      .input(imgPath)
      .inputOptions(['-loop 1'])
      .outputOptions([
        `-t ${scene.duration}`,
        '-c:v libx264',
        '-preset fast',
        '-crf 18',
        '-pix_fmt yuv420p',
        `-r ${FPS}`,
        `-vf`, vf,
      ])
      .output(vidPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  return vidPath;
}

// ── Assembly via chained xfade ────────────────────────────────────────────────

async function assembleWithXfade(clips, durations, outputPath) {
  const FADE = 0.6;

  let cmd = Ffmpeg();
  for (const clip of clips) cmd = cmd.input(clip);

  let offset = durations[0] - FADE;
  let prev = '[0:v]';
  const filterParts = [];

  for (let i = 1; i < clips.length; i++) {
    const label = i < clips.length - 1 ? `[v${i}]` : '[vout]';
    filterParts.push(
      `${prev}[${i}:v]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(3)}${label}`,
    );
    prev = label;
    offset += durations[i] - FADE;
  }

  await new Promise((resolve, reject) => {
    cmd
      .complexFilter(filterParts.join(';'))
      .outputOptions([
        '-map [vout]',
        '-c:v libx264',
        '-preset medium',
        '-crf 17',
        '-pix_fmt yuv420p',
        `-r ${FPS}`,
        '-movflags +faststart',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Render the full cinematic Sérum S1 promotional video.
 * @param {object} brief  – same shape as VideoStudioDirector brief
 * @param {string} outputPath – final MP4 path (defaults to tmpdir)
 * @returns {{ localPath: string, durationSec: number, scenes: number }}
 */
export async function renderSerumVideo(brief = {}, outputPath) {
  const dest = outputPath ?? join(tmpdir(), `serum-s1-${Date.now()}.mp4`);
  const tmpFiles = [];

  try {
    const scenes = buildScenes(brief);

    // Render all scenes in sequence (zoompan is CPU-heavy, keep sequential)
    const clips = [];
    for (const scene of scenes) {
      const path = await renderScene(scene, tmpFiles);
      clips.push(path);
    }

    const durations = scenes.map(s => s.duration);
    await assembleWithXfade(clips, durations, dest);

    const totalSec = durations.reduce((a, b) => a + b, 0);
    return { localPath: dest, durationSec: totalSec, scenes: scenes.length };
  } finally {
    // Clean up intermediate files
    await Promise.allSettled(tmpFiles.map(f => unlink(f).catch(() => {})));
  }
}
