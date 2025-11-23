// Test dark and light themes
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  console.log('\n=== Testing Theme System ===\n');

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Test 1: Dark theme (default)
  console.log('TEST 1: Dark Theme');

  // Enable preview mode to test split view
  await page.locator('#previewModeToggle').check();
  await page.waitForTimeout(500);

  // Lookup verse to show in preview
  await page.locator('#verseInput').fill('John 3:16');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'theme-dark-preview.png', fullPage: true });
  console.log('✅ Dark theme screenshot saved\n');

  // Go live
  await page.locator('#goLiveBtn').click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'theme-dark-split.png', fullPage: true });
  console.log('✅ Dark theme split view screenshot saved\n');

  // Test 2: Light theme
  console.log('TEST 2: Light Theme');

  // Toggle to light theme (find button by theme icon)
  await page.locator('#themeIcon').click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'theme-light-split.png', fullPage: true });
  console.log('✅ Light theme split view screenshot saved\n');

  // Test readability in light mode
  await page.locator('#verseInput').fill('Psalm 23:1-6');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'theme-light-preview.png', fullPage: true });
  console.log('✅ Light theme with verse screenshot saved\n');

  // Test 3: Disable preview mode in light theme
  console.log('TEST 3: Light Theme - Direct Mode');

  await page.locator('#previewModeToggle').uncheck();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'theme-light-direct.png', fullPage: true });
  console.log('✅ Light theme direct mode screenshot saved\n');

  // Back to dark theme
  await page.locator('#themeIcon').click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'theme-dark-direct.png', fullPage: true });
  console.log('✅ Dark theme direct mode screenshot saved\n');

  console.log('=== Theme Test Complete ===');
  console.log('All screenshots saved for manual verification');
  console.log('Check for:');
  console.log('- Text readability in both themes');
  console.log('- Proper contrast in preview/live panes');
  console.log('- Button visibility');
  console.log('- No dark text on dark backgrounds');

  await browser.close();
})();
