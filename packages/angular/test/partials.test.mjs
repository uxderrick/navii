import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { needsLinking } from '@angular/compiler-cli/linker';

const bundle = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8');
assert.equal(needsLinking('dist/index.js', bundle), true, 'Angular must detect the package for AOT linking');

// Angular applications compile from partial declarations; the esbuild bundle
// must preserve them and keep the SVG adapter bundled for extensionless imports.
assert.match(bundle, /ngDeclareComponent\(/, 'component partial declarations must survive bundling');
assert.match(bundle, /selector: "navii-avatar"/, 'Navii must keep its selector');
assert.match(bundle, /selector: "navii-group"/, 'NaviiGroup must keep its selector');
assert.doesNotMatch(
  bundle,
  /from\s*["']@mhaadi\/svg/,
  'the SVG adapter must be bundled into the package',
);
console.log('Angular partial declaration checks passed.');
