import { test, expect } from '@playwright/test';

test.describe('Level Editor Logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Bypass title screen
    await page.click('text=ENTER THE VOID');
    await page.waitForTimeout(500);
    // Open Editor
    await page.click('text=LEVEL EDITOR');
  });

  test('should create, save, and reload a custom level', async ({ page }) => {
    // 1. Verify editor is open
    await expect(page.locator('text=EDITOR PRO')).toBeVisible();
    
    // 2. Click on the canvas to place some blocks (assuming canvas-based editor)
    // We'll use coordinates if possible or specific UI buttons
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 200, y: 200 } });
    
    // 3. Save the level
    await page.click('text=SAVE');
    await page.fill('input[placeholder*="Level Name"]', 'Test Level 101');
    await page.click('button:has-text("CONFIRM")');
    
    // 4. Verify toast/success (assuming AchievementToast or similar)
    // Or check the 'LOAD' list
    await page.click('text=LOAD');
    await expect(page.locator('text=Test Level 101')).toBeVisible();
    
    // 5. Hard Refresh and check if it persisted in LocalStorage
    await page.reload();
    await page.click('text=ENTER THE VOID');
    await page.click('text=LEVEL EDITOR');
    await page.click('text=LOAD');
    await expect(page.locator('text=Test Level 101')).toBeVisible();
  });

  test('should validate level data before saving', async ({ page }) => {
    await page.click('text=SAVE');
    // Try to save without a name
    await page.fill('input[placeholder*="Level Name"]', '');
    const saveBtn = page.locator('button:has-text("CONFIRM")');
    await expect(saveBtn).toBeDisabled();
  });
});
