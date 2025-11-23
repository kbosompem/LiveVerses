// Debug preview vs live pane rendering
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  console.log('\n=== Debugging Preview → Live Issue ===\n');

  await page.goto('http://localhost:8080/liveverses/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Enable preview mode
  await page.locator('#previewModeToggle').check();
  await page.waitForTimeout(500);

  // Check which versions are selected
  const kjvChecked = await page.locator('#kjvCheck').isChecked();
  const asvChecked = await page.locator('#asvCheck').isChecked();
  const webChecked = await page.locator('#webCheck').isChecked();
  const nltChecked = await page.locator('#nltCheck').isChecked();

  console.log('Version checkboxes:');
  console.log('  KJV:', kjvChecked);
  console.log('  ASV:', asvChecked);
  console.log('  WEB:', webChecked);
  console.log('  NLT:', nltChecked);
  console.log('');

  // Select all 4 versions
  if (!asvChecked) await page.locator('#asvCheck').check();
  if (!webChecked) await page.locator('#webCheck').check();
  if (!nltChecked) await page.locator('#nltCheck').check();
  await page.waitForTimeout(500);

  // Set side-by-side layout
  const sideBySideBtn = page.getByRole('button', { name: 'Side by Side' });
  const isActive = await sideBySideBtn.evaluate(el => el.classList.contains('active'));
  if (!isActive) {
    await sideBySideBtn.click();
    await page.waitForTimeout(500);
  }

  // Lookup verse
  await page.locator('#verseInput').fill('John 3:16');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  // Check preview pane HTML
  const previewHTML = await page.locator('#previewArea').innerHTML();
  console.log('=== PREVIEW PANE HTML ===');
  console.log(previewHTML.substring(0, 500));
  console.log('...\n');

  // Check if preview has side-by-side class
  const previewHasSideBySide = previewHTML.includes('side-by-side');
  console.log('Preview has "side-by-side" class:', previewHasSideBySide);

  // Count verse blocks in preview
  const previewVerseCount = await page.locator('#previewArea .verse-block').count();
  console.log('Preview verse blocks:', previewVerseCount);

  // Go live
  await page.locator('#goLiveBtn').click();
  await page.waitForTimeout(1000);

  // Check live pane HTML
  const liveHTML = await page.locator('#liveArea').innerHTML();
  console.log('\n=== LIVE PANE HTML ===');
  console.log(liveHTML.substring(0, 500));
  console.log('...\n');

  // Check if live has side-by-side class
  const liveHasSideBySide = liveHTML.includes('side-by-side');
  console.log('Live has "side-by-side" class:', liveHasSideBySide);

  // Count verse blocks in live
  const liveVerseCount = await page.locator('#liveArea .verse-block').count();
  console.log('Live verse blocks:', liveVerseCount);

  // Check computed styles
  const previewFlexDirection = await page.locator('#previewArea .verse-container').evaluate(el => {
    return window.getComputedStyle(el).flexDirection;
  });
  console.log('\nPreview flex-direction:', previewFlexDirection);

  const liveFlexDirection = await page.locator('#liveArea .verse-container').evaluate(el => {
    return window.getComputedStyle(el).flexDirection;
  });
  console.log('Live flex-direction:', liveFlexDirection);

  await page.screenshot({ path: 'debug-preview-live.png', fullPage: true });
  console.log('\n📸 Screenshot saved: debug-preview-live.png');

  await browser.close();
})();
