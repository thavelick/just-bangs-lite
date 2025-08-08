import { expect, test } from "@playwright/test";

test.describe("Settings Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should open and close settings modal", async ({ page }) => {
    const hamburgerButton = page.locator(".hamburger-menu");
    const settingsPanel = page.locator(".settings-panel");

    await expect(settingsPanel).toHaveAttribute("aria-hidden", "true");

    await hamburgerButton.click();
    await expect(settingsPanel).toHaveAttribute("aria-hidden", "false");

    const closeButton = page.locator(".close-button");
    await closeButton.click();
    await expect(settingsPanel).toHaveAttribute("aria-hidden", "true");
  });

  test("should save default search engine selection", async ({ page }) => {
    const hamburgerButton = page.locator(".hamburger-menu");

    await hamburgerButton.click();

    const githubRadio = page.locator('input[name="default-bang"][value="gh"]');
    await githubRadio.click();

    const saveMessage = page.locator(".save-message");
    await expect(saveMessage).toBeVisible();

    await page.locator(".close-button").click();

    await hamburgerButton.click();
    await expect(githubRadio).toBeChecked();
  });

  test("should persist settings across page reloads", async ({ page }) => {
    const hamburgerButton = page.locator(".hamburger-menu");

    await hamburgerButton.click();

    const wikipediaRadio = page.locator(
      'input[name="default-bang"][value="w"]',
    );
    await wikipediaRadio.click();

    await page.reload();

    await hamburgerButton.click();
    await expect(wikipediaRadio).toBeChecked();
  });
});
