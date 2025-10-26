#!/usr/bin/env node

/**
 * Asset Optimization and CDN Pipeline Script
 * Optimizes images, compresses assets, and prepares CDN uploads
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';

// ══════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════

const PROJECT_ROOT = dirname(__dirname);
const PUBLIC_DIR = join(PROJECT_ROOT, 'public');
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];
const FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf'];

// ═════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════════

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📦',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[type];

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function ensureDirectory(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
}

function getFileHash(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex').substring(0, 8);
}

function getFileSize(filePath) {
  const stats = readFileSync(filePath);
  return Buffer.byteLength(stats);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ═════════════════════════════════════════════════════════
// OPTIMIZATION FUNCTIONS
// ═════════════════════════════════════════════════════════

function optimizeImages() {
  log('Starting image optimization...');

  if (!existsSync(ASSETS_DIR)) {
    log('No assets directory found, skipping image optimization', 'warning');
    return;
  }

  const imagesDir = join(ASSETS_DIR, 'images');
  const optimizedDir = join(ASSETS_DIR, 'optimized');

  ensureDirectory(optimizedDir);

  const images = IMAGE_EXTENSIONS.flatMap(ext => {
    try {
      return execSync(`find "${imagesDir}" -name "*${ext}"`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);
    } catch (error) {
      log(`No ${ext} images found`, 'warning');
      return [];
    }
  });

  if (images.length === 0) {
    log('No images found for optimization', 'warning');
    return;
  }

  let totalSaved = 0;

  images.forEach(imagePath => {
    if (!existsSync(imagePath)) return;

    const originalSize = getFileSize(imagePath);
    const fileName = imagePath.split('/').pop();
    const hash = getFileHash(imagePath);
    const optimizedPath = join(optimizedDir, `${fileName.replace(/\.[^.]+$/, '')}_${hash}.webp`);

    try {
      // Use imagemin if available, fallback to basic compression
      execSync(`npx imagemin "${imagePath}" --out-dir="${optimizedDir}" --plugin=webp`, { stdio: 'inherit' });

      const optimizedSize = getFileSize(optimizedPath);
      const saved = originalSize - optimizedSize;
      const percentSaved = ((saved / originalSize) * 100).toFixed(1);

      log(`Optimized ${fileName}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${percentSaved}% saved)`);
      totalSaved += saved;
    } catch (error) {
      log(`Failed to optimize ${fileName}: ${error.message}`, 'error');
    }
  });

  log(`Image optimization complete. Saved ${formatBytes(totalSaved)}`, 'success');
}

function compressAudio() {
  log('Starting audio compression...');

  const audioDir = join(ASSETS_DIR, 'media');
  const compressedDir = join(ASSETS_DIR, 'compressed');

  ensureDirectory(compressedDir);

  // Audio compression would require ffmpeg or similar tools
  // For now, just organize and prepare for CDN
  log('Audio compression requires external tools. Skipping...', 'warning');
}

function optimizeFonts() {
  log('Starting font optimization...');

  const fontsDir = join(PUBLIC_DIR, 'fonts');
  if (existsSync(fontsDir)) {
    log('Font directory found, preparing for CDN...');
    // Font optimization would require fonttools or similar
    log('Font optimization requires specialized tools. Skipping...', 'warning');
  }
}

function generateAssetManifest() {
  log('Generating asset manifest...');

  const manifest = {
    version: Date.now(),
    generated: new Date().toISOString(),
    assets: {}
  };

  function scanDirectory(dirPath, assetType) {
    if (!existsSync(dirPath)) return;

    const files = execSync(`find "${dirPath}" -type f`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    files.forEach(filePath => {
      const fileName = filePath.split('/').pop();
      const relativePath = filePath.replace(DIST_DIR + '/', '');
      const hash = getFileHash(filePath);
      const size = getFileSize(filePath);

      manifest.assets[fileName] = {
        path: relativePath,
        hash,
        size,
        type: assetType,
        lastModified: new Date().toISOString()
      };
    });
  }

  // Scan all asset directories
  scanDirectory(join(ASSETS_DIR, 'images'), 'image');
  scanDirectory(join(ASSETS_DIR, 'media'), 'audio');
  scanDirectory(join(ASSETS_DIR, 'fonts'), 'font');
  scanDirectory(join(DIST_DIR, 'css'), 'style');
  scanDirectory(join(DIST_DIR, 'js'), 'script');

  const manifestPath = join(DIST_DIR, 'asset-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log(`Asset manifest generated: ${manifestPath}`, 'success');
}

function generateCDNConfig() {
  log('Generating CDN configuration...');

  const cdnConfig = {
    provider: 'vercel',
    staticAssets: {
      cacheControl: 'public, max-age=31536000, immutable',
      compression: {
        brotli: true,
        gzip: true
      },
      optimization: {
        images: true,
        fonts: true,
        css: true,
        js: true
      }
    },
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    },
    security: {
      cors: true,
      httpsOnly: true
    }
  };

  const configPath = join(DIST_DIR, 'cdn-config.json');
  writeFileSync(configPath, JSON.stringify(cdnConfig, null, 2));
  log(`CDN configuration generated: ${configPath}`, 'success');
}

// ═════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═════════════════════════════════════════════════════════

function main() {
  const command = process.argv[2];

  console.log('🚀 W3BP0NG Asset Optimization Pipeline');
  console.log('');

  switch (command) {
    case 'images':
      optimizeImages();
      break;

    case 'audio':
      compressAudio();
      break;

    case 'fonts':
      optimizeFonts();
      break;

    case 'manifest':
      generateAssetManifest();
      break;

    case 'cdn':
      generateCDNConfig();
      break;

    case 'all':
      optimizeImages();
      compressAudio();
      optimizeFonts();
      generateAssetManifest();
      generateCDNConfig();
      break;

    default:
      console.log('📖 W3BP0NG Asset Optimization Pipeline');
      console.log('');
      console.log('Usage: node scripts/optimize-assets.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  images   - Optimize all images');
      console.log('  audio    - Compress audio files');
      console.log('  fonts    - Optimize fonts');
      console.log('  manifest  - Generate asset manifest');
      console.log('  cdn      - Generate CDN configuration');
      console.log('  all       - Run all optimizations');
      console.log('');
      process.exit(0);
  }
}

if (require.main === module) {
  main();
}

export {
  optimizeImages,
  compressAudio,
  optimizeFonts,
  generateAssetManifest,
  generateCDNConfig
};