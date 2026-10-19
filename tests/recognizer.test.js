// Kalibrierung der Handschrifterkennung mit künstlich verzerrten Sollformen:
// node tests/recognizer.test.js
import { LESSONS, drillKeys, drillKeysUpTo } from '../js/lessons.js';
import { layoutFor } from '../js/steno/keys.js';
import { grade, compare, segmentWords } from '../js/recognizer.js';

let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());

// „Handschrift“: Sollform mit Größen-, Neigungs-, Lage- und Zitterabweichungen
function scribble(word, level = 1) {
  const l = layoutFor(word);
  const s = 1 + (rnd() - 0.5) * 0.24 * level;
  const shear = (rnd() - 0.5) * 0.2 * level;
  const dy = (rnd() - 0.5) * 0.3 * level;
  const dx = 3 + rnd() * 2;
  let wobX = 0, wobY = 0;
  return l.strokes.map((st) =>
    st.pts.filter((_, i) => i % 2 === 0).map((p) => {
      wobX = wobX * 0.8 + gauss() * 0.012 * level;
      wobY = wobY * 0.8 + gauss() * 0.012 * level;
      return { x: dx + p.x * s + p.y * shear + wobX, y: p.y * s + dy + wobY };
    }),
  );
}

let total = 0, ok = 0, falseAccept = 0, wrongTotal = 0;
const dRight = [], dWrong = [];
for (const lesson of LESSONS) {
  const pool = LESSONS.filter((l) => l.nr <= lesson.nr).flatMap((l) => l.woerter);
  for (const w of lesson.woerter) {
    for (let k = 0; k < 3; k++) {
      const strokes = scribble(w, +(process.env.LEVEL || 1));
      const g = grade(strokes, w, pool);
      total++;
      if (g.ok) ok++;
      dRight.push(g.distance);
      // Gegenprobe: falsches Zielwort
      const other = pool[Math.floor(rnd() * pool.length)];
      if (other.toLowerCase() !== w.toLowerCase()) {
        const g2 = grade(strokes, other, pool);
        wrongTotal++;
        if (g2.ok) falseAccept++;
        dWrong.push(compare(strokes, other).distance);
      }
    }
  }
}
// Einzelzeichen-Übungen: Zeichen unter den bis dahin gelernten Zeichen erkennen
let zOk = 0, zTotal = 0;
const zFehler = [];
for (const lesson of LESSONS) {
  const pool = drillKeysUpTo(lesson.nr);
  for (const key of drillKeys(lesson)) {
    for (let k = 0; k < 3; k++) {
      const g = grade(scribble(key, +(process.env.LEVEL || 1)), key, pool);
      zTotal++;
      if (g.ok) zOk++;
      else zFehler.push(`${key}→${g.confusedWith || '?'}`);
    }
  }
}
console.log(`Einzelzeichen richtig erkannt: ${zOk}/${zTotal} (${((100 * zOk) / zTotal).toFixed(1)} %)${zFehler.length ? ' – verwechselt: ' + zFehler.join(', ') : ''}`);

const q = (arr, p) => arr.slice().sort((a, b) => a - b)[Math.floor(p * (arr.length - 1))].toFixed(3);
console.log(`Richtig erkannt: ${ok}/${total} (${((100 * ok) / total).toFixed(1)} %)`);
console.log(`Fälschlich akzeptiert: ${falseAccept}/${wrongTotal} (${((100 * falseAccept) / wrongTotal).toFixed(1)} %)`);
console.log(`Abstand richtig: Median ${q(dRight, 0.5)}, 90 % ${q(dRight, 0.9)}, max ${q(dRight, 1)}`);
console.log(`Abstand falsch:  10 % ${q(dWrong, 0.1)}, Median ${q(dWrong, 0.5)}`);

const segs = segmentWords([...scribble('Haus'), ...scribble('Tor').map((s) => s.map((p) => ({ x: p.x + 6, y: p.y })))]);
console.log('Segmentierung (2 erwartet):', segs.length);

if (ok / total < 0.85 || zOk / zTotal < 0.85 || falseAccept / wrongTotal > 0.05 || segs.length !== 2) {
  console.error('Erkennungsgüte unzureichend.');
  process.exit(1);
}
console.log('Erkennungsprüfung bestanden.');
