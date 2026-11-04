import { build, createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, dirname, join } from 'node:path';

// Compile the supplied .svx pages and Svelte components. Never substitute a
// manually written HTML copy for what their data and code actually render.
await build();
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const entry = manifest['src/client.js'];
const css = [...new Set(Object.values(manifest).flatMap((v) => v.css ?? []))];
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('svelte/server');
  const pages = await server.ssrLoadModule('/scripts/routes.js');
  for (const [source, page] of Object.entries(pages.pages)) {
    const route = source.replace('/src/routes', '').replace('/+page.svx', '');
    const destination = join('dist', route, 'index.html');
    const asset = (file) => relative(dirname(destination), join('dist', file));
    const { head, body } = await render(page.default);
    const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}${css.map((file) => `<link rel="stylesheet" href="${asset(file)}">`).join('')}</head><body><div id="app" data-source="${source}">${body}</div><script type="module" src="${asset(entry.file)}"></script></body></html>\n`;
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
    console.log(`Rendered ${route} → ${destination}`);
  }
  await writeFile('dist/index.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=kb/"><title>Support kb</title><a href="kb/">Open the support knowledge base</a></html>\n');
} finally {
  await server.close();
}
