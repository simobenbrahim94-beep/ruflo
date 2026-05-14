/**
 * FFmpeg utilities for video assembly, transitions, captions, and platform export.
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { join } from 'path';
import { tmpdir, homedir } from 'os';
import { mkdir } from 'fs/promises';

ffmpeg.setFfmpegPath(ffmpegStatic);

const OUTPUT_DIR = join(homedir(), '.video-studio', 'output');

export async function ensureOutputDir() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  return OUTPUT_DIR;
}

// ── Concatenate video clips ──────────────────────────────────────────────────

export async function concatenateClips(clipPaths, outputPath) {
  await ensureOutputDir();
  const out = outputPath ?? join(OUTPUT_DIR, `concat-${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();
    clipPaths.forEach(p => cmd.input(p));
    cmd
      .on('error', reject)
      .on('end', () => resolve(out))
      .mergeToFile(out, tmpdir());
  });
}

// ── Add audio track to video ─────────────────────────────────────────────────

export async function addAudio(videoPath, audioPath, outputPath, options = {}) {
  await ensureOutputDir();
  const out = outputPath ?? join(OUTPUT_DIR, `mixed-${Date.now()}.mp4`);
  const { volume = 1.0, fadeInSec = 0.5, fadeOutSec = 1.0 } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(audioPath)
      .audioFilters([
        `volume=${volume}`,
        `afade=t=in:ss=0:d=${fadeInSec}`,
        `afade=t=out:st=${fadeOutSec}:d=${fadeOutSec}`,
      ])
      .outputOptions(['-map 0:v:0', '-map 1:a:0', '-c:v copy', '-shortest'])
      .output(out)
      .on('error', reject)
      .on('end', () => resolve(out))
      .run();
  });
}

// ── Add burned-in captions ────────────────────────────────────────────────────

export async function addCaptions(videoPath, captionsPath, outputPath, style = {}) {
  await ensureOutputDir();
  const out = outputPath ?? join(OUTPUT_DIR, `captioned-${Date.now()}.mp4`);
  const {
    fontColor = 'white',
    fontSize = 48,
    fontFile = '',
    outlineColor = 'black',
    outlineWidth = 3,
    bottomMargin = 100,
  } = style;

  const subtitleFilter = fontFile
    ? `subtitles=${captionsPath}:force_style='FontSize=${fontSize},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=${outlineWidth},MarginV=${bottomMargin}'`
    : `subtitles=${captionsPath}`;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .videoFilters(subtitleFilter)
      .output(out)
      .on('error', reject)
      .on('end', () => resolve(out))
      .run();
  });
}

// ── Add logo/watermark overlay ────────────────────────────────────────────────

export async function addWatermark(videoPath, logoPath, outputPath, position = 'bottom_right') {
  await ensureOutputDir();
  const out = outputPath ?? join(OUTPUT_DIR, `watermarked-${Date.now()}.mp4`);
  const positions = {
    bottom_right: 'overlay=W-w-20:H-h-20',
    bottom_left:  'overlay=20:H-h-20',
    top_right:    'overlay=W-w-20:20',
    top_left:     'overlay=20:20',
    center:       'overlay=(W-w)/2:(H-h)/2',
  };

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(logoPath)
      .complexFilter([`[1:v]scale=150:-1[logo];[0:v][logo]${positions[position] ?? positions.bottom_right}`])
      .outputOptions(['-map 0:a?', '-c:a copy'])
      .output(out)
      .on('error', reject)
      .on('end', () => resolve(out))
      .run();
  });
}

// ── Platform export (resize + re-encode for platform specs) ──────────────────

export async function exportForPlatform(inputPath, platform, outputDir) {
  const specs = {
    tiktok:           { w: 1080, h: 1920, fps: 30, vbr: '2500k', abr: '128k' },
    instagram_reels:  { w: 1080, h: 1920, fps: 30, vbr: '3500k', abr: '128k' },
    youtube_shorts:   { w: 1080, h: 1920, fps: 60, vbr: '4000k', abr: '192k' },
    facebook_reels:   { w: 1080, h: 1920, fps: 30, vbr: '2500k', abr: '128k' },
    landscape_yt:     { w: 1920, h: 1080, fps: 30, vbr: '5000k', abr: '192k' },
  };
  const spec = specs[platform] ?? specs.tiktok;
  const dir = outputDir ?? OUTPUT_DIR;
  await mkdir(dir, { recursive: true });
  const out = join(dir, `${platform}-${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(`scale=${spec.w}:${spec.h}:force_original_aspect_ratio=decrease,pad=${spec.w}:${spec.h}:(ow-iw)/2:(oh-ih)/2`)
      .fps(spec.fps)
      .videoBitrate(spec.vbr)
      .audioBitrate(spec.abr)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(['-movflags +faststart', '-pix_fmt yuv420p'])
      .output(out)
      .on('error', reject)
      .on('end', () => resolve(out))
      .run();
  });
}

// ── Extract thumbnail ─────────────────────────────────────────────────────────

export async function extractThumbnail(videoPath, timeSec = 1, outputPath) {
  await ensureOutputDir();
  const out = outputPath ?? join(OUTPUT_DIR, `thumb-${Date.now()}.jpg`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timeSec)
      .frames(1)
      .output(out)
      .on('error', reject)
      .on('end', () => resolve(out))
      .run();
  });
}

// ── Get video metadata ────────────────────────────────────────────────────────

export function getVideoInfo(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, meta) => {
      if (err) return reject(err);
      const v = meta.streams.find(s => s.codec_type === 'video');
      const a = meta.streams.find(s => s.codec_type === 'audio');
      resolve({
        durationSec: meta.format.duration,
        width: v?.width,
        height: v?.height,
        fps: eval(v?.r_frame_rate ?? '0/1'),
        hasAudio: !!a,
        sizeMB: (meta.format.size / 1e6).toFixed(2),
      });
    });
  });
}
