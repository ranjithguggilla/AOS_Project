import { test, expect } from '@playwright/test';

test('home page renders marketplace shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-heading')).toContainText(/BitForge/i);
  await expect(page.getByText('DIY Maker Kits Marketplace')).toBeVisible();
  await expect(page.getByText('Build. Learn. Create.')).toBeVisible();
  await expect(page.getByRole('link', { name: /BitForge home/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /shop kits/i })).toBeVisible();
});
