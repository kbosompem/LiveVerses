// Quick test for John 3:16 lookup
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:8765');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✓ Page loaded');

  // Type John 3:16
  await page.locator('#verseInput').fill('John 3:16');
  console.log('✓ Typed: John 3:16');

  // Click Lookup
  await page.getByRole('button', { name: 'Lookup' }).click();
  console.log('✓ Clicked Lookup');

  // Wait for result
  await page.waitForTimeout(2000);

  // Check for verse text or error
  const hasVerse = await page.locator('.verse-text').count();
  const hasError = await page.locator('.error-message').count();

  if (hasVerse > 0) {
    const verseText = await page.locator('.verse-text').first().textContent();
    console.log('✓ SUCCESS! Verse found:');
    console.log('  ' + verseText.substring(0, 100) + '...');
  } else if (hasError > 0) {
    const errorText = await page.locator('.error-message').textContent();
    console.log('✗ FAILED! Error:');
    console.log('  ' + errorText);
  } else {
    console.log('✗ FAILED! No verse or error found');
  }

  // Take screenshot
  await page.screenshot({ path: 'test-result.png' });
  console.log('✓ Screenshot saved to test-result.png');

  await browser.close();
})();
