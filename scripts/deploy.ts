/**
 * Professional Deployment Script
 * Optimized for Vercel with strict typing and environment validation
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface DeploymentConfig {
  distDir: string;
  projectName: string;
  platform: 'vercel' | 'github-pages';
  env: 'production' | 'preview';
}

const config: DeploymentConfig = {
  distDir: './dist',
  projectName: 'w3bP0ng',
  platform: 'vercel',
  env: 'production',
};

async function runDeploy() {
  console.log(`🚀 ${config.projectName.toUpperCase()} Deployment System`);
  console.log(`📡 Target: ${config.platform.toUpperCase()} (${config.env})`);
  console.log('────────────────────────────────────────────────');

  // 1. Validation
  const distPath = path.resolve(process.cwd(), config.distDir);
  if (!existsSync(distPath)) {
    console.error(`❌ ERROR: Build directory not found at ${distPath}`);
    console.log('💡 Tip: Run "npm run build" first.');
    process.exit(1);
  }

  console.log('✅ Build directory verified.');

  // 2. Platform-Specific Deployment
  try {
    if (config.platform === 'vercel') {
      console.log('📦 Pushing to Vercel Production...');
      const cmd = config.env === 'production' ? 'npx vercel --prod' : 'npx vercel';
      execSync(cmd, { stdio: 'inherit' });
    } else if (config.platform === 'github-pages') {
      console.log('📦 Pushing to GitHub Pages...');
      execSync('npx gh-pages -d dist', { stdio: 'inherit' });
    }

    console.log('────────────────────────────────────────────────');
    console.log('✅ DEPLOYMENT SUCCESSFUL!');
  } catch (error) {
    console.error('❌ DEPLOYMENT FAILED');
    if (error instanceof Error) {
      console.error(`Reason: ${error.message}`);
    }
    process.exit(1);
  }
}

// Execute deployment
runDeploy().catch((err) => {
  console.error('Unhandled deployment error:', err);
  process.exit(1);
});
