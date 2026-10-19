// SVG-Ausgabe der Kurzschriftbilder.

import { layoutWord, layoutText } from './layout.js';

const f = (n) => (Math.round(n * 100) / 100).toString();

function polyline(pts, S, ox, oy) {
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    d += (i ? 'L' : 'M') + f(ox + p.x * S) + ' ' + f(oy - p.y * S);
  }
  return d;
}

// Umriss eines verstärkten Abschnitts als gefülltes Vieleck
function thickOutline(pts, a, b, S, ox, oy, hair, heavy) {
  const seg = pts.slice(a, b + 1);
  if (seg.length < 2) return '';
  const cum = [0];
  for (let i = 1; i < seg.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(seg[i].x - seg[i - 1].x, seg[i].y - seg[i - 1].y));
  }
  const L = cum[cum.length - 1] || 1;
  const left = [];
  const right = [];
  for (let i = 0; i < seg.length; i++) {
    const p = seg[i];
    const q = seg[Math.min(i + 1, seg.length - 1)];
    const o = seg[Math.max(i - 1, 0)];
    let tx = q.x - o.x;
    let ty = q.y - o.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const w = (hair + (heavy - hair) * Math.pow(Math.max(0, Math.sin((Math.PI * cum[i]) / L)), 0.6)) / 2;
    const x = ox + p.x * S;
    const y = oy - p.y * S;
    // Normale in Bildschirmkoordinaten (y nach unten)
    left.push([x - ty * w, y - tx * w]);
    right.push([x + ty * w, y + tx * w]);
  }
  const ring = left.concat(right.reverse());
  return 'M' + ring.map(([x, y]) => f(x) + ' ' + f(y)).join('L') + 'Z';
}

function linesSvg(x0, x1, oy, S, cls = 'steno-lines') {
  const ys = [2, 1, 0, -1];
  return (
    `<g class="${cls}">` +
    ys
      .map(
        (y) =>
          `<line x1="${f(x0)}" x2="${f(x1)}" y1="${f(oy - y * S)}" y2="${f(oy - y * S)}" class="${
            y === 0 ? 'grund' : y === 2 || y === -1 ? 'grenze' : 'ober'
          }"/>`,
      )
      .join('') +
    '</g>'
  );
}

// Liefert die Pfade eines Wortes; bei Animation beginnt der Schreibablauf nach `start` Sekunden.
function wordPaths(layout, S, ox, oy, { hair, heavy, animate, start = 0, timing }) {
  let out = '';
  let delay = start;
  for (const s of layout.strokes) {
    const d = polyline(s.pts, S, ox, oy);
    if (animate) {
      const len = s.pts.length;
      const dur = Math.max(0.3, len * 0.012);
      out += `<path d="${d}" class="ink anim" pathLength="1" style="stroke-width:${f(hair)}px;animation-delay:${f(
        delay,
      )}s;animation-duration:${f(dur)}s"/>`;
      delay += dur + 0.1;
    } else {
      out += `<path d="${d}" class="ink" style="stroke-width:${f(hair)}px"/>`;
    }
    for (const [a, b, k = 1] of s.runs) {
      const t = thickOutline(s.pts, a, b, S, ox, oy, hair, hair + (heavy - hair) * k);
      if (t) out += `<path d="${t}" class="ink-fill${animate ? ' anim-fill' : ''}" ${animate ? `style="animation-delay:${f(delay)}s"` : ''}/>`;
    }
  }
  if (timing) timing.end = delay;
  return out;
}

// Einzelnes Wort als SVG-Zeichenkette
export function wordSvg(word, opts = {}) {
  const S = opts.scale ?? 30;
  const pad = opts.pad ?? 0.6;
  const layout = opts.layout || layoutWord(word);
  const bb = layout.bbox;
  const minY = Math.min(bb.minY, opts.lines !== false ? -1 : bb.minY) - pad;
  const maxY = Math.max(bb.maxY, opts.lines !== false ? 2 : bb.maxY) + pad;
  const w = Math.max(opts.minWidth ?? 0, (bb.maxX - bb.minX + 2 * pad) * S);
  const h = (maxY - minY) * S;
  const ox = (w - (bb.maxX - bb.minX) * S) / 2 - bb.minX * S;
  const oy = maxY * S;
  const hair = opts.hair ?? Math.max(1.2, S * 0.055);
  const heavy = opts.heavy ?? S * 0.17;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" class="steno-svg${opts.cls ? ' ' + opts.cls : ''}" viewBox="0 0 ${f(
    w,
  )} ${f(h)}" width="${f(w)}" height="${f(h)}" role="img" aria-label="Kurzschrift: ${escapeAttr(word)}">`;
  if (opts.lines !== false) svg += linesSvg(0, w, oy, S);
  svg += wordPaths(layout, S, ox, oy, { hair, heavy, animate: opts.animate });
  svg += '</svg>';
  return svg;
}

// Längerer Text mit Zeilenumbruch
export function textSvg(text, opts = {}) {
  const S = opts.scale ?? 26;
  const maxWidth = opts.maxWidth ?? 30;
  const { lines, lineHeight } = layoutText(text, { maxWidth });
  const pad = 0.8;
  const w = (maxWidth + 2 * pad + 2) * S;
  const h = (lines.length * lineHeight + 0.6) * S;
  const hair = opts.hair ?? Math.max(1.2, S * 0.055);
  const heavy = opts.heavy ?? S * 0.17;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" class="steno-svg steno-text" viewBox="0 0 ${f(w)} ${f(
    h,
  )}" width="${f(w)}" height="${f(h)}" role="img" aria-label="Kurzschrift: ${escapeAttr(text)}">`;
  const timing = { end: 0 };
  lines.forEach((line, li) => {
    const oy = (li * lineHeight + 2.6) * S;
    svg += linesSvg(0, w, oy, S);
    for (const it of line) {
      const ox = (pad + it.x) * S;
      if (it.punct) {
        svg += `<text x="${f(ox)}" y="${f(oy - 0.05 * S)}" class="steno-punct" font-size="${f(S * 0.9)}">${it.punct}</text>`;
      } else {
        svg += `<g><title>${escapeAttr(it.word)}</title>${wordPaths(it.layout, S, ox, oy, {
          hair,
          heavy,
          animate: opts.animate,
          start: timing.end,
          timing,
        })}</g>`;
      }
    }
  });
  svg += '</svg>';
  return svg;
}

// Einzelnes Zeichen (für die Zeichentafel)
export function glyphSvg(layout, opts = {}) {
  return wordSvg('', { ...opts, layout });
}

function escapeAttr(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
