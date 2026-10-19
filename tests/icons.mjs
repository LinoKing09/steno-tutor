// Erzeugt PNG-Symbole aus img/icon.svg: node tests/icons.mjs
import { createRequire } from 'module';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const svg = readFileSync(new URL('../img/icon.svg', import.meta.url), 'utf8');
const browser = await pw.chromium.launch();
for (const size of [180, 192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: new URL(`../img/icon-${size}.png`, import.meta.url).pathname });
  await page.close();
}
await browser.close();
