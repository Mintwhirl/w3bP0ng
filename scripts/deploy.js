/**
 * Deployment Automation Script
 * Handles Vite build, version control, and Vercel deployment
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════
// CONFIGURATION
// ═════════════════════════════════════════════════════════

const VERSION_FILE = './dist/version.json';
const PACKAGE_FILE = './package.json';

// ═════════════════════════════════════════════════════════
// VERSION MANAGEMENT
// ═══════════════════════════════════════════════════════════

function getCurrentVersion() {
  const pkg = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
  return pkg.version;
}

function updateVersion() {
  const version = getCurrentVersion();
  const versionData = {
    version,
    date: new Date().toISOString().split('T')[0],
    commit: getCommitHash(),
  };
  writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2));
}

function getCommitHash() {
  try {
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    return hash.substring(0, 7);
  } catch (error) {
    return 'unknown';
  }
}

// ═══════════════════════════════════════════════════════
// BUILD PROCESS
// ═══════════════════════════════════════════════════════════════

function runBuild() {
  console.log('🏗️ Starting production build...');

  try {
    const result = execSync('npm run build', { stdio: 'inherit' });

    if (result.status !== 0) {
      throw new Error(`Build failed with exit code ${result.status}`);
    }

    console.log('✅ Build completed successfully');
    updateVersion();

    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// ═════════════════════════════════════════════════════
// DEPLOYMENT
// ═════════════════════════════════════════════════════════

function deployToVercel() {
  console.log('🚀 Deploying to Vercel...');

  try {
    // Build project
    if (!runBuild()) {
      process.exit(1);
    }

    // Deploy to Vercel
    const result = execSync('vercel --prod', { stdio: 'inherit' });

    if (result.status !== 0) {
      throw new Error(`Vercel deployment failed with exit code ${result.status}`);
    }

    console.log('✅ Deployment completed successfully');

    // Get deployment URL
    const url = result.stdout
      .split('\n')
      .find(line => line.includes('Preview:'))
      ?.split('Preview: ')[1]
      ?.trim();

    if (url) {
      console.log(`🌐 Deployed at: ${url}`);
    } else {
      console.log('🌐 Deployment completed (URL not detected in output)');
    }

    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

// ═════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function verifyBuildOutput() {
  console.log('🔍 Verifying build output...');

  const requiredFiles = [
    'dist/index.html',
    'dist/assets/',
    'dist/version.json'
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
    console.log(`✅ Found: ${file}`);
  }

  // Check HTML file for correct content
  const html = readFileSync('dist/index.html', 'utf8');
  if (!html.includes('w3bP0ng')) {
    console.warn('⚠️  Warning: HTML may not be correctly updated');
  }

  console.log('✅ Build output verification completed');
}

function getBuildSize() {
  try {
    const { size } = execSync('du -sh dist', { encoding: 'utf8' });
    const sizeMB = Math.round(parseInt(size) / 1024 / 1024 * 100) / 100;
    return { size: parseInt(size), sizeMB };
  } catch (error) {
    return { size: 0, sizeMB: 0 };
  }
}

function checkEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';

  console.log(`🔧 Environment: ${nodeEnv}`);
  console.log(`🚀 Production mode: ${isProduction}`);

  return isProduction;
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCRIPT
// ═══════════════════════════════════════════════════════════════════

const command = process.argv[2];

switch (command) {
  case 'build':
    console.log('🏗️ Build mode activated');
    runBuild();
    verifyBuildOutput();

    const buildSize = getBuildSize();
    console.log(`📦 Build size: ${buildSize.size} bytes (${buildSize.sizeMB} MB)`);
    break;

  case 'deploy':
    console.log('🚀 Deploy mode activated');
    const isProduction = checkEnvironment();

    if (!isProduction) {
      console.error('❌ Deployment requires NODE_ENV=production');
      process.exit(1);
    }

    deployToVercel();
    break;

  case 'verify':
    console.log('🔍 Verification mode activated');
    verifyBuildOutput();
    break;

  case 'version':
    console.log('📋 Version information:');
    console.log(`Version: ${getCurrentVersion()}`);
    console.log(`Commit: ${getCommitHash()}`);
    updateVersion();
    break;

  default:
    console.log('📖️ W3BP0NG Deployment Script');
    console.log('');
    console.log('Usage: npm run deploy [build|verify|version]');
    console.log('  build    - Build project for production');
    console.log('  deploy   - Build and deploy to Vercel');
    console.log('  verify   - Verify build output');
    console.log('  version  - Update version information');
    console.log('');
    process.exit(0);
}