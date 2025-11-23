// Test nginx deployment
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n=== Testing nginx deployment ===\n');
  console.log('URL: http://localhost:8080/liveverses/\n');

  // Collect console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Collect network errors
  page.on('requestfailed', request => {
    console.log(`[NETWORK ERROR]: ${request.url()} - ${request.failure().errorText}`);
  });

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('\n=== Checking Bible Data ===');
  const bibleDataStatus = await page.evaluate(() => {
    return {
      KJV: window.bibleData?.KJV !== null,
      ASV: window.bibleData?.ASV !== null,
      WEB: window.bibleData?.WEB !== null,
      NLT: window.bibleData?.NLT !== null
    };
  });

  console.log('Bible data loaded:', bibleDataStatus);

  console.log('\n=== Testing John 3:16 ===');
  await page.locator('#verseInput').fill('John 3:16');
  await page.getByRole('button', { name: 'Lookup' }).click();
  await page.waitForTimeout(2000);

  const hasVerse = await page.locator('.verse-text').count();
  const hasError = await page.locator('.error-message').count();

  if (hasVerse > 0) {
    const verseText = await page.locator('.verse-text').first().textContent();
    console.log('✅ SUCCESS! Verses are loading');
    console.log('Verse:', verseText.substring(0, 100) + '...');
  } else if (hasError > 0) {
    const errorText = await page.locator('.error-message').textContent();
    console.log('❌ ERROR:', errorText);
  } else {
    console.log('❌ FAILED: No verse found');
  }

  await page.screenshot({ path: 'nginx-deployment-test.png', fullPage: true });
  console.log('\n📸 Screenshot: nginx-deployment-test.png');
  console.log('\n✨ App is deployed at: http://localhost:8080/liveverses/');

  await browser.close();
})();
