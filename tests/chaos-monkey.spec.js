import { test, expect } from '@playwright/test';

test.describe('Chaos Monkey: Stress & Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the main game URL
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should handle rapid window resizing without crashing', async ({ page }) => {
    // Start Classic Mode to have an active game session
    await page.click('text=START PERFORMANCE'); // Assuming Title screen first
    await page.waitForTimeout(1000);
    await page.click('text=CLASSIC');
    await page.click('text=START GAME');

    // Perform rapid resizes
    const sizes = [
      { width: 1280, height: 720 },
      { width: 375, height: 667 }, // iPhone SE
      { width: 1024, height: 1366 }, // iPad Pro
      { width: 1920, height: 1080 },
      { width: 500, height: 500 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      // Brief pause to allow React/Canvas to respond
      await page.waitForTimeout(100);
      
      // Verify no error boundary is shown
      const errorBoundary = page.locator('text=Something went wrong');
      await expect(errorBoundary).not.toBeVisible();
      
      // Verify canvas still exists
      const canvas = page.locator('canvas.pong-canvas');
      await expect(canvas).toBeVisible();
    }
  });

  test('should handle rapid orientation changes', async ({ page }) => {
    await page.click('text=START PERFORMANCE');
    await page.waitForTimeout(1000);

    const orientations = ['portrait', 'landscape'];
    
    for (let i = 0; i < 6; i++) {
      const orientation = orientations[i % 2];
      const isLandscape = orientation === 'landscape';
      
      await page.setViewportSize({
        width: isLandscape ? 844 : 390,
        height: isLandscape ? 390 : 844,
      });
      
      await page.waitForTimeout(150);
      
      // Verify app is still functional
      await expect(page.locator('canvas')).toBeVisible();
    }
  });

  test('should survive rapid mode switching', async ({ page }) => {
    await page.click('text=START PERFORMANCE');
    await page.waitForTimeout(1000);

    const modes = ['CLASSIC', 'PUZZLE', 'RHYTHM', 'BATTLE ROYALE'];
    
    for (const mode of modes) {
      await page.click(`text=${mode}`);
      await page.waitForTimeout(300);
      
      // Switch back to menu using Escape or hypothetical back button
      // If we don't have a back button, we can use the game's EXIT button if it exists
      const exitBtn = page.locator('text=EXIT');
      if (await exitBtn.isVisible()) {
        await exitBtn.click();
      } else {
        // Fallback: reload to menu
        await page.goto('/#menu');
      }
      
      await expect(page.locator('text=START PERFORMANCE').or(page.locator('text=CLASSIC'))).toBeVisible();
    }
  });
});
