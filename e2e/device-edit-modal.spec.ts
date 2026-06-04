import { test, expect } from '@playwright/test';

const MOCK_DEVICE = {
  machineName: 'Freezer-01',
  status: 'N',
  tempValue: -18.45,
  timestamp: '2026-06-04 10:00:00',
  ipAddress: '192.168.1.101',
  probeNo: 1,
};

const MOCK_DETAIL = {
  machineName: 'Freezer-01',
  ip: '192.168.1.101',
  probeNo: 1,
  minTemp: -30,
  maxTemp: -10,
};

const SSE_PAYLOAD = `data: ${JSON.stringify([MOCK_DEVICE])}\n\n`;

async function setupMocks(page: Parameters<Parameters<typeof test>[1]>[0]) {
  // SSE stream
  await page.route('**/api/temperature-stream', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: SSE_PAYLOAD,
    });
  });

  // Device detail GET
  await page.route('**/api/devices/**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DETAIL),
      });
    } else if (method === 'PUT') {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_DEVICE, ...body }),
      });
    } else {
      await route.continue();
    }
  });
}

test.beforeEach(async ({ page }) => {
  await setupMocks(page);
  await page.goto('/');
  await expect(page.getByText('Freezer-01')).toBeVisible({ timeout: 10000 });
});

test('edit button is visible on device card', async ({ page }) => {
  await expect(page.getByTitle('Edit device')).toBeVisible();
});

test('clicking edit button opens the modal', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).toBeVisible();
});

test('modal fetches and shows IP address', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByText('192.168.1.101')).toBeVisible({ timeout: 5000 });
});

test('modal fetches and pre-fills machine name from detail', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  const input = page.getByPlaceholder('Enter machine name');
  await expect(input).toHaveValue('Freezer-01', { timeout: 5000 });
});

test('modal fetches and pre-fills minTemp and maxTemp', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByPlaceholder('e.g. -30')).toHaveValue('-30', { timeout: 5000 });
  await expect(page.getByPlaceholder('e.g. 10')).toHaveValue('-10', { timeout: 5000 });
});

test('modal shows read-only current temperature and status', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByText('-18.45 °C')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('paragraph').filter({ hasText: 'Normal' })).toBeVisible();
});

test('cancel button closes the modal', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).not.toBeVisible();
});

test('clicking backdrop closes the modal', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole('heading', { name: 'Edit Device' })).not.toBeVisible();
});

test('X button closes the modal', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).not.toBeVisible();
});

test('save button is disabled when name is empty', async ({ page }) => {
  await page.getByTitle('Edit device').click();
  // Wait for detail to load then clear the field
  await expect(page.getByPlaceholder('Enter machine name')).toHaveValue('Freezer-01', { timeout: 5000 });
  await page.getByPlaceholder('Enter machine name').clear();
  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
});

test('submitting sends updated name, minTemp, maxTemp via PUT and closes modal', async ({ page }) => {
  const putBodies: Record<string, unknown>[] = [];
  page.on('request', async (req) => {
    if (req.method() === 'PUT') putBodies.push(await req.postDataJSON());
  });

  await page.getByTitle('Edit device').click();
  await expect(page.getByPlaceholder('Enter machine name')).toHaveValue('Freezer-01', { timeout: 5000 });

  await page.getByPlaceholder('Enter machine name').fill('Freezer-Renamed');
  await page.getByPlaceholder('e.g. -30').fill('-25');
  await page.getByPlaceholder('e.g. 10').fill('-5');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByRole('heading', { name: 'Edit Device' })).not.toBeVisible();
  expect(putBodies[0]).toMatchObject({ machineName: 'Freezer-Renamed', minTemp: -25, maxTemp: -5 });
});

test('GET error is shown inline before save', async ({ page }) => {
  await page.route('**/api/devices/**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Device not found' }),
      });
    } else {
      await route.continue();
    }
  });

  await page.getByTitle('Edit device').click();
  await expect(page.getByText('Device not found')).toBeVisible({ timeout: 5000 });
});

test('PUT error is shown inline and modal stays open', async ({ page }) => {
  await page.route('**/api/devices/**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DETAIL) });
    } else if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    } else {
      await route.continue();
    }
  });

  await page.getByTitle('Edit device').click();
  await expect(page.getByPlaceholder('Enter machine name')).toHaveValue('Freezer-01', { timeout: 5000 });
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Internal server error')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Edit Device' })).toBeVisible();
});
