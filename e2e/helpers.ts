import { type Page, expect } from '@playwright/test';

/**
 * Injects a fake authenticated session into localStorage so the app
 * treats the browser as logged-in without going through the Telegram
 * OTP flow (which requires a real bot interaction).
 *
 * Call this BEFORE navigating to any protected page.
 */
export async function loginAsCompanyAdmin(page: Page) {
  await page.goto('/');

  // Build a minimal JWT-like payload the auth store will accept.
  // The app reads `user_type` from localStorage and then calls /api/v1/auth/me.
  // For E2E we intercept that call and return a canned profile.
  await page.evaluate(() => {
    localStorage.setItem('user_type', 'company_user');
    localStorage.setItem('access_token', 'e2e-test-token');
  });

  // Intercept the /me profile call so ProtectedRoute initializes correctly
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-user-1',
        first_name: 'Test',
        last_name: 'Admin',
        phone: '+998901234567',
        role: 'company_admin',
        company_id: 'e2e-company-1',
        company_subdomain: null,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        permissions: [
          'contacts.read', 'contacts.write', 'contacts.delete',
          'leads.read', 'leads.write', 'leads.delete',
          'deals.read', 'deals.write', 'deals.delete',
          'tasks.read', 'tasks.write', 'tasks.delete',
          'calls.read', 'calls.write',
        ],
      }),
    }),
  );
}

/**
 * Navigate to a protected page with an active session.
 * Combines login injection + navigation in one call.
 */
export async function gotoAuthenticated(page: Page, path: string) {
  await loginAsCompanyAdmin(page);
  await page.goto(path);
  // Wait for the app to finish initializing (loading spinner disappears)
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for Ant Design table to render rows.
 */
export async function waitForTableRows(page: Page) {
  await page.locator('.ant-table-tbody tr.ant-table-row').first().waitFor({ timeout: 10_000 });
}
