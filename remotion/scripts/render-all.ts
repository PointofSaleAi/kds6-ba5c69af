import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, openBrowser } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RECIPES, DEFAULT } from '../../src/data/recipe-reference-data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, '../src/index.ts'),
    webpackOverride: (config) => config,
  });

  const browser = await openBrowser('chrome', {
    browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/bin/chromium',
    chromiumOptions: {
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    },
    chromeMode: 'chrome-for-testing',
  });

  const recipes = Object.entries(RECIPES);
  const outputDir = path.resolve(__dirname, '../output');
  fs.mkdirSync(outputDir, { recursive: true });

  const results: { product: string; path: string; duration: string }[] = [];

  for (const [key, recipe] of recipes) {
    const productName = key.charAt(0).toUpperCase() + key.slice(1);
    const durationSeconds = Math.min(20, Math.max(10, recipe.steps.length * 2));
    const durationInFrames = durationSeconds * 30;

    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'recipe',
      puppeteerInstance: browser,
      inputProps: {
        productName,
        steps: recipe.steps,
        durationSeconds,
      },
    });

    const outputPath = path.join(outputDir, `${key}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      puppeteerInstance: browser,
      muted: true,
      concurrency: 1,
      inputProps: {
        productName,
        steps: recipe.steps,
        durationSeconds,
      },
    });

    results.push({ product: key, path: outputPath, duration: recipe.video?.duration ?? '0:00' });
    console.log(`Rendered ${key}: ${outputPath}`);
  }

  await browser.close({ silent: false });

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('All videos rendered.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
