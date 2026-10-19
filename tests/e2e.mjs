// Durchklick-Test im echten Browser: node tests/e2e.mjs [ausgabeordner]
// Schreibt Wörter mit simulierten Stiftbewegungen ins Schreibfeld und prüft die Bewertung.
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const out = process.argv[2] || '.';
const BASE = process.env.BASE || 'http://localhost:8080/index.html';
const browser = await pw.chromium.launch();
const errors = [];
let failed = 0;
const assert = (cond, msg) => { if (!cond) { failed++; console.error('✗', msg); } else console.log('✓', msg); };

async function newPage(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
  return page;
}

// Zeichnet die Sollform eines Wortes (leicht verzittert) ins erste Schreibfeld
async function writeWord(page, word, { jitter = 0.03, dx = 1.2 } = {}) {
  const box = await page.locator('.pad-canvas').first().boundingBox();
  const strokes = await page.evaluate((w) => window.stenoTutor.layoutFor(w).strokes.map((s) => s.pts.map((p) => [p.x, p.y])), word);
  const S = Math.max(28, Math.min(56, box.width / 16));
  const base = box.y + 2.75 * S;
  for (const s of strokes) {
    const pts = s.filter((_, i) => i % 2 === 0);
    const toPx = ([x, y]) => [box.x + (x + 0.5 + dx) * S + (Math.random() - 0.5) * jitter * S, base - y * S + (Math.random() - 0.5) * jitter * S];
    const [x0, y0] = toPx(pts[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (const p of pts.slice(1)) {
      const [x, y] = toPx(p);
      await page.mouse.move(x, y);
    }
    await page.mouse.up();
  }
}

// Desktop
const page = await newPage({ width: 1280, height: 900 });
await page.goto(BASE + '#/', { waitUntil: 'networkidle' });
assert((await page.locator('h1').first().textContent()).includes('Willkommen'), 'Startseite lädt');

await page.goto(BASE + '#/lektion/l1', { waitUntil: 'networkidle' });
assert((await page.locator('.lernweg').textContent()).includes('Zeichen üben'), 'Lehrstoff zeigt den Lernweg');
await page.screenshot({ path: `${out}/l1-lehrstoff.png`, fullPage: true });

assert((await page.locator('.zeichenkarte figcaption b').allTextContents()).join(',') === 'b,r,t,e am Wortende', 'Lerneinheit 1 führt b, r, t und e ein');

// Zeichen üben: erst nachspuren, dann dasselbe Zeichen frei schreiben
await page.goto(BASE + '#/lektion/l1/zeichen');
await page.waitForSelector('.pad-canvas');
assert((await page.locator('.auftrag').textContent()).includes('nachspuren') || (await page.locator('.auftrag').textContent()).includes('Spuren'), 'Zeichenübung beginnt mit Nachspuren');
let key = await page.evaluate(() => window.__letzteAufgabe);
assert(key === '#b', 'erstes Übungszeichen ist b');
await writeWord(page, key);
await page.click('text=Prüfen lassen');
await page.waitForSelector('.bescheidchen');
assert((await page.locator('.bescheidchen').textContent()).includes('ANERKANNT'), 'b nachgespurt und anerkannt');
await page.click('text=Nächster Vorgang');
await page.waitForSelector('.pad-canvas');
assert((await page.locator('.auftrag').textContent()).includes('aus dem Gedächtnis') && (await page.evaluate(() => window.__letzteAufgabe)) === '#b', 'danach b aus dem Gedächtnis');
await writeWord(page, '#t');
await page.click('text=Prüfen lassen');
await page.waitForSelector('.bescheidchen');
assert((await page.locator('.bescheidchen').textContent()).includes('NACHBESSERN'), 't statt b wird zurückgewiesen');
await page.screenshot({ path: `${out}/l1-zeichen.png`, fullPage: true });

// Wörter bilden: Baukasten
await page.goto(BASE + '#/lektion/l1/woerter');
await page.waitForSelector('.baukasten');
assert(await page.locator('.baukasten').count() === 4, 'Baukasten zeigt vier Beispielwörter');
await page.screenshot({ path: `${out}/l1-woerter.png`, fullPage: true });

// Schreibübung: richtiges Wort schreiben
await page.goto(BASE + '#/lektion/l7/schreiben');
await page.waitForSelector('.pad-canvas');
let target = (await page.locator('.zielwort').first().textContent()).trim();
await writeWord(page, target);
await page.click('text=Prüfen lassen');
await page.waitForSelector('.bescheidchen');
let txt = await page.locator('.bescheidchen').textContent();
assert(txt.includes('ANERKANNT'), `Schreibübung: „${target}“ korrekt geschrieben wird anerkannt`);
await page.screenshot({ path: `${out}/l7-schreiben.png`, fullPage: true });

// falsches Wort schreiben
await page.click('text=Nächster Vorgang');
await page.waitForSelector('.pad-canvas');
target = (await page.locator('.zielwort').first().textContent()).trim();
const wrong = target === 'Tor' ? 'Rose' : 'Tor';
await writeWord(page, wrong);
await page.click('text=Prüfen lassen');
await page.waitForSelector('.bescheidchen');
txt = await page.locator('.bescheidchen').textContent();
assert(txt.includes('NACHBESSERN'), `Schreibübung: „${wrong}“ statt „${target}“ wird zurückgewiesen`);

// Leseübung
await page.goto(BASE + '#/lektion/l2/lesen');
await page.waitForSelector('.lesebild svg');
const word = await page.locator('.lesebild svg').getAttribute('aria-label');
await page.fill('.formular input[type=text]', word.replace('Kurzschrift: ', ''));
await page.click('text=Antrag einreichen');
await page.waitForSelector('.bescheidchen');
assert((await page.locator('.bescheidchen').textContent()).includes('ANERKANNT'), 'Leseübung: richtige Lesung anerkannt');

// Prüfung durchlaufen
await page.goto(BASE + '#/lektion/l1/pruefung');
await page.click('text=Prüfungsverfahren eröffnen');
for (let i = 0; i < 8; i++) {
  await page.waitForSelector('.vorgang');
  if (await page.locator('.lesebild svg').count()) {
    const w = (await page.locator('.lesebild svg').getAttribute('aria-label')).replace('Kurzschrift: ', '');
    await page.fill('.formular input[type=text]', w);
    await page.click('text=Antrag einreichen');
  } else {
    // Diktat: Zielwort aus dem Seitenzustand nicht sichtbar -> über Ersatzverfahren/Testhilfe
    let w = await page.locator('.zielwort').first().textContent().catch(() => null);
    if (!w) w = await page.evaluate(() => window.__letzteAufgabe);
    await writeWord(page, w.trim());
    await page.click('text=Prüfen lassen');
  }
  await page.waitForSelector('.bescheidchen');
  await page.click('text=Nächste Aufgabe');
}
await page.waitForSelector('.bescheid');
const bescheid = await page.locator('.bescheid').textContent();
assert(bescheid.includes('bestanden') && !bescheid.includes('nicht bestanden'), 'Prüfung Lerneinheit 1 bestanden, Bescheid erstellt');
await page.screenshot({ path: `${out}/bescheid.png`, fullPage: true });

// Übertragungsstelle
await page.goto(BASE + '#/uebersetzer');
await page.waitForSelector('.stenoausgabe svg');
assert(await page.locator('.stenoausgabe svg path').count() > 5, 'Übertragungsstelle erzeugt Kurzschrift');
await page.screenshot({ path: `${out}/uebersetzer.png`, fullPage: true });

// Schreibstube: zwei Wörter schreiben und erkennen lassen
await page.goto(BASE + '#/schreibstube');
await page.waitForSelector('.pad-canvas');
{
  const box = await page.locator('.pad-canvas').boundingBox();
  const S = Math.max(28, Math.min(56, box.width / 20));
  const draw = async (w, offX) => {
    const strokes = await page.evaluate((w) => window.stenoTutor.layoutWord(w).strokes.map((s) => s.pts.map((p) => [p.x, p.y])), w);
    for (const s of strokes) {
      const pts = s.filter((_, i) => i % 2 === 0);
      await page.mouse.move(box.x + (pts[0][0] + 0.5 + offX) * S, box.y + 2.75 * S - pts[0][1] * S);
      await page.mouse.down();
      for (const p of pts.slice(1)) await page.mouse.move(box.x + (p[0] + 0.5 + offX) * S, box.y + 2.75 * S - p[1] * S);
      await page.mouse.up();
    }
  };
  await draw('Haus', 1);
  await draw('Sitzung', 7);
  await page.click('text=Auswerten');
  await page.waitForSelector('.uebertragung');
  const t = await page.locator('.uebertragung').textContent();
  assert(t.trim() === 'Haus Sitzung', `Schreibstube erkennt „${t.trim()}“`);
  await page.screenshot({ path: `${out}/schreibstube.png`, fullPage: true });
}

for (const r of ['lektionen', 'zeichentafel', 'akte', 'hilfe', 'lesesaal']) {
  await page.goto(BASE + '#/' + r);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/${r}.png`, fullPage: true });
}

// iPad hochkant mit Touch
const ipad = await newPage({ width: 820, height: 1180 }, { touch: true });
await ipad.goto(BASE + '#/lektion/l9/woerter', { waitUntil: 'networkidle' });
await ipad.waitForSelector('.pad-canvas');
await ipad.screenshot({ path: `${out}/ipad-woerter.png`, fullPage: true });
const overflow = await ipad.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
assert(!overflow, 'iPad hochkant: kein waagerechtes Scrollen');

// Telefon
const phone = await newPage({ width: 390, height: 844 }, { touch: true });
await phone.goto(BASE + '#/lektion/l2/schreiben', { waitUntil: 'networkidle' });
await phone.waitForSelector('.pad-canvas');
await phone.screenshot({ path: `${out}/phone.png`, fullPage: true });
assert(!(await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), 'Telefon: kein waagerechtes Scrollen');

assert(errors.length === 0, 'keine JavaScript-Fehler' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
process.exit(failed ? 1 : 0);
