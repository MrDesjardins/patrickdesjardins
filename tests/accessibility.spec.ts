import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const staticRoutes = [
  "/",
  "/blog",
  "/blog/search",
  "/philosophy",
  "/philosophy/search",
];

function axeForPage(page: Page): AxeBuilder {
  return new AxeBuilder({ page: page })
    .exclude("iframe")
    .disableRules([
      // Existing visual design and third-party widgets still have contrast debt.
      // Keep structural/name/role/form checks active while that legacy work is
      // handled separately.
      "color-contrast",
      // The homepage portfolio sections use h5 for card labels. That visual
      // hierarchy predates this focused accessibility pass.
      "heading-order",
    ]);
}

for (const route of staticRoutes) {
  test(`has no axe violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await axeForPage(page).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("has no axe violations on one blog post", async ({ page }) => {
  await page.goto("/blog");
  const href = await page
    .locator(
      'article a[href^="/blog/"]:not([href="/blog/search"]):not([href^="/blog/page/"]):not([href^="/blog/for/"])',
    )
    .first()
    .getAttribute("href");

  await page.goto(href ?? "/blog/628");
  const results = await axeForPage(page).analyze();
  expect(results.violations).toEqual([]);
});
