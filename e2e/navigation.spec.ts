import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all list endpoints to avoid errors when navigating
    const emptyList = JSON.stringify({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0 });
    await page.route('**/api/v1/contacts?*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: emptyList }),
    );
    await page.route('**/api/v1/leads?*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: emptyList }),
    );
    await page.route('**/api/v1/deals?*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: emptyList }),
    );
    await page.route('**/api/v1/deals/pipeline-summary', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route('**/api/v1/tasks?*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: emptyList }),
    );
    await page.route('**/api/v1/calls?*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: emptyList }),
    );
    await page.route('**/api/v1/dashboard**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_calls: 0, total_leads: 0, total_deals: 0,
          total_tasks: 0, completed_tasks: 0, total_contacts: 0,
          recent_leads: [], recent_deals: [], recent_calls: [],
        }),
      }),
    );
  });

  test('sidebar shows correct nav items for admin', async ({ page }) => {
    await gotoAuthenticated(page, '/dashboard');

    const sidebar = page.locator('.sidebar-inner');

    // Core nav items for company admin
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Contacts')).toBeVisible();
    await expect(sidebar.getByText('Leads')).toBeVisible();
    await expect(sidebar.getByText('Deals')).toBeVisible();
    await expect(sidebar.getByText('Tasks')).toBeVisible();
    await expect(sidebar.getByText('Calls')).toBeVisible();

    // Admin-only items
    await expect(sidebar.getByText('Analytics')).toBeVisible();
    await expect(sidebar.getByText('Team')).toBeVisible();
  });

  test('navigate between pages', async ({ page }) => {
    await gotoAuthenticated(page, '/dashboard');

    // Click Contacts in sidebar
    await page.locator('.crm-sidebar-menu').getByText('Contacts').click();
    await expect(page).toHaveURL(/\/contacts/, { timeout: 5_000 });

    // Click Deals in sidebar
    await page.locator('.crm-sidebar-menu').getByText('Deals').click();
    await expect(page).toHaveURL(/\/deals/, { timeout: 5_000 });

    // Click Dashboard in sidebar
    await page.locator('.crm-sidebar-menu').getByText('Dashboard').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 });
  });

  test('page titles update on navigation', async ({ page }) => {
    await gotoAuthenticated(page, '/dashboard');

    // Navigate to contacts
    await page.locator('.crm-sidebar-menu').getByText('Contacts').click();
    await page.waitForURL(/\/contacts/);
    await expect(page).toHaveTitle(/contacts/i, { timeout: 5_000 });

    // Navigate to deals
    await page.locator('.crm-sidebar-menu').getByText('Deals').click();
    await page.waitForURL(/\/deals/);
    await expect(page).toHaveTitle(/deals/i, { timeout: 5_000 });
  });

  test('dark mode toggle works', async ({ page }) => {
    await gotoAuthenticated(page, '/dashboard');

    // Open profile popover
    await page.locator('.sidebar-profile-trigger').click();

    // The theme segmented control has sun/moon/laptop icons.
    // Click the dark mode option (MoonOutlined icon)
    const themeSegment = page.locator('.ant-segmented').filter({ has: page.locator('.anticon-moon') });
    await themeSegment.locator('.ant-segmented-item').nth(1).click(); // dark is second option

    // Body or html should have dark theme class or attribute
    // The app uses CSS variables via a theme store, so we check the data attribute or class
    await page.waitForTimeout(500);
    const htmlClass = await page.locator('html').getAttribute('class');
    const bodyClass = await page.locator('body').getAttribute('class');
    const hasDark = (htmlClass || '').includes('dark') || (bodyClass || '').includes('dark');

    // Also verify via localStorage
    const themeMode = await page.evaluate(() => localStorage.getItem('theme-mode'));

    // At least one indicator should confirm dark mode is set
    expect(hasDark || themeMode === 'dark').toBeTruthy();
  });
});
