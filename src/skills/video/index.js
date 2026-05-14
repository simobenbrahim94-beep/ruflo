/**
 * Unified video skills export — all capabilities in one import.
 */

export * from './platform-specs.js';
export * from './shot-library.js';
export * from './apis.js';
export * from './ffmpeg-utils.js';

export { RunwayAPI, StabilityAPI, ElevenLabsAPI, HeyGenAPI, KlingAPI, PikaAPI, MockVideoAPIs, detectAvailableAPIs, selectVideoAPI } from './apis.js';
export { getPlatformSpec, formatPlatformBrief, PLATFORMS, SHOT_DURATIONS } from './platform-specs.js';
export { SHOT_TYPES, CAMERA_MOVES, LIGHTING, COLOR_GRADES, PROMPT_TEMPLATES, SCRIPT_STRUCTURES, buildShotList } from './shot-library.js';
