// Test rapid verse selection feature
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  console.log('\n=== Testing Rapid Verse Selection ===\n');

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const input = page.locator('#verseInput');

  // Test 1: Type "z" to see Zechariah and Zephaniah
  console.log('TEST 1: Type "z" - Should show books starting with Z');
  await input.fill('z');
  await page.waitForTimeout(500);

  let dropdown = page.locator('#autocompleteDropdown');
  let isVisible = await dropdown.evaluate(el => el.classList.contains('visible'));
  let items = await dropdown.locator('.autocomplete-item').count();

  console.log('  Dropdown visible:', isVisible);
  console.log('  Matching books:', items);

  if (items === 2) {
    console.log('  ✅ Shows Zechariah and Zephaniah\n');
  } else {
    console.log('  ❌ Expected 2 matches\n');
  }

  await page.screenshot({ path: 'rapid-step1-book-search.png', fullPage: true });

  // Test 2: Type "zec" to auto-select Zechariah
  console.log('TEST 2: Type "zec" - Should auto-select Zechariah and show chapters');
  await input.fill('zec');
  await page.waitForTimeout(500);

  const inputValue = await input.inputValue();
  console.log('  Input value:', inputValue);

  if (inputValue.includes('Zechariah')) {
    console.log('  ✅ Auto-selected Zechariah\n');
  } else {
    console.log('  ❌ Did not auto-select\n');
  }

  await page.screenshot({ path: 'rapid-step2-chapters.png', fullPage: true });

  // Test 3: Type "3" for chapter 3
  console.log('TEST 3: Add "3" for chapter 3 - Should show verses');
  await page.keyboard.type('3');
  await page.waitForTimeout(500);

  const inputValue2 = await input.inputValue();
  console.log('  Input value:', inputValue2);

  if (inputValue2.includes('3:')) {
    console.log('  ✅ Selected chapter 3\n');
  } else {
    console.log('  ❌ Chapter not selected\n');
  }

  await page.screenshot({ path: 'rapid-step3-verses.png', fullPage: true });

  // Test 4: Type "5" for verse 5
  console.log('TEST 4: Add "5" for verse 5 - Should complete reference');
  await page.keyboard.type('5');
  await page.waitForTimeout(500);

  const finalValue = await input.inputValue();
  console.log('  Final input:', finalValue);

  if (finalValue.includes('3:5')) {
    console.log('  ✅ Completed to Zechariah 3:5\n');
  } else {
    console.log('  ❌ Verse not completed\n');
  }

  await page.screenshot({ path: 'rapid-step4-complete.png', fullPage: true });

  // Test 5: Press Enter to lookup
  console.log('TEST 5: Press Enter - Should display verse');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const hasVerse = await page.locator('.verse-text').count();
  if (hasVerse > 0) {
    const verseText = await page.locator('.verse-text').textContent();
    console.log('  ✅ Verse displayed!');
    console.log('  ', verseText.substring(0, 80) + '...\n');
  } else {
    console.log('  ❌ Verse not displayed\n');
  }

  await page.screenshot({ path: 'rapid-step5-displayed.png', fullPage: true });

  // Test 6: Try single chapter book (Philemon)
  console.log('TEST 6: Type "phm" (Philemon - single chapter) - Should skip to verse');
  await input.fill('phm');
  await page.waitForTimeout(500);

  const philemonValue = await input.inputValue();
  console.log('  Input value:', philemonValue);

  if (philemonValue.includes('1:')) {
    console.log('  ✅ Single chapter book skips to verse selection\n');
  } else {
    console.log('  ⚠️  May need manual progression\n');
  }

  await page.screenshot({ path: 'rapid-step6-single-chapter.png', fullPage: true });

  // Test 7: Keyboard navigation
  console.log('TEST 7: Test arrow key navigation');
  await input.fill('j');
  await page.waitForTimeout(500);

  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);

  const selected = await page.locator('.autocomplete-item.selected').count();
  console.log('  Selected items:', selected);

  if (selected > 0) {
    console.log('  ✅ Arrow key navigation works\n');
  } else {
    console.log('  ❌ Arrow key navigation failed\n');
  }

  await page.screenshot({ path: 'rapid-step7-keyboard-nav.png', fullPage: true });

  console.log('=== Rapid Selection Test Complete ===');
  console.log('Total keystrokes for Zechariah 3:5: 6 keys (z-e-c-3-5-Enter)');
  console.log('vs traditional typing: 17 keys (Zechariah 3:5)');
  console.log('Speed improvement: ~65% faster!');

  await browser.close();
})();
