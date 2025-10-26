#!/usr/bin/env node

/**
 * QA Automation with Headless Browser Testing
 * Comprehensive testing suite for W3BP0NG
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// ══════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════

const PROJECT_ROOT = dirname(__dirname);
const TEST_REPORT_DIR = join(PROJECT_ROOT, 'test-results');
const SCREENSHOT_DIR = join(TEST_REPORT_DIR, 'screenshots');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5175/w3bP0ng/';
const VIEWPORTS = [
  { width: 1920, height: 1080 }, // Desktop
  { width: 768, height: 1024 },  // Tablet
  { width: 375, height: 667 },   // Mobile
];

const CONFIG = {
  timeout: 30000, // 30 seconds
  slowMo: 100,    // Slow down for visual debugging
  headless: true,
  video: 'retain-on-failure'
};

// ════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════

function ensureDirectory(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔍',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    screenshot: '📸'
  }[type];

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════

class QAAutomation {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = [];
    this.screenshots = [];
  }

  async initialize() {
    log('Initializing headless browser for QA testing...');

    ensureDirectory(TEST_REPORT_DIR);
    ensureDirectory(SCREENSHOT_DIR);

    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: VIEWPORTS[0], // Desktop viewport
      ignoreHTTPSErrors: true,
      recordVideo: CONFIG.video === 'always' ? { dir: SCREENSHOT_DIR } : undefined
    });

    this.page = await this.context.newPage();

    // Set up console logging
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.results.push({
          type: 'console_error',
          message: msg.text(),
          url: this.page.url(),
          timestamp: new Date().toISOString()
        });
        log(`Console error: ${msg.text()}`, 'error');
      }
    });

    // Set up error handling
    this.page.on('pageerror', (error) => {
      this.results.push({
        type: 'javascript_error',
        message: error.message,
        stack: error.stack,
        url: this.page.url(),
        timestamp: new Date().toISOString()
      });
      log(`JavaScript error: ${error.message}`, 'error');
    });

    // Set up response monitoring
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        this.results.push({
          type: 'http_error',
          status: response.status(),
          url: response.url(),
          timestamp: new Date().toISOString()
        });
        log(`HTTP error ${response.status()}: ${response.url()}`, 'error');
      }
    });

    log('Browser initialized successfully', 'success');
  }

  async takeScreenshot(name, viewport) {
    const filename = `${name}_${viewport.width}x${viewport.height}.png`;
    const filepath = join(SCREENSHOT_DIR, filename);

    await this.page.setViewportSize(viewport);
    await this.page.screenshot({
      path: filepath,
      fullPage: true,
      type: 'png'
    });

    this.screenshots.push({
      name,
      viewport: `${viewport.width}x${viewport.height}`,
      filepath,
      timestamp: new Date().toISOString()
    });

    log(`Screenshot captured: ${filename}`, 'screenshot');
    return filepath;
  }

  async testPageLoad(url, testName) {
    log(`Testing: ${testName}`);
    const startTime = Date.now();

    try {
      const response = await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: CONFIG.timeout
      });

      const loadTime = Date.now() - startTime;

      // Check for successful load
      if (response && response.ok()) {
        this.results.push({
          type: 'page_load',
          test: testName,
          url,
          status: 'success',
          loadTime,
          timestamp: new Date().toISOString()
        });

        log(`${testName} loaded successfully in ${formatDuration(loadTime)}`, 'success');

        // Take screenshots of different viewports
        for (const viewport of VIEWPORTS) {
          await this.takeScreenshot(`${testName}_loaded`, viewport);
        }

        return { success: true, loadTime };
      } else {
        throw new Error(`Page returned status ${response?.status()}`);
      }

    } catch (error) {
      const loadTime = Date.now() - startTime;
      this.results.push({
        type: 'page_load',
        test: testName,
        url,
        status: 'error',
        error: error.message,
        loadTime,
        timestamp: new Date().toISOString()
      });

      log(`${testName} failed: ${error.message}`, 'error');
      return { success: false, error: error.message, loadTime };
    }
  }

  async testCoreFunctionality() {
    log('Testing core functionality...');

    const tests = [
      {
        name: 'Game initialization',
        test: async () => {
          await this.page.waitForSelector('#root', { timeout: 10000 });

          // Check for React app mount
          const hasReactApp = await this.page.evaluate(() => {
            const root = document.getElementById('root');
            return root && root.children.length > 0;
          });

          return hasReactApp;
        }
      },
      {
        name: 'Game controls presence',
        test: async () => {
          // Look for game elements
          const gameElements = await this.page.locator('canvas, .game-container, [data-testid="game-canvas"]').count();
          return gameElements > 0;
        }
      },
      {
        name: 'Audio system',
        test: async () => {
          const hasAudioContext = await this.page.evaluate(() => {
            return !!(window.AudioContext || window.webkitAudioContext);
          });

          return hasAudioContext;
        }
      },
      {
        name: 'Storage access',
        test: async () => {
          const hasLocalStorage = await this.page.evaluate(() => {
            try {
              localStorage.setItem('test', 'test');
              localStorage.removeItem('test');
              return true;
            } catch (e) {
              return false;
            }
          });

          return hasLocalStorage;
        }
      },
      {
        name: 'Performance monitoring',
        test: async () => {
          const hasPerformanceAPI = await this.page.evaluate(() => {
            return !!(window.performance && window.performance.now);
          });

          return hasPerformanceAPI;
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        log(`Running test: ${test.name}`);
        const result = await Promise.race([
          test.test(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Test timeout')), 10000)
          )
        ]);

        results.push({
          test: test.name,
          passed: !!result,
          timestamp: new Date().toISOString()
        });

        log(`${test.name}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');

      } catch (error) {
        results.push({
          test: test.name,
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        log(`${test.name}: FAILED - ${error.message}`, 'error');
      }
    }

    return results;
  }

  async testResponsiveDesign() {
    log('Testing responsive design...');

    const responsiveTests = [];

    for (const viewport of VIEWPORTS) {
      await this.page.setViewportSize(viewport);

      // Test basic layout
      const isLayoutResponsive = await this.page.evaluate(() => {
        const root = document.getElementById('root');
        if (!root) return false;

        const rect = root.getBoundingClientRect();
        return rect.width > 300 && rect.height > 200;
      });

      responsiveTests.push({
        viewport: `${viewport.width}x${viewport.height}`,
        responsive: isLayoutResponsive,
        timestamp: new Date().toISOString()
      });

      await this.takeScreenshot(`responsive_${viewport.width}x${viewport.height}`, viewport);
    }

    return responsiveTests;
  }

  async testPerformance() {
    log('Testing performance metrics...');

    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        resourceCount: performance.getEntriesByType('resource').length
      };
    });

    this.results.push({
      type: 'performance',
      metrics: performanceMetrics,
      timestamp: new Date().toISOString()
    });

    return performanceMetrics;
  }

  async runFullTestSuite() {
    log('Starting full QA test suite...');

    const startTime = Date.now();
    const testSuite = {
      startTime: new Date().toISOString(),
      url: BASE_URL,
      tests: []
    };

    // Test different pages/modes
    const pages = [
      { url: BASE_URL, name: 'Main Menu' },
      { url: `${BASE_URL}?mode=title`, name: 'Title Screen' },
      { url: `${BASE_URL}?mode=classic`, name: 'Classic Mode' },
      { url: `${BASE_URL}404.html`, name: '404 Page' }
    ];

    for (const page of pages) {
      const result = await this.testPageLoad(page.url, page.name);
      testSuite.tests.push({
        page: page.name,
        ...result
      });

      // Small delay between tests
      await this.page.waitForTimeout(1000);
    }

    // Test core functionality
    const coreTests = await this.testCoreFunctionality();
    testSuite.coreTests = coreTests;

    // Test responsive design
    const responsiveTests = await this.testResponsiveDesign();
    testSuite.responsiveTests = responsiveTests;

    // Test performance
    const performanceTests = await this.testPerformance();
    testSuite.performanceTests = performanceTests;

    const totalTime = Date.now() - startTime;
    testSuite.duration = totalTime;
    testSuite.summary = {
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.type === 'test' && r.passed).length,
      errors: this.results.filter(r => r.type === 'console_error' || r.type === 'javascript_error').length
    };

    return testSuite;
  }

  async cleanup() {
    log('Cleaning up test environment...');

    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    log('Test environment cleaned up', 'success');
  }

  generateReport(testSuite) {
    log('Generating QA report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: testSuite.summary,
      performance: testSuite.performanceTests,
      responsive: testSuite.responsiveTests,
      errors: this.results.filter(r => r.type === 'console_error' || r.type === 'javascript_error' || r.type === 'http_error'),
      screenshots: this.screenshots,
      testResults: testSuite.tests,
      coreTests: testSuite.coreTests
    };

    const reportPath = join(TEST_REPORT_DIR, `qa-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = join(TEST_REPORT_DIR, `qa-report-${Date.now()}.html`);
    writeFileSync(htmlPath, htmlReport);

    log(`QA report generated: ${reportPath}`, 'success');
    log(`HTML report generated: ${htmlPath}`, 'success');

    return { jsonPath: reportPath, htmlPath };
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>W3BP0NG QA Report - ${new Date().toISOString().split('T')[0]}</title>
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

        .test-result {
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .test-result.passed {
            background: rgba(34, 211, 238, 0.1);
            border-left-color: #22d3ee;
        }

        .test-result.failed {
            background: rgba(239, 68, 68, 0.1);
            border-left-color: #ef4444;
        }

        .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }

        .screenshot {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .screenshot img {
            width: 100%;
            height: auto;
            display: block;
        }

        .screenshot figcaption {
            text-align: center;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.8);
        }

        .error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 W3BP0NG QA Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>

        <h2>📊 Test Summary</h2>
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.totalTests}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value">${report.summary.passedTests}</div>
            </div>
            <div class="metric">
                <h3>Errors</h3>
                <div class="value">${report.summary.errors}</div>
            </div>
        </div>

        ${report.errors.length > 0 ? `
            <h2>❌ Errors Found</h2>
            ${report.errors.map(error => `
                <div class="error">
                    <strong>${error.type}:</strong> ${error.message}
                    <br><small>URL: ${error.url}</small>
                </div>
            `).join('')}
        ` : ''}

        <h2>📸 Screenshots</h2>
        <div class="screenshots">
            ${report.screenshots.map(screenshot => `
                <div class="screenshot">
                    <img src="screenshots/${screenshot.name}" alt="${screenshot.name}">
                    <figcaption>${screenshot.name} (${screenshot.viewport})</figcaption>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }
}

// ══════════════════════════════════════════════════════
// MAIN EXECUTION
// ══════════════════════════════════════════════════════

async function main() {
  const qa = new QAAutomation();

  try {
    await qa.initialize();
    const testSuite = await qa.runFullTestSuite();
    const reportPaths = qa.generateReport(testSuite);

    log(`QA tests completed successfully!`, 'success');
    log(`JSON Report: ${reportPaths.jsonPath}`);
    log(`HTML Report: ${reportPaths.htmlPath}`);

  } catch (error) {
    log(`QA test suite failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    await qa.cleanup();
  }
}

if (require.main === module) {
  main();
}

export { QAAutomation };