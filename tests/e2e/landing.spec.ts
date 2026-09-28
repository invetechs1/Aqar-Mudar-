import { test, expect } from "@playwright/test";

test("landing page renders in Arabic RTL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("العراب Certified", { exact: false }).first()).toBeVisible();
});

test("locale switch to English changes dir and lang", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("browse to properties list", async ({ page }) => {
  await page.goto("/properties");
  await expect(page.getByRole("heading", { name: /العقارات المتاحة/ })).toBeVisible();
});

test("health endpoint returns ok/degraded", async ({ request }) => {
  const res = await request.get("/api/health");
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty("status");
});
