import { test, expect } from '@playwright/test';

test('AI copilot docs page explains triage and safety', async ({ page }) => {
  await page.goto('/docs/ai-copilot');

  await expect(page.getByRole('heading', { name: 'AI copilot' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AI triage' })).toBeVisible();
  await expect(
    page.getByText(/OpsFlow will classify the ticket, choose a priority, suggest an assignee/i),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Auto-replies' })).toBeVisible();
  await expect(
    page.getByText(/human must click to send the suggestion as a reply/i),
  ).toBeVisible();
});
