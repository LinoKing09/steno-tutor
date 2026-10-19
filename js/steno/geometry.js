// Geometrie-Hilfen für die Kurzschrift-Engine.
// Einheit ist die "Stufe" (Abstand zweier Linien im Schreibraum, § 1 Wiener Urkunde).
// Koordinatensystem: x nach rechts, y nach oben, Grundlinie bei y = 0.

const STEP = 0.04; // Abtastweite in Stufen

// Ein Pfad aus abgetasteten Punkten {x, y, m}; m = 1 markiert den Hauptstrich
// (die Stelle, die bei der Verstärkung dicker geschrieben wird).
export class Pen {
  constructor(x, y) {
    this.pts = [{ x, y, m: 0 }];
  }

  get cur() {
    return this.pts[this.pts.length - 1];
  }

  line(x, y, m = 0) {
    const p = this.cur;
    const len = Math.hypot(x - p.x, y - p.y);
    const n = Math.max(1, Math.ceil(len / STEP));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      this.pts.push({ x: p.x + (x - p.x) * t, y: p.y + (y - p.y) * t, m });
    }
    return this;
  }

  curve(c1x, c1y, c2x, c2y, x, y, m = 0) {
    const p = this.cur;
    const approx =
      Math.hypot(c1x - p.x, c1y - p.y) + Math.hypot(c2x - c1x, c2y - c1y) + Math.hypot(x - c2x, y - c2y);
    const n = Math.max(2, Math.ceil(approx / STEP));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      this.pts.push({
        x: a * p.x + b * c1x + c * c2x + d * x,
        y: a * p.y + b * c1y + c * c2y + d * y,
        m,
      });
    }
    return this;
  }

  // Kreis-/Ellipsenbogen um (cx, cy), Winkel in Grad (mathematisch positiv = gegen den Uhrzeigersinn)
  arc(cx, cy, rx, ry, from, to, m = 0) {
    const n = Math.max(4, Math.ceil((Math.abs(to - from) / 360) * 2 * Math.PI * Math.max(rx, ry) / STEP));
    for (let i = 1; i <= n; i++) {
      const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
      this.pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), m });
    }
    return this;
  }
}

export function bounds(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export function pathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}
