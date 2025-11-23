const { test, expect } = require('@playwright/test');

test.describe('LiveVerses User Guide Screenshots', () => {
  test.setTimeout(90000); // 90 seconds for all screenshots

  test('01 - Main Control Window Overview', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({
      path: 'screenshots/01-control-window-overview.png',
      fullPage: true
    });

    // Verify main elements are present
    await expect(page.locator('#verseInput')).toBeVisible();
    await expect(page.getByText('Launch Display')).toBeVisible();
  });

  test('02 - Entering a Verse Reference', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Type a verse reference
    await page.locator('#verseInput').click();
    await page.locator('#verseInput').fill('John 3:16');

    await page.waitForTimeout(500);

    // Highlight the input
    await page.locator('#verseInput').focus();

    await page.screenshot({
      path: 'screenshots/02-entering-verse.png',
      fullPage: true
    });
  });

  test('03 - Verse Displayed (Single Version)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter verse and lookup
    await page.locator('#verseInput').fill('John 3:16');
    await page.getByRole('button', { name: 'Lookup' }).click();

    await page.waitForTimeout(1000);

    // Wait for verse to appear
    await expect(page.locator('.verse-text')).toBeVisible();

    await page.screenshot({
      path: 'screenshots/03-verse-displayed-single.png',
      fullPage: true
    });
  });

  test('04 - Multiple Versions Side-by-Side', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select multiple versions
    await page.locator('#kjvCheck').check();
    await page.locator('#asvCheck').check();
    await page.locator('#webCheck').check();

    // Switch to side-by-side layout
    await page.getByRole('button', { name: 'Side by Side' }).click();

    // Enter and lookup verse
    await page.locator('#verseInput').fill('Psalm 23:1');
    await page.getByRole('button', { name: 'Lookup' }).click();

    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'screenshots/04-multiple-versions-side-by-side.png',
      fullPage: true
    });
  });

  test('05 - Multiple Versions Stacked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select multiple versions
    await page.locator('#kjvCheck').check();
    await page.locator('#asvCheck').check();

    // Use stacked layout (default)
    await page.getByRole('button', { name: 'Stacked' }).click();

    // Enter and lookup verse
    await page.locator('#verseInput').fill('Romans 8:28');
    await page.getByRole('button', { name: 'Lookup' }).click();

    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'screenshots/05-multiple-versions-stacked.png',
      fullPage: true
    });
  });

  test('06 - Verse Range Display', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter verse range
    await page.locator('#verseInput').fill('1 Corinthians 13:4-8');
    await page.getByRole('button', { name: 'Lookup' }).click();

    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'screenshots/06-verse-range.png',
      fullPage: true
    });
  });

  test('07 - Customization Controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Show a verse first
    await page.locator('#verseInput').fill('Matthew 5:16');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(1000);

    // Highlight the settings panel
    await page.evaluate(() => {
      const settings = document.querySelector('.settings-grid');
      if (settings) settings.style.border = '3px solid #ff0000';
    });

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/07-customization-controls.png',
      fullPage: true
    });
  });

  test('08 - Dark Background with Light Text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Setup verse
    await page.locator('#verseInput').fill('Genesis 1:1');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(1000);

    // Change to dark background
    await page.locator('#bgColor').fill('#000000');
    await page.locator('#textColor').fill('#ffffff');

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/08-dark-background.png',
      fullPage: true
    });
  });

  test('09 - Light Background with Dark Text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Setup verse
    await page.locator('#verseInput').fill('Philippians 4:13');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(1000);

    // Change to light background
    await page.locator('#bgColor').fill('#ffffff');
    await page.locator('#textColor').fill('#000000');

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/09-light-background.png',
      fullPage: true
    });
  });

  test('10 - Font Size Adjustment', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Setup verse
    await page.locator('#verseInput').fill('Proverbs 3:5-6');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(1000);

    // Increase font size to maximum
    await page.locator('#fontSize').fill('4.5');
    await page.locator('#fontSize').dispatchEvent('change');

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/10-large-font-size.png',
      fullPage: true
    });
  });

  test('11 - Display Window Button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Highlight the display window button
    await page.evaluate(() => {
      const btn = document.querySelector('button[onclick="openDisplayWindow()"]');
      btn.style.boxShadow = '0 0 20px 5px #ff0000';
    });

    await page.waitForTimeout(500);

    // Take screenshot focused on control panel
    await page.screenshot({
      path: 'screenshots/11-display-window-button.png',
      clip: { x: 0, y: 0, width: 1280, height: 200 }
    });
  });

  test('12 - Dual Window Setup', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click to open display window
    const [displayPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: 'Open Display Window' }).click()
    ]);

    await displayPage.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of control window
    await page.screenshot({
      path: 'screenshots/12-control-window.png',
      fullPage: true
    });

    // Take screenshot of display window
    await displayPage.screenshot({
      path: 'screenshots/13-display-window-empty.png',
      fullPage: true
    });

    // Now show a verse in both windows
    await page.locator('#verseInput').fill('John 3:16');
    await page.getByRole('button', { name: 'Lookup' }).click();

    await page.waitForTimeout(1500);

    // Screenshot control window with verse
    await page.screenshot({
      path: 'screenshots/14-control-with-verse.png',
      fullPage: true
    });

    // Screenshot display window with verse
    await displayPage.screenshot({
      path: 'screenshots/15-display-with-verse.png',
      fullPage: true
    });

    // Show connection status
    await page.evaluate(() => {
      const status = document.querySelector('#displayStatus');
      status.style.border = '2px solid #4CAF50';
      status.style.padding = '5px';
      status.style.borderRadius = '5px';
    });

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/16-connection-status.png',
      clip: { x: 0, y: 0, width: 600, height: 150 }
    });

    await displayPage.close();
  });

  test('13 - Version Selection Controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Highlight version checkboxes
    await page.evaluate(() => {
      const versionGroup = Array.from(document.querySelectorAll('.control-group'))
        .find(el => el.textContent.includes('Versions'));
      if (versionGroup) {
        versionGroup.style.border = '3px solid #4a90e2';
        versionGroup.style.padding = '10px';
        versionGroup.style.borderRadius = '8px';
      }
    });

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/17-version-selection.png',
      clip: { x: 0, y: 0, width: 1280, height: 250 }
    });
  });

  test('14 - Layout Toggle Controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Highlight layout controls
    await page.evaluate(() => {
      const layoutGroup = Array.from(document.querySelectorAll('.control-group'))
        .find(el => el.textContent.includes('Layout'));
      if (layoutGroup) {
        layoutGroup.style.border = '3px solid #4a90e2';
        layoutGroup.style.padding = '10px';
        layoutGroup.style.borderRadius = '8px';
      }
    });

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/18-layout-controls.png',
      clip: { x: 0, y: 0, width: 1280, height: 250 }
    });
  });

  test('15 - Popular Verse Examples', async ({ page }) => {
    const popularVerses = [
      { ref: 'Jeremiah 29:11', name: 'jeremiah-29-11' },
      { ref: 'Isaiah 41:10', name: 'isaiah-41-10' },
      { ref: 'Psalm 46:1', name: 'psalm-46-1' }
    ];

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const verse of popularVerses) {
      await page.locator('#verseInput').fill(verse.ref);
      await page.getByRole('button', { name: 'Lookup' }).click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `screenshots/19-example-${verse.name}.png`,
        fullPage: true
      });
    }
  });

  test('16 - Clear Display Function', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Show a verse first
    await page.locator('#verseInput').fill('John 14:6');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(1000);

    // Click clear
    await page.getByRole('button', { name: 'Clear' }).click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/20-cleared-display.png',
      fullPage: true
    });
  });
});
