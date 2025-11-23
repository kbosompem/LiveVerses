// Test long passage rendering
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });

  // Open both control and display windows
  const controlPage = await browser.newPage();
  await controlPage.setViewportSize({ width: 1400, height: 900 });

  const displayPage = await browser.newPage();
  await displayPage.setViewportSize({ width: 1920, height: 1080 });

  console.log('\n=== Testing Long Passage (Psalm 23:1-19) ===\n');

  // Load control panel with cache disabled
  await controlPage.goto('http://localhost:8080/liveverses/', { waitUntil: 'networkidle' });
  await controlPage.reload({ waitUntil: 'networkidle' }); // Force reload to bypass cache
  await controlPage.waitForTimeout(2000);

  // Load display window
  await displayPage.goto('http://localhost:8080/liveverses/display.html');
  await displayPage.waitForLoadState('networkidle');
  await displayPage.waitForTimeout(2000);

  // Enable preview mode
  await controlPage.locator('#previewModeToggle').check();
  await controlPage.waitForTimeout(500);

  // Select all 4 versions
  await controlPage.locator('#asvCheck').check();
  await controlPage.locator('#webCheck').check();
  await controlPage.locator('#nltCheck').check();
  await controlPage.waitForTimeout(500);

  // Set side-by-side layout
  const sideBySideBtn = controlPage.getByRole('button', { name: 'Side by Side' });
  await sideBySideBtn.click();
  await controlPage.waitForTimeout(500);

  // Lookup Psalm 23:1-19 (note: Psalm 23 only has 6 verses, so this tests the range)
  await controlPage.locator('#verseInput').fill('Psalm 23:1-6');
  await controlPage.keyboard.press('Enter');
  await controlPage.waitForTimeout(2000);

  await controlPage.screenshot({ path: 'long-passage-control-preview.png', fullPage: true });
  console.log('✅ Control panel (preview) screenshot saved');

  // Go live
  await controlPage.locator('#goLiveBtn').click();
  await controlPage.waitForTimeout(1000);

  await controlPage.screenshot({ path: 'long-passage-control-live.png', fullPage: true });
  await displayPage.screenshot({ path: 'long-passage-display.png', fullPage: true });
  console.log('✅ Control panel (live) screenshot saved');
  console.log('✅ Display window screenshot saved');

  // Count verse blocks in each pane
  const previewCount = await controlPage.locator('#previewArea .verse-block').count();
  const liveCount = await controlPage.locator('#liveArea .verse-block').count();
  const displayCount = await displayPage.locator('.verse-block').count();

  console.log('\nVerse blocks:');
  console.log('  Preview:', previewCount);
  console.log('  Live:', liveCount);
  console.log('  Display:', displayCount);

  await browser.close();
})();
