import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const externalAdapters = ['react', 'vue', 'solid', 'angular', 'react-native'];

for (const packageName of [...externalAdapters, 'svelte', 'astro']) {
  const manifest = JSON.parse(
    await readFile(new URL(`../packages/${packageName}/package.json`, import.meta.url), 'utf8'),
  );
  assert.equal(
    manifest.dependencies?.['@mhaadi/svg'],
    '^0.5.0',
    `@usenavii/${packageName} must declare the SVG adapter dependency`,
  );
}

for (const packageName of externalAdapters) {
  const dist = new URL(`../packages/${packageName}/dist/`, import.meta.url);
  const entry = await readFile(new URL('index.js', dist), 'utf8');
  let adapter = entry;
  if (['react', 'vue'].includes(packageName)) {
    const cjs = await readFile(new URL('index.cjs', dist), 'utf8');
    assert.match(entry, /from\s*["']\.\/svg-adapter\.js["']/, 'ESM must load the SVG adapter bridge');
    assert.match(cjs, /require\(["']\.\/svg-adapter\.js["']\)/, 'CommonJS must load the SVG adapter bridge');
    adapter = await readFile(new URL('svg-adapter.js', dist), 'utf8');
  }
  assert.match(
    adapter,
    new RegExp(`from\\s*["']@mhaadi/svg/${packageName}["']`),
    `@usenavii/${packageName} must import the installed SVG adapter`,
  );
}

{
  const svelteBundle = await readFile(
    new URL('../packages/svelte/dist/Navii.svelte', import.meta.url),
    'utf8',
  );
  assert.match(
    svelteBundle,
    /from\s*['"]@mhaadi\/svg\/svelte['"]/,
    '@usenavii/svelte must import the SVG adapter at runtime',
  );

  const astroBundle = await readFile(
    new URL('../packages/astro/dist/index.js', import.meta.url),
    'utf8',
  );
  assert.match(
    astroBundle,
    /from\s*['"]\.\.\/src\/Navii\.astro['"]/,
    '@usenavii/astro must export its .astro components',
  );
}

const reactPackageUrl = new URL('../packages/react/package.json', import.meta.url);
const reactRequire = createRequire(reactPackageUrl);
const React = reactRequire('react');
const { renderToStaticMarkup } = reactRequire('react-dom/server');
const reactAdapter = await import(
  `${pathToFileURL(new URL('../packages/react/dist/index.js', import.meta.url).pathname)}?artifact-test`
);
for (const { Navii } of [reactAdapter, reactRequire('@usenavii/react')]) {
  const reactMarkup = renderToStaticMarkup(
    React.createElement(Navii, { seed: 'artifact-test', as: 'img' }),
  );
  assert.match(reactMarkup, /^<img /, 'React adapter must server-render its image fallback');
}

const vuePackageUrl = new URL('../packages/vue/package.json', import.meta.url);
const vueRequire = createRequire(vuePackageUrl);
const { createSSRApp, h } = vueRequire('vue');
const { renderToString } = vueRequire('vue/server-renderer');
const vueAdapter = await import(
  `${pathToFileURL(new URL('../packages/vue/dist/index.js', import.meta.url).pathname)}?artifact-test`
);
for (const { Navii } of [vueAdapter, vueRequire('@usenavii/vue')]) {
  const vueMarkup = await renderToString(
    createSSRApp({ render: () => h(Navii, { seed: 'artifact-test', as: 'img' }) }),
  );
  assert.match(vueMarkup, /^<img /, 'Vue adapter must server-render its image fallback');
}

const reactNativeBundle = await readFile(
  new URL('../packages/react-native/dist/index.js', import.meta.url),
  'utf8',
);
assert.match(reactNativeBundle, /from\s*["']react-native["']/, 'React Native must remain external');
assert.match(reactNativeBundle, /from\s*["']react-native-svg["']/, 'react-native-svg must remain external');

assert.match(
  reactNativeBundle,
  /from\s*["']react-native-reanimated["']/,
  'Reanimated must remain external',
);

console.log('Framework artifact checks passed.');
