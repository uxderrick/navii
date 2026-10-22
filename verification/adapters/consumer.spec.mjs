import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders a labelled avatar and a decorative avatar', async ({ page }) => {
  await expect(page.locator('#avatar svg').first()).toBeVisible();
  await expect(page.locator('#avatar [role="img"]').first()).toHaveAttribute('aria-label', 'Person');
  await expect(page.locator('#decorative [aria-hidden="true"]').first()).toBeAttached();
});

test('renders valid image fallbacks with sizes and labels', async ({ page }) => {
  const avatar = page.locator('#image img');
  await expect(avatar).toHaveAttribute('width', '80');
  await expect(avatar).toHaveAttribute('height', '80');
  await expect(avatar).toHaveAttribute('alt', 'Photo');
  await expect(avatar).toHaveJSProperty('naturalWidth', 80);
  const group = page.locator('#group-image img');
  await expect(group).toHaveAttribute('alt', 'Team image');
  await expect(group).toHaveAttribute('height', '64');
  await expect(group).toHaveJSProperty('naturalHeight', 64);
});

test('handles empty groups and overflow counters', async ({ page }) => {
  await expect(page.locator('#empty svg, #empty img')).toHaveCount(0);
  await expect(page.locator('#group text')).toHaveText('+3');
  await expect(page.locator('#group [role="img"]').first()).toHaveAttribute('aria-label', 'Team');
});

test('isolates repeated SVG IDs and resolves local fragment references', async ({ page }) => {
  await expect(page.locator('#repeat-a svg').first()).toBeVisible();
  await expect(page.locator('#repeat-b svg').first()).toBeVisible();
  const problems = await page.locator('main').evaluate(root => {
    const ids = [...root.querySelectorAll('[id]')].map(node => node.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    const missing = [];
    for (const node of root.querySelectorAll('svg *')) {
      for (const attr of node.attributes) {
        const references = [...attr.value.matchAll(/url\(#([^)]+)\)/g)].map(match => match[1]);
        if (['href', 'xlink:href'].includes(attr.name) && attr.value.startsWith('#')) references.push(attr.value.slice(1));
        for (const id of references) if (!ids.includes(id)) missing.push(id);
      }
    }
    return { duplicates, missing };
  });
  expect(problems).toEqual({ duplicates: [], missing: [] });
});

test('updates seed, size, and group inputs after a user action', async ({ page }, info) => {
  test.skip(info.project.name === 'astro', 'Astro components render on the server without hydration.');
  const image = page.locator('#image img');
  const oldSource = await image.getAttribute('src');
  const oldSvg = await page.locator('#avatar').innerHTML();
  await page.getByRole('button', { name: 'Update inputs' }).click();
  await expect(image).toHaveAttribute('width', '120');
  await expect(image).not.toHaveAttribute('src', oldSource);
  await expect(page.locator('#avatar')).not.toHaveJSProperty('innerHTML', oldSvg);
  await expect(page.locator('#group text')).toHaveCount(0);
  await expect(page.locator('#empty svg').first()).toBeVisible();
});

test('loads without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.reload();
  await expect(page.locator('#image img')).toHaveJSProperty('naturalWidth', 80);
  expect(errors).toEqual([]);
});
