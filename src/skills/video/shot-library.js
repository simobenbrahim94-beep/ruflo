/**
 * Hollywood cinematic vocabulary, prompt engineering templates,
 * and shot construction formulas for AI video generation.
 */

// ── Shot types (caméra) ──────────────────────────────────────────────────────
export const SHOT_TYPES = {
  ECU: 'Extreme Close-Up — pores, texture, détail produit micro',
  CU:  'Close-Up — visage, flacon produit, regard',
  MCU: 'Medium Close-Up — buste, expression émotionnelle',
  MS:  'Medium Shot — personnage mi-corps, interaction produit',
  MLS: 'Medium Long Shot — personnage plein + contexte',
  LS:  'Long Shot — silhouette dans environnement luxueux',
  ELS: 'Extreme Long Shot — paysage Maroc, ville de nuit',
  OTS: 'Over-The-Shoulder — point de vue intime, tutoriel',
  POV: 'Point-of-View — regarder le miroir, appliquer produit',
  DUTCH: 'Dutch Angle — tension dramatique, modernité',
  BIRD: "Bird's Eye — flat lay produit de dessus",
  WORM: "Worm's Eye — glamour, puissance, dominance de la marque",
};

// ── Mouvements caméra ────────────────────────────────────────────────────────
export const CAMERA_MOVES = {
  static:    'plan fixe, stabilisé — élégance, luxe',
  dolly_in:  'travelling avant — intimité, révélation',
  dolly_out: 'travelling arrière — grandeur, contexte',
  pan:       'panoramique horizontal — suivre mouvement, révéler espace',
  tilt_up:   'panoramique vertical haut — aspiration, pouvoir',
  tilt_down: 'panoramique vertical bas — détail, focus produit',
  handheld:  'caméra portée — authenticité, spontanéité, lifestyle',
  orbit:     '360° autour produit — showcase technique luxe',
  push_in:   'zoom avant lent — tension, focus émotionnel',
  whip_pan:  'panoramique rapide — énergie, jeunesse, TikTok vibes',
};

// ── Lighting styles ──────────────────────────────────────────────────────────
export const LIGHTING = {
  golden_hour:   'lumière dorée heure magique — chaleur, luxe naturel marocain',
  studio_high:   'studio high-key blanc — cosmétique premium, clinique, net',
  dramatic_low:  'low-key, ombres profondes — parfum, séduction, mystère',
  neon_night:    'néons colorés nuit — modernité, jeunesse urbaine Casablanca',
  soft_natural:  'lumière douce fenêtre — authenticité, soins naturels',
  candlelight:   'bougie/chaud — rituel beauté, hammam, tradition marocaine',
  backlit_glow:  'contre-jour + halo — glamour, aspiration, instagram-worthy',
  product_beam:  'beam spot sur produit — hero shot, focus total',
};

// ── Color grades (LUT styles) ────────────────────────────────────────────────
export const COLOR_GRADES = {
  luxury_gold:   'tons chauds or, teintes sépia légères, hautes lumières saturées',
  moroccan_rich: 'ocre, terracotta, bleu zellige, vert atlas — identité culturelle',
  clean_beauty:  'blanc cassé, nude, pastels — naturel, sain, minimaliste',
  cinematic:     'teal and orange cinématique — Hollywood blockbuster look',
  moody_dark:    'désaturé sombre, contrastes forts — luxe masculin, parfum',
  vibrant_pop:   'couleurs saturées éclatantes — énergie, jeunesse, viral TikTok',
  editorial:     'film grain, faded blacks — mode, editorial, haut de gamme',
};

// ── Prompt engineering templates pour AI video/image génération ─────────────
export const PROMPT_TEMPLATES = {

  product_hero: ({ product, setting, lighting, grade }) =>
    `Cinematic product hero shot, ${product}, ${setting}, ` +
    `${lighting ?? 'studio lighting with dramatic shadows'}, ` +
    `${grade ?? 'luxury gold color grade'}, ` +
    `8K resolution, photorealistic, shot on RED camera, ` +
    `shallow depth of field, bokeh background, commercial photography style, ` +
    `no text, no watermarks`,

  lifestyle_beauty: ({ subject, product, location, emotion }) =>
    `Lifestyle beauty video scene, ${subject ?? 'Moroccan woman 25-35 years old'}, ` +
    `using ${product}, in ${location ?? 'modern Casablanca apartment'}, ` +
    `expressing ${emotion ?? 'confidence and joy'}, ` +
    `golden hour lighting, cinematic composition, ` +
    `realistic skin texture, 4K quality, editorial fashion photography style`,

  transformation: ({ before, after, product }) =>
    `Split-screen before/after transformation video, ` +
    `left: ${before}, right: ${after}, ` +
    `${product} as the agent of change, ` +
    `dramatic lighting reveal, satisfying visual transition, ` +
    `high contrast, commercial beauty ad style, 4K`,

  moroccan_culture: ({ element, product, message }) =>
    `Culturally rich Moroccan scene, ${element ?? 'traditional riad courtyard in Marrakech'}, ` +
    `${product} seamlessly integrated, ` +
    `warm authentic atmosphere, zellige tiles, natural light, ` +
    `${message ?? 'premium brand meets heritage'}, ` +
    `cinematic, editorial, 4K, no text`,

  tiktok_hook: ({ action, product, surprise }) =>
    `Dynamic vertical video hook frame, 9:16 aspect ratio, ` +
    `${action ?? 'close-up hand pouring product'}, ` +
    `${product}, ` +
    `${surprise ?? 'unexpected satisfying reveal'}, ` +
    `bright colors, sharp focus, trending aesthetic, 1080x1920`,

  flat_lay: ({ products, background, props }) =>
    `Professional flat lay photography, bird's eye view, ` +
    `${products} arranged artfully, ` +
    `${background ?? 'white marble background'}, ` +
    `${props ?? 'dried flowers, gold accents, linen texture'}, ` +
    `perfectly lit, no shadows, editorial styling, 4K commercial quality`,
};

// ── Script structure templates ───────────────────────────────────────────────
export const SCRIPT_STRUCTURES = {

  product_reveal_30s: {
    name: 'Product Reveal — 30s TikTok/Reels',
    beats: [
      { beat: 'HOOK',       timing: '0-3s',   desc: 'Question choc ou scène surprising — "Tu ne vas PAS y croire..."' },
      { beat: 'PROBLÈME',   timing: '3-8s',   desc: 'Pain point universellement reconnu du public cible' },
      { beat: 'RÉVÉLATION', timing: '8-18s',  desc: 'Présentation produit + démonstration visuelle forte' },
      { beat: 'PREUVE',     timing: '18-25s', desc: 'Résultat visible, transformation, témoignage express' },
      { beat: 'CTA',        timing: '25-30s', desc: 'Action claire : lien en bio / commenter / partager' },
    ],
  },

  transformation_60s: {
    name: 'Transformation Story — 60s YouTube Shorts',
    beats: [
      { beat: 'HOOK',         timing: '0-5s',   desc: 'Résultat final d\'abord (fin révélée) — créer curiosité pour le "comment"' },
      { beat: 'CONTEXTE',     timing: '5-12s',  desc: 'Situation initiale, problème identifiable' },
      { beat: 'DÉCOUVERTE',   timing: '12-25s', desc: 'Trouver le produit — moment de turning point' },
      { beat: 'PARCOURS',     timing: '25-45s', desc: 'Utilisation étape par étape, moments clés' },
      { beat: 'TRANSFORMATION', timing: '45-55s', desc: 'Résultat dramatique, before/after, émotion' },
      { beat: 'CTA',          timing: '55-60s', desc: 'Subscribe + link + call to community' },
    ],
  },

  brand_story_90s: {
    name: 'Brand Story — 90s Reels Instagram/Facebook',
    beats: [
      { beat: 'OUVERTURE',    timing: '0-3s',   desc: 'Plan cinématique fort — établit le monde premium de la marque' },
      { beat: 'HÉROS',        timing: '3-15s',  desc: 'Présenter le personnage principal (client idéal)' },
      { beat: 'DÉSIR',        timing: '15-30s', desc: 'Ce qu\'il/elle veut — aspirations de beauté, confiance' },
      { beat: 'OBSTACLE',     timing: '30-45s', desc: 'Ce qui l\'en empêche — problème de peau, produit inefficace' },
      { beat: 'GUIDE/PRODUIT', timing: '45-65s', desc: 'La marque comme guide — expertise, qualité, culture' },
      { beat: 'TRANSFORMATION', timing: '65-80s', desc: 'Victoire — beauté retrouvée, confiance rayonnante' },
      { beat: 'INVITATION',   timing: '80-90s', desc: 'Le viewer est invité à vivre la même transformation' },
    ],
  },
};

export function buildShotList(structure, productName, platform) {
  return structure.beats.map((beat, i) => ({
    shot: i + 1,
    beat: beat.beat,
    timing: beat.timing,
    description: beat.desc,
    suggestedShot: i === 0 ? SHOT_TYPES.CU : i < 2 ? SHOT_TYPES.MS : SHOT_TYPES.MCU,
    suggestedMove: i === 0 ? CAMERA_MOVES.push_in : CAMERA_MOVES.static,
    lighting: i < 2 ? LIGHTING.dramatic_low : LIGHTING.golden_hour,
    promptHint: PROMPT_TEMPLATES.product_hero({ product: productName, setting: 'modern studio' }),
  }));
}
