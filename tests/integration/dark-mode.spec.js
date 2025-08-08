import { test, expect } from "@playwright/test";

test.describe("Dark Mode Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should toggle dark mode and persist preference", async ({ page }) => {
    const html = page.locator("html");
    const darkModeToggle = page.locator(".dark-mode-toggle");
    const toggleSlider = page.locator(".toggle-slider");

    await expect(html).not.toHaveClass(/dark-mode/);

    const sliderContent = await toggleSlider.evaluate((el) =>
      window.getComputedStyle(el, "::after").getPropertyValue("content"),
    );
    expect(sliderContent).toBe('"☀️"');

    await darkModeToggle.click();
    await expect(html).toHaveClass(/dark-mode/);

    const darkSliderContent = await toggleSlider.evaluate((el) =>
      window.getComputedStyle(el, "::after").getPropertyValue("content"),
    );
    expect(darkSliderContent).toBe('"🌙"');

    await page.reload();
    await expect(html).toHaveClass(/dark-mode/);

    await darkModeToggle.click();
    await expect(html).not.toHaveClass(/dark-mode/);

    const lightSliderContent = await toggleSlider.evaluate((el) =>
      window.getComputedStyle(el, "::after").getPropertyValue("content"),
    );
    expect(lightSliderContent).toBe('"☀️"');
  });
});
