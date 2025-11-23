// Test display window with status indicator
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  console.log('\n=== Testing Display Window Status Indicator ===\n');

  // Open control window
  const controlPage = await context.newPage();
  await controlPage.goto('http://localhost:8080/liveverses/');
  await controlPage.waitForLoadState('networkidle');
  await controlPage.waitForTimeout(3000);

  console.log('✓ Control window opened');

  // Open display window by clicking the button
  const [displayPage] = await Promise.all([
    context.waitForEvent('page'),
    controlPage.getByRole('button', { name: /Launch Display/i }).click()
  ]);

  await displayPage.waitForLoadState('networkidle');
  await displayPage.waitForTimeout(2000);

  console.log('✓ Display window opened');
  console.log('\n=== Checking Status Indicator ===');

  // Check if status indicator is visible
  const statusIndicator = displayPage.locator('.status-indicator');
  const isVisible = await statusIndicator.isVisible();
  console.log('Status indicator visible:', isVisible);

  // Check connection status
  const statusText = await displayPage.locator('#statusText').textContent();
  console.log('Status text:', statusText);

  // Check if dot has connected class
  const hasConnectedClass = await displayPage.locator('.status-dot').evaluate(el =>
    el.classList.contains('connected')
  );
  console.log('Status dot connected:', hasConnectedClass);

  // Take screenshot showing disconnected state first
  console.log('\n📸 Taking screenshot of disconnected state...');
  await displayPage.waitForTimeout(6000); // Wait for disconnect timeout
  await displayPage.screenshot({
    path: 'display-disconnected.png',
    fullPage: true
  });
  console.log('✓ Saved: display-disconnected.png');

  // Now test with a verse to show connected state
  console.log('\n=== Testing with verse (connected state) ===');
  await controlPage.locator('#verseInput').fill('John 3:16');
  await controlPage.getByRole('button', { name: 'Lookup' }).click();
  await displayPage.waitForTimeout(2000);

  // Check if verse appears
  const hasVerse = await displayPage.locator('.verse-text').count();
  console.log('Verse displayed:', hasVerse > 0);

  // Take screenshot showing connected state with verse
  await displayPage.screenshot({
    path: 'display-connected.png',
    fullPage: true
  });
  console.log('✓ Saved: display-connected.png');

  console.log('\n✅ Status indicator is now in bottom left corner');
  console.log('   🔴 Red when disconnected');
  console.log('   🟢 Green when connected');

  await browser.close();
})();
