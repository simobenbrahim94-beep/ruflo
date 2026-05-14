/**
 * Sérum S1 — Production pipeline example.
 * Generates a 75-second cinematic promotional short film via VideoStudioDirector.
 *
 * Usage:
 *   node examples/serum-s1-production.js
 *
 * Optional env vars (for actual video rendering):
 *   RUNWAY_API_KEY       — Runway Gen-3 video generation
 *   STABILITY_API_KEY    — Stability AI images
 *   ELEVENLABS_API_KEY   — Voice-off synthesis
 *   KLING_API_KEY        — Kling AI video alternative
 *   HEYGEN_API_KEY       — HeyGen avatar videos
 *
 * Without API keys the pipeline runs in planning mode, producing a full
 * Production Bible (brief → script → storyboard → narration → edit → strategy → trends → plan).
 */

import { VideoStudioDirector } from '../src/agents/video-studio/index.js';

const director = new VideoStudioDirector({
  elevenLabsKey: process.env.ELEVENLABS_API_KEY,
  runwayKey:     process.env.RUNWAY_API_KEY,
  stabilityKey:  process.env.STABILITY_API_KEY,
  klingKey:      process.env.KLING_API_KEY,
});

director.on('debut',     ({ produit, plateforme }) => console.log(`\n🎬  Production — ${produit} | ${plateforme}`));
director.on('step-debut',({ id }) => process.stdout.write(`   ⟳  ${id}...`));
director.on('step-fin',  ({ id, succes }) => console.log(succes ? ' ✓' : ' ✗'));
director.on('fin',       ({ succes }) => console.log(succes ? '\n✅  Pipeline complet.' : '\n⚠  Pipeline partiel.'));

const brief = {
  produit:     'Sérum S1 — sérum visage régénérant & éclat',
  marque:      'MBF Cosmetics',
  cible:       'femmes 25-45 ans, CSP+, urbaines marocaines, aspirations luxe',
  plateforme:  'instagram_reels',
  objectif:    'désir + conversion — haut de gamme',
  dureeMax:    75,
  styleVisuel: 'luxury_gold',
  langue:      'français avec touches darija',
};

const resultat = await director.produire(brief);
console.log(director.genererRapport(resultat));
