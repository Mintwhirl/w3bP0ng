#!/usr/bin/env node

/**
 * Build Output Verification and Integrity Checks
 * Validates build outputs, checks file integrity, and generates reports
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

// ════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const REPORTS_DIR = join(PROJECT_ROOT, 'build-reports');

const REQUIRED_FILES = [
  'index.html',
  'assets/',
  'version.json'
];

const MAX_FILE_SIZES = {
  'index.html': 50 * 1024, // 50KB
  'css': 1024 * 1024,     // 1MB
  'js': 2048 * 1024,      // 2MB
  'images': 512 * 1024,      // 512KB per image
  'total': 10 * 1024 * 1024 // 10MB total
};

const EXPECTED_PATTERNS = [
  /\/assets\/.*\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$/,
  /\.html$/,
  /version\.json$/
];

// ══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔍',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    check: '✔️',
    cross: '❌'
  }[type];

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileHash(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  } catch (error) {
    log(`Failed to hash ${filePath}: ${error.message}`, 'error');
    return null;
  }
}

function analyzeFile(filePath) {
  if (!existsSync(filePath)) {
    return { exists: false, size: 0, hash: null };
  }

  try {
    const stats = statSync(filePath);
    const size = stats.isFile() ? stats.size : 0;
    const hash = getFileHash(filePath);

    return {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size,
      hash,
      lastModified: stats.mtime.toISOString()
    };
  } catch (error) {
    log(`Failed to analyze ${filePath}: ${error.message}`, 'error');
    return { exists: false, size: 0, hash: null };
  }
}

function scanDirectory(dirPath, maxDepth = 3) {
  const results = [];

  function scanRecursive(currentPath, depth = 0) {
    if (depth > maxDepth) return;

    try {
      const items = execSync(`find "${currentPath}" -maxdepth 1 -type f`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);

      for (const item of items) {
        const fullPath = join(currentPath, item);
        const relativePath = fullPath.replace(DIST_DIR + '/', '');
        results.push(analyzeFile(fullPath));
      }

      // Scan subdirectories
      const subdirs = execSync(`find "${currentPath}" -maxdepth 1 -type d`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);

      for (const subdir of subdirs) {
        scanRecursive(join(currentPath, subdir), depth + 1);
      }
    } catch (error) {
      log(`Failed to scan ${currentPath}: ${error.message}`, 'error');
    }
  }

  scanRecursive(dirPath);
  return results;
}

function validateIntegrity(files) {
  log('Validating build integrity...');

  const integrityReport = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    validFiles: 0,
    corruptedFiles: 0,
    missingFiles: 0,
    largeFiles: [],
    unexpectedFiles: [],
    checksums: {}
  };

  for (const file of files) {
    if (!file.exists) {
      integrityReport.missingFiles++;
      log(`Missing file: ${file.relativePath}`, 'error');
      continue;
    }

    integrityReport.validFiles++;

    // Check file sizes
    const extension = file.relativePath.split('.').pop()?.toLowerCase();
    const maxSize = MAX_FILE_SIZES[extension] || MAX_FILE_SIZES.total;

    if (file.size > maxSize) {
      integrityReport.largeFiles.push({
        path: file.relativePath,
        size: file.size,
        maxSize: maxSize,
        ratio: ((file.size - maxSize) / maxSize * 100).toFixed(1)
      });
      log(`Large file: ${file.relativePath} (${formatBytes(file.size)} > ${formatBytes(maxSize)})`, 'warning');
    }

    // Check for unexpected files
    const isExpected = EXPECTED_PATTERNS.some(pattern => pattern.test(file.relativePath));
    if (!isExpected) {
      integrityReport.unexpectedFiles.push(file.relativePath);
      log(`Unexpected file: ${file.relativePath}`, 'warning');
    }

    if (file.hash) {
      integrityReport.checksums[file.relativePath] = file.hash;
    }
  }

  return integrityReport;
}

function checkPWARequirements() {
  log('Checking PWA requirements...');

  const pwaChecks = {
    manifest: false,
    serviceWorker: false,
    icons: false,
    splashScreens: false,
    httpsReady: false,
    responsive: false
  };

  // Check PWA manifest
  const manifestPath = join(DIST_DIR, 'manifest.json');
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      pwaChecks.manifest = true;
      pwaChecks.icons = manifest.icons && manifest.icons.length > 0;
      pwaChecks.splashScreens = manifest.splash_pages && manifest.splash_pages.length > 0;
    } catch (error) {
      log(`Invalid PWA manifest: ${error.message}`, 'error');
    }
  }

  // Check service worker
  const swPath = join(DIST_DIR, 'sw.js');
  pwaChecks.serviceWorker = existsSync(swPath);

  // Check for HTTPS indicators (basic check)
  const indexPath = join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    const indexContent = readFileSync(indexPath, 'utf8');
    pwaChecks.httpsReady = indexContent.includes('https://') || indexContent.includes('serviceWorker');
    pwaChecks.responsive = indexContent.includes('viewport') || indexContent.includes('responsive');
  }

  return pwaChecks;
}

function checkSEO() {
  log('Checking SEO optimization...');

  const seoChecks = {
    hasTitle: false,
    hasDescription: false,
    hasLanguage: false,
    hasViewport: false,
    hasFavicon: false,
    hasOGTags: false
  };

  const indexPath = join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    const indexContent = readFileSync(indexPath, 'utf8');

    seoChecks.hasTitle = /<title[^>]*>([^<]*)<\/title>/i.test(indexContent);
    seoChecks.hasDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^>]*["']/i.test(indexContent);
    seoChecks.hasLanguage = /<html[^>]*lang=["'][^"']*["']/i.test(indexContent);
    seoChecks.hasViewport = /<meta[^>]*name=["']viewport["']/i.test(indexContent);
    seoChecks.hasFavicon = /<link[^>]*rel=["']icon["']/i.test(indexContent);
    seoChecks.hasOGTags = /<meta[^>]*property=["']og:["']/i.test(indexContent);
  }

  return seoChecks;
}

function generateIntegrityReport(integrityReport, pwaChecks, seoChecks) {
  log('Generating integrity report...');

  const report = {
    timestamp: new Date().toISOString(),
    buildVersion: getVersion(),
    summary: {
      totalFiles: integrityReport.totalFiles,
      validFiles: integrityReport.validFiles,
      corruptedFiles: integrityReport.corruptedFiles,
      missingFiles: integrityReport.missingFiles,
      largeFiles: integrityReport.largeFiles.length,
      unexpectedFiles: integrityReport.unexpectedFiles.length,
      warnings: [
        ...(integrityReport.largeFiles.length > 0 ? [`${integrityReport.largeFiles.length} oversized files`] : []),
        ...(integrityReport.unexpectedFiles.length > 0 ? [`${integrityReport.unexpectedFiles.length} unexpected files`] : [])
      ]
    },
    integrity: {
      checksums: integrityReport.checksums
    },
    pwa: pwaChecks,
    seo: seoChecks,
    recommendations: generateRecommendations(integrityReport, pwaChecks, seoChecks)
  };

  ensureDirectory(REPORTS_DIR);

  const reportPath = join(REPORTS_DIR, `build-integrity-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`Integrity report generated: ${reportPath}`, 'success');
  return reportPath;
}

function generateRecommendations(integrityReport, pwaChecks, seoChecks) {
  const recommendations = [];

  // Size recommendations
  if (integrityReport.largeFiles.length > 0) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      message: 'Compress large assets to improve load times',
      details: `Found ${integrityReport.largeFiles.length} oversized files`
    });
  }

  // PWA recommendations
  if (!pwaChecks.icons) {
    recommendations.push({
      type: 'pwa',
      priority: 'medium',
      message: 'Add PWA icons for better mobile experience',
      details: 'Missing icon definitions in manifest'
    });
  }

  if (!pwaChecks.serviceWorker) {
    recommendations.push({
      type: 'pwa',
      priority: 'medium',
      message: 'Implement service worker for offline support',
      details: 'Service worker not found in build output'
    });
  }

  // SEO recommendations
  if (!seoChecks.hasDescription) {
    recommendations.push({
      type: 'seo',
      priority: 'medium',
      message: 'Add meta description for better search ranking',
      details: 'Missing meta description tag'
    });
  }

  if (!seoChecks.hasOGTags) {
    recommendations.push({
      type: 'seo',
      priority: 'low',
      message: 'Add Open Graph tags for social sharing',
      details: 'Missing OG meta tags'
    });
  }

  return recommendations;
}

function getVersion() {
  try {
    const packagePath = join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    return '0.0.0';
  }
}

function checkBuildOutputs() {
  log('Checking build outputs...');

  const outputCheck = {
    distExists: existsSync(DIST_DIR),
    hasHTML: false,
    hasAssets: false,
    hasVersion: false,
    assetCount: 0,
    totalSize: 0,
    largestFile: null,
    fileTypes: {}
  };

  if (!outputCheck.distExists) {
    log('Dist directory does not exist', 'error');
    return outputCheck;
  }

  // Scan all files in dist
  const files = scanDirectory(DIST_DIR);

  for (const file of files) {
    const extension = file.relativePath.split('.').pop()?.toLowerCase() || 'unknown';

    if (file.isFile) {
      outputCheck.fileTypes[extension] = (outputCheck.fileTypes[extension] || 0) + 1;
      outputCheck.totalSize += file.size;

      if (!outputCheck.largestFile || file.size > outputCheck.largestFile.size) {
        outputCheck.largestFile = file;
      }

      // Check for specific required files
      if (file.relativePath === 'index.html') outputCheck.hasHTML = true;
      if (file.relativePath.startsWith('assets/')) outputCheck.hasAssets = true;
      if (file.relativePath === 'version.json') outputCheck.hasVersion = true;
    }
  }

  outputCheck.assetCount = files.filter(f => f.isFile).length;

  log(`Build outputs: ${outputCheck.assetCount} files, ${formatBytes(outputCheck.totalSize)}`, 'info');

  return outputCheck;
}

// ══════════════════════════════════════════════════════════
// MAIN EXECUTION
// ════════════════════════════════════════════════════════

async function main() {
  const command = process.argv[2];

  console.log('🔍 W3BP0NG Build Verification & Integrity Checks');
  console.log('');

  switch (command) {
    case 'files': {
      const outputCheck = checkBuildOutputs();
      console.log('Build Output Summary:');
      console.log(`  Dist directory exists: ${outputCheck.distExists}`);
      console.log(`  HTML file: ${outputCheck.hasHTML ? '✅' : '❌'}`);
      console.log(`  Assets directory: ${outputCheck.hasAssets ? '✅' : '❌'}`);
      console.log(`  Version file: ${outputCheck.hasVersion ? '✅' : '❌'}`);
      console.log(`  Total files: ${outputCheck.assetCount}`);
      console.log(`  Total size: ${formatBytes(outputCheck.totalSize)}`);
      if (outputCheck.largestFile) {
        console.log(`  Largest file: ${outputCheck.largestFile.relativePath} (${formatBytes(outputCheck.largestFile.size)})`);
      }
      break;
    }

    case 'integrity': {
      if (!existsSync(DIST_DIR)) {
        log('Dist directory not found', 'error');
        process.exit(1);
      }

      const files = scanDirectory(DIST_DIR);
      const integrityReport = validateIntegrity(files);
      const pwaChecks = checkPWARequirements();
      const seoChecks = checkSEO();

      generateIntegrityReport(integrityReport, pwaChecks, seoChecks);
      break;
    }

    case 'full': {
      // Run both checks
      const outputCheck = checkBuildOutputs();
      const files = scanDirectory(DIST_DIR);
      const integrityReport = validateIntegrity(files);
      const pwaChecks = checkPWARequirements();
      const seoChecks = checkSEO();

      const fullReport = {
        timestamp: new Date().toISOString(),
        buildVersion: getVersion(),
        outputs: outputCheck,
        integrity: integrityReport,
        pwa: pwaChecks,
        seo: seoChecks,
        recommendations: generateRecommendations(integrityReport, pwaChecks, seoChecks)
      };

      ensureDirectory(REPORTS_DIR);
      const reportPath = join(REPORTS_DIR, `full-build-report-${Date.now()}.json`);
      writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));

      log(`Full build report generated: ${reportPath}`, 'success');

      // Generate HTML version
      const htmlReport = generateHTMLReport(fullReport);
      const htmlPath = join(REPORTS_DIR, `build-report-${Date.now()}.html`);
      writeFileSync(htmlPath, htmlReport);
      log(`HTML report generated: ${htmlPath}`, 'success');
      break;
    }

    default:
      console.log('📖 W3BP0NG Build Verification Tool');
      console.log('');
      console.log('Usage: node scripts/build-verification.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  files     - Check build outputs and file sizes');
      console.log('  integrity - Validate file integrity and checksums');
      console.log('  full      - Run complete verification suite');
      console.log('');
      process.exit(0);
  }
}

function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>W3BP0NG Build Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap');

        body {
            font-family: 'Orbitron', 'Courier New', monospace;
            background: linear-gradient(135deg, #0b001a 0%, #140033 100%);
            color: #ffffff;
            margin: 0;
            padding: 2rem;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        h1, h2, h3 {
            color: #a855f7;
            text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .metric {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid rgba(34, 211, 238, 0.3);
        }

        .metric h3 {
            color: #22d3ee;
            margin: 0 0 0.5rem 0;
        }

        .metric .value {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .check-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
        }

        .check-icon {
            font-size: 1.2rem;
        }

        .check-fail { color: #ef4444; }
        .check-pass { color: #10b981; }

        .recommendations {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1.5rem;
        }

        .recommendation {
            background: rgba(255, 255, 255, 0.1);
            border-left: 4px solid;
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 0 8px 8px 0;
        }

        .recommendation.high {
            border-left-color: #ef4444;
        }

        .recommendation.medium {
            border-left-color: #f59e0b;
        }

        .recommendation.low {
            border-left-color: #10b981;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 W3BP0NG Build Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>

        <div class="summary">
            <div class="metric">
                <h3>📁 Total Files</h3>
                <div class="value">${report.outputs?.assetCount || 0}</div>
            </div>
            <div class="metric">
                <h3>📦 Total Size</h3>
                <div class="value">${formatBytes(report.outputs?.totalSize || 0)}</div>
            </div>
            <div class="metric">
                <h3>✅ Valid Files</h3>
                <div class="value">${report.integrity?.validFiles || 0}</div>
            </div>
            <div class="metric">
                <h3>❌ Issues Found</h3>
                <div class="value">${(report.integrity?.corruptedFiles || 0) + (report.integrity?.missingFiles || 0) + (report.integrity?.largeFiles?.length || 0) + (report.integrity?.unexpectedFiles?.length || 0)}</div>
            </div>
        </div>

        <div class="recommendations">
            <h2>📋 Recommendations</h2>
            ${(report.recommendations || []).map(rec => `
                <div class="recommendation ${rec.priority}">
                    <strong>${rec.message}</strong>
                    <br><small>${rec.details}</small>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
}

if (import.meta.url) {
  main();
}

export { checkBuildOutputs, validateIntegrity, generateIntegrityReport };