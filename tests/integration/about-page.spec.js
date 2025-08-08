import { expect, test } from "@playwright/test";

test.describe("About Page", () => {
  test("should load about page with dark mode toggle", async ({ page }) => {
    await page.goto("/about/");

    await expect(page.locator("h1")).toContainText("About Just Bangs");

    const darkModeToggle = page.locator(".dark-mode-toggle");
    await expect(darkModeToggle).toBeVisible();

    await darkModeToggle.click();
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
  });
});
