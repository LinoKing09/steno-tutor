// Setzt die Bausteine eines Wortes zu einem Kurzschriftbild zusammen.
// Ergebnis: Striche als Punktfolgen in Stufen-Koordinaten (y nach oben, Grundlinie 0).

import { glyph, finalVowel } from './glyphs.js';
import { parseWord, VOWEL_RULES } from './parser.js';
import { bounds } from './geometry.js';

const GAP_NARROW = 0.22; // enge Verbindung (e, i, u, a …)
const GAP_WIDE = 1.0; // weite Verbindung (o, ei, eu, ö …), etwa dreimal so weit
const GAP_NONE = 0.06; // ohne Selbstlaut: möglichst eng (§ 4.2)
const RISE = 0.42; // waagerechter Anteil des Aufstrichs je Stufe Höhe

function place(pts, ox, oy) {
  return pts.map((p) => ({ x: p.x + ox, y: p.y + oy, m: p.m }));
}

// Waagerechter Mindestabstand: Das neue Zeichen darf in keinem Höhenband näher als `min`
// an das vorige Zeichen heranrücken. Liefert die nötige Verschiebung nach rechts.
function clearance(prevPts, pts, ox, oy, min) {
  const band = 0.12;
  const right = new Map();
  for (const p of prevPts) {
    const k = Math.round(p.y / band);
    if (!right.has(k) || right.get(k) < p.x) right.set(k, p.x);
  }
  let shift = 0;
  for (const p of pts) {
    const k = Math.round((p.y + oy) / band);
    for (const kk of [k - 1, k, k + 1]) {
      if (!right.has(kk)) continue;
      const need = right.get(kk) + min - (p.x + ox);
      if (need > shift) shift = need;
    }
  }
  return shift;
}

// Liefert { strokes: [{pts, thick}], bbox, parse }
export function layoutWord(word) {
  const parse = parseWord(word);
  const strokes = [];
  let stroke = null; // aktueller zusammenhängender Zug
  let exit = null; // Austrittspunkt des zuletzt geschriebenen Zeichens
  let level = 0; // Anschlusszeile
  let maxX = 0;
  let prevGlyph = null; // Punkte des vorigen Zeichens (für den Mindestabstand)

  const startStroke = (p) => {
    stroke = { segs: [] };
    strokes.push(stroke);
    if (p) stroke.segs.push({ pts: [{ ...p, m: 0 }], thick: false });
  };

  const items = parse.items;
  items.forEach((it, idx) => {
    if (it.final) {
      const from = exit || { x: 0, y: level };
      if (!stroke) startStroke(from);
      const f = finalVowel(it.final);
      const pts = place(f.pts, from.x, from.y);
      stroke.segs.push({ pts, thick: f.thick, heavy: 0.8 });
      exit = pts[pts.length - 1];
      maxX = Math.max(maxX, exit.x);
      return;
    }

    const rule = it.vowel ? VOWEL_RULES[it.vowel] : null;
    const g = glyph(it.g);
    // Am Wortende werden l und s ohne Ausstrich geschrieben (§ 2.4)
    const isLast = idx === items.length - 1;
    if (isLast && g.tail) g.pts = g.pts.slice(0, g.tail);

    let lvl;
    if (it.level !== undefined) lvl = it.level;
    else lvl = level + (rule ? rule.shift : 0);
    const thick = it.thick || (rule ? rule.thick : false);

    const entry = g.pts[0];
    const b = bounds(g.pts);
    let ox;
    const oy = lvl;
    if (g.dot) {
      // Punkt: freistehend
      ox = (exit ? exit.x + 0.25 : 0) - b.minX;
      const pts = place(g.pts, ox, oy);
      strokes.push({ segs: [{ pts, thick: true, heavy: 0.5 }] });
      stroke = null;
      maxX = Math.max(maxX, ox + b.maxX);
      exit = { x: ox + b.maxX, y: oy };
      level = lvl;
      return;
    }

    if (!exit && !rule) {
      // Wortanfang ohne Anlautvokal
      ox = -b.minX;
      startStroke(null);
    } else {
      // Verbindung (bei Anlautvokal vom Anstrich auf der Grundlinie aus)
      const from = exit || { x: 0, y: 0 };
      if (!stroke) startStroke(from);
      const ey = oy + entry.y;
      const dy = ey - from.y;
      let gap = GAP_NONE;
      if (rule) gap = rule.wide ? GAP_WIDE : GAP_NARROW;
      if (!exit) gap = rule && rule.wide ? GAP_WIDE * 0.8 : 0.35; // Anstrich
      const k = rule || !exit ? RISE : 0.3;
      const dx = dy > 0 ? dy * k + gap : -dy * 0.25 + gap;
      ox = from.x + dx - entry.x;
    }
    if (prevGlyph) ox += clearance(prevGlyph, g.pts, ox, oy, rule ? (rule.wide ? 0.5 : 0.14) : 0.16);
    const pts = place(g.pts, ox, oy);
    if (!stroke) startStroke(null);
    stroke.segs.push({ pts, thick, heavy: g.heavy });
    prevGlyph = pts;
    exit = pts[pts.length - 1];
    level = lvl;
    maxX = Math.max(maxX, ox + b.maxX);
  });

  // Verbindungslinien einfügen: Segmente eines Zuges werden aneinandergehängt
  const out = strokes.map((s) => {
    const pts = [];
    const runs = []; // Bereiche mit Verstärkung
    for (const seg of s.segs) {
      const start = pts.length;
      for (const p of seg.pts) pts.push(p);
      if (seg.thick) {
        // nur der Hauptstrich (m = 1) wird verstärkt
        let a = -1;
        let b = -1;
        seg.pts.forEach((p, i) => {
          if (p.m) {
            if (a < 0) a = i;
            b = i;
          }
        });
        if (a < 0) {
          a = 0;
          b = seg.pts.length - 1;
        }
        runs.push([start + a, start + b, seg.heavy ?? 1]);
      }
    }
    return { pts, runs };
  });

  const all = out.flatMap((s) => s.pts);
  const bbox = all.length ? bounds(all) : { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  return { strokes: out, bbox, parse, word };
}

// Satz/Text: Wörter nebeneinander, Zeilenumbruch nach maxWidth (in Stufen)
export function layoutText(text, { maxWidth = 40, wordGap = 1.1, lineHeight = 4.2 } = {}) {
  const tokens = text.match(/[A-Za-zÄÖÜäöüß]+|[.,;:!?–-]/g) || [];
  const lines = [[]];
  let x = 0;
  for (const t of tokens) {
    let item;
    if (/^[.,;:!?–-]$/.test(t)) {
      item = { punct: t, width: 0.6 };
    } else {
      const lw = layoutWord(t);
      item = { word: t, layout: lw, width: lw.bbox.maxX - lw.bbox.minX };
    }
    if (x > 0 && x + item.width > maxWidth && !item.punct) {
      lines.push([]);
      x = 0;
    }
    item.x = x - (item.layout ? item.layout.bbox.minX : 0);
    lines[lines.length - 1].push(item);
    x += item.width + (item.punct ? 0.6 : wordGap);
  }
  return { lines, lineHeight };
}

// Buchstäbliches Selbstlautzeichen allein (z. B. das e am Wortende)
export function layoutFinal(v) {
  const f = finalVowel(v);
  const pts = f.pts.map((p) => ({ ...p }));
  return { strokes: [{ pts, runs: f.thick ? [[0, pts.length - 1, 0.8]] : [] }], bbox: bounds(pts), parse: null, word: v };
}

// Einzelnes Zeichen der Zeichentafel (ohne Wortlogik)
export function layoutGlyph(id, { thick = false, level = 0 } = {}) {
  const g = glyph(id);
  const b = bounds(g.pts);
  const pts = place(g.pts, -b.minX, level);
  const runs = thick || g.dot ? [[0, pts.length - 1]] : [];
  return { strokes: [{ pts, runs }], bbox: bounds(pts), parse: null, word: id };
}
