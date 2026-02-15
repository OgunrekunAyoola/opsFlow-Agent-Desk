import { test, expect } from '@playwright/test';

function uniqueEmail() {
  const id = Date.now().toString(36);
  return `user+${id}@example.com`;
}

test.describe('Authentication and landing', () => {
  test('mobile hamburger menu works on landing, pricing, and docs', async ({ page }) => {
    // 375px (iPhone SE style)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.getByRole('button', { name: /toggle navigation/i }).click();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /docs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start free/i })).toBeVisible();
    await page.getByRole('button', { name: /toggle navigation/i }).click();

    await page.goto('/pricing');
    await page.getByRole('button', { name: /toggle navigation/i }).click();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /docs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start free/i })).toBeVisible();
    await page.getByRole('button', { name: /toggle navigation/i }).click();

    await page.goto('/docs');
    await page.getByRole('button', { name: /toggle navigation/i }).click();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /docs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start free/i })).toBeVisible();
    await page.getByRole('button', { name: /toggle navigation/i }).click();

    // 768px (tablet) and 1024px (small desktop) still render correctly
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');
    await expect(page.getByText('OpsFlow')).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/');
    await expect(page.getByText('OpsFlow')).toBeVisible();
  });
  test('landing to login/signup/docs/pricing navigation works', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('OpsFlow')).toBeVisible();

    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/');
    await page.getByRole('link', { name: /get started/i }).click();
    await expect(page).toHaveURL(/\/signup/);

    await page.goto('/');
    await page.getByRole('link', { name: /pricing/i }).click();
    await expect(page).toHaveURL(/\/pricing/);

    await page.goto('/');
    await page.getByRole('link', { name: /docs/i }).click();
    await expect(page).toHaveURL(/\/docs/);
  });

  test('signup, login, and dashboard banner', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/signup');
    await page.getByPlaceholder('Acme Inc.').fill('E2E Tenant');
    await page.getByPlaceholder('Jane Doe').fill('E2E User');
    await page.getByPlaceholder('you@company.com').fill(email);
    await page.getByPlaceholder('Use a strong password').fill('StrongPass1!');

    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/account created/i)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByText(/please verify your email/i)).toBeVisible();

    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByPlaceholder('you@agency.com').fill(email);
    await page.getByPlaceholder('••••••••').fill('StrongPass1!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Tickets')).toBeVisible();
  });

  test('forgot and reset password flows show success states', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@agency.com').fill('nonexistent@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page.getByText(/if an account exists/i)).toBeVisible();

    await page.goto('/reset-password?token=fake');
    await page.getByPlaceholder('Enter new password').fill('StrongPass1!');
    await page.getByRole('button', { name: /reset password/i }).click();

    await expect(page.getByText(/invalid or expired/i)).toBeVisible();
  });
});
