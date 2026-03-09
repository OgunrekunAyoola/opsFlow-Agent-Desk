import { test, expect } from '@playwright/test';

test('home page renders hero and signup link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The future of support' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start your evolution' })).toBeVisible();
});

