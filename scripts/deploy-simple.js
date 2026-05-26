#!/usr/bin/env node

/**
 * Simple deployment script for Vercel
 * Bypasses Vite command issues by calling Vercel directly
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 W3BP0NG Simple Deployment');
console.log('');

// Check if dist directory exists
if (!existsSync('./dist')) {
  console.error('❌ No dist directory found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Found dist directory');
console.log('📦 Deploying to Vercel...');

try {
  // Deploy directly using Vercel CLI
  execSync('npx vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
  console.log('🌐 Check deployment at: https://vercel.com/dashboard');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}