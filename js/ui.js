// Kleine DOM-Helfer und wiederkehrende Behörden-Bausteine (Stempel, Vorgangsnummern, Meldungen).

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function stamp(text, kind = 'rot') {
  return h('span', { class: `stempel stempel-${kind}`, 'aria-label': 'Stempel: ' + text }, text);
}

let vorgang = 1000 + Math.floor(Math.random() * 8000);
export function vorgangsnummer() {
  vorgang += 1 + Math.floor(Math.random() * 3);
  return `V-${new Date().getFullYear()}-${String(vorgang).padStart(5, '0')}`;
}

export function heute() {
  return new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Kurze „Bearbeitungszeit“ – nur ein Augenzwinkern, keine echte Wartezeit
export function bearbeiten(container, text = 'Ihr Vorgang wird bearbeitet') {
  const box = h('div', { class: 'bearbeitung', role: 'status' }, h('span', { class: 'sanduhr', 'aria-hidden': 'true' }, '⌛'), ' ', text, h('span', { class: 'punkte' }, '…'));
  container.replaceChildren(box);
  return new Promise((r) => setTimeout(r, 350));
}

export function toast(msg, kind = 'info') {
  let host = document.getElementById('meldungen');
  if (!host) {
    host = h('div', { id: 'meldungen', 'aria-live': 'polite' });
    document.body.appendChild(host);
  }
  const t = h('div', { class: 'meldung meldung-' + kind }, h('b', {}, kind === 'fehler' ? 'Hinweis der Behörde: ' : 'Mitteilung: '), msg);
  host.appendChild(t);
  setTimeout(() => t.classList.add('weg'), 3600);
  setTimeout(() => t.remove(), 4200);
}

export function fenster(titel, ...inhalt) {
  return h(
    'section',
    { class: 'fenster' },
    h('div', { class: 'titelleiste' }, h('span', { class: 'titel' }, titel), h('span', { class: 'fensterknoepfe', 'aria-hidden': 'true' }, h('i', {}, '_'), h('i', {}, '□'), h('i', {}, '×'))),
    h('div', { class: 'fensterinhalt' }, ...inhalt),
  );
}

export function knopf(label, onclick, extra = {}) {
  return h('button', { ...extra, type: 'button', class: 'knopf' + (extra.class ? ' ' + extra.class : ''), onclick }, label);
}

// append/replaceChildren ohne leere Werte (null, false, '')
const clean = (kids) => kids.flat().filter((k) => k !== null && k !== undefined && k !== false && k !== '');
export function add(el, ...kids) {
  el.append(...clean(kids));
  return el;
}
export function put(el, ...kids) {
  el.replaceChildren(...clean(kids));
  return el;
}
