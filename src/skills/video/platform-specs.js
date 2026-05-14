/**
 * Platform specs, viral formulas, and optimization rules for each social platform.
 * Based on 2025-2026 algorithm signals and trending content analysis.
 */

export const PLATFORMS = {
  tiktok: {
    name: 'TikTok',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    maxDurationSec: 180,
    sweetSpotSec: [21, 34],         // highest completion rate
    maxFileSizeMB: 287,
    audioRequired: true,
    captionsBoost: true,            // +40% reach with captions
    hookWindowSec: 3,               // viewer decision in first 3s
    viralFormula: {
      hook: 'pattern interrupt — shock/question/bold claim in 0-3s',
      conflict: 'problem/tension established by 5s',
      buildUp: 'value delivery 5-25s — show product transformation',
      reveal: 'money shot at 75% of video',
      cta: 'last 3s — follow/link in bio/comment',
    },
    hashtagStrategy: 'mix: 3 niche (10K-100K) + 2 medium (100K-1M) + 1 trending (1M+)',
    postingPeakHours: ['06:00', '10:00', '19:00', '22:00'],
    format: 'mp4',
    codec: 'h264',
    audioBitrate: '128k',
    videoBitrate: '2500k',
  },

  instagram_reels: {
    name: 'Instagram Reels',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    maxDurationSec: 90,
    sweetSpotSec: [15, 30],
    maxFileSizeMB: 650,
    audioRequired: false,
    captionsBoost: true,
    hookWindowSec: 2,
    viralFormula: {
      hook: 'aesthetic visual hook — beauty/luxury trigger in first frame',
      conflict: 'before/after setup by 3s',
      buildUp: 'product feature showcase 3-20s — close-ups, textures',
      reveal: 'transformation/result shot — emotional payoff',
      cta: 'save this / tag someone / shop link in bio',
    },
    hashtagStrategy: '5-10 tags: mix niche + location (Maroc, Casablanca) + product category',
    postingPeakHours: ['07:00', '11:00', '17:00', '20:00'],
    format: 'mp4',
    codec: 'h264',
    audioBitrate: '128k',
    videoBitrate: '3500k',
  },

  youtube_shorts: {
    name: 'YouTube Shorts',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 60,
    maxDurationSec: 60,
    sweetSpotSec: [45, 58],         // close to 60s for watch-time signal
    maxFileSizeMB: 256,
    audioRequired: false,
    captionsBoost: false,
    hookWindowSec: 5,
    viralFormula: {
      hook: 'curiosity gap — "you will not believe..." / "how I..." / dramatic visual',
      conflict: 'problem statement clear by 8s',
      buildUp: 'step-by-step value 8-45s — educational or entertaining',
      reveal: 'satisfying resolution + surprise element',
      cta: 'subscribe for more / comment your question',
    },
    hashtagStrategy: '#Shorts mandatory + 3-5 topic tags',
    postingPeakHours: ['09:00', '15:00', '18:00'],
    format: 'mp4',
    codec: 'h264',
    audioBitrate: '192k',
    videoBitrate: '4000k',
  },

  facebook_reels: {
    name: 'Facebook Reels',
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    maxDurationSec: 90,
    sweetSpotSec: [20, 40],
    maxFileSizeMB: 1000,
    audioRequired: false,
    captionsBoost: true,
    hookWindowSec: 3,
    viralFormula: {
      hook: 'relatable situation — family/everyday Moroccan life angle',
      conflict: 'common problem audience recognizes',
      buildUp: 'product as solution — testimonial style',
      reveal: 'social proof + price reveal',
      cta: 'tag a friend who needs this / comment "oui" for link',
    },
    hashtagStrategy: '3-5 tags + location tag + product category',
    postingPeakHours: ['12:00', '18:00', '21:00'],
    format: 'mp4',
    codec: 'h264',
    audioBitrate: '128k',
    videoBitrate: '2500k',
  },
};

export const SHOT_DURATIONS = {
  hook_frame: [0.5, 1.5],       // single powerful frame
  establishing: [2, 4],          // set the scene
  close_up: [1.5, 3],            // product/face detail
  medium: [2, 4],                // subject at mid distance
  wide: [3, 5],                  // environment/context
  transition: [0.3, 0.8],        // cut/swipe/zoom transition
  money_shot: [2, 5],            // hero product moment
  cta_card: [3, 5],              // final call-to-action
};

export function getPlatformSpec(platform) {
  return PLATFORMS[platform] ?? PLATFORMS.tiktok;
}

export function formatPlatformBrief(platform) {
  const spec = getPlatformSpec(platform);
  return [
    `SPECS ${spec.name.toUpperCase()} :`,
    `  Format      : ${spec.resolution.width}×${spec.resolution.height} | ${spec.fps}fps | ${spec.aspectRatio}`,
    `  Durée cible : ${spec.sweetSpotSec[0]}-${spec.sweetSpotSec[1]}s (max ${spec.maxDurationSec}s)`,
    `  Hook window : ${spec.hookWindowSec} premières secondes — CRITIQUE`,
    `  Formule virale :`,
    `    → Hook (0-${spec.hookWindowSec}s)   : ${spec.viralFormula.hook}`,
    `    → Conflit (${spec.hookWindowSec}-8s) : ${spec.viralFormula.conflict}`,
    `    → Build-up    : ${spec.viralFormula.buildUp}`,
    `    → Reveal      : ${spec.viralFormula.reveal}`,
    `    → CTA         : ${spec.viralFormula.cta}`,
    `  Hashtags : ${spec.hashtagStrategy}`,
  ].join('\n');
}
