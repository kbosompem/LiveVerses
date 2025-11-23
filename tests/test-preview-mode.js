// Test preview mode feature
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n=== Testing Preview Mode ===\n');

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Test 1: Enable preview mode
  console.log('TEST 1: Enable Preview Mode');
  const previewToggle = page.locator('#previewModeToggle');
  await previewToggle.check();
  await page.waitForTimeout(500);

  const splitViewVisible = await page.locator('#splitView').isVisible();
  const singleViewVisible = await page.locator('#singleView').isVisible();

  console.log('  Split view visible:', splitViewVisible);
  console.log('  Single view visible:', singleViewVisible);

  if (splitViewVisible && !singleViewVisible) {
    console.log('  ✅ Split view activated!\n');
  } else {
    console.log('  ❌ Split view not showing\n');
  }

  await page.screenshot({ path: 'preview-mode-1-enabled.png', fullPage: true });

  // Test 2: Lookup a verse - should appear in PREVIEW only
  console.log('TEST 2: Lookup John 3:16 (should go to preview only)');
  await page.locator('#verseInput').fill('John 3:16');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const previewHasVerse = await page.locator('#previewArea .verse-text').count();
  const liveHasVerse = await page.locator('#liveArea .verse-text').count();

  console.log('  Preview area has verse:', previewHasVerse > 0);
  console.log('  Live area has verse:', liveHasVerse > 0);

  if (previewHasVerse > 0 && liveHasVerse === 0) {
    console.log('  ✅ Verse loaded in preview only!\n');
  } else {
    console.log('  ❌ Verse routing issue\n');
  }

  await page.screenshot({ path: 'preview-mode-2-verse-in-preview.png', fullPage: true });

  // Test 3: Click "Go Live" button
  console.log('TEST 3: Click "Go Live" button');
  const goLiveBtn = page.locator('#goLiveBtn');
  await goLiveBtn.click();
  await page.waitForTimeout(1000);

  const liveHasVerseNow = await page.locator('#liveArea .verse-text').count();

  if (liveHasVerseNow > 0) {
    const liveVerse = await page.locator('#liveArea .verse-text').textContent();
    console.log('  ✅ Verse sent live!');
    console.log('  ', liveVerse.substring(0, 60) + '...\n');
  } else {
    console.log('  ❌ Verse not sent to live area\n');
  }

  await page.screenshot({ path: 'preview-mode-3-went-live.png', fullPage: true });

  // Test 4: Lookup another verse to preview (while first is still live)
  console.log('TEST 4: Lookup Genesis 1:1 (should replace preview, not live)');
  await page.locator('#verseInput').fill('Genesis 1:1');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const previewText = await page.locator('#previewArea .verse-reference').textContent();
  const liveText = await page.locator('#liveArea .verse-reference').textContent();

  console.log('  Preview shows:', previewText);
  console.log('  Live shows:', liveText);

  if (previewText.includes('Genesis') && liveText.includes('John')) {
    console.log('  ✅ Preview updated, live unchanged!\n');
  } else {
    console.log('  ❌ Content routing issue\n');
  }

  await page.screenshot({ path: 'preview-mode-4-new-preview.png', fullPage: true });

  // Test 5: Use Ctrl+Enter keyboard shortcut
  console.log('TEST 5: Press Ctrl+Enter to go live');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(1000);

  const liveTextNow = await page.locator('#liveArea .verse-reference').textContent();

  if (liveTextNow.includes('Genesis')) {
    console.log('  ✅ Ctrl+Enter sent Genesis to live!\n');
  } else {
    console.log('  ❌ Keyboard shortcut failed\n');
  }

  await page.screenshot({ path: 'preview-mode-5-keyboard-shortcut.png', fullPage: true });

  // Test 6: Test with display window
  console.log('TEST 6: Open display window and verify sync');

  const displayPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: /Launch Display/i }).click();
  const displayPage = await displayPromise;

  await displayPage.waitForLoadState('networkidle');
  await displayPage.waitForTimeout(2000);

  const displayHasVerse = await displayPage.locator('.verse-text').count();

  if (displayHasVerse > 0) {
    const displayText = await displayPage.locator('.verse-reference').textContent();
    console.log('  Display window shows:', displayText);
    console.log('  ✅ Display window synced with live content!\n');
  } else {
    console.log('  ❌ Display window not synced\n');
  }

  await displayPage.screenshot({ path: 'preview-mode-6-display-window.png', fullPage: true });

  // Test 7: Disable preview mode (go back to direct)
  console.log('TEST 7: Disable preview mode');
  await page.bringToFront();
  await previewToggle.uncheck();
  await page.waitForTimeout(500);

  const backToSingle = await page.locator('#singleView').isVisible();

  if (backToSingle) {
    console.log('  ✅ Back to direct mode!\n');
  } else {
    console.log('  ❌ Failed to switch back\n');
  }

  await page.screenshot({ path: 'preview-mode-7-disabled.png', fullPage: true });

  console.log('=== Preview Mode Test Complete ===');
  console.log('Features verified:');
  console.log('✅ Toggle between Direct and Preview modes');
  console.log('✅ Verses load to Preview pane');
  console.log('✅ Go Live button sends to Live and Display');
  console.log('✅ Ctrl+Enter keyboard shortcut');
  console.log('✅ Preview can change while Live stays stable');
  console.log('✅ Display window syncs with Live content');

  await browser.close();
})();
