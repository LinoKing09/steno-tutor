// Schreibfeld für Stift (Apple Pencil, S-Pen), Finger oder Maus.
// Speichert die Striche in Stufen-Koordinaten (y nach oben, Grundlinie = 0),
// damit sie unabhängig von der Bildschirmgröße mit den Sollformen verglichen werden können.

import { layoutFor } from './steno/keys.js';

const PAD_TOP = 0.75; // Luft über der Obergrenze (in Stufen)
const PAD_BOTTOM = 0.75;
const ROW_H = PAD_TOP + 3 + PAD_BOTTOM;
const MARGIN = 0.5;

export class StenoPad {
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = { rows: 1, minStufe: 28, maxStufe: 56, perWidth: 16, ...opts };
    this.strokes = []; // { row, pts: [{x, y, p}] }
    this.guide = null;
    this.solution = null;
    this.active = null;
    this.penSeen = false;
    this.allowFinger = opts.allowFinger ?? !matchMedia('(pointer: coarse)').matches;

    this.wrap = document.createElement('div');
    this.wrap.className = 'pad-wrap';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pad-canvas';
    this.canvas.setAttribute('aria-label', 'Schreibfeld für Kurzschrift');
    this.canvas.setAttribute('role', 'img');
    this.wrap.appendChild(this.canvas);
    host.appendChild(this.wrap);
    this.ctx = this.canvas.getContext('2d');

    this._down = this._down.bind(this);
    this._move = this._move.bind(this);
    this._up = this._up.bind(this);
    this.canvas.addEventListener('pointerdown', this._down);
    this.canvas.addEventListener('pointermove', this._move);
    this.canvas.addEventListener('pointerup', this._up);
    this.canvas.addEventListener('pointercancel', this._up);
    this.canvas.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') this._up(e);
    });
    // iOS: Scrollen, Lupe und Kontextmenü im Schreibfeld unterbinden
    const stop = (e) => e.preventDefault();
    this.canvas.addEventListener('touchstart', stop, { passive: false });
    this.canvas.addEventListener('touchmove', stop, { passive: false });
    this.canvas.addEventListener('contextmenu', stop);
    this.canvas.addEventListener('selectstart', stop);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.wrap);
    this.resize();
  }

  get rows() {
    return this.opts.rows;
  }

  resize() {
    const w = this.wrap.clientWidth || 600;
    const S = Math.max(this.opts.minStufe, Math.min(this.opts.maxStufe, w / this.opts.perWidth));
    this.S = S;
    const h = Math.round(ROW_H * S * this.opts.rows);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.height = h + 'px';
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.cssW = w;
    this.cssH = h;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.redraw();
  }

  baselineY(row) {
    return (row * ROW_H + PAD_TOP + 2) * this.S;
  }

  toStufe(px, py, row) {
    return { x: px / this.S - MARGIN, y: (this.baselineY(row) - py) / this.S };
  }

  toPx(x, y, row) {
    return { x: (x + MARGIN) * this.S, y: this.baselineY(row) - y * this.S };
  }

  widthStufen() {
    return this.cssW / this.S - 2 * MARGIN;
  }

  _accept(e) {
    if (e.pointerType === 'pen') {
      this.penSeen = true;
      return true;
    }
    if (e.pointerType === 'touch') {
      // Handballen-Erkennung: Sobald ein Stift benutzt wurde, werden Fingerberührungen ignoriert
      if (this.penSeen && !this.allowFinger) return false;
      return this.allowFinger || !this.penSeen;
    }
    return true;
  }

  _pressure(e) {
    if (e.pointerType === 'pen' && e.pressure > 0) return e.pressure;
    return 0.45;
  }

  _down(e) {
    if (!this._accept(e)) return;
    if (this.active) return; // nur ein Zeiger gleichzeitig
    e.preventDefault();
    this.canvas.setPointerCapture?.(e.pointerId);
    const r = this.canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const row = Math.max(0, Math.min(this.opts.rows - 1, Math.floor(py / (ROW_H * this.S))));
    const stroke = { row, pts: [] };
    this.active = { id: e.pointerId, stroke, rect: r };
    this.strokes.push(stroke);
    this.solution = null;
    this._addPoint(e);
    this.host.dispatchEvent(new CustomEvent('padstart'));
  }

  _move(e) {
    if (!this.active || e.pointerId !== this.active.id) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) this._addPoint(ev);
  }

  _addPoint(e) {
    const { stroke, rect } = this.active;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const p = this.toStufe(px, py, stroke.row);
    p.p = this._pressure(e);
    const pts = stroke.pts;
    const last = pts[pts.length - 1];
    if (last && Math.hypot(last.x - p.x, last.y - p.y) < 0.012) return;
    pts.push(p);
    this._drawSegment(stroke, pts.length - 1);
  }

  _up(e) {
    if (!this.active || e.pointerId !== this.active.id) return;
    const s = this.active.stroke;
    this.active = null;
    if (s.pts.length === 1) {
      // Punkt (z. B. Kürzel „ist“)
      s.pts.push({ ...s.pts[0], x: s.pts[0].x + 0.01 });
    }
    this.redraw();
    this.host.dispatchEvent(new CustomEvent('padchange'));
    this.opts.onChange?.(this);
  }

  _lineWidth(p) {
    return this.S * (0.035 + 0.17 * p * p);
  }

  _drawSegment(stroke, i) {
    const ctx = this.ctx;
    const pts = stroke.pts;
    const a = pts[Math.max(0, i - 1)];
    const b = pts[i];
    const pa = this.toPx(a.x, a.y, stroke.row);
    const pb = this.toPx(b.x, b.y, stroke.row);
    ctx.strokeStyle = getComputedStyle(this.wrap).getPropertyValue('--ink').trim() || '#111';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = this._lineWidth((a.p + b.p) / 2);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x + 0.01, pb.y);
    ctx.stroke();
  }

  _drawLines() {
    const ctx = this.ctx;
    const cs = getComputedStyle(this.wrap);
    for (let r = 0; r < this.opts.rows; r++) {
      for (const y of [2, 1, 0, -1]) {
        const py = this.baselineY(r) - y * this.S;
        ctx.beginPath();
        ctx.setLineDash(y === 0 ? [] : [4, 4]);
        ctx.strokeStyle = (y === 0 ? cs.getPropertyValue('--line-strong') : cs.getPropertyValue('--line')).trim() || '#88a';
        ctx.lineWidth = y === 0 ? 1.6 : 1;
        ctx.moveTo(0, Math.round(py) + 0.5);
        ctx.lineTo(this.cssW, Math.round(py) + 0.5);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }

  _drawLayout(layout, offsetX, row, color, width, dash) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    for (const s of layout.strokes) {
      ctx.beginPath();
      s.pts.forEach((p, i) => {
        const q = this.toPx(p.x + offsetX, p.y, row);
        if (i) ctx.lineTo(q.x, q.y);
        else ctx.moveTo(q.x, q.y);
      });
      ctx.stroke();
      // Verstärkungen andeuten
      for (const [a, b] of s.runs) {
        ctx.lineWidth = width * 2.6;
        ctx.beginPath();
        const mid = Math.floor(a + (b - a) * 0.25);
        const end = Math.ceil(a + (b - a) * 0.75);
        for (let i = mid; i <= end; i++) {
          const q = this.toPx(s.pts[i].x + offsetX, s.pts[i].y, row);
          if (i === mid) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
        ctx.lineWidth = width;
      }
    }
    ctx.restore();
  }

  redraw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    this._drawLines();
    const cs = getComputedStyle(this.wrap);
    if (this.guide) {
      const l = this.guide.layout;
      this._drawLayout(l, 0.6 - l.bbox.minX, 0, cs.getPropertyValue('--guide').trim() || 'rgba(0,0,200,.25)', this.S * 0.14);
    }
    for (const s of this.strokes) {
      for (let i = 1; i < s.pts.length; i++) this._drawSegment(s, i);
    }
    if (this.solution) {
      const { layout, row, offsetX } = this.solution;
      this._drawLayout(layout, offsetX, row, cs.getPropertyValue('--solution').trim() || 'rgba(200,0,0,.6)', Math.max(1.5, this.S * 0.05), [6, 4]);
    }
  }

  setGuide(word) {
    this.guide = word ? { word, layout: layoutFor(word) } : null;
    this.redraw();
  }

  // Sollform in Rot über die eigene Schrift legen (linksbündig an der eigenen Schrift)
  showSolution(word, row = 0) {
    if (!word) {
      this.solution = null;
      this.redraw();
      return;
    }
    const layout = layoutFor(word);
    const own = this.rowStrokes(row).flat();
    const ownMin = own.length ? Math.min(...own.map((p) => p.x)) : 0.6;
    this.solution = { layout, row, offsetX: ownMin - layout.bbox.minX };
    this.redraw();
  }

  rowStrokes(row = 0) {
    return this.strokes.filter((s) => s.row === row && s.pts.length).map((s) => s.pts.map((p) => ({ x: p.x, y: p.y })));
  }

  isEmpty(row) {
    return !this.strokes.some((s) => (row === undefined || s.row === row) && s.pts.length > 1);
  }

  undo() {
    this.strokes.pop();
    this.solution = null;
    this.redraw();
    this.host.dispatchEvent(new CustomEvent('padchange'));
  }

  clear() {
    this.strokes = [];
    this.solution = null;
    this.redraw();
    this.host.dispatchEvent(new CustomEvent('padchange'));
  }

  setAllowFinger(v) {
    this.allowFinger = v;
  }

  destroy() {
    this.ro.disconnect();
    this.wrap.remove();
  }
}
