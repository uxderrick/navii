import { build, context } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const watch = process.argv.includes('--watch');

const shared = {
  bundle: true,
  target: 'es2017',
  format: 'iife',
  logLevel: 'info',
  sourcemap: watch ? 'inline' : false,
  minify: !watch,
};

const codeOpts = {
  ...shared,
  entryPoints: [resolve(root, 'src/code.ts')],
  outfile: resolve(root, 'dist/code.js'),
  platform: 'neutral',
};

const uiOpts = {
  ...shared,
  entryPoints: [resolve(root, 'src/ui.ts')],
  outfile: resolve(root, 'dist/ui.js'),
  platform: 'browser',
};

async function inlineHtml() {
  const html = await readFile(resolve(root, 'src/ui.html'), 'utf8');
  const rawJs = await readFile(resolve(root, 'dist/ui.js'), 'utf8');
  // Per HTML5, only `</script` (case-insensitive) ends a script block.
  // Other `<X` patterns (`<script` without `/`, `<g`, etc.) are inert inside
  // a script's text content — the parser only watches for the close tag.
  // Escaping anything else can corrupt minified regex/string literals.
  const safeJs = rawJs.replace(/<\/script/gi, '<\\/script');
  const marker = '<!-- script injected by build.mjs -->';
  const tag = `<script>${safeJs}</script>`;
  // Use a replacer FUNCTION so `$&`, `$1`, etc. inside `tag` (common in
  // minified JS where `$` is an identifier char) aren't interpreted as
  // String.replace backreferences.
  const inlined = html.includes(marker)
    ? html.replace(marker, () => tag)
    : html + `\n${tag}\n`;
  await mkdir(resolve(root, 'dist'), { recursive: true });
  await writeFile(resolve(root, 'dist/ui.html'), inlined);
  console.log('[build] dist/ui.html written');
}

if (watch) {
  const codeCtx = await context(codeOpts);
  const uiCtx = await context({
    ...uiOpts,
    plugins: [{
      name: 'inline-html',
      setup(b) { b.onEnd(() => inlineHtml().catch(console.error)); },
    }],
  });
  await Promise.all([codeCtx.watch(), uiCtx.watch()]);
  console.log('[build] watching…');
} else {
  await Promise.all([build(codeOpts), build(uiOpts)]);
  await inlineHtml();
  console.log('[build] done');
}
