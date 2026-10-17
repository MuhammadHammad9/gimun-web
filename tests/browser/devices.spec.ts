import { expect, test, type Browser } from '@playwright/test';
import committees from '../../content/committees.json';

// Every public page on the phone and tablet sizes people actually use, from
// the narrowest (old iPhone SE, Galaxy Fold cover screen) to an iPad, plus a
// phone held sideways. One project runs the sweep so it isn't repeated.
const devices = [
  { name: 'iPhone SE (1st gen) 320', width: 320, height: 568, scale: 2 },
  { name: 'Galaxy Z Fold cover 344', width: 344, height: 882, scale: 3 },
  { name: 'Galaxy S 360', width: 360, height: 780, scale: 3 },
  { name: 'Pixel 7 393', width: 393, height: 852, scale: 2.75 },
  { name: 'Galaxy A / Pixel XL 412', width: 412, height: 915, scale: 2.6 },
  { name: 'iPhone Pro Max 430', width: 430, height: 932, scale: 3 },
  { name: 'iPhone landscape 844', width: 844, height: 390, scale: 3 },
  { name: 'iPad mini 744', width: 744, height: 1133, scale: 2 },
  { name: 'iPad Air 820', width: 820, height: 1180, scale: 2 },
];

const routes = [
  '/',
  '/gimun',
  '/gimun/committees',
  ...committees.map((committee) => `/gimun/committees/${committee.slug}`),
  '/gimun/rules',
  '/moot-cup',
  '/moot-cup/categories',
  '/moot-cup/rules',
  '/schedule',
  '/resources',
  '/register',
  '/about',
  '/about/team',
  '/about/venue',
  '/about/faq',
  '/about/sponsors',
  '/about/gallery',
  '/announcements',
  '/results',
  '/contact',
  '/privacy',
];

async function sweep(browser: Browser, device: (typeof devices)[number]) {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.scale,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`${page.url()} script error: ${error.message}`));

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'load' });
    if (response?.status() !== 200) problems.push(`${route} returned ${response?.status()}`);
    await page.waitForTimeout(400);
    const found = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const issues: string[] = [];
      if (document.documentElement.scrollWidth > width + 1) {
        issues.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide)`);
      }
      // Content that runs past the right edge without a scroller or clip
      // around it is cut off for the visitor even when the page itself is clipped.
      const clipped = (element: Element) => {
        for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
          const { overflowX, position } = getComputedStyle(node);
          if (overflowX !== 'visible' || position === 'fixed') return true;
        }
        return false;
      };
      for (const element of document.body.querySelectorAll('*')) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || rect.right <= width + 2) continue;
        const style = getComputedStyle(element);
        if (style.visibility === 'hidden' || style.position === 'fixed' || element.closest('[aria-hidden="true"], .sr-only')) continue;
        if (clipped(element)) continue;
        const label = `${element.tagName.toLowerCase()}${element.className && typeof element.className === 'string' ? '.' + element.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
        issues.push(`${label} runs ${Math.round(rect.right - width)}px past the edge`);
        if (issues.length > 4) break;
      }
      return issues;
    });
    for (const issue of found) problems.push(`${route}: ${issue}`);
  }

  await context.close();
  return problems;
}

for (const device of devices) {
  test(`every page fits ${device.name}`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-375', 'The device sweep sets its own viewports; one project runs it.');
    test.setTimeout(600_000);
    expect(await sweep(browser, device)).toEqual([]);
  });
}
