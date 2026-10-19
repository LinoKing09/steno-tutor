// Lokale Aktenführung: Lernfortschritt im Browser (localStorage), mit Rückfall auf Arbeitsspeicher.

const KEY = 'steno-tutor-akte-v2'; // v2: neuer, feiner gegliederter Lehrplan
let memory = null;

function blank() {
  return {
    angelegt: new Date().toISOString(),
    aktenzeichen: 'KS-' + Math.floor(100000 + Math.random() * 899999) + '/' + new Date().getFullYear(),
    name: '',
    lektionen: {}, // id -> { gelesen, uebungen: {typ: {richtig, gesamt}}, pruefung: {punkte, bestanden, datum} }
    besuche: 0,
    einstellungen: { finger: null, tempo: 0.85, stufe: null },
  };
}

export function load() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? { ...blank(), ...JSON.parse(raw) } : blank();
  } catch {
    memory = blank();
  }
  return memory;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* privater Modus o. Ä.: Fortschritt bleibt nur für diese Sitzung erhalten */
  }
}

export function update(fn) {
  const a = load();
  fn(a);
  save();
  return a;
}

export function lesson(id) {
  const a = load();
  if (!a.lektionen[id]) a.lektionen[id] = { gelesen: false, uebungen: {}, pruefung: null };
  return a.lektionen[id];
}

export function recordExercise(id, typ, ok) {
  update(() => {
    const l = lesson(id);
    const u = (l.uebungen[typ] ||= { richtig: 0, gesamt: 0 });
    u.gesamt++;
    if (ok) u.richtig++;
  });
}

export function reset() {
  memory = blank();
  save();
}
