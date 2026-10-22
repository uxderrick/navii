import { cp, mkdir, mkdtemp, readFile, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const here = dirname(fileURLToPath(import.meta.url));
const source = await realpath(resolve(process.argv[2] ?? join(here, '../..')));
const work = await mkdtemp(join(tmpdir(), 'navii-consumers-'));
const port = Number(process.env.CONSUMER_PORT ?? 4310);
const manifest = async path => JSON.parse(await readFile(path, 'utf8'));
const rootManifest = await manifest(join(source, 'package.json'));
const adapters = ['solid', 'angular', 'astro'];
const failures = [];
const servers = [];
console.log(`Source: ${source}\nConsumer files and logs: ${work}`);

async function run(command, args, cwd, name) {
  const log = join(work, `${name}.log`);
  let output = '';
  const code = await new Promise((accept, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, CI: 'true', NG_CLI_ANALYTICS: 'false' } });
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', accept);
  });
  await writeFile(log, output);
  if (code !== 0) throw new Error(`${name} exited ${code}; see ${log}\n${output.slice(-5000)}`);
  console.log(`PASS ${name}`);
}

async function serve(root, listenPort) {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
      const file = resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
      if (!file.startsWith(`${root}${sep}`)) { response.writeHead(403); response.end(); return; }
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
      response.end(data);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(listenPort, '127.0.0.1', accept); });
  servers.push(server);
}

try {
  await mkdir(join(work, 'packed'));
  for (const name of ['core', ...adapters]) {
    await run('pnpm', ['--filter', `@usenavii/${name}`, 'pack', '--out', join(work, 'packed', `${name}.tgz`)], source, `pack-${name}`);
  }
  for (const [i, adapter] of adapters.entries()) {
    try {
      const app = join(work, adapter);
      await cp(join(here, 'fixtures', adapter), app, { recursive: true });
      const pkg = await manifest(join(app, 'package.json'));
      const sdk = await manifest(join(source, 'packages', adapter, 'package.json'));
      const tools = sdk.devDependencies;
      const dependencies = {
        '@usenavii/core': `file:${join(work, 'packed/core.tgz')}`,
        [`@usenavii/${adapter}`]: `file:${join(work, 'packed', `${adapter}.tgz`)}`,
        typescript: rootManifest.devDependencies.typescript,
      };
      if (adapter === 'solid') Object.assign(dependencies, { 'solid-js': tools['solid-js'], vite: '^8.3.2' });
      if (adapter === 'angular') {
        for (const key of ['@angular/core', '@angular/common', '@angular/platform-browser', '@angular/compiler', '@angular/compiler-cli', 'rxjs']) dependencies[key] = tools[key];
        Object.assign(dependencies, { '@angular/build': '22.2.1', '@angular/cli': '22.2.1' });
      }
      if (adapter === 'astro') Object.assign(dependencies, { astro: tools.astro, '@astrojs/check': tools['@astrojs/check'] });
      await writeFile(join(app, 'package.json'), `${JSON.stringify({ ...pkg, dependencies }, null, 2)}\n`);
      await run('npm', ['install', '--no-audit', '--no-fund'], app, `install-${adapter}`);
      await run('npm', ['run', 'build'], app, `build-${adapter}`);
      await serve(join(app, adapter === 'angular' ? 'dist/browser' : 'dist'), port + i);
    } catch (error) { failures.push(error.message); console.error(error.message); }
  }
  const built = adapters.filter((_, i) => servers.some(server => server.address()?.port === port + i));
  if (built.length) {
    process.env.CONSUMER_RESULTS = join(work, 'browser-results');
    try {
      await run(process.execPath, [join(here, 'node_modules/@playwright/test/cli.js'), 'test', '--config', join(here, 'playwright.config.mjs'), ...built.map(name => `--project=${name}`)], here, 'browser');
    } catch (error) { failures.push(error.message); console.error(error.message); }
  }
  await writeFile(join(work, 'result.json'), `${JSON.stringify({ source, work, failures }, null, 2)}\n`);
  console.log(`Results: ${join(work, 'result.json')}`);
  if (failures.length) process.exitCode = 1;
} finally {
  await Promise.all(servers.map(server => new Promise(accept => server.close(accept))));
}
