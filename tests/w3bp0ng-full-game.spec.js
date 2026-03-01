/**
 * Comprehensive End-to-End Tests for w3bp0ng
 * Tests full game functionality with console error/warning monitoring
 */

import { test, expect } from '@playwright/test';

test.describe('w3bp0ng Full Game Functionality', () => {
  let consoleMessages = [];
  let gameCanvas = null;

  async function bypassTitleScreen(page) {
    // Bypass Title Screen if present
    const titleScreen = page.locator('.title-screen');
    const startButton = page.locator('button', { hasText: /Start|Audio/i }).first();
    
    // Check if we are on title screen
    if (await titleScreen.count() > 0 || await startButton.count() > 0) {
      console.log('Bypassing Title Screen...');
      await page.waitForTimeout(1000); // Wait for animations
      await page.click('body');
      
      // Some versions might need a button click if global click doesn't work
      if (await startButton.isVisible()) {
        await startButton.click().catch(() => {});
      }
      
      await page.waitForSelector('.main-menu', { timeout: 10000 });
      console.log('Main Menu reached.');
    }
  }

  test.beforeEach(async ({ page }) => {
    // Reset console monitoring
    consoleMessages = [];

    // Monitor console for errors and warnings
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });

      // Log critical issues during test
      if (msg.type() === 'error') {
        console.error(`🚨 Console Error: ${msg.text()}`, msg.location());
      }
      if (msg.type() === 'warning') {
        console.warn(`⚠️ Console Warning: ${msg.text()}`, msg.location());
      }
    });

    // Monitor uncaught exceptions
    page.on('pageerror', error => {
      console.error(`🚨 Page Error: ${error.message}`);
      consoleMessages.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack
      });
    });

    // Navigate to the game
    await page.goto('/');
    await bypassTitleScreen(page);
  });

  test.afterEach(async ({ page }) => {
    // Analyze console output for test failures
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => 
      msg.type === 'warning' && 
      !msg.text.includes('Service Worker') // Ignore SW warnings in results
    );

    if (errors.length > 0) {
      console.error(`❌ Test completed with ${errors.length} console errors`);
      errors.forEach(error => console.error(`  - ${error.text}`));
    }

    if (warnings.length > 0) {
      console.warn(`⚠️ Test completed with ${warnings.length} console warnings`);
      warnings.forEach(warning => console.warn(`  - ${warning.text}`));
    }
  });

  test.describe('Application Initialization', () => {
    test('should load main menu without errors', async ({ page }) => {
      // Verify main menu loads - use flexible text match for "w3bP0ng" vs "W3B P0NG"
      await expect(page.locator('h1.menu-title')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=ARCADE MAYHEM UNLEASHED')).toBeVisible();

      // Check for console errors during load (ignoring Service Worker errors)
      const loadErrors = consoleMessages.filter(msg => 
        msg.type === 'error' && 
        !msg.text.includes('Service Worker')
      );
      expect(loadErrors.length).toBe(0);
    });

    test('should display all game mode cards', async ({ page }) => {
      const modeCards = [
        'Classic Mode',
        'Physics Puzzle',
        'Rhythm Mode',
        'Battle Royale',
        'Level Editor'
      ];

      for (const mode of modeCards) {
        await expect(page.locator(`text=${mode}`)).toBeVisible();
      }
    });

    test('should have proper visual theme and styling', async ({ page }) => {
      // Verify glassmorphism UI elements
      await expect(page.locator('.main-menu')).toBeVisible();
      
      // Check for particle background
      await expect(page.locator('.particle-background')).toBeVisible();
    });
  });

  test.describe('Classic Mode Gameplay', () => {
    test('should navigate to Classic Mode and start game', async ({ page }) => {
      // Click Classic Mode button
      await page.click('[aria-label="Classic Mode - Available"]');

      // Wait for game to load - use first() to avoid strict mode violation if needed
      const pongGame = page.locator('[data-testid="pong-game"]').first();
      await expect(pongGame).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=Web Pong')).toBeVisible();

      // Check for game canvas
      gameCanvas = page.locator('canvas');
      await expect(gameCanvas).toBeVisible();

      // Verify no critical errors during game load
      const loadErrors = consoleMessages.filter(msg => 
        msg.type === 'error' && 
        !msg.text.includes('Service Worker')
      );
      expect(loadErrors.length).toBe(0);
    });

    test('should have functional game controls', async ({ page }) => {
      // Navigate to game
      await page.click('[aria-label="Classic Mode - Available"]');
      await expect(page.locator('[data-testid="pong-game"]').first()).toBeVisible({ timeout: 15000 });

      // Test keyboard input responsiveness
      await page.keyboard.press('w');
      await page.keyboard.press('s');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');

      // Allow time for game to process input
      await page.waitForTimeout(1000);

      // Verify no errors from input handling
      const inputErrors = consoleMessages.filter(msg =>
        msg.type === 'error' &&
        msg.text.toLowerCase().includes('keyboard')
      );
      expect(inputErrors.length).toBe(0);
    });

    test('should display game elements properly', async ({ page }) => {
      // Start game
      await page.click('[aria-label="Classic Mode - Available"]');
      await expect(page.locator('[data-testid="pong-game"]').first()).toBeVisible({ timeout: 15000 });

      // Wait for game elements to render
      await page.waitForTimeout(2000);

      // Check for score display
      await expect(page.locator('.score-container, .score')).toBeVisible();

      // Verify canvas is properly sized
      gameCanvas = page.locator('canvas');
      const width = await gameCanvas.getAttribute('width');
      expect(Number(width)).toBeGreaterThan(400);
    });

    test('should handle game state transitions', async ({ page }) => {
      // Navigate to game
      await page.click('[aria-label="Classic Mode - Available"]');
      await expect(page.locator('[data-testid="pong-game"]').first()).toBeVisible({ timeout: 15000 });

      // Check for start/pause functionality
      const startButton = page.locator('button:has-text("START")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }

      // Allow game to run
      await page.waitForTimeout(2000);

      // Test pause functionality
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Verify no state management errors
      const stateErrors = consoleMessages.filter(msg =>
        msg.type === 'error' &&
        msg.text.toLowerCase().includes('state')
      );
      expect(stateErrors.length).toBe(0);
    });
  });

  test.describe('Audio System', () => {
    test('should handle audio system initialization', async ({ page }) => {
      // Monitor audio-related console messages
      await page.goto('/');
      await bypassTitleScreen(page);

      // Check for audio system initialization messages
      const audioMessages = consoleMessages.filter(msg =>
        msg.text.toLowerCase().includes('audio') ||
        msg.text.toLowerCase().includes('sound')
      );

      // Should not have critical audio errors
      const audioErrors = audioMessages.filter(msg => 
        msg.type === 'error' && 
        !msg.text.includes('Service Worker')
      );
      expect(audioErrors.length).toBe(0);
    });

    test('should toggle audio settings', async ({ page }) => {
      // Open settings
      await page.click('[aria-label="Open settings"]');
      await expect(page.locator('h2', { hasText: 'Settings' })).toBeVisible();

      // Close settings
      await page.locator('button', { hasText: /Close|✕/ }).first().click().catch(() => {
         page.keyboard.press('Escape');
      });

      // Verify no audio system errors
      const audioErrors = consoleMessages.filter(msg =>
        msg.type === 'error' &&
        msg.text.toLowerCase().includes('audio') &&
        !msg.text.includes('Service Worker')
      );
      expect(audioErrors.length).toBe(0);
    });
  });

  test.describe('Other Game Modes', () => {
    test('should handle other modes (if implemented)', async ({ page }) => {
      const otherModes = [
        'Physics Puzzle',
        'Rhythm Mode'
      ];

      for (const mode of otherModes) {
        // Click on mode
        const modeButton = page.locator(`[aria-label^="${mode}"]`);
        if (await modeButton.isVisible()) {
          await modeButton.click();
          
          // Should not crash
          await page.waitForTimeout(1000);
          
          // Return to menu if possible
          const returnButton = page.locator('button', { hasText: /Menu/i }).first();
          if (await returnButton.isVisible()) {
            await returnButton.click();
          } else {
            await page.goto('/');
            await bypassTitleScreen(page);
          }
        }
      }
    });
  });

  test.describe('Performance and Error Handling', () => {
    test('should handle rapid navigation without errors', async ({ page }) => {
      const modes = ['Classic Mode', 'Physics Puzzle'];

      for (let i = 0; i < 2; i++) {
        for (const mode of modes) {
          const btn = page.locator(`[aria-label^="${mode}"]`);
          if (await btn.isVisible()) {
            await btn.click();
            await page.waitForTimeout(500);
            await page.goto('/');
            await bypassTitleScreen(page);
          }
        }
      }

      // Verify no performance errors
      const performanceErrors = consoleMessages.filter(msg =>
        msg.type === 'error' && 
        !msg.text.includes('Service Worker') &&
        (
          msg.text.toLowerCase().includes('memory') ||
          msg.text.toLowerCase().includes('performance')
        )
      );
      expect(performanceErrors.length).toBe(0);
    });
  });

  test.describe('Accessibility and Responsive Design', () => {
    test('should be accessible via keyboard navigation', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab');

      // Should focus on interactive elements
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });

    test('should handle different viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 1280, height: 800 }, // Desktop
        { width: 375, height: 667 }    // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.reload();
        await bypassTitleScreen(page);

        // Verify main elements are still visible
        await expect(page.locator('h1.menu-title')).toBeVisible();
      }
    });
  });

  test.describe('Console Quality Assurance', () => {
    test('should have zero console errors in complete user flow', async ({ page }) => {
      // Complete user journey
      await page.click('[aria-label="Classic Mode - Available"]');
      await expect(page.locator('[data-testid="pong-game"]').first()).toBeVisible({ timeout: 15000 });

      // Play for a bit
      await page.waitForTimeout(1000);

      // Return to menu
      await page.goto('/');
      await bypassTitleScreen(page);
      await expect(page.locator('h1.menu-title')).toBeVisible();

      // Final console analysis
      const allErrors = consoleMessages.filter(msg => 
        msg.type === 'error' && 
        !msg.text.includes('Service Worker')
      );
      
      expect(allErrors.length).toBe(0,
        `Found ${allErrors.length} console errors: ` +
        allErrors.map(e => e.text).join(', ')
      );
    });
  });
});
