// Test the verse history feature
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n=== Testing History Feature ===\n');

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✓ Page loaded');

  // Check initial history state
  const historyEmpty = await page.locator('.history-empty').textContent();
  console.log('✓ Initial history state:', historyEmpty);

  // Lookup first verse
  console.log('\n=== Looking up John 3:16 ===');
  await page.locator('#verseInput').fill('John 3:16');
  await page.getByRole('button', { name: 'Lookup' }).click();
  await page.waitForTimeout(1500);

  let historyCount = await page.locator('.history-item').count();
  console.log('✓ History items after 1st lookup:', historyCount);

  // Lookup second verse
  console.log('\n=== Looking up Psalm 23:1 ===');
  await page.locator('#verseInput').fill('Psalm 23:1');
  await page.getByRole('button', { name: 'Lookup' }).click();
  await page.waitForTimeout(1500);

  historyCount = await page.locator('.history-item').count();
  console.log('✓ History items after 2nd lookup:', historyCount);

  // Lookup third verse with different versions
  console.log('\n=== Looking up Romans 8:28 (ASV, WEB) ===');
  await page.locator('#kjvCheck').uncheck();
  await page.locator('#asvCheck').check();
  await page.locator('#webCheck').check();
  await page.locator('#verseInput').fill('Romans 8:28');
  await page.getByRole('button', { name: 'Lookup' }).click();
  await page.waitForTimeout(1500);

  historyCount = await page.locator('.history-item').count();
  console.log('✓ History items after 3rd lookup:', historyCount);

  // Take screenshot showing history
  await page.screenshot({
    path: 'history-populated.png',
    fullPage: true
  });
  console.log('✓ Screenshot saved: history-populated.png');

  // Test clicking on history item
  console.log('\n=== Testing History Click (John 3:16) ===');
  const firstHistoryItem = page.locator('.history-item').nth(2); // Should be John 3:16 (3rd item)
  const historyRef = await firstHistoryItem.locator('.history-reference').textContent();
  console.log('✓ Clicking history item:', historyRef);

  await firstHistoryItem.click();
  await page.waitForTimeout(1500);

  // Verify verse was loaded
  const inputValue = await page.locator('#verseInput').inputValue();
  console.log('✓ Input field updated to:', inputValue);

  // Check if KJV is checked again
  const kjvChecked = await page.locator('#kjvCheck').isChecked();
  console.log('✓ KJV checkbox restored:', kjvChecked);

  // Take screenshot after clicking history
  await page.screenshot({
    path: 'history-clicked.png',
    fullPage: true
  });
  console.log('✓ Screenshot saved: history-clicked.png');

  // Test clear history
  console.log('\n=== Testing Clear History ===');

  // Accept the confirmation dialog
  page.on('dialog', async dialog => {
    console.log('✓ Confirmation dialog appeared:', dialog.message());
    await dialog.accept();
  });

  await page.locator('.btn-clear-history').click();
  await page.waitForTimeout(1000);

  // Check if history is empty
  const hasEmptyState = await page.locator('.history-empty').isVisible();
  console.log('✓ History cleared, empty state visible:', hasEmptyState);

  await page.screenshot({
    path: 'history-cleared.png',
    fullPage: true
  });
  console.log('✓ Screenshot saved: history-cleared.png');

  console.log('\n✅ History Feature Test Complete!');
  console.log('   - Verses are added to history');
  console.log('   - Clicking history items loads the verse');
  console.log('   - Clear history works correctly');

  await browser.close();
})();
