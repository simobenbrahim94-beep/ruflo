// Remotion render script for ROUTINES cinematic showcase
'use strict';
const path = require('path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

async function main() {
  const entryPoint = path.join(__dirname, '../src/agents/video-studio/remotion/index.jsx');
  const outputPath = path.join('/tmp', 'routines-cinematic-final.mp4');

  console.log('📦 Bundling Remotion composition...');
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log('🎬 Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'RoutinesCinematic',
    inputProps: {},
    browserExecutable: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    chromeMode: 'chrome-for-testing',
    onBrowserDownload: () => ({ version: 'skip', browserExecutable: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }),
  });

  console.log(`   ${composition.durationInFrames} frames @ ${composition.fps}fps = ${Math.round(composition.durationInFrames / composition.fps)}s`);
  console.log(`   ${composition.width}×${composition.height}`);
  console.log('🎥 Rendering...');

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    browserExecutable: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    chromeMode: 'chrome-for-testing',
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) process.stdout.write(`   ${pct}%\r`);
    },
  });

  const { statSync } = require('fs');
  const size = (statSync(outputPath).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Done: ${outputPath} (${size}MB)`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
