#!/usr/bin/env node
/**
 * Create high-quality app icons from SVG using Sharp.
 * Works on all platforms including Windows.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function svgToPng(svgPath, outputPath, size, options = {}) {
  const { background = 'white', fit = 'contain' } = options;

  console.log(`Converting SVG to ${size}x${size} PNG...`);

  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: fit,
        background: background === 'white' ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();
    console.log(`  ✓ Saved: ${outputPath} (${metadata.width}x${metadata.height}, ${metadata.format})`);

    return outputPath;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    throw error;
  }
}

async function createAdaptiveIcon(svgPath, outputPath, size) {
  console.log(`\nCreating Android adaptive icon (${size}x${size})...`);

  // For adaptive icons, the content should be in the safe zone (66%)
  const safeSize = Math.floor(size * 0.66);

  try {
    // First, resize SVG to safe size with transparency
    const iconBuffer = await sharp(svgPath)
      .resize(safeSize, safeSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Create transparent canvas
    const padding = Math.floor((size - safeSize) / 2);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: iconBuffer,
          top: padding,
          left: padding,
        },
      ])
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();
    console.log(`  ✓ Saved: ${outputPath} (${metadata.width}x${metadata.height}, RGBA)`);

    return outputPath;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  const svgSource = path.join(__dirname, 'assets', 'icon-source.svg');
  const assetsDir = path.join(__dirname, 'assets');

  console.log('='.repeat(70));
  console.log('Creating High-Quality App Icons from Vector SVG');
  console.log('='.repeat(70));

  // Check if SVG exists
  if (!fs.existsSync(svgSource)) {
    console.error(`\n✗ SVG source not found: ${svgSource}`);
    console.error('Please ensure TalorAppLogo.svg is at assets/icon-source.svg');
    process.exit(1);
  }

  console.log(`\nSource: ${svgSource}`);
  console.log('Vector graphics = Perfect quality at any size!\n');

  try {
    // 1. Main app icon (1024x1024 PNG RGB with white background)
    console.log('1. Creating main app icon (1024x1024)...');
    await svgToPng(
      svgSource,
      path.join(assetsDir, 'icon.png'),
      1024,
      { background: 'white' }
    );

    // 2. Android adaptive icon (1024x1024 PNG RGBA with transparency)
    await createAdaptiveIcon(
      svgSource,
      path.join(assetsDir, 'adaptive-icon.png'),
      1024
    );

    // 3. Splash screen icon (400x400 PNG RGB)
    console.log('\n3. Creating splash screen icon (400x400)...');
    await svgToPng(
      svgSource,
      path.join(assetsDir, 'splash-icon.png'),
      400,
      { background: 'white' }
    );

    // 4. Favicon (48x48 PNG RGB)
    console.log('\n4. Creating favicon (48x48)...');
    await svgToPng(
      svgSource,
      path.join(assetsDir, 'favicon.png'),
      48,
      { background: 'white' }
    );

    console.log('\n' + '='.repeat(70));
    console.log('✓ All icons created successfully from vector SVG!');
    console.log('='.repeat(70));

    console.log('\nGenerated files:');
    console.log('  - assets/icon.png (1024x1024 RGB - iOS/Android)');
    console.log('  - assets/adaptive-icon.png (1024x1024 RGBA - Android adaptive)');
    console.log('  - assets/splash-icon.png (400x400 RGB - Splash screen)');
    console.log('  - assets/favicon.png (48x48 RGB - Web)');

    console.log('\nQuality benefits from SVG:');
    console.log('  ✓ Perfect sharpness (vector source)');
    console.log('  ✓ No upscaling artifacts');
    console.log('  ✓ Clean edges and curves');
    console.log('  ✓ Production-ready quality');

    console.log('\nNext steps:');
    console.log('  1. Restart Expo: npx expo start --clear');
    console.log('  2. Build app: npx expo run:ios');
    console.log('  3. Your icon will look crisp at all sizes!');

    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('\n✗ Failed to create icons:', error.message);
    process.exit(1);
  }
}

main();
