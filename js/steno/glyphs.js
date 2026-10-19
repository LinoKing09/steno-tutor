// Zeichenvorrat der Verkehrsschrift (DEK, Wiener Urkunde 1968, § 2 Mitlaute).
// Jedes Zeichen wird parametrisch als Strichfolge in Stufen-Koordinaten erzeugt.
// Erster Punkt = Ansatzpunkt (Eintritt), letzter Punkt = Austrittspunkt.

import { Pen } from './geometry.js';

export const SLANT = 0.36; // Schräglage der Abstriche (dx je Stufe Höhe)

// Allgemeiner Abstrich: senkrecht-schräger Hauptstrich mit gestaltetem Kopf und Fuß.
//   top/bot:  Ober- und Unterkante in Stufen (relativ zur Anschlusszeile)
//   head:     plain | hook | arc | cap | tick | loop | sloop | hloop | three
//   foot:     plain | round | foot | left | loop | baseloop
function abstrich({ top, bot = 0, head = 'plain', foot = 'plain', hs = 1, fs = 1, bulge = 0 }) {
  const ax = (y) => SLANT * (y - bot);
  const A = { x: ax(top), y: top };
  let pen;

  switch (head) {
    case 'plain':
      pen = new Pen(A.x, A.y);
      break;
    case 'hook': // rechtswendige Oberrundung (g, gr, sch …)
    case 'arc': { // weite Oberrundung (ch, h, schw)
      const r = (head === 'arc' ? 0.3 : 0.19) * hs;
      pen = new Pen(A.x - 1.05 * r, A.y - 0.85 * r);
      const qy = top - 1.25 * r;
      pen.curve(A.x - 1.0 * r, A.y + 0.25 * r, A.x + 1.0 * r, A.y + 0.35 * r, ax(qy) + 0.02, qy);
      break;
    }
    case 'cap': { // linkswendige Oberrundung (p, w, v, st)
      const r = 0.22 * hs;
      pen = new Pen(A.x + 1.5 * r, A.y + 0.05 * r);
      const qy = top - 1.4 * r;
      pen.curve(A.x + 0.2 * r, A.y + 0.3 * r, A.x - 0.3 * r, A.y - 0.3 * r, ax(qy), qy);
      break;
    }
    case 'tick': { // m-Kopf: kurzer Anstrich nach rechts mit Ecke
      pen = new Pen(A.x - 0.3, A.y - 0.04);
      pen.curve(A.x - 0.2, A.y + 0.02, A.x - 0.04, A.y + 0.02, A.x, A.y - 0.02);
      break;
    }
    case 'loop': { // Kopfschleife (d, f, pf …)
      const lh = 0.42 * hs;
      const lw = 0.26 * hs;
      const p0y = top - lh;
      pen = new Pen(ax(p0y), p0y);
      pen.curve(ax(p0y) + lw * 1.25, p0y + lh * 0.35, A.x + lw * 0.95, top + 0.02, A.x + 0.0, top);
      const qy = top - lh - 0.12;
      pen.curve(A.x - lw * 0.75, top - 0.02, ax(qy) - lw * 0.35, qy + lh * 0.45, ax(qy), qy);
      break;
    }
    case 'sloop': { // kleine Kopfschleife links (qu, sp, spr)
      const p0y = top - 0.32;
      pen = new Pen(ax(p0y), p0y);
      pen.curve(ax(p0y) - 0.26, p0y + 0.1, A.x - 0.3, top, A.x - 0.08, top);
      const qy = top - 0.45;
      pen.curve(A.x + 0.14, top, A.x + 0.14, top - 0.22, ax(qy), qy);
      break;
    }
    case 'hloop': { // waagerechte Kopfschleife (nd, ndr, schn)
      const s = { x: ax(top - 0.16) - 0.3, y: top - 0.2 };
      pen = new Pen(s.x, s.y);
      pen.curve(s.x + 0.18, s.y - 0.12, A.x + 0.34, top - 0.3, A.x + 0.42, top - 0.08);
      const qy = top - 0.24;
      pen.curve(A.x + 0.48, top + 0.08, A.x + 0.02, top + 0.1, ax(qy), qy);
      break;
    }
    case 'three': { // „3“-Kopf (cr, x)
      pen = new Pen(A.x - 0.12, top - 0.03);
      pen.curve(A.x + 0.1, top + 0.07, A.x + 0.22, top - 0.1, A.x + 0.03, top - 0.2);
      const qy = top - 0.52;
      pen.curve(A.x + 0.26, top - 0.24, A.x + 0.22, top - 0.46, ax(qy), qy);
      break;
    }
    default:
      throw new Error('Unbekannte Kopfform ' + head);
  }

  const reserve = { plain: 0, round: 0.22 * fs, foot: 0.04, left: 0.2, loop: 0.3, baseloop: 0.2 }[foot];
  const endY = bot + reserve;
  const c = pen.cur;
  if (bulge) {
    const ex = ax(endY);
    pen.curve(
      c.x + (ex - c.x) / 3 + bulge, c.y + (endY - c.y) / 3,
      c.x + ((ex - c.x) * 2) / 3 + bulge, c.y + ((endY - c.y) * 2) / 3,
      ex, endY, 1,
    );
  } else {
    pen.line(ax(endY), endY, 1);
  }

  switch (foot) {
    case 'plain':
      break;
    case 'round':
      pen.curve(ax(bot + 0.05) - 0.01, bot + 0.02, 0.08 * fs, bot - 0.02, 0.32 * fs, bot + 0.08);
      break;
    case 'foot':
      pen.line(0, bot, 1).line(0.22, bot + 0.02);
      break;
    case 'left':
      pen.curve(ax(bot + 0.05), bot + 0.01, -0.08, bot - 0.03, -0.3, bot + 0.08);
      break;
    case 'loop':
      pen.curve(ax(bot + 0.1), bot + 0.07, 0.02 * fs, bot - 0.02, -0.08 * fs, bot);
      pen.curve(-0.26 * fs, bot + 0.02, -0.2 * fs, bot + 0.42, ax(bot + 0.95) + 0.25, bot + 0.95);
      break;
    case 'baseloop':
      pen.curve(ax(bot + 0.06), bot + 0.03, 0.0, bot - 0.03, -0.1, bot + 0.02);
      pen.curve(-0.22, bot + 0.08, -0.08, bot + 0.32, 0.3, bot + 0.3);
      break;
    default:
      throw new Error('Unbekannte Fußform ' + foot);
  }
  return { pts: pen.pts };
}

// Bogenzeichen (n, k, kr): von links unten über einen Bogen nach rechts unten
function bogen(w, h) {
  const pen = new Pen(0, 0);
  pen.curve(0.02 * w, h * 1.33, 0.98 * w, h * 1.33, w, 0, 1);
  return { pts: pen.pts };
}

function rStrich(h, w, flick = 0) {
  const pen = new Pen(0, h);
  pen.curve(w * 0.3, h * 0.72, w * 0.75, h * 0.2, w, 0, 1);
  if (flick) pen.curve(w + 0.06, -0.02, w + flick * 0.6, 0.02, w + flick, flick);
  return { pts: pen.pts };
}

function sSchleife() {
  // kleine linkswendige Schleife mit Ausstrich; Ausstrich entfällt am Wortende (§ 2.4)
  const pen = new Pen(0.24, 0.34);
  pen.curve(0.06, 0.36, -0.02, 0.12, 0.14, 0.02, 1);
  pen.curve(0.3, -0.06, 0.4, 0.2, 0.26, 0.32, 0);
  const tail = pen.pts.length;
  pen.line(0.46, 0.42);
  return { pts: pen.pts, tail };
}

function lHaken() {
  // kleines l: winzige Schleife mit Ausstrich
  const pen = new Pen(0, 0.03);
  pen.curve(0.1, 0.1, 0.26, 0.2, 0.18, 0.26, 1);
  pen.curve(0.1, 0.3, 0.0, 0.14, 0.12, 0.02, 1);
  const tail = pen.pts.length;
  pen.curve(0.2, -0.02, 0.28, 0.0, 0.36, 0.06);
  return { pts: pen.pts, tail };
}

function ssKreis() {
  // rechtswendiges ss/ß, im Uhrzeigersinn von links unten einmal herum bis zum oberen Rand;
  // der obere Rand bestimmt die Anschlusszeile (§ 4.1b)
  const pen = new Pen(0.26 + 0.22 * Math.cos((216 * Math.PI) / 180), 0.33 + 0.22 * Math.sin((216 * Math.PI) / 180));
  pen.arc(0.26, 0.33, 0.22, 0.22, 216, 0, 1);
  pen.arc(0.26, 0.33, 0.22, 0.22, 0, -270, 0);
  return { pts: pen.pts };
}

function dreier(h) {
  // kleines „ʒ“ (c, y)
  const pen = new Pen(0, h);
  pen.curve(0.16, h + 0.04, 0.22, h * 0.62, 0.06, h * 0.55, 1);
  pen.curve(0.26, h * 0.48, 0.26, h * 0.05, 0.02, 0, 1);
  return { pts: pen.pts };
}

function rs() {
  const pen = new Pen(0, 0.45);
  pen.curve(0.08, 0.32, 0.2, 0.12, 0.26, 0.04, 1);
  pen.curve(0.34, -0.06, 0.48, 0.12, 0.38, 0.2, 1);
  pen.curve(0.3, 0.26, 0.24, 0.1, 0.36, 0.06);
  pen.line(0.5, 0.14);
  return { pts: pen.pts };
}

function ng() {
  const pen = new Pen(-0.06, 0.96);
  pen.line(0.04, 1.0);
  pen.curve(0.25, 0.7, 0.45, 0.25, 0.64, 0.02, 1);
  pen.curve(0.7, -0.03, 0.78, 0.02, 0.86, 0.18);
  return { pts: pen.pts };
}

function ung() {
  // Nachsilbe -ung: „ʒ“ unter die Zeile
  const pen = new Pen(0, 0.3);
  pen.curve(0.2, 0.36, 0.28, 0.08, 0.06, 0.02, 1);
  pen.curve(0.32, -0.06, 0.3, -0.44, 0.0, -0.45, 1);
  return { pts: pen.pts };
}

// Sonderformen für Kürzel
function punkt() {
  const pen = new Pen(0.07, 0.0);
  pen.arc(0.0, 0.0, 0.07, 0.07, 0, 360, 1);
  return { pts: pen.pts, dot: true };
}
function strich(len = 0.7) {
  const pen = new Pen(0, 0);
  pen.line(len, 0.03, 1);
  return { pts: pen.pts };
}
function nurZeichen() {
  const pen = new Pen(0.12, 0.1);
  pen.curve(0.02, 0.1, -0.04, 0.0, 0.08, -0.01);
  pen.line(0.95, 0.02, 1);
  return { pts: pen.pts };
}
function schale() {
  const pen = new Pen(0, 0.22);
  pen.curve(0.05, -0.02, 0.4, -0.06, 0.52, 0.2, 1);
  return { pts: pen.pts };
}

// ---------------------------------------------------------------------------
// Zeichentabelle. size: Kategorie nach § 2.2 (klein / mittel / groß)
const DEF = {
  // kleine Zeichen
  n: { name: 'n', size: 'klein', make: () => bogen(0.62, 0.3) },
  l: { name: 'l', size: 'klein', make: lHaken },
  r: { name: 'r', size: 'klein', make: () => rStrich(0.45, 0.32) },
  s: { name: 's', size: 'klein', make: sSchleife },
  ss: { name: 'ss, ß', size: 'klein', make: ssKreis },
  rs: { name: 'rs', size: 'klein', make: rs },
  c: { name: 'c', size: 'klein', make: () => dreier(0.45) },
  k: { name: 'k', size: 'klein', heavy: 0.8, make: () => bogen(1.05, 0.52) },
  // mittlere Zeichen (einstufig)
  t: { name: 't', size: 'mittel', make: () => abstrich({ top: 1 }) },
  b: { name: 'b', size: 'mittel', make: () => abstrich({ top: 1, foot: 'round' }) },
  d: { name: 'd', size: 'mittel', make: () => abstrich({ top: 1, head: 'loop', foot: 'round' }) },
  dr: { name: 'dr', size: 'mittel', make: () => abstrich({ top: 1, head: 'loop' }) },
  g: { name: 'g', size: 'mittel', make: () => abstrich({ top: 1, head: 'hook' }) },
  h: { name: 'h', size: 'mittel', make: () => abstrich({ top: 1, head: 'arc', hs: 0.9, foot: 'round' }) },
  m: { name: 'm', size: 'mittel', make: () => abstrich({ top: 1, head: 'tick', foot: 'round' }) },
  mp: { name: 'mp', size: 'mittel', make: () => abstrich({ top: 1, head: 'tick', foot: 'baseloop' }) },
  nd: { name: 'nd', size: 'mittel', make: () => abstrich({ top: 1, head: 'hloop', foot: 'round' }) },
  ndr: { name: 'ndr', size: 'mittel', make: () => abstrich({ top: 1, head: 'hloop' }) },
  rd: { name: 'rd', size: 'mittel', make: () => abstrich({ top: 1, head: 'loop', hs: 1.35, foot: 'round' }) },
  rdr: { name: 'rdr', size: 'mittel', make: () => abstrich({ top: 1, head: 'loop', hs: 1.35 }) },
  rr: { name: 'rr', size: 'mittel', make: () => rStrich(1, 0.72) },
  ng: { name: 'ng', size: 'mittel', make: ng },
  w: { name: 'w', size: 'mittel', make: () => abstrich({ top: 1, head: 'cap', foot: 'round', bulge: -0.1 }) },
  wr: { name: 'wr', size: 'mittel', make: () => abstrich({ top: 1, head: 'cap', hs: 1.2 }) },
  y: { name: 'y', size: 'mittel', make: () => dreier(0.75) },
  // große Zeichen (Ober-, Unter- und Ganzlängen)
  tr: { name: 'tr', size: 'groß', make: () => abstrich({ top: 2 }) },
  br: { name: 'br', size: 'groß', make: () => abstrich({ top: 2, foot: 'round', bulge: -0.05 }) },
  j: { name: 'j', size: 'groß', make: () => abstrich({ top: 2, foot: 'foot' }) },
  ch: { name: 'ch', size: 'groß', make: () => abstrich({ top: 2, head: 'arc', hs: 1.1 }) },
  cht: { name: 'cht', size: 'groß', make: () => abstrich({ top: 2, head: 'arc', foot: 'round' }) },
  cr: { name: 'cr', size: 'groß', make: () => abstrich({ top: 2, head: 'three' }) },
  x: { name: 'x', size: 'groß', make: () => abstrich({ top: 2, head: 'three', foot: 'left' }) },
  f: { name: 'f', size: 'groß', make: () => abstrich({ top: 2, head: 'loop', hs: 1.25, foot: 'round' }) },
  fr: { name: 'fr', size: 'groß', make: () => abstrich({ top: 2, head: 'loop', hs: 1.25 }) },
  gr: { name: 'gr', size: 'groß', make: () => abstrich({ top: 2, head: 'hook', hs: 1.2 }) },
  kr: { name: 'kr', size: 'groß', make: () => bogen(1.3, 0.92) },
  mpf: { name: 'mpf', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'tick', foot: 'loop' }) },
  p: { name: 'p', size: 'groß', make: () => abstrich({ top: 2, head: 'cap', hs: 1.3, foot: 'round', bulge: -0.16 }) },
  pr: { name: 'pr', size: 'groß', make: () => abstrich({ top: 2, head: 'cap', hs: 1.6 }) },
  pf: { name: 'pf', size: 'groß', make: () => abstrich({ top: 2, head: 'loop', hs: 1.55, foot: 'round' }) },
  pfr: { name: 'pfr', size: 'groß', make: () => abstrich({ top: 2, head: 'loop', hs: 1.55 }) },
  qu: { name: 'qu', size: 'groß', make: () => abstrich({ top: 2, head: 'sloop', foot: 'round', bulge: -0.08 }) },
  sch: { name: 'sch', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'hook', foot: 'loop' }) },
  schm: { name: 'schm', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'tick', foot: 'loop' }) },
  schn: { name: 'schn', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'hloop', foot: 'loop' }) },
  schr: { name: 'schr', size: 'groß', make: () => abstrich({ top: 2, bot: -1, head: 'hook', foot: 'loop' }) },
  schw: { name: 'schw', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'arc', foot: 'loop', bulge: -0.08 }) },
  sp: { name: 'sp', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'sloop', foot: 'loop' }) },
  spr: { name: 'spr', size: 'groß', make: () => abstrich({ top: 2, bot: -1, head: 'sloop', foot: 'loop' }) },
  st: { name: 'st', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'cap', hs: 0.6, foot: 'loop' }) },
  str: { name: 'str', size: 'groß', make: () => abstrich({ top: 2, bot: -1, head: 'cap', hs: 0.6, foot: 'loop' }) },
  v: { name: 'v', size: 'groß', make: () => abstrich({ top: 2, head: 'cap', hs: 0.9, foot: 'left', bulge: 0.06 }) },
  z: { name: 'z', size: 'groß', make: () => abstrich({ top: 1, bot: -1, foot: 'loop' }) },
  zr: { name: 'zr', size: 'groß', make: () => abstrich({ top: 2, bot: -1, foot: 'loop' }) },
  zw: { name: 'zw', size: 'groß', make: () => abstrich({ top: 1, bot: -1, foot: 'loop', fs: 1.5 }) },
  // Silbenzeichen und Kürzel-Sonderformen
  ung: { name: '-ung', size: 'klein', make: ung, special: true },
  punkt: { name: 'Punkt', size: 'klein', make: punkt, special: true },
  strich: { name: 'Strich', size: 'klein', make: () => strich(0.7), special: true },
  nur: { name: 'nur', size: 'klein', make: nurZeichen, special: true },
  schale: { name: 'ver-', size: 'klein', make: schale, special: true },
  tklein: { name: 'die', size: 'klein', make: () => abstrich({ top: 0.5 }), special: true },
  ich: { name: 'ich', size: 'klein', make: () => abstrich({ top: 0.5, head: 'hook', hs: 0.7 }), special: true },
  ge: { name: 'ge-', size: 'groß', make: () => abstrich({ top: 0.5, bot: -1 }), special: true },
  sich: { name: 'sich', size: 'groß', make: () => abstrich({ top: 1, bot: -1, head: 'arc', bulge: 0.1 }), special: true },
};

export const GLYPHS = DEF;

// Reihenfolge der Mitlautzeichen wie in der Urkunde (§ 2.1)
export const URKUNDE_ORDER = [
  'b', 'br', 'c', 'ch', 'cht', 'cr', 'd', 'dr', 'f', 'fr', 'g', 'gr', 'h', 'j',
  'k', 'kr', 'l', 'm', 'mp', 'mpf', 'n', 'nd', 'ndr', 'ng', 'p', 'pf', 'pfr', 'pr', 'qu',
  'r', 'rd', 'rdr', 'rr', 'rs', 's', 'sch', 'schm', 'schn', 'schr', 'schw', 'sp', 'spr', 'ss',
  'st', 'str', 't', 'tr', 'v', 'w', 'wr', 'x', 'y', 'z', 'zr', 'zw',
];

const cache = new Map();

// Liefert eine frische Kopie des Zeichens: { pts, tail?, dot?, entry, exit }
export function glyph(id) {
  const def = DEF[id];
  if (!def) throw new Error('Unbekanntes Zeichen: ' + id);
  if (!cache.has(id)) cache.set(id, def.make());
  const g = cache.get(id);
  const pts = g.pts.map((p) => ({ ...p }));
  const heavy = def.heavy ?? (def.size === 'klein' ? 0.6 : 1);
  return { id, pts, tail: g.tail, dot: g.dot, size: def.size, heavy };
}

// Buchstäbliche Selbstlautzeichen, wenn kein Mitlaut folgt (§ 3.2)
const FINAL = {
  e: [0.42, 0.14, false],
  o: [1.15, 0.06, false],
  i: [0.3, 0.75, false],
  ei: [1.2, 0.75, false],
  u: [0.32, -0.45, false],
  eu: [1.1, -0.45, false],
  a: [0.45, 0.14, true],
  'ö': [1.15, 0.06, true],
  'ü': [0.3, 0.75, true],
  'ä': [1.2, 0.75, true],
  au: [0.32, -0.45, true],
  'äu': [1.1, -0.45, true],
};

export function finalVowel(v) {
  const f = FINAL[v] || FINAL.e;
  const pen = new Pen(0, 0);
  pen.line(f[0], f[1], 1);
  return { pts: pen.pts, thick: f[2] };
}
