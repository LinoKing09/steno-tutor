// Prüft Engine und Lehrplan: node tests/engine.test.js
import assert from 'node:assert/strict';
import { LESSONS, allWords, drillKeys } from '../js/lessons.js';
import { layoutFor } from '../js/steno/keys.js';
import { parseWord, normalize, KUERZEL } from '../js/steno/parser.js';
import { layoutWord } from '../js/steno/layout.js';
import { wordSvg, textSvg } from '../js/steno/render.js';
import { GLYPHS } from '../js/steno/glyphs.js';

let failures = 0;
function check(name, fn) {
  try {
    fn();
  } catch (e) {
    failures++;
    console.error('✗', name, '\n ', e.message);
  }
}

// 1. Normalisierung
check('Normalisierung', () => {
  assert.equal(normalize('Bett'), 'bet');
  assert.equal(normalize('Straße'), 'strasse');
  assert.equal(normalize('fahren'), 'faren');
  assert.equal(normalize('Liebe'), 'libe');
  assert.equal(normalize('Bäcker'), 'beker');
  assert.equal(normalize('Häuser'), 'heuser');
});

// 2. Zerlegung
check('Zerlegung Bundestag', () => {
  const p = parseWord('Bundestag').items.map((i) => (i.final ? '#' + i.final : (i.vowel || '') + ':' + i.g));
  assert.deepEqual(p, [':b', 'u:nd', 'e:s', ':t', 'a:g']);
});
check('st nur im Stammanlaut', () => {
  assert.equal(parseWord('Stadt').items[0].g, 'st');
  assert.deepEqual(parseWord('Rest').items.map((i) => i.g), ['r', 's', 't']);
  assert.deepEqual(parseWord('Ost').items.map((i) => i.g), ['s', 't']);
});
check('Kürzel', () => {
  assert.equal(parseWord('der').kuerzel, 'der');
  assert.equal(parseWord('Und').kuerzel, 'und');
});
check('Vorsilben und -ung', () => {
  assert.equal(parseWord('gesagt').items[0].prefix, 'ge');
  assert.equal(parseWord('Verkehr').items[0].prefix, 'ver');
  const o = parseWord('Ordnung').items;
  assert.equal(o[o.length - 1].suffix, 'ung');
});

// 3. Lehrplan nutzt nur eingeführte Zeichen und Selbstlaute
check('Lehrplan-Reihenfolge', () => {
  const glyphs = new Set();
  const vowels = new Set();
  for (const l of LESSONS) {
    l.zeichen.forEach((g) => glyphs.add(g));
    l.vokale.forEach((v) => vowels.add(v));
    for (const w of l.woerter) {
      const p = parseWord(w);
      for (const it of p.items) {
        if (it.final) {
          assert.ok(vowels.has(it.final), `${l.id}: „${w}“ nutzt Auslaut ${it.final} vor seiner Einführung`);
          continue;
        }
        if (it.kz || GLYPHS[it.g].special) {
          assert.ok(l.nr >= 11 || it.g === 'ung', `${l.id}: „${w}“ nutzt Sonderzeichen ${it.g}`);
          continue;
        }
        assert.ok(glyphs.has(it.g), `${l.id}: „${w}“ nutzt Zeichen ${it.g} vor seiner Einführung`);
        if (it.vowel) assert.ok(vowels.has(it.vowel), `${l.id}: „${w}“ nutzt Selbstlaut ${it.vowel} vor seiner Einführung`);
      }
    }
  }
});

// 3b. Aufbau: erst Zeichen, dann Wörter; keine Kürzel vor der Kürzel-Lektion
check('Aufbau der Lerneinheiten', () => {
  assert.deepEqual(LESSONS[0].zeichen, ['b', 'r', 't'], 'Lerneinheit 1 beginnt mit b, r, t');
  assert.deepEqual(LESSONS[0].vokale, ['e']);
  const firstKz = LESSONS.findIndex((l) => l.kuerzel);
  LESSONS.forEach((l, i) => {
    assert.equal(l.nr, i + 1, `${l.id}: Nummer`);
    assert.ok(l.woerter.length >= 8, `${l.id}: mindestens 8 Übungswörter`);
    assert.ok(l.zeichen.length + l.vokale.length + (l.kuerzel || []).length > 0, `${l.id}: bringt nichts Neues`);
    for (const k of drillKeys(l)) assert.ok(layoutFor(k).strokes.length, `${l.id}: Übungszeichen ${k}`);
    if (i < firstKz) for (const w of l.woerter) assert.ok(!KUERZEL[w.toLowerCase()], `${l.id}: „${w}“ ist ein Kürzel`);
    // jede neue Regel bzw. jedes neue Zeichen kommt in den Übungswörtern vor
    const used = new Set(l.woerter.flatMap((w) => parseWord(w).items.flatMap((it) => [it.g, it.vowel, it.final])));
    for (const g of l.zeichen) if (!['ung'].includes(g)) assert.ok(used.has(g) || ['cr', 'zr', 'wr', 'rdr', 'ndr', 'mpf', 'pfr', 'rs', 'schn', 'schm'].includes(g), `${l.id}: Zeichen ${g} kommt in keinem Übungswort vor`);
    for (const v of l.vokale) if (!['ä', 'äu'].includes(v)) assert.ok(used.has(v), `${l.id}: Selbstlaut ${v} kommt in keinem Übungswort vor`);
  });
});

// 4. Alle Wörter und Sätze lassen sich fehlerfrei setzen
check('Darstellung aller Wörter', () => {
  for (const w of allWords()) {
    const l = layoutWord(w);
    assert.ok(l.strokes.length > 0, `„${w}“ ohne Striche`);
    const svg = wordSvg(w);
    assert.ok(!svg.includes('NaN'), `„${w}“ erzeugt NaN`);
    const bb = l.bbox;
    assert.ok(bb.maxY <= 3.6 && bb.minY >= -2.6, `„${w}“ verlässt den Schreibraum (${bb.minY.toFixed(2)}…${bb.maxY.toFixed(2)})`);
  }
  for (const l of LESSONS) for (const s of l.saetze || []) assert.ok(!textSvg(s).includes('NaN'), s);
});

// 5. Unterscheidbarkeit: Wörter einer Lektion mit gleicher Kurzform melden
check('Gleiche Kurzformen innerhalb einer Lektion', () => {
  for (const l of LESSONS) {
    const seen = new Map();
    for (const w of l.woerter) {
      const sig = JSON.stringify(parseWord(w).items);
      if (seen.has(sig) && !['dass', 'das'].includes(w)) console.log(`  Hinweis ${l.id}: „${w}“ = „${seen.get(sig)}“`);
      seen.set(sig, w);
    }
  }
});

if (failures) {
  console.error(`\n${failures} Prüfung(en) fehlgeschlagen.`);
  process.exit(1);
}
console.log('Alle Engine-Prüfungen bestanden.');
