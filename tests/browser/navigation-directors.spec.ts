import { expect, test } from "@playwright/test";

test("staggered mobile navigation remains keyboard-accessible", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("mobile-"),
    "Mobile viewport only.",
  );
  await page.goto("/", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "Mobile menu" });
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(
    menu.getByRole("link", { name: "Register for GIMUN or GMC" }),
  ).toBeVisible();
  await expect(menu.locator(".mobile-menu__link").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect.poll(async () => menu.locator(".mobile-menu__surface").evaluate(
    (element) => Math.abs(element.getBoundingClientRect().right - window.innerWidth),
  )).toBeLessThan(2);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
});

test("GIMUN directors end in a centered pair without an empty card", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("desktop-"),
    "Three-column layout only.",
  );
  await page.goto("/contact");
  const gimun = page.locator('.director-directory[data-track="gimun"]');
  const gmc = page.locator('.director-directory[data-track="gmc"]');
  test.skip(
    (await gimun.count()) === 0,
    "This test server has no published director contacts.",
  );
  await expect(gimun.locator("li")).toHaveCount(8);
  await expect(gmc.locator("li")).toHaveCount(6);
  await expect(page.locator(".director-stack > .stack__card")).toHaveCount(2);
  await expect(gimun.locator(".director-directory__header")).toContainText("GIMUN");
  await expect(gmc.locator(".director-directory__header")).toContainText("GMC");

  const frame = await gimun.boundingBox();
  const seventh = await gimun.locator("li").nth(6).boundingBox();
  const eighth = await gimun.locator("li").nth(7).boundingBox();
  expect(frame && seventh && eighth).toBeTruthy();
  if (!frame || !seventh || !eighth) return;
  const leftInset = seventh.x - frame.x;
  const rightInset = frame.x + frame.width - (eighth.x + eighth.width);
  expect(Math.abs(leftInset - rightInset)).toBeLessThan(6);
  expect(seventh.y).toBeCloseTo(eighth.y, 0);
});
