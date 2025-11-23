// Test NLT and color persistence
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8765');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✓ Page loaded');

  // Test 1: NLT checkbox
  console.log('\n=== Test 1: NLT Support ===');
  const nltCheck = await page.locator('#nltCheck').count();
  if (nltCheck > 0) {
    console.log('✓ NLT checkbox found');

    // Select NLT and lookup John 3:16
    await page.locator('#nltCheck').check();
    await page.locator('#verseInput').fill('John 3:16');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(2000);

    const verseText = await page.locator('.verse-text').first().textContent();
    if (verseText.includes('God loved') || verseText.includes('gave')) {
      console.log('✓ NLT verse displayed successfully');
      console.log('  ' + verseText.substring(0, 80) + '...');
    } else {
      console.log('✗ NLT verse not found');
    }
  } else {
    console.log('✗ NLT checkbox not found');
  }

  // Test 2: Color persistence
  console.log('\n=== Test 2: Color Persistence ===');

  // Change colors
  await page.locator('#bgColor').fill('#2a2a2a');
  await page.locator('#textColor').fill('#ffcc00');
  console.log('✓ Changed background to #2a2a2a and text to #ffcc00');

  await page.waitForTimeout(500);

  // Open display window
  const [displayPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'Open Display Window' }).click()
  ]);

  await displayPage.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✓ Display window opened');

  // Check if colors applied
  const displayBg = await displayPage.locator('#displayArea').evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );

  console.log(`Display window background: ${displayBg}`);

  if (displayBg.includes('42, 42, 42') || displayBg.includes('2a2a2a')) {
    console.log('✓ Background color persisted!');
  } else {
    console.log('✗ Background color NOT persisted (expected #2a2a2a)');
  }

  // Take screenshots
  await page.screenshot({ path: 'test-control-nlt.png' });
  await displayPage.screenshot({ path: 'test-display-nlt.png' });
  console.log('\n✓ Screenshots saved');

  await browser.close();
})();
