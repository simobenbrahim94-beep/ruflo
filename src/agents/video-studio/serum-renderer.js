/**
 * Cinematic renderer for Sérum S1 — MBF × routines.fr (Maroc launch).
 * Brand DNA: routines.fr = clinical longevity, French pharmaceutical precision.
 * Visual language: SkinCeuticals × Typology × French editorial restraint.
 * Palette: off-white / warm charcoal / muted sand — ZERO luxury gold.
 * Finale: short-film teaser style — curiosity, mystery, hard cut to black.
 */

import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

Ffmpeg.setFfmpegPath(ffmpegStatic);

const W = 1080, H = 1920, FPS = 30;

// ── Brand palette (routines.fr) ───────────────────────────────────────────────
const C = {
  white:    '#FAFAF8',   // primary background — warm off-white
  ivory:    '#F0EBE3',   // secondary background — warmer
  paper:    '#E8E2DA',   // tertiary — slightly deeper
  charcoal: '#0F0F0F',   // primary text — near-black
  grey:     '#5A5A5A',   // secondary text
  muted:    '#9A9490',   // tertiary text / captions
  accent:   '#B8A898',   // single brand accent — warm sand
  line:     '#D4CCC4',   // dividers — very subtle
  sage:     '#4A6A5A',   // scientific / nature accent (used sparingly)
  black:    '#080808',   // teaser finale only
  darkbg:   '#111110',   // near-black for finale
};

// ── SVG helpers (clinical minimalist style) ───────────────────────────────────

const thinLine = (x1, y1, x2, y2, color = C.line, opacity = 0.7) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.6" opacity="${opacity}"/>`;

const hRule = (y, padX = W * 0.12, color = C.line, opacity = 0.65) =>
  thinLine(padX, y, W - padX, y, color, opacity);

function labelText(text, y, { color = C.muted, size = 20, spacing = 7, x = W / 2 } = {}) {
  return `<text x="${x}" y="${y}" font-family="Liberation Sans,Helvetica,Arial,sans-serif"
    font-size="${size}" fill="${color}" text-anchor="middle"
    letter-spacing="${spacing}" opacity="0.8">${text}</text>`;
}

function headlineText(text, y, { color = C.charcoal, size = 88, spacing = -1, weight = 'normal', x = W / 2 } = {}) {
  return `<text x="${x}" y="${y}" font-family="Liberation Sans,Helvetica,Arial,sans-serif"
    font-size="${size}" font-weight="${weight}" fill="${color}"
    text-anchor="middle" letter-spacing="${spacing}">${text}</text>`;
}

function bodyText(text, y, { color = C.grey, size = 34, spacing = 1, opacity = 0.88, x = W / 2 } = {}) {
  return `<text x="${x}" y="${y}" font-family="Liberation Sans,Helvetica,Arial,sans-serif"
    font-size="${size}" fill="${color}" text-anchor="middle"
    letter-spacing="${spacing}" opacity="${opacity}">${text}</text>`;
}

function dataNumber(num, y, { color = C.charcoal, size = 200, x = W / 2 } = {}) {
  return `<text x="${x}" y="${y}" font-family="Liberation Sans,Helvetica,Arial,sans-serif"
    font-size="${size}" font-weight="bold" fill="${color}"
    text-anchor="middle" letter-spacing="-6" opacity="0.92">${num}</text>`;
}

function brandMark(y = H - 160, color = C.muted) {
  return `<text x="${W / 2}" y="${y}" font-family="Liberation Sans,Helvetica,Arial,sans-serif"
    font-size="18" fill="${color}" text-anchor="middle" letter-spacing="9" opacity="0.55">ROUTINES</text>`;
}

function bgRect(color = C.white) {
  return `<rect width="${W}" height="${H}" fill="${color}"/>`;
}

// Clinical corner marks (like a lab report)
function cornerMarks(color = C.line, opacity = 0.35) {
  const s = 40;
  return `<g stroke="${color}" stroke-width="0.7" opacity="${opacity}" fill="none">
    <path d="M60,${s} L60,60 L${s},60"/>
    <path d="M${W - 60},${s} L${W - 60},60 L${W - s},60"/>
    <path d="M60,${H - s} L60,${H - 60} L${s},${H - 60}"/>
    <path d="M${W - 60},${H - s} L${W - 60},${H - 60} L${W - s},${H - 60}"/>
  </g>`;
}

// ── Scene definitions ─────────────────────────────────────────────────────────

function buildScenes(brief = {}) {
  const cy = H / 2;

  return [
    // 1 — PRODUIT (5s) — clean reveal, white background
    {
      id: 'produit', duration: 5, zoom: 'subtle-in',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="${C.white}"/>
        ${cornerMarks()}
        ${hRule(cy - 240)}
        ${labelText('LONGEVITY COMPLEX™', cy - 200, { color: C.sage, spacing: 6, size: 22 })}
        ${headlineText('SÉRUM S1', cy - 60, { size: 110, spacing: 2, weight: 'bold' })}
        ${hRule(cy + 20)}
        ${bodyText('Régénérant · Éclat · Anti-âge', cy + 100, { size: 32 })}
        ${bodyText('MBF Cosmetics pour routines.fr', cy + 155, { size: 24, color: C.muted })}
        ${brandMark()}
      </svg>`,
    },

    // 2 — SCIENCE (7s) — clinical data, large numbers
    {
      id: 'science', duration: 7, zoom: 'hold',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        ${bgRect(C.ivory)}
        ${cornerMarks()}
        ${hRule(cy - 320)}
        ${labelText('FORMULE', cy - 280, { size: 18, spacing: 9 })}
        ${dataNumber('94', cy - 80, { size: 220, color: C.charcoal })}
        ${labelText('%', cy - 100, { size: 42, color: C.accent, x: W / 2 + 130 })}
        ${hRule(cy + 30)}
        ${bodyText('d\'actifs naturels certifiés', cy + 110, { size: 34 })}
        ${bodyText('Huile d\'Argan · Rétinol végétal', cy + 165, { color: C.muted, size: 26 })}
        ${bodyText('Acide hyaluronique · Peptides', cy + 208, { color: C.muted, size: 26 })}
        ${bodyText('Eau de Rose de Damas', cy + 251, { color: C.muted, size: 26 })}
        ${hRule(cy + 310)}
        ${brandMark()}
      </svg>`,
    },

    // 3 — 28 JOURS (7s) — clinical efficacy
    {
      id: 'efficacite', duration: 7, zoom: 'subtle-up',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        ${bgRect(C.white)}
        ${cornerMarks()}
        ${hRule(cy - 290)}
        ${labelText('RÉSULTATS CLINIQUES', cy - 255, { size: 18, spacing: 8, color: C.sage })}
        ${dataNumber('28', cy - 60, { size: 210 })}
        ${labelText('JOURS', cy - 15, { size: 28, spacing: 10, color: C.accent })}
        ${hRule(cy + 50)}
        ${bodyText('Rides visiblement réduites', cy + 130, { size: 34 })}
        ${bodyText('+38% de fermeté · +56% d\'hydratation', cy + 186, { size: 28, color: C.muted })}
        ${bodyText('Testé sous contrôle dermatologique', cy + 235, { size: 24, color: C.muted })}
        ${hRule(cy + 290)}
        ${labelText('ÉTUDE SUR 200 VOLONTAIRES', cy + 330, { size: 18, spacing: 6, color: C.muted })}
        ${brandMark()}
      </svg>`,
    },

    // 4 — RÉGÉNÈRE (7s)
    {
      id: 'regenere', duration: 7, zoom: 'subtle-in',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        ${bgRect(C.paper)}
        ${cornerMarks()}
        ${hRule(cy - 200)}
        ${labelText('ACTION CELLULAIRE', cy - 165, { size: 18, spacing: 8, color: C.sage })}
        ${headlineText('RÉGÉNÈRE', cy - 30, { size: 100, spacing: 1, weight: 'bold' })}
        ${headlineText('NUIT APRÈS NUIT', cy + 80, { size: 48, color: C.accent, spacing: 3 })}
        ${hRule(cy + 140)}
        ${bodyText('Le Longevity Complex™ active', cy + 215, { size: 32 })}
        ${bodyText('la communication intercellulaire', cy + 263, { size: 32 })}
        ${bodyText('pendant votre sommeil.', cy + 311, { size: 32 })}
        ${brandMark()}
      </svg>`,
    },

    // 5 — ÉCLAT (7s)
    {
      id: 'eclat', duration: 7, zoom: 'hold',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        ${bgRect(C.ivory)}
        ${cornerMarks()}
        ${hRule(cy - 210)}
        ${labelText('RÉSULTAT VISIBLE', cy - 175, { size: 18, spacing: 8, color: C.sage })}
        ${headlineText('ÉCLAT', cy - 50, { size: 130, spacing: 2, weight: 'bold' })}
        ${headlineText('NATUREL', cy + 80, { size: 90, color: C.accent, spacing: 3 })}
        ${hRule(cy + 140)}
        ${bodyText('Teint unifié · Pores resserrés', cy + 220, { size: 34 })}
        ${bodyText('Grain de peau affiné', cy + 270, { size: 28, color: C.muted })}
        ${brandMark()}
      </svg>`,
    },

    // 6 — LE PROTOCOLE (8s) — ritual, minimal
    {
      id: 'protocole', duration: 8, zoom: 'subtle-up',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        ${bgRect(C.white)}
        ${cornerMarks()}
        ${hRule(cy - 310)}
        ${labelText('PROTOCOLE', cy - 275, { size: 18, spacing: 9 })}
        ${headlineText('VOTRE ROUTINE', cy - 90, { size: 78, spacing: 1 })}
        ${hRule(cy - 20)}
        <!-- Steps -->
        ${bodyText('01 — 2 gouttes le matin', cy + 60, { size: 32, color: C.charcoal })}
        ${bodyText('02 — Masser en mouvements circulaires', cy + 112, { size: 28, color: C.grey })}
        ${bodyText('03 — Appliquer votre crème habituelle', cy + 160, { size: 28, color: C.grey })}
        ${bodyText('04 — Répéter le soir', cy + 208, { size: 28, color: C.grey })}
        ${hRule(cy + 270)}
        ${bodyText('Peaux sensibles : testé et approuvé', cy + 330, { size: 24, color: C.muted })}
        ${brandMark()}
      </svg>`,
    },

    // 7 — MAROC EXCLUSIF (8s) — prestige, honour
    {
      id: 'maroc', duration: 8, zoom: 'subtle-in',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        ${bgRect(C.paper)}
        ${cornerMarks()}
        ${hRule(cy - 260)}
        ${labelText('UNE PREMIÈRE MONDIALE', cy - 225, { size: 18, spacing: 7, color: C.sage })}
        ${headlineText('EXCLUSIVEMENT', cy - 70, { size: 78, spacing: 1 })}
        ${headlineText('AU MAROC', cy + 40, { size: 100, spacing: 2, weight: 'bold', color: C.charcoal })}
        ${hRule(cy + 110)}
        ${bodyText('routines.fr choisit le Maroc', cy + 190, { size: 34 })}
        ${bodyText('pour le lancement mondial de', cy + 240, { size: 34 })}
        ${bodyText('son protocole Sérum S1.', cy + 290, { size: 34 })}
        ${hRule(cy + 350)}
        ${bodyText('Parce que votre peau mérite ce qu\'il y a', cy + 415, { size: 26, color: C.muted })}
        ${bodyText('de plus avancé en dermatologie française.', cy + 450, { size: 26, color: C.muted })}
        ${brandMark()}
      </svg>`,
    },

    // 8 — TEASER FINALE (14s) — short film ending, black, mystery, hard cut
    // Two sub-frames blended: question → révélation → cut
    {
      id: 'teaser-a', duration: 6, zoom: 'hold',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="${C.darkbg}"/>
        <!-- Film grain texture via noise pattern -->
        <rect width="${W}" height="${H}" fill="${C.black}" opacity="0.3"/>
        <!-- Centered quote — appears on fade-in -->
        <text x="${W / 2}" y="${H / 2 - 80}"
          font-family="Liberation Serif,Georgia,serif" font-size="52" font-weight="normal"
          fill="${C.white}" text-anchor="middle" opacity="0.92" letter-spacing="1">Certaines peaux</text>
        <text x="${W / 2}" y="${H / 2}"
          font-family="Liberation Serif,Georgia,serif" font-size="52" font-weight="normal"
          fill="${C.white}" text-anchor="middle" opacity="0.92" letter-spacing="1">ont attendu ceci</text>
        <text x="${W / 2}" y="${H / 2 + 80}"
          font-family="Liberation Serif,Georgia,serif" font-size="52" font-weight="normal"
          fill="${C.white}" text-anchor="middle" opacity="0.92" letter-spacing="1">toute leur vie.</text>
        <!-- Thin rule under -->
        ${thinLine(W * 0.35, H / 2 + 130, W * 0.65, H / 2 + 130, C.accent, 0.4)}
      </svg>`,
    },

    {
      id: 'teaser-b', duration: 8, zoom: 'hold',
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="${C.black}"/>
        <!-- Product name — clinical, restrained -->
        <text x="${W / 2}" y="${H / 2 - 100}"
          font-family="Liberation Sans,Helvetica,Arial,sans-serif" font-size="24"
          fill="${C.accent}" text-anchor="middle" letter-spacing="12" opacity="0.75">SÉRUM S1</text>
        <!-- Thin line -->
        ${thinLine(W * 0.38, H / 2 - 60, W * 0.62, H / 2 - 60, C.line, 0.3)}
        <!-- Morocco exclusivity -->
        <text x="${W / 2}" y="${H / 2 + 20}"
          font-family="Liberation Sans,Helvetica,Arial,sans-serif" font-size="34"
          fill="${C.white}" text-anchor="middle" letter-spacing="2" opacity="0.95">Disponible exclusivement</text>
        <text x="${W / 2}" y="${H / 2 + 75}"
          font-family="Liberation Sans,Helvetica,Arial,sans-serif" font-size="34"
          fill="${C.white}" text-anchor="middle" letter-spacing="2" opacity="0.95">au Maroc</text>
        <!-- Brand — very small, understated -->
        ${thinLine(W * 0.38, H / 2 + 120, W * 0.62, H / 2 + 120, C.line, 0.25)}
        <text x="${W / 2}" y="${H / 2 + 185}"
          font-family="Liberation Sans,Helvetica,Arial,sans-serif" font-size="22"
          fill="${C.muted}" text-anchor="middle" letter-spacing="8" opacity="0.65">ROUTINES</text>
        <!-- Teaser bientôt — curiosity hook -->
        <text x="${W / 2}" y="${H - 260}"
          font-family="Liberation Serif,Georgia,serif" font-size="28"
          fill="${C.accent}" text-anchor="middle" letter-spacing="2" opacity="0.8">Bientôt au Maroc</text>
        <text x="${W / 2}" y="${H - 200}"
          font-family="Liberation Sans,Helvetica,Arial,sans-serif" font-size="22"
          fill="${C.muted}" text-anchor="middle" letter-spacing="3" opacity="0.65">chez MBF Cosmetics exclusivement</text>
      </svg>`,
    },
  ];
}

// ── FFmpeg animation ──────────────────────────────────────────────────────────

function zoompanFilter(style, duration) {
  const d = duration * FPS;
  switch (style) {
    case 'subtle-in':
      // Barely perceptible push in — clinical restraint
      return `zoompan=z='if(lte(zoom,1.0),1.0,zoom+0.0005)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${d}:s=${W}x${H}:fps=${FPS}`;
    case 'subtle-up':
      // Very slow upward drift — editorial
      return `zoompan=z='1.02':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)-(${H}*0.0008*on)':d=${d}:s=${W}x${H}:fps=${FPS}`;
    case 'hold':
    default:
      // Static — pure clinical. Just scale to fill.
      return `scale=${W}:${H}`;
  }
}

async function renderScene(scene, tmpFiles) {
  const imgPath = join(tmpdir(), `rtn-frame-${scene.id}-${Date.now()}.jpg`);
  const vidPath = join(tmpdir(), `rtn-scene-${scene.id}-${Date.now()}.mp4`);
  tmpFiles.push(imgPath, vidPath);

  await sharp(Buffer.from(scene.svg())).jpeg({ quality: 97 }).toFile(imgPath);

  const vf = [
    zoompanFilter(scene.zoom, scene.duration),
    `scale=${W}:${H}`,
  ].filter(Boolean).join(',');

  // Teaser scenes: fade in from black (for film-trailer feel)
  const isTeaser = scene.id.startsWith('teaser');
  const fadePart = isTeaser ? `,fade=t=in:st=0:d=1.5:color=black` : '';

  await new Promise((resolve, reject) => {
    Ffmpeg()
      .input(imgPath)
      .inputOptions(['-loop 1'])
      .outputOptions([
        `-t ${scene.duration}`,
        '-c:v libx264',
        '-preset fast',
        '-crf 16',
        '-pix_fmt yuv420p',
        `-r ${FPS}`,
        `-vf`, `${vf}${fadePart}`,
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
  const FADE = 0.5;

  let cmd = Ffmpeg();
  for (const clip of clips) cmd = cmd.input(clip);

  let offset = durations[0] - FADE;
  let prev = '[0:v]';
  const filterParts = [];

  for (let i = 1; i < clips.length; i++) {
    const label = i < clips.length - 1 ? `[v${i}]` : '[vout]';
    // Teaser transition: fade to black then back (more dramatic)
    const transition = i >= clips.length - 2 ? 'fade' : 'fade';
    filterParts.push(
      `${prev}[${i}:v]xfade=transition=${transition}:duration=${FADE}:offset=${offset.toFixed(3)}${label}`,
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
        '-crf 16',
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
 * Render the Sérum S1 × routines.fr promotional video for Morocco launch.
 * @param {object} brief
 * @param {string|null} outputPath
 * @returns {{ localPath, durationSec, scenes }}
 */
export async function renderSerumVideo(brief = {}, outputPath) {
  const dest = outputPath ?? join(tmpdir(), `serum-s1-routines-${Date.now()}.mp4`);
  const tmpFiles = [];

  try {
    const scenes = buildScenes(brief);
    const clips = [];

    for (const scene of scenes) {
      clips.push(await renderScene(scene, tmpFiles));
    }

    const durations = scenes.map(s => s.duration);
    await assembleWithXfade(clips, durations, dest);

    return {
      localPath: dest,
      durationSec: durations.reduce((a, b) => a + b, 0),
      scenes: scenes.length,
    };
  } finally {
    await Promise.allSettled(tmpFiles.map(f => unlink(f).catch(() => {})));
  }
}
