import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const affectedPackages = ['react', 'vue', 'react-native'];

for (const packageName of affectedPackages) {
  const manifest = JSON.parse(
    await readFile(new URL(`../packages/${packageName}/package.json`, import.meta.url), 'utf8'),
  );
  assert.equal(
    manifest.dependencies?.['@mhaadi/svg'],
    undefined,
    `@usenavii/${packageName} must not require @mhaadi/svg at runtime`,
  );

  const bundle = await readFile(
    new URL(`../packages/${packageName}/dist/index.js`, import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(
    bundle,
    /from\s*["']@mhaadi\/svg(?:\/[^"']*)?["']/,
    `@usenavii/${packageName} must bundle its @mhaadi/svg adapter`,
  );
}

const reactPackageUrl = new URL('../packages/react/package.json', import.meta.url);
const reactRequire = createRequire(reactPackageUrl);
const React = reactRequire('react');
const { renderToStaticMarkup } = reactRequire('react-dom/server');
const reactAdapter = await import(
  `${pathToFileURL(new URL('../packages/react/dist/index.js', import.meta.url).pathname)}?artifact-test`
);
const reactMarkup = renderToStaticMarkup(
  React.createElement(reactAdapter.Navii, { seed: 'artifact-test', as: 'img' }),
);
assert.match(reactMarkup, /^<img /, 'React adapter must server-render its image fallback');

const vuePackageUrl = new URL('../packages/vue/package.json', import.meta.url);
const vueRequire = createRequire(vuePackageUrl);
const { createSSRApp, h } = vueRequire('vue');
const { renderToString } = vueRequire('vue/server-renderer');
const vueAdapter = await import(
  `${pathToFileURL(new URL('../packages/vue/dist/index.js', import.meta.url).pathname)}?artifact-test`
);
const vueMarkup = await renderToString(
  createSSRApp({ render: () => h(vueAdapter.Navii, { seed: 'artifact-test', as: 'img' }) }),
);
assert.match(vueMarkup, /^<img /, 'Vue adapter must server-render its image fallback');

const reactNativeBundle = await readFile(
  new URL('../packages/react-native/dist/index.js', import.meta.url),
  'utf8',
);
assert.match(reactNativeBundle, /from\s*["']react-native["']/, 'React Native must remain external');
assert.match(reactNativeBundle, /from\s*["']react-native-svg["']/, 'react-native-svg must remain external');

console.log('Framework artifact checks passed.');
