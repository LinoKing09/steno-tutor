// Erkennung handgeschriebener Kurzschrift durch Vergleich mit den Sollformen.
// Verfahren: Punktwolkenvergleich (nach Art des $P-Erkenners), jedoch ohne Größen-
// normierung, weil in der Kurzschrift Größe und Stellung zur Linie bedeutungstragend sind.
// Toleriert werden kleine Abweichungen in Größe (±25 %) und Höhe (±0,3 Stufen).

import { layoutWord } from './steno/layout.js';

const N = 48;
const SCALES = [0.8, 0.9, 1, 1.12, 1.25];
const SHIFTS = [-0.3, -0.15, 0, 0.15, 0.3];

const templateCache = new Map();

function strokesLength(strokes) {
  let len = 0;
  for (const s of strokes) for (let i = 1; i < s.length; i++) len += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
  return len;
}

// Verteilt n Punkte gleichmäßig entlang aller Striche
export function resample(strokes, n = N) {
  const usable = strokes.filter((s) => s.length > 0);
  if (!usable.length) return [];
  const total = strokesLength(usable);
  if (total === 0) {
    const p = usable[0][0];
    return Array.from({ length: n }, () => ({ x: p.x, y: p.y }));
  }
  const step = total / (n - 1);
  const out = [{ x: usable[0][0].x, y: usable[0][0].y }];
  let acc = 0;
  for (const s of usable) {
    for (let i = 1; i < s.length; i++) {
      let a = { x: s[i - 1].x, y: s[i - 1].y };
      const b = s[i];
      let d = Math.hypot(b.x - a.x, b.y - a.y);
      while (acc + d >= step && out.length < n) {
        const t = (step - acc) / d;
        const q = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
        out.push(q);
        a = q;
        d = Math.hypot(b.x - a.x, b.y - a.y);
        acc = 0;
      }
      acc += d;
    }
  }
  const last = usable[usable.length - 1];
  while (out.length < n) out.push({ x: last[last.length - 1].x, y: last[last.length - 1].y });
  return out;
}

function minX(pts) {
  let m = Infinity;
  for (const p of pts) if (p.x < m) m = p.x;
  return m;
}

function cloudDistance(a, b, start) {
  const n = a.length;
  const matched = new Uint8Array(n);
  let sum = 0;
  let i = start;
  do {
    let best = Infinity;
    let idx = -1;
    for (let j = 0; j < n; j++) {
      if (matched[j]) continue;
      const dx = a[i].x - b[j].x;
      const dy = a[i].y - b[j].y;
      const d = dx * dx + dy * dy;
      if (d < best) {
        best = d;
        idx = j;
      }
    }
    matched[idx] = 1;
    const weight = 1 - ((i - start + n) % n) / n;
    sum += weight * Math.sqrt(best);
    i = (i + 1) % n;
  } while (i !== start);
  return sum / (n / 2 + 0.5); // mittlere gewichtete Abweichung in Stufen
}

function greedyMatch(a, b) {
  const n = a.length;
  const step = Math.floor(Math.sqrt(n));
  let min = Infinity;
  for (let i = 0; i < n; i += step) {
    const d1 = cloudDistance(a, b, i);
    const d2 = cloudDistance(b, a, i);
    min = Math.min(min, d1, d2);
  }
  return min;
}

export function templatePoints(word) {
  if (templateCache.has(word)) return templateCache.get(word);
  const layout = layoutWord(word);
  const pts = resample(layout.strokes.map((s) => s.pts));
  const mx = minX(pts);
  const norm = pts.map((p) => ({ x: p.x - mx, y: p.y }));
  const width = Math.max(...norm.map((p) => p.x));
  const t = { pts: norm, width };
  templateCache.set(word, t);
  return t;
}

function prepare(strokes) {
  const user = resample(strokes);
  if (user.length < 2) return null;
  const mx = minX(user);
  const base = user.map((p) => ({ x: p.x - mx, y: p.y }));
  const width = Math.max(...base.map((p) => p.x));
  return { base, width };
}

const transform = (base, s, dy) => base.map((p) => ({ x: p.x * s, y: p.y * s + dy }));

// Schneller Vorfilter: mittlerer Abstand zum nächsten Punkt (beidseitig, ohne Zuordnung)
function chamfer(a, b) {
  let sum = 0;
  for (const [p, q] of [[a, b], [b, a]]) {
    for (const u of p) {
      let best = Infinity;
      for (const v of q) {
        const d = (u.x - v.x) ** 2 + (u.y - v.y) ** 2;
        if (d < best) best = d;
      }
      sum += Math.sqrt(best);
    }
  }
  return sum / (a.length + b.length);
}

function fullDistance(prep, tpl) {
  const { base, width } = prep;
  // Koordinatensuche: erst Größe, dann Höhenlage
  let bestS = 1;
  let best = Infinity;
  for (const s of SCALES) {
    if (Math.abs(width * s - tpl.width) > Math.max(1.6, tpl.width * 0.7)) continue;
    const d = greedyMatch(transform(base, s, 0), tpl.pts) + Math.abs(s - 1) * 0.08;
    if (d < best) {
      best = d;
      bestS = s;
    }
  }
  if (best === Infinity) return greedyMatch(base, tpl.pts) + 0.4; // Breite völlig abweichend
  for (const dy of SHIFTS) {
    if (dy === 0) continue;
    const d = greedyMatch(transform(base, bestS, dy), tpl.pts) + Math.abs(bestS - 1) * 0.08 + Math.abs(dy) * 0.05;
    if (d < best) best = d;
  }
  return best;
}

// Vergleicht die Handschrift (Striche in Stufen-Koordinaten) mit der Sollform eines Wortes.
export function compare(strokes, word, prep = prepare(strokes)) {
  if (!prep) return { word, distance: Infinity, score: 0 };
  const d = fullDistance(prep, templatePoints(word));
  return { word, distance: d, score: toScore(d) };
}

export function toScore(d) {
  return Math.max(0, Math.min(100, Math.round((1 - (d - 0.08) / 0.5) * 100)));
}

export const ACCEPT_DISTANCE = 0.3;

// Ordnet Kandidatenwörter nach Ähnlichkeit. Vorauswahl per Schnellvergleich, dann genaue
// Bewertung der `keep` aussichtsreichsten Kandidaten.
export function rank(strokes, words, keep = 10) {
  const prep = prepare(strokes);
  if (!prep) return [];
  const seen = new Set();
  const quick = [];
  for (const w of words) {
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const tpl = templatePoints(w);
    if (Math.abs(prep.width - tpl.width) > Math.max(2, tpl.width * 0.9)) continue;
    quick.push({ w, q: chamfer(prep.base, tpl.pts) });
  }
  quick.sort((a, b) => a.q - b.q);
  return quick
    .slice(0, keep)
    .map(({ w }) => compare(strokes, w, prep))
    .sort((a, b) => a.distance - b.distance);
}

// Bewertet eine Schreibübung: richtig, wenn die Sollform am ähnlichsten ist
// (unter Mitbewerbern) und die Abweichung im Rahmen bleibt.
export function grade(strokes, target, distractors = []) {
  const t = compare(strokes, target);
  const others = rank(strokes, distractors.filter((w) => w.toLowerCase() !== target.toLowerCase()), 6);
  const better = others.filter((o) => o.distance + 0.015 < t.distance);
  const ok = t.distance <= ACCEPT_DISTANCE && better.length === 0;
  return { ok, score: t.score, distance: t.distance, confusedWith: better[0]?.word || null };
}

// Teilt Striche in Wortgruppen (waagerechter Abstand > gap Stufen)
export function segmentWords(strokes, gap = 0.9) {
  const boxes = strokes
    .filter((s) => s.length)
    .map((s) => ({ s, min: minX(s), max: Math.max(...s.map((p) => p.x)) }))
    .sort((a, b) => a.min - b.min);
  const groups = [];
  for (const b of boxes) {
    const g = groups[groups.length - 1];
    if (g && b.min - g.max < gap) {
      g.strokes.push(b.s);
      g.max = Math.max(g.max, b.max);
    } else groups.push({ strokes: [b.s], min: b.min, max: b.max });
  }
  return groups.map((g) => g.strokes);
}
