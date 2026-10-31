import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /engineering workspace foundation/i }),
  ).toBeVisible();
});

test("unauthenticated dashboard redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
