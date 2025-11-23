// Diagnostic test to check for verse loading issues
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Collect network errors
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure().errorText
    });
    console.log(`[NETWORK ERROR]: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('\n=== Starting Diagnostic Test ===\n');

  await page.goto('http://localhost:8765');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Wait for Bible data to load

  console.log('\n=== Checking Bible Data Load Status ===');

  // Check if Bible data loaded
  const bibleDataStatus = await page.evaluate(() => {
    return {
      KJV: window.bibleData?.KJV !== null,
      ASV: window.bibleData?.ASV !== null,
      WEB: window.bibleData?.WEB !== null,
      NLT: window.bibleData?.NLT !== null
    };
  });

  console.log('Bible data loaded:', bibleDataStatus);

  console.log('\n=== Testing Verse Lookup ===');

  // Type John 3:16
  await page.locator('#verseInput').fill('John 3:16');
  console.log('✓ Entered: John 3:16');

  // Click Lookup
  await page.getByRole('button', { name: 'Lookup' }).click();
  console.log('✓ Clicked Lookup button');

  // Wait for result
  await page.waitForTimeout(2000);

  // Check results
  const hasVerse = await page.locator('.verse-text').count();
  const hasError = await page.locator('.error-message').count();

  console.log('\n=== Results ===');
  console.log('Verse elements found:', hasVerse);
  console.log('Error elements found:', hasError);

  if (hasVerse > 0) {
    const verseText = await page.locator('.verse-text').first().textContent();
    console.log('✅ SUCCESS! Verse text:', verseText.substring(0, 150) + '...');
  } else if (hasError > 0) {
    const errorText = await page.locator('.error-message').textContent();
    console.log('❌ ERROR DISPLAYED:', errorText);
  } else {
    console.log('❌ NO VERSE OR ERROR FOUND');
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log('Console messages:', consoleMessages.length);
  console.log('Network errors:', networkErrors.length);

  if (networkErrors.length > 0) {
    console.log('\n❌ NETWORK ERRORS DETECTED:');
    networkErrors.forEach(err => {
      console.log(`  - ${err.url}: ${err.failure}`);
    });
  }

  // Take screenshot
  await page.screenshot({ path: 'diagnostic-result.png', fullPage: true });
  console.log('\n📸 Screenshot saved to diagnostic-result.png');

  await browser.close();
})();
