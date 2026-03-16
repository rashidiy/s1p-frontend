import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers';

const mockDeals = [
  {
    id: 'd1',
    title: 'Enterprise License',
    contact_id: 'c1',
    contact_name: 'John Doe',
    lead_id: null,
    amount: 50000,
    currency: 'USD',
    stage: 'proposal',
    probability: 75,
    expected_close_date: '2025-09-30',
    assigned_to: 'u1',
    assigned_to_name: 'Sales Rep',
    description: null,
    created_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 'd2',
    title: 'Startup Plan',
    contact_id: 'c2',
    contact_name: 'Jane Smith',
    lead_id: null,
    amount: 12000,
    currency: 'USD',
    stage: 'prospecting',
    probability: 30,
    expected_close_date: '2025-10-15',
    assigned_to: null,
    assigned_to_name: null,
    description: null,
    created_at: '2025-08-01T00:00:00Z',
  },
];

const mockPipelineSummary = [
  { stage: 'prospecting', count: 1, total_value: 12000 },
  { stage: 'qualification', count: 0, total_value: 0 },
  { stage: 'proposal', count: 1, total_value: 50000 },
  { stage: 'negotiation', count: 0, total_value: 0 },
];

test.describe('Deals', () => {
  test.beforeEach(async ({ page }) => {
    // Mock deals list API
    await page.route('**/api/v1/deals?*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: mockDeals,
          total: 2,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      }),
    );

    // Mock pipeline summary
    await page.route('**/api/v1/deals/pipeline-summary', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPipelineSummary),
      }),
    );
  });

  test('deals page shows pipeline view by default', async ({ page }) => {
    await gotoAuthenticated(page, '/deals');

    // Pipeline board should be visible with stage columns
    await expect(page.locator('.pipeline-board')).toBeVisible({ timeout: 10_000 });

    // Deal cards should be rendered
    await expect(page.getByText('Enterprise License')).toBeVisible();
    await expect(page.getByText('Startup Plan')).toBeVisible();

    // Stage headers should be visible
    await expect(page.getByText('$50,000')).toBeVisible();
  });

  test('create new deal', async ({ page }) => {
    // Mock users list for assigned_to dropdown
    await page.route('**/api/v1/users?*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 'u1', first_name: 'Sales', last_name: 'Rep', role: 'company_operator' },
          ],
        }),
      }),
    );

    // Mock deal creation
    await page.route('**/api/v1/deals', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'd-new',
            title: 'New Deal',
            amount: 25000,
            currency: 'USD',
            stage: 'prospecting',
            probability: 50,
            created_at: '2025-09-01T00:00:00Z',
          }),
        });
      }
      return route.continue();
    });

    // Mock the detail page we redirect to
    await page.route('**/api/v1/deals/d-new', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'd-new',
          title: 'New Deal',
          amount: 25000,
          currency: 'USD',
          stage: 'prospecting',
          probability: 50,
          contact_id: null,
          contact_name: null,
          lead_id: null,
          assigned_to: null,
          assigned_to_name: null,
          expected_close_date: null,
          description: null,
          created_at: '2025-09-01T00:00:00Z',
        }),
      }),
    );

    await page.route('**/api/v1/deals/d-new/notes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await gotoAuthenticated(page, '/deals/new');

    // Fill the form
    await page.locator('#title').fill('New Deal');
    await page.locator('#amount').fill('25000');
    await page.locator('#probability').fill('50');

    // Submit
    await page.getByRole('button', { name: /create deal/i }).click();

    // Should redirect to the deal detail
    await expect(page).toHaveURL(/\/deals\/d-new/, { timeout: 10_000 });
  });

  test('switch between pipeline and list view', async ({ page }) => {
    await gotoAuthenticated(page, '/deals');

    // Pipeline view should be active by default
    await expect(page.locator('.pipeline-board')).toBeVisible({ timeout: 10_000 });

    // Click the "List" view toggle
    await page.getByText('List', { exact: false }).filter({ has: page.locator('.anticon-bars') }).or(
      page.locator('.ant-segmented-item').filter({ hasText: /list/i })
    ).first().click();

    // Pipeline board should be replaced by card grid or table
    await expect(page.locator('.pipeline-board')).not.toBeVisible({ timeout: 5_000 });

    // Deal cards in list view should show
    await expect(page.getByText('Enterprise License')).toBeVisible();
  });

  test('deal detail page loads', async ({ page }) => {
    await page.route('**/api/v1/deals/d1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeals[0]),
      }),
    );

    await page.route('**/api/v1/deals/d1/notes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await gotoAuthenticated(page, '/deals/d1');

    // Deal title should be visible
    await expect(page.getByText('Enterprise License')).toBeVisible();

    // Amount should be displayed
    await expect(page.getByText('50,000')).toBeVisible();
  });
});
