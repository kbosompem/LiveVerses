// Quick test of display window status indicator
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  console.log('\n=== Testing Display Window Status Indicator ===\n');

  // Open control window
  const controlPage = await context.newPage();
  await controlPage.goto('http://localhost:8080/liveverses/');
  await controlPage.waitForLoadState('networkidle');
  await controlPage.waitForTimeout(3000);

  console.log('✓ Control window opened');

  // Open display window
  const displayPromise = context.waitForEvent('page');
  await controlPage.getByRole('button', { name: /Launch Display/i }).click();
  const displayPage = await displayPromise;

  await displayPage.waitForLoadState('networkidle');
  await displayPage.waitForTimeout(2000);

  console.log('✓ Display window opened');

  // Send a verse to keep connection alive
  await controlPage.locator('#verseInput').fill('John 3:16');
  await controlPage.getByRole('button', { name: 'Lookup' }).click();
  await displayPage.waitForTimeout(2000);

  console.log('✓ Verse sent to display');

  // Take screenshot
  await displayPage.screenshot({
    path: 'display-status-indicator.png',
    fullPage: true
  });

  console.log('\n✅ Screenshot saved: display-status-indicator.png');
  console.log('   Status indicator is in bottom left corner');
  console.log('   🟢 Green dot = Connected to control');

  await browser.close();
})();
