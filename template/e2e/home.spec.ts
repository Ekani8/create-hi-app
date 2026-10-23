import { test, expect } from "@playwright/test";
test("shows the application shell", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your platform is ready." }),
  ).toBeVisible();
});
