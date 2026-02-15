import { test, expect, Page } from '@playwright/test';

async function createTenantAndLogin(page: Page) {
  const email = `agent+${Date.now().toString(36)}@example.com`;

  await page.goto('/signup');
  await page.getByPlaceholder('Acme Inc.').fill('E2E Tenant');
  await page.getByPlaceholder('Jane Doe').fill('E2E Agent');
  await page.getByPlaceholder('you@company.com').fill(email);
  await page.getByPlaceholder('Use a strong password').fill('StrongPass1!');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page.getByText(/account created/i)).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByText(/dashboard/i)).toBeVisible();

  return { email };
}

test.describe('App shell and core flows', () => {
  test('dashboard widgets and navigation links work', async ({ page }) => {
    const { email } = await createTenantAndLogin(page);

    await expect(page.getByText(/overview of your support desk/i)).toBeVisible();

    await page.getByText('Total Tickets').click();
    await expect(page).toHaveURL(/\/tickets/);

    await page.goto('/dashboard');
    await page.getByText('Team Members').click();
    await expect(page).toHaveURL(/\/team/);

    await page.goto('/profile');
    await expect(page.getByText(email)).toBeVisible();
  });

  test('tickets list, create ticket, and detail with AI panel', async ({ page }) => {
    await createTenantAndLogin(page);

    await page.goto('/tickets');
    await expect(page.getByText(/tickets/i)).toBeVisible();

    await page.getByRole('button', { name: /new ticket/i }).click();

    await page.getByPlaceholder('Customer email').fill('customer@example.com');
    await page.getByPlaceholder('Short summary').fill('Login issue from E2E test');
    await page
      .getByPlaceholder('Provide full context for AI triage')
      .fill('Customer reports they cannot log in to the dashboard.');
    await page.getByRole('button', { name: /create ticket/i }).click();

    await expect(page.getByText(/ticket created/i)).toBeVisible();

    await page.getByText('Login issue from E2E test').first().click();
    await expect(page).toHaveURL(/\/tickets\/.+/);
    await expect(page.getByText(/discussion/i)).toBeVisible();

    const aiButton = page.getByRole('button', { name: /run ai triage/i });
    await aiButton.click();

    await expect(page.getByText(/reading ticket context/i)).toBeVisible();
    await expect(page.getByText(/analysis/i)).toBeVisible({ timeout: 15000 });
  });

  test('team members and invite flow renders', async ({ page }) => {
    await createTenantAndLogin(page);

    await page.goto('/team');
    await expect(page.getByText(/team members/i)).toBeVisible();

    await page.getByRole('button', { name: /add member/i }).click();
    await expect(page.getByText(/invite a teammate/i)).toBeVisible();
  });

  test('clients, settings, profile, docs, pricing and 404', async ({ page }) => {
    await createTenantAndLogin(page);

    await page.goto('/clients');
    await expect(page.getByText(/clients/i)).toBeVisible();

    await page.goto('/settings');
    await expect(page.getByText(/inbound address/i)).toBeVisible();

    await page.goto('/profile');
    await expect(page.getByText(/profile/i)).toBeVisible();

    await page.goto('/docs');
    await expect(page.getByText(/developer docs/i)).toBeVisible();

    await page.goto('/pricing');
    await expect(page.getByText(/clear plans for serious support teams/i)).toBeVisible();

    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
