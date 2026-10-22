import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const rootTypes = await readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8');

// The root declaration must type the Astro components as factories; re-exporting
// './Navii.astro' would break tsc for consumers, since .astro sources ship under
// src/ with sibling .astro.d.ts files instead of inside dist/.
assert.match(rootTypes, /declare const Navii: /, 'Navii must be declared as an Astro factory');
assert.match(rootTypes, /declare const NaviiGroup: /, 'NaviiGroup must be declared as an Astro factory');
assert.doesNotMatch(
  rootTypes,
  /from\s*['"]\.\/Navii(Group)?\.astro['"]/,
  'root types must not re-export .astro modules that never ship in dist',
);
assert.match(
  await readFile(new URL('../dist/index.js', import.meta.url), 'utf8'),
  /from\s*['"]\.\.\/src\/Navii\.astro['"]/,
  'runtime export must still resolve the .astro sources',
);
console.log('Astro declaration checks passed.');
