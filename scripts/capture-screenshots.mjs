#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const LIVE_URL_PATH = path.join('docs', 'LIVE_DEPLOYMENT_URL');
const OUT_DIR = path.join('docs', 'screenshots');

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function main() {
  const base = fs.readFileSync(LIVE_URL_PATH, 'utf8').trim();
  ensureDir(OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 820 } });

  const consoleLogs = [];
  let consoleErrors = 0;
  page.on('console', (msg) => {
    const entry = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(entry);
    if (msg.type() === 'error') consoleErrors += 1;
  });
  page.on('pageerror', (err) => {
    consoleLogs.push(`[pageerror] ${err?.message || err}`);
    consoleErrors += 1;
  });

  const save = async (name) => {
    await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });
  };

  const gotoMenu = async () => {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);
    const startBtn = page.locator('text=Press Start');
    if (await startBtn.count()) {
      await startBtn.first().click().catch(()=>{});
    } else {
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(250);
      await page.mouse.click(30, 30).catch(()=>{});
    }
    await page.waitForSelector('.mode-grid', { timeout: 8000 });
  };

  const openMode = async (name) => {
    // Prefer role-based search then fallback to text
    try {
      await page.getByRole('button', { name }).first().click({ timeout: 4000 });
    } catch {
      await page.locator(`button:has-text("${name}")`).first().click();
    }
  };

  // Title
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await save('title.png');

  // Menu
  await gotoMenu();
  await save('menu.png');

  // Classic Mode
  await openMode('Classic Mode');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(800);
  await save('classic.png');

  // Back to menu
  await gotoMenu();

  // Physics Puzzle
  await openMode('Physics Puzzle');
  await page.waitForSelector('canvas', { timeout: 10000 });
  // Start play if needed
  await page.keyboard.press(' ').catch(()=>{});
  await page.waitForTimeout(800);
  await save('puzzle.png');

  await gotoMenu();

  // Rhythm Mode
  await openMode('Rhythm Mode');
  // Click Start
  await page.getByRole('button', { name: /Start/i }).first().click().catch(()=>{});
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(800);
  await save('rhythm.png');

  await gotoMenu();

  // Battle Royale
  await openMode('Battle Royale');
  await page.getByRole('button', { name: /Start Battle/i }).first().click().catch(()=>{});
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(800);
  await save('battle.png');

  await gotoMenu();

  // Level Editor
  await openMode('Level Editor');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(800);
  await save('editor.png');

  // Save logs
  fs.writeFileSync(path.join(OUT_DIR, 'console.log'), consoleLogs.join('\n'), 'utf8');

  await browser.close();

  // Report
  if (consoleErrors > 0) {
    console.warn(`Completed with ${consoleErrors} console error(s). See docs/screenshots/console.log`);
    process.exitCode = 0; // do not fail the pipeline; just warn
  } else {
    console.log('Completed screenshots with no console errors.');
  }
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err?.message || err);
  process.exit(1);
});

