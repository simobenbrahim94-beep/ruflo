'use strict';
// JARVIS visual & video production engine
// - Image generation via Replicate (Flux) or Stability AI
// - Promotional video generation via Replicate (Zeroscope)
// - Slideshow video composition via ffmpeg (local, no API needed)
// - Multi-format package for social media / web / print

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');
const execAsync = promisify(exec);

const STYLES = {
  photorealistic: 'photorealistic, 8k ultra-detailed, professional photography, sharp focus, DSLR quality, studio lighting',
  cinematic:      'cinematic, dramatic lighting, film grain, anamorphic lens, movie quality, depth of field, color graded',
  corporate:      'professional corporate, clean minimalist, bright studio lighting, premium business aesthetic, sleek',
  luxury:         'luxury premium brand, elegant sophisticated, high-end, gold and dark tones, exclusive atmosphere',
  social_media:   'vibrant eye-catching, social media optimized, dynamic composition, bold colors, trendy aesthetic, scroll-stopping',
  product:        'commercial product photography, studio lighting, clean background, sharp detail, advertising quality, hero shot',
  futuristic:     'futuristic sci-fi, blue neon glow, sleek modern tech, holographic, cyberpunk aesthetic, dark background',
};

const NEGATIVE_PROMPT = 'blurry, low quality, distorted, watermark, text, ugly, deformed, noise, grainy, out of focus';

class VisualsService {
  constructor() {
    this.replicateKey  = null;
    this.stabilityKey  = null;
    this.outputDir     = null;
  }

  init(config) {
    this.replicateKey = config.replicateKey  || null;
    this.stabilityKey = config.stabilityKey || null;
    this.outputDir    = path.join(os.homedir(), 'Desktop', 'JARVIS-Visuels');
    if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });
  }

  // ── Internal helpers ────────────────────────────────────────────────────────
  async _postJson(url, headers, body) {
    const tmp = path.join(os.tmpdir(), `jarvis-vis-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify(body));
    const hdr = Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
    try {
      const { stdout } = await execAsync(`curl -s --max-time 30 -X POST "${url}" ${hdr} --data @"${tmp}"`);
      return stdout;
    } finally {
      try { fs.unlinkSync(tmp); } catch (_) {}
    }
  }

  async _pollReplicate(id, maxMs = 180000) {
    const deadline = Date.now() + maxMs;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3500));
      const { stdout } = await execAsync(
        `curl -s --max-time 15 "https://api.replicate.com/v1/predictions/${id}" -H "Authorization: Bearer ${this.replicateKey}"`
      );
      const r = JSON.parse(stdout);
      if (r.status === 'succeeded') return { ok: true,  output: r.output };
      if (r.status === 'failed')    return { ok: false, error: r.error || 'Unknown error' };
    }
    return { ok: false, error: 'Timeout — génération trop longue.' };
  }

  async _download(url, type) {
    const ext      = type === 'video' ? 'mp4' : 'jpg';
    const filename = `jarvis-${type}-${Date.now()}.${ext}`;
    const filepath = path.join(this.outputDir, filename);
    await execAsync(`curl -sL --max-time 90 "${url}" -o "${filepath}"`);
    if (type === 'video') {
      await execAsync(`open "${this.outputDir}"`);
    } else {
      await execAsync(`open "${filepath}"`);
    }
    return `${type === 'video' ? 'Vidéo' : 'Image'} sauvegardée: ${filepath}`;
  }

  _aspectToSize(ratio) {
    const map = { '16:9': [1344, 768], '9:16': [768, 1344], '1:1': [1024, 1024], '4:3': [1152, 896], '3:4': [896, 1152] };
    return map[ratio] || [1024, 1024];
  }

  // ── Image generation ────────────────────────────────────────────────────────
  async generateImage(prompt, style = 'photorealistic', aspectRatio = '16:9') {
    if (!this.replicateKey && !this.stabilityKey) {
      return 'Configurez une clé API Replicate ou Stability AI dans les paramètres JARVIS pour générer des visuels.';
    }
    const enhancement = STYLES[style] || STYLES.photorealistic;
    const fullPrompt  = `${prompt}, ${enhancement}`;

    if (this.replicateKey) return this._imageViaReplicate(fullPrompt, aspectRatio);
    return this._imageViaStability(fullPrompt, aspectRatio);
  }

  async _imageViaReplicate(prompt, aspectRatio) {
    try {
      // Prefer synchronous result (Prefer: wait = up to 60s inline)
      const raw  = await this._postJson(
        'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
        {
          'Authorization': `Bearer ${this.replicateKey}`,
          'Content-Type':  'application/json',
          'Prefer':        'wait=60',
        },
        { input: { prompt, aspect_ratio: aspectRatio, output_format: 'jpg', output_quality: 92, go_fast: true } }
      );

      const pred = JSON.parse(raw);
      if (pred.output) {
        const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
        return this._download(url, 'image');
      }
      if (pred.id) {
        const result = await this._pollReplicate(pred.id, 120000);
        if (result.ok) {
          const url = Array.isArray(result.output) ? result.output[0] : result.output;
          return this._download(url, 'image');
        }
        return `Génération échouée: ${result.error}`;
      }
      return `Erreur Replicate: ${raw.slice(0, 200)}`;
    } catch (err) {
      return `Erreur image (Replicate): ${err.message}`;
    }
  }

  async _imageViaStability(prompt, aspectRatio) {
    const [width, height] = this._aspectToSize(aspectRatio);
    try {
      const raw = await this._postJson(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        { 'Authorization': `Bearer ${this.stabilityKey}`, 'Content-Type': 'application/json' },
        {
          text_prompts: [
            { text: prompt, weight: 1 },
            { text: NEGATIVE_PROMPT, weight: -1 },
          ],
          cfg_scale: 7.5,
          width,
          height,
          samples: 1,
          steps: 35,
        }
      );
      const d = JSON.parse(raw);
      if (!d.artifacts?.[0]) return `Erreur Stability AI: ${raw.slice(0, 200)}`;
      const filename = `jarvis-image-${Date.now()}.jpg`;
      const filepath = path.join(this.outputDir, filename);
      fs.writeFileSync(filepath, Buffer.from(d.artifacts[0].base64, 'base64'));
      await execAsync(`open "${filepath}"`);
      return `Image générée: ${filepath}`;
    } catch (err) {
      return `Erreur image (Stability AI): ${err.message}`;
    }
  }

  // ── Video generation ────────────────────────────────────────────────────────
  async generateVideo(prompt, style = 'cinematic') {
    if (!this.replicateKey) {
      return 'Clé API Replicate requise pour la génération vidéo IA. Ajoutez-la dans les paramètres JARVIS.';
    }
    const enhancement = STYLES[style] || STYLES.cinematic;
    const fullPrompt  = `${prompt}, ${enhancement}`;

    try {
      const raw = await this._postJson(
        'https://api.replicate.com/v1/models/anotherjesse/zeroscope-v2-xl/predictions',
        { 'Authorization': `Bearer ${this.replicateKey}`, 'Content-Type': 'application/json' },
        { input: { prompt: fullPrompt, width: 1024, height: 576, num_frames: 24, num_inference_steps: 25, guidance_scale: 7.5 } }
      );
      const pred = JSON.parse(raw);
      if (!pred.id) return `Erreur création: ${raw.slice(0, 200)}`;

      const result = await this._pollReplicate(pred.id, 360000); // 6 min max for video
      if (result.ok) {
        const url = Array.isArray(result.output) ? result.output[0] : result.output;
        return this._download(url, 'video');
      }
      return `Génération vidéo échouée: ${result.error}`;
    } catch (err) {
      return `Erreur génération vidéo: ${err.message}`;
    }
  }

  // ── Promotional package (multi-format images) ───────────────────────────────
  async createPromoPackage(brand, topic, style = 'corporate') {
    if (!this.replicateKey && !this.stabilityKey) {
      return 'Configurez une clé API Replicate ou Stability AI dans les paramètres JARVIS.';
    }
    const formats = [
      { ratio: '16:9', label: 'Bannière web / YouTube / LinkedIn' },
      { ratio: '1:1',  label: 'Post Instagram / Facebook / Twitter' },
      { ratio: '9:16', label: 'Story / Reels / TikTok vertical' },
    ];
    const results = [];
    for (const fmt of formats) {
      const prompt = `Promotional visual for ${brand}: ${topic}, ${fmt.label} format`;
      const res    = await this.generateImage(prompt, style, fmt.ratio);
      results.push(`• ${fmt.label}: ${res}`);
    }
    return `Package promotionnel "${brand}" — style ${style}:\n${results.join('\n')}\n\nDossier: ${this.outputDir}`;
  }

  // ── ffmpeg slideshow from generated images ──────────────────────────────────
  async createSlideshowVideo(imagePaths, title = '', outputName = 'promo') {
    try { await execAsync('which ffmpeg 2>/dev/null'); }
    catch { return 'ffmpeg non installé. Installez-le avec: brew install ffmpeg'; }

    const images = (Array.isArray(imagePaths) ? imagePaths : [imagePaths]).filter(p => {
      try { return fs.existsSync(p); } catch { return false; }
    });
    if (!images.length) return 'Aucune image valide fournie pour le slideshow.';

    const listFile = path.join(os.tmpdir(), `jarvis-slides-${Date.now()}.txt`);
    const listContent = images.map(p => `file '${p}'\nduration 3.5`).join('\n')
      + `\nfile '${images[images.length - 1]}'`;
    fs.writeFileSync(listFile, listContent);

    const safeTitle = (title || '').replace(/[^a-zA-Z0-9 À-ÿ.,!]/g, '');
    const titleFilter = safeTitle
      ? `,drawtext=text='${safeTitle}':fontcolor=white:fontsize=52:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-th-50`
      : '';

    const outputPath = path.join(this.outputDir, `${outputName.replace(/[^a-zA-Z0-9_-]/g, '_')}-${Date.now()}.mp4`);
    const vf = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1${titleFilter}`;
    const cmd = `ffmpeg -f concat -safe 0 -i "${listFile}" -vf "${vf}" -r 25 -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p "${outputPath}" -y 2>&1`;

    try {
      await execAsync(cmd, { timeout: 180000 });
      try { fs.unlinkSync(listFile); } catch (_) {}
      await execAsync(`open "${this.outputDir}"`);
      return `Vidéo slideshow créée: ${outputPath}`;
    } catch (err) {
      return `Erreur ffmpeg: ${err.message.slice(0, 300)}`;
    }
  }

  // ── List generated files ────────────────────────────────────────────────────
  listGeneratedFiles(limit = 10) {
    if (!this.outputDir || !fs.existsSync(this.outputDir)) return 'Aucun visuel généré.';
    const files = fs.readdirSync(this.outputDir)
      .filter(f => /\.(jpg|mp4|png)$/i.test(f))
      .sort().reverse().slice(0, limit)
      .map(f => `• ${f}`);
    return files.length
      ? `Derniers visuels dans ${this.outputDir}:\n${files.join('\n')}`
      : 'Aucun visuel généré.';
  }
}

module.exports = new VisualsService();
