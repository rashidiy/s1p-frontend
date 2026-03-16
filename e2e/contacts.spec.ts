import { test, expect } from '@playwright/test';
import { gotoAuthenticated, waitForTableRows } from './helpers';

test.describe('Contacts', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept contacts list API
    await page.route('**/api/v1/contacts?*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'c1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              company_name: 'Acme Corp',
              position: 'CTO',
              source: 'Website',
              tags: ['vip'],
              total_leads: 2,
              total_deals: 1,
              total_calls: 3,
              created_at: '2025-06-01T10:00:00Z',
            },
            {
              id: 'c2',
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane@corp.io',
              phone: '+9876543210',
              company_name: 'TechCo',
              position: 'VP Sales',
              source: 'Referral',
              tags: [],
              total_leads: 0,
              total_deals: 3,
              total_calls: 0,
              created_at: '2025-07-15T08:30:00Z',
            },
          ],
          total: 2,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      }),
    );
  });

  test('contacts page shows table view', async ({ page }) => {
    await gotoAuthenticated(page, '/contacts');

    // Table should be visible with contact rows
    await waitForTableRows(page);
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();

    // "Add Contact" button should be visible
    await expect(page.getByRole('button', { name: /add contact/i })).toBeVisible();
  });

  test('create new contact', async ({ page }) => {
    // Mock the create endpoint
    await page.route('**/api/v1/contacts', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'c-new',
            first_name: 'New',
            last_name: 'Contact',
            email: 'new@test.com',
            phone: null,
            company_name: null,
            position: null,
            source: null,
            tags: [],
            total_leads: 0,
            total_deals: 0,
            total_calls: 0,
            created_at: '2025-08-01T00:00:00Z',
          }),
        });
      }
      return route.continue();
    });

    // Mock the detail page that we'll be redirected to
    await page.route('**/api/v1/contacts/c-new', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'c-new',
          first_name: 'New',
          last_name: 'Contact',
          email: 'new@test.com',
          phone: null,
          company_name: null,
          position: null,
          source: null,
          tags: [],
          total_leads: 0,
          total_deals: 0,
          total_calls: 0,
          created_at: '2025-08-01T00:00:00Z',
        }),
      }),
    );

    await page.route('**/api/v1/contacts/c-new/notes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.route('**/api/v1/contacts/c-new/activity', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ contact_id: 'c-new', leads: [], deals: [], calls: [] }),
      }),
    );

    await gotoAuthenticated(page, '/contacts/new');

    // Fill the form
    await page.locator('#first_name').fill('New');
    await page.locator('#last_name').fill('Contact');
    await page.locator('#email').fill('new@test.com');

    // Submit
    await page.getByRole('button', { name: /create contact/i }).click();

    // Should redirect to the new contact's detail page
    await expect(page).toHaveURL(/\/contacts\/c-new/, { timeout: 10_000 });
  });

  test('view contact detail', async ({ page }) => {
    // Mock contact detail endpoint
    await page.route('**/api/v1/contacts/c1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'c1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company_name: 'Acme Corp',
          position: 'CTO',
          source: 'Website',
          tags: ['vip'],
          total_leads: 2,
          total_deals: 1,
          total_calls: 3,
          created_at: '2025-06-01T10:00:00Z',
        }),
      }),
    );

    await page.route('**/api/v1/contacts/c1/notes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.route('**/api/v1/contacts/c1/activity', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ contact_id: 'c1', leads: [], deals: [], calls: [] }),
      }),
    );

    await gotoAuthenticated(page, '/contacts/c1');

    // Contact info should be displayed
    await expect(page.getByText('john@example.com')).toBeVisible();
    await expect(page.getByText('+1234567890')).toBeVisible();
    await expect(page.getByText('Acme Corp')).toBeVisible();

    // Edit and Delete buttons should be visible (admin has write+delete perms)
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  test('edit contact', async ({ page }) => {
    // Mock contact detail
    await page.route('**/api/v1/contacts/c1', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'c1',
            first_name: 'John',
            last_name: 'Updated',
            email: 'john@example.com',
            phone: '+1234567890',
            company_name: 'Acme Corp',
            position: 'CTO',
            source: 'Website',
            tags: ['vip'],
            total_leads: 2,
            total_deals: 1,
            total_calls: 3,
            created_at: '2025-06-01T10:00:00Z',
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'c1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company_name: 'Acme Corp',
          position: 'CTO',
          source: 'Website',
          tags: ['vip'],
          total_leads: 2,
          total_deals: 1,
          total_calls: 3,
          created_at: '2025-06-01T10:00:00Z',
        }),
      });
    });

    await page.route('**/api/v1/contacts/c1/notes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.route('**/api/v1/contacts/c1/activity', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ contact_id: 'c1', leads: [], deals: [], calls: [] }),
      }),
    );

    await gotoAuthenticated(page, '/contacts/c1');

    // Click Edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Edit form should appear — the last name input should be editable
    const lastNameInput = page.locator('input').filter({ has: page.locator('[value="Doe"]') });
    await lastNameInput.fill('Updated');

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    // Success message should appear
    await expect(page.locator('.ant-message')).toBeVisible({ timeout: 5_000 });
  });

  test('search contacts', async ({ page }) => {
    // Track search requests
    let lastSearchQuery = '';
    await page.route('**/api/v1/contacts?*', (route) => {
      const url = new URL(route.request().url());
      lastSearchQuery = url.searchParams.get('search') || '';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: lastSearchQuery
            ? [{
                id: 'c1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                company_name: 'Acme Corp',
                position: 'CTO',
                source: 'Website',
                tags: [],
                total_leads: 0,
                total_deals: 0,
                total_calls: 0,
                created_at: '2025-06-01T10:00:00Z',
              }]
            : [],
          total: lastSearchQuery ? 1 : 0,
          page: 1,
          page_size: 20,
          total_pages: lastSearchQuery ? 1 : 0,
        }),
      });
    });

    await gotoAuthenticated(page, '/contacts');

    // Type in the search box (has debounce of 300ms)
    await page.locator('input[type="search"], .ant-input-search input').first().fill('John');

    // Wait for debounced search to fire
    await page.waitForTimeout(500);

    // The filtered result should show John
    await expect(page.getByText('John Doe')).toBeVisible({ timeout: 5_000 });
  });
});
