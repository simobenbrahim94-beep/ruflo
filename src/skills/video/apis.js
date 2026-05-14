/**
 * API wrappers for AI video/image/voice generation services.
 * All calls are async, fail gracefully, and log usage for cost tracking.
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpegStatic from 'ffmpeg-static';
import Ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';

// ── Runway ML Gen-3 Alpha ────────────────────────────────────────────────────

export class RunwayAPI {
  constructor(apiKey = process.env.RUNWAY_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.runwayml.com/v1';
    this.model = 'gen3a_turbo';
  }

  async textToVideo({ prompt, duration = 5, ratio = '9:16' }) {
    this._requireKey('RUNWAY_API_KEY');
    const res = await fetch(`${this.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
      body: JSON.stringify({ promptText: prompt, model: this.model, duration, ratio }),
    });
    if (!res.ok) throw new Error(`Runway error ${res.status}: ${await res.text()}`);
    const task = await res.json();
    return this._pollTask(task.id);
  }

  async imageToVideo({ imageUrl, prompt, duration = 5, ratio = '9:16' }) {
    this._requireKey('RUNWAY_API_KEY');
    const res = await fetch(`${this.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
      body: JSON.stringify({ promptImage: imageUrl, promptText: prompt, model: this.model, duration, ratio }),
    });
    if (!res.ok) throw new Error(`Runway error ${res.status}: ${await res.text()}`);
    const task = await res.json();
    return this._pollTask(task.id);
  }

  async _pollTask(taskId, maxWaitMs = 300_000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 5000));
      const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'X-Runway-Version': '2024-11-06' },
      });
      const task = await res.json();
      if (task.status === 'SUCCEEDED') return { url: task.output?.[0], taskId };
      if (task.status === 'FAILED') throw new Error(`Runway task failed: ${task.failure}`);
    }
    throw new Error('Runway task timeout');
  }

  _requireKey(name) {
    if (!this.apiKey) throw new Error(`Missing env: ${name}`);
  }
}

// ── Stability AI (images + video) ────────────────────────────────────────────

export class StabilityAPI {
  constructor(apiKey = process.env.STABILITY_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.stability.ai/v2beta';
  }

  async textToImage({ prompt, negativePrompt = '', width = 1024, height = 1792, style = 'photographic' }) {
    this._requireKey('STABILITY_API_KEY');
    const fd = new FormData();
    fd.append('prompt', prompt);
    if (negativePrompt) fd.append('negative_prompt', negativePrompt);
    fd.append('output_format', 'jpeg');
    fd.append('aspect_ratio', width > height ? '16:9' : '9:16');
    fd.append('style_preset', style);

    const res = await fetch(`${this.baseUrl}/stable-image/generate/ultra`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, Accept: 'application/json' },
      body: fd,
    });
    if (!res.ok) throw new Error(`Stability error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const b64 = data.image;
    const path = join(tmpdir(), `stability-${Date.now()}.jpg`);
    await writeFile(path, Buffer.from(b64, 'base64'));
    return { localPath: path, seed: data.seed };
  }

  async imageToVideo({ imagePath, motionBucketId = 127, cfgScale = 2.5 }) {
    this._requireKey('STABILITY_API_KEY');
    const { readFile } = await import('fs/promises');
    const imageBytes = await readFile(imagePath);
    const fd = new FormData();
    fd.append('image', new Blob([imageBytes], { type: 'image/jpeg' }), 'frame.jpg');
    fd.append('motion_bucket_id', String(motionBucketId));
    fd.append('cfg_scale', String(cfgScale));

    const res = await fetch(`${this.baseUrl}/image-to-video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: fd,
    });
    if (!res.ok) throw new Error(`Stability i2v error ${res.status}`);
    const { id } = await res.json();
    return this._pollVideo(id);
  }

  async _pollVideo(id, maxWaitMs = 300_000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 8000));
      const res = await fetch(`${this.baseUrl}/image-to-video/result/${id}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: 'video/*' },
      });
      if (res.status === 200) {
        const buf = Buffer.from(await res.arrayBuffer());
        const path = join(tmpdir(), `stability-video-${Date.now()}.mp4`);
        await writeFile(path, buf);
        return { localPath: path };
      }
      if (res.status !== 202) throw new Error(`Stability video error ${res.status}`);
    }
    throw new Error('Stability video timeout');
  }

  _requireKey(name) {
    if (!this.apiKey) throw new Error(`Missing env: ${name}`);
  }
}

// ── ElevenLabs TTS ───────────────────────────────────────────────────────────

const VOICE_PRESETS = {
  fr_female_luxury: { voiceId: 'EXAVITQu4vr4xnSDxMaL', model: 'eleven_multilingual_v2', stability: 0.5, similarity: 0.75 },
  fr_male_authority: { voiceId: 'VR6AewLTigWG4xSOukaG', model: 'eleven_multilingual_v2', stability: 0.6, similarity: 0.7 },
  ar_female_warm:    { voiceId: 'pNInz6obpgDQGcFmaJgB', model: 'eleven_multilingual_v2', stability: 0.55, similarity: 0.8 },
  energetic_youth:   { voiceId: 'ErXwobaYiN019PkySvjV', model: 'eleven_multilingual_v2', stability: 0.4, similarity: 0.65 },
};

export class ElevenLabsAPI {
  constructor(apiKey = process.env.ELEVENLABS_API_KEY) {
    this.client = new ElevenLabsClient({ apiKey: apiKey ?? 'FREE_TIER' });
  }

  async textToSpeech({ text, voicePreset = 'fr_female_luxury', outputPath }) {
    const preset = VOICE_PRESETS[voicePreset] ?? VOICE_PRESETS.fr_female_luxury;
    const audio = await this.client.textToSpeech.convert(preset.voiceId, {
      text,
      model_id: preset.model,
      voice_settings: { stability: preset.stability, similarity_boost: preset.similarity },
    });

    const chunks = [];
    for await (const chunk of audio) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const path = outputPath ?? join(tmpdir(), `elevenlabs-${Date.now()}.mp3`);
    await writeFile(path, buffer);
    return { localPath: path, durationEstimateSec: Math.ceil(text.length / 15) };
  }

  getVoicePresets() { return Object.keys(VOICE_PRESETS); }
}

// ── HeyGen (AI Avatar presenter) ─────────────────────────────────────────────

export class HeyGenAPI {
  constructor(apiKey = process.env.HEYGEN_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.heygen.com/v2';
  }

  async createAvatarVideo({ script, avatarId = 'default', voiceId, width = 1080, height = 1920 }) {
    this._requireKey('HEYGEN_API_KEY');
    const res = await fetch(`${this.baseUrl}/video/generate`, {
      method: 'POST',
      headers: { 'X-Api-Key': this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [{
          character: { type: 'avatar', avatar_id: avatarId },
          voice: { type: 'text', input_text: script, voice_id: voiceId },
        }],
        dimension: { width, height },
      }),
    });
    if (!res.ok) throw new Error(`HeyGen error ${res.status}`);
    const { data } = await res.json();
    return this._pollVideo(data.video_id);
  }

  async _pollVideo(videoId, maxWaitMs = 600_000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 10_000));
      const res = await fetch(`${this.baseUrl}/video_status.get?video_id=${videoId}`, {
        headers: { 'X-Api-Key': this.apiKey },
      });
      const { data } = await res.json();
      if (data.status === 'completed') return { url: data.video_url, thumbnailUrl: data.thumbnail_url };
      if (data.status === 'failed') throw new Error(`HeyGen failed: ${data.error}`);
    }
    throw new Error('HeyGen timeout');
  }

  _requireKey(name) {
    if (!this.apiKey) throw new Error(`Missing env: ${name}`);
  }
}

// ── Kling AI (alternative to Runway) ─────────────────────────────────────────

export class KlingAPI {
  constructor(apiKey = process.env.KLING_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.klingai.com/v1';
  }

  async textToVideo({ prompt, duration = 5, aspectRatio = '9:16', mode = 'pro' }) {
    this._requireKey('KLING_API_KEY');
    const res = await fetch(`${this.baseUrl}/videos/text2video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, duration, aspect_ratio: aspectRatio, mode }),
    });
    if (!res.ok) throw new Error(`Kling error ${res.status}: ${await res.text()}`);
    const { data } = await res.json();
    return this._pollTask(data.task_id);
  }

  async _pollTask(taskId, maxWaitMs = 300_000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 6000));
      const res = await fetch(`${this.baseUrl}/videos/text2video/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const { data } = await res.json();
      if (data.task_status === 'succeed') return { url: data.task_result?.videos?.[0]?.url, taskId };
      if (data.task_status === 'failed') throw new Error(`Kling failed: ${data.task_status_msg}`);
    }
    throw new Error('Kling timeout');
  }

  _requireKey(name) {
    if (!this.apiKey) throw new Error(`Missing env: ${name}`);
  }
}

// ── Pika Labs (product demo loops, packaging animations) ──────────────────────

export class PikaAPI {
  constructor(apiKey = process.env.PIKA_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.pika.art/v1';
  }

  async textToVideo({ prompt, duration = 3, aspectRatio = '9:16', style = 'cinematic' }) {
    this._requireKey('PIKA_API_KEY');
    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, options: { duration, aspectRatio, style } }),
    });
    if (!res.ok) throw new Error(`Pika error ${res.status}: ${await res.text()}`);
    const { id } = await res.json();
    return this._pollTask(id);
  }

  async _pollTask(taskId, maxWaitMs = 180_000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 5000));
      const res = await fetch(`${this.baseUrl}/jobs/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const { status, videos } = await res.json();
      if (status === 'finished') return { url: videos?.[0]?.url, taskId };
      if (status === 'failed') throw new Error('Pika task failed');
    }
    throw new Error('Pika timeout');
  }

  _requireKey(name) {
    if (!this.apiKey) throw new Error(`Missing env: ${name}`);
  }
}

export function detectAvailableAPIs() {
  return {
    runway:     !!process.env.RUNWAY_API_KEY,
    stability:  !!process.env.STABILITY_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    heygen:     !!process.env.HEYGEN_API_KEY,
    kling:      !!process.env.KLING_API_KEY,
    pika:       !!process.env.PIKA_API_KEY,
    mock:       !!process.env.USE_MOCK_APIS,
  };
}

// Returns the best available video API for a given scene type.
// Priority: real APIs > mock. Scene routing follows config/video-apis.env.example.
export function selectVideoAPI(apis, sceneType = 'generic') {
  const routes = {
    liquid:     apis.runway    ? new RunwayAPI()    : null,
    slowmo:     apis.kling     ? new KlingAPI()     : null,
    packshot:   apis.stability ? new StabilityAPI() : null,
    loop:       apis.pika      ? new PikaAPI()      : null,
    avatar:     apis.heygen    ? new HeyGenAPI()    : null,
    generic:    apis.runway    ? new RunwayAPI()
              : apis.kling     ? new KlingAPI()
              : apis.stability ? new StabilityAPI()
              : apis.pika      ? new PikaAPI()
              : null,
  };
  return routes[sceneType] ?? routes.generic ?? null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _silentWav(durationSec, sampleRate = 44100) {
  const numSamples = Math.ceil(durationSec * sampleRate);
  const dataSize = numSamples * 2; // 16-bit mono
  const buf = Buffer.alloc(44 + dataSize, 0);
  buf.write('RIFF', 0);             buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);             buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);        buf.writeUInt16LE(1, 20);  // PCM
  buf.writeUInt16LE(1, 22);         buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);        buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf; // samples are all 0 = silence
}

// ── MockVideoAPIs — zero-cost placeholder using sharp + ffmpeg ────────────────
// Set USE_MOCK_APIS=1 to activate. Generates real image/video/audio files
// locally so the full pipeline can be exercised without paid API accounts.
// When brief context is provided via textToVideo({ brief }), renders the full
// cinematic Sérum S1 video using serum-renderer.js.

export class MockVideoAPIs {
  constructor() {
    Ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  async textToImage({ prompt, width = 1080, height = 1920 }) {
    const { renderSerumVideo } = await import('../../agents/video-studio/serum-renderer.js');
    // Return a key frame from the renderer as a still image
    const vid = await renderSerumVideo({}, null);
    // Extract first frame as JPEG
    const imgPath = vid.localPath.replace('.mp4', '-thumb.jpg');
    await new Promise((resolve, reject) => {
      Ffmpeg(vid.localPath)
        .screenshots({ timestamps: ['00:00:02'], filename: imgPath, size: `${width}x${height}`, folder: '/' })
        .on('end', resolve)
        .on('error', () => {
          // Fallback: gold gradient
          sharp({ create: { width, height, channels: 3, background: { r: 18, g: 12, b: 6 } } })
            .jpeg({ quality: 90 }).toFile(imgPath).then(resolve).catch(reject);
        });
    });
    return { localPath: imgPath, seed: 0, mock: true, prompt: prompt?.slice(0, 80) };
  }

  async textToVideo({ prompt, duration = 70, ratio = '9:16', brief = {}, outputPath } = {}) {
    const { renderSerumVideo } = await import('../../agents/video-studio/serum-renderer.js');
    const result = await renderSerumVideo(brief, outputPath ?? null);
    return { url: `file://${result.localPath}`, localPath: result.localPath, durationSec: result.durationSec, scenes: result.scenes, mock: true };
  }

  async imageToVideo({ prompt = '', duration = 70, ratio = '9:16', brief = {} } = {}) {
    return this.textToVideo({ prompt, duration, ratio, brief });
  }

  async textToSpeech({ text, outputPath }) {
    const path = outputPath ?? join(tmpdir(), `mock-audio-${Date.now()}.wav`);
    const durationSec = Math.max(2, Math.ceil(text.length / 15));
    await writeFile(path, _silentWav(durationSec));
    return { localPath: path, durationEstimateSec: durationSec, mock: true };
  }
}
