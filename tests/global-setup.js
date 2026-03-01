/**
 * Global setup for Playwright tests
 * Ensures dev server is running and console monitoring is ready
 */

async function globalSetup(config) {
  console.log('🎮 Setting up w3bp0ng Playwright tests...');

  // Verify dev server is accessible
  const { request } = await import('@playwright/test');
  const requestContext = await request.newContext();

  try {
    const response = await requestContext.get('http://localhost:5173/w3bP0ng/', {
      timeout: 30000
    });

    if (response.status() !== 200) {
      throw new Error(`Dev server not ready: ${response.status()}`);
    }

    console.log('✅ Dev server is ready for testing');
  } catch (error) {
    console.error('❌ Dev server not accessible:', error.message);
    throw new Error('Please ensure dev server is running: npm run dev');
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;