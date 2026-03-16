import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers';

test.describe('Authentication', () => {
  test('login page renders with Telegram login button', async ({ page }) => {
    await page.goto('/login');

    // The AuthLayout renders a welcome title
    await expect(page.getByText('Welcome back')).toBeVisible();

    // The primary CTA is "Log in via Telegram"
    await expect(page.getByRole('button', { name: /telegram/i })).toBeVisible();
  });

  test('login page shows Telegram OTP flow on button click', async ({ page }) => {
    await page.goto('/login');

    // Mock the challenge creation endpoint
    await page.route('**/api/v1/auth/telegram/challenge', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          challenge_id: 'test-challenge-id',
          deep_link: 'https://t.me/s1pcrm_bot?start=test',
        }),
      }),
    );

    await page.getByRole('button', { name: /telegram/i }).click();

    // Should show the "waiting for bot" state
    await expect(page.getByText(/open telegram/i)).toBeVisible();

    // Cancel button should be available
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('OTP verification shows error on invalid code', async ({ page }) => {
    await page.goto('/login');

    // Mock challenge creation
    await page.route('**/api/v1/auth/telegram/challenge', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          challenge_id: 'test-challenge-id',
          deep_link: 'https://t.me/s1pcrm_bot?start=test',
        }),
      }),
    );

    // Mock polling to immediately return otp_sent
    await page.route('**/api/v1/auth/telegram/challenge/*/status', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'otp_sent' }),
      }),
    );

    // Mock OTP verify to fail
    await page.route('**/api/v1/auth/telegram/verify', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid code' }),
      }),
    );

    await page.getByRole('button', { name: /telegram/i }).click();

    // Wait for OTP input to appear
    await page.locator('input[placeholder="000000"]').waitFor({ timeout: 10_000 });

    // Type a 6-digit OTP (auto-submits)
    await page.locator('input[placeholder="000000"]').fill('123456');

    // Error alert should appear
    await expect(page.locator('.ant-alert-error')).toBeVisible({ timeout: 5_000 });
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await gotoAuthenticated(page, '/dashboard');

    // Mock the logout endpoint
    await page.route('**/api/v1/auth/logout', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    );

    // Open the profile popover by clicking the user avatar area
    await page.locator('.sidebar-profile-trigger').click();

    // Click "Log out"
    await page.getByText('Log out').click();

    // Should redirect to /login
    await expect(page).toHaveURL(/\/login/);

    // localStorage should be cleared
    const userType = await page.evaluate(() => localStorage.getItem('user_type'));
    expect(userType).toBeNull();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    // Navigate directly to a protected route without setting up auth
    await page.goto('/dashboard');

    // ProtectedRoute should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
