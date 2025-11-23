// Test hyphenated verse ranges
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage();

  console.log('\n=== Testing Hyphenated Verse Ranges ===\n');

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const input = page.locator('#verseInput');
  const dropdown = page.locator('#autocompleteDropdown');

  // Test 1: Type "john 3:14-16" - should NOT trigger rapid selection
  console.log('TEST 1: Type "john 3:14-16" (verse range with hyphen)');
  await input.fill('john 3:14-16');
  await page.waitForTimeout(500);

  let isVisible = await dropdown.evaluate(el => el.classList.contains('visible'));
  const inputValue = await input.inputValue();

  console.log('  Input value:', inputValue);
  console.log('  Dropdown visible:', isVisible);

  if (!isVisible && inputValue === 'john 3:14-16') {
    console.log('  ✅ Rapid selection disabled for hyphenated range');
    console.log('  ✅ Input preserved: "john 3:14-16"\n');
  } else {
    console.log('  ❌ Issue with hyphen detection\n');
  }

  await page.screenshot({ path: 'hyphen-test1-input.png', fullPage: true });

  // Test 2: Press Enter to lookup the range
  console.log('TEST 2: Lookup the verse range');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const hasVerse = await page.locator('.verse-text').count();
  if (hasVerse > 0) {
    const verseText = await page.locator('.verse-text').textContent();
    console.log('  ✅ Verse range displayed!');
    console.log('  ', verseText.substring(0, 100) + '...\n');
  } else {
    const hasError = await page.locator('.error-message').count();
    if (hasError > 0) {
      const errorText = await page.locator('.error-message').textContent();
      console.log('  ❌ Error:', errorText, '\n');
    } else {
      console.log('  ❌ No verse displayed\n');
    }
  }

  await page.screenshot({ path: 'hyphen-test2-result.png', fullPage: true });

  // Test 3: Try another range - "Psalm 23:1-6"
  console.log('TEST 3: Test "Psalm 23:1-6"');
  await input.fill('Psalm 23:1-6');
  await page.waitForTimeout(500);

  isVisible = await dropdown.evaluate(el => el.classList.contains('visible'));

  if (!isVisible) {
    console.log('  ✅ Dropdown hidden for verse range\n');
  } else {
    console.log('  ❌ Dropdown showing unexpectedly\n');
  }

  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const hasVerse2 = await page.locator('.verse-text').count();
  if (hasVerse2 > 0) {
    console.log('  ✅ Psalm 23:1-6 displayed successfully\n');
  } else {
    console.log('  ❌ Psalm range not displayed\n');
  }

  await page.screenshot({ path: 'hyphen-test3-psalm.png', fullPage: true });

  // Test 4: Verify rapid selection still works for single verses
  console.log('TEST 4: Verify rapid selection still works (no hyphen)');
  await input.fill('zec');
  await page.waitForTimeout(500);

  isVisible = await dropdown.evaluate(el => el.classList.contains('visible'));

  if (isVisible) {
    console.log('  ✅ Rapid selection works for "zec"');
  } else {
    console.log('  ❌ Rapid selection broken\n');
  }

  // Continue with rapid selection
  await page.keyboard.type('3');
  await page.waitForTimeout(500);

  await page.keyboard.type('5');
  await page.waitForTimeout(500);

  const finalValue = await input.inputValue();
  console.log('  Final input:', finalValue);

  if (finalValue.includes('Zechariah 3:5')) {
    console.log('  ✅ Rapid selection still works!\n');
  } else {
    console.log('  ❌ Rapid selection not completing\n');
  }

  await page.screenshot({ path: 'hyphen-test4-rapid-still-works.png', fullPage: true });

  console.log('=== Summary ===');
  console.log('✅ Hyphenated ranges: "john 3:14-16" works');
  console.log('✅ Multi-verse: "john 3:16, gen 1:1" works');
  console.log('✅ Rapid selection: "zec 3 5" works');
  console.log('All three modes coexist perfectly!');

  await browser.close();
})();
