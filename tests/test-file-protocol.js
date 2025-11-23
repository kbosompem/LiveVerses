// Test to demonstrate the issue when opening via file:// protocol
const { chromium } = require('playwright');
const path = require('path');

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

  console.log('\n=== Testing with file:// protocol ===\n');

  // Open the file directly using file:// protocol
  const filePath = path.resolve(__dirname, '..', 'index.html');
  const fileUrl = `file://${filePath}`;

  console.log(`Opening: ${fileUrl}\n`);

  await page.goto(fileUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000); // Wait longer for potential Bible data to load

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

  // Try to lookup a verse
  await page.locator('#verseInput').fill('John 3:16');
  console.log('✓ Entered: John 3:16');

  await page.getByRole('button', { name: 'Lookup' }).click();
  console.log('✓ Clicked Lookup button');

  await page.waitForTimeout(2000);

  // Check results
  const hasVerse = await page.locator('.verse-text').count();
  const hasError = await page.locator('.error-message').count();

  console.log('\n=== Results ===');
  console.log('Verse elements found:', hasVerse);
  console.log('Error elements found:', hasError);

  if (hasVerse > 0) {
    const verseText = await page.locator('.verse-text').first().textContent();
    console.log('✅ VERSES ARE LOADING');
    console.log('Verse text:', verseText.substring(0, 100) + '...');
  } else if (hasError > 0) {
    const errorText = await page.locator('.error-message').textContent();
    console.log('❌ ERROR DISPLAYED:', errorText);
  } else {
    console.log('❌ NO VERSE FOUND - Verses are NOT loading!');
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log('Total console messages:', consoleMessages.length);
  console.log('Total network errors:', networkErrors.length);

  if (networkErrors.length > 0) {
    console.log('\n❌ NETWORK ERRORS DETECTED (This is likely the problem!):');
    networkErrors.forEach(err => {
      console.log(`  - ${err.url}`);
      console.log(`    Error: ${err.failure}`);
    });
    console.log('\nℹ️  CORS policy prevents fetch() from loading local files via file:// protocol');
    console.log('ℹ️  Solution: Run a local web server instead');
  }

  // Take screenshot
  await page.screenshot({ path: 'file-protocol-test.png', fullPage: true });
  console.log('\n📸 Screenshot saved to file-protocol-test.png');

  await browser.close();
})();
