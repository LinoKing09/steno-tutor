// Zerlegt ein deutsches Wort in eine Folge von Kurzschrift-Bausteinen
// (Mitlautzeichen mit sinnbildlich vorangehendem Selbstlaut, Kürzel, Auslautvokal).

// Kürzel (Auswahl nach § 5.2 der Wiener Urkunde). level = feste Stellung zur Grundlinie.
export const KUERZEL = {
  das: { parts: [{ g: 'd' }], hint: 'd auf der Grundlinie' },
  dass: { parts: [{ g: 'd' }], hint: 'wie „das“' },
  'daß': { parts: [{ g: 'd' }], hint: 'wie „das“' },
  der: { parts: [{ g: 'r', level: 1 }], hint: 'r auf der Oberlinie' },
  den: { parts: [{ g: 'n', level: 1 }], hint: 'n auf der Oberlinie' },
  dem: { parts: [{ g: 'm', level: 1 }], hint: 'm auf der Oberlinie' },
  des: { parts: [{ g: 's', level: 1 }], hint: 's auf der Oberlinie' },
  die: { parts: [{ g: 'tklein' }], hint: 'kleiner Aufstrich' },
  und: { parts: [{ g: 'strich', level: 1 }], hint: 'Flachstrich auf der Oberlinie' },
  ist: { parts: [{ g: 'punkt', level: 1 }], hint: 'Punkt auf der Oberlinie' },
  ich: { parts: [{ g: 'ich' }], hint: 'kleiner Haken' },
  mit: { parts: [{ g: 'm' }], hint: 'm auf der Grundlinie' },
  kann: { parts: [{ g: 'k' }], hint: 'k-Bogen' },
  nicht: { parts: [{ g: 't' }], hint: 'Aufstrich-t' },
  wenn: { parts: [{ g: 'w' }], hint: 'w' },
  von: { parts: [{ g: 'v' }], hint: 'v' },
  wir: { parts: [{ g: 'wr' }], hint: 'wr auf der Grundlinie' },
  wird: { parts: [{ g: 'wr', level: 1 }], hint: 'wr auf der Oberlinie' },
  'für': { parts: [{ g: 'f', level: 0.5, thick: true }], hint: 'verstärktes, hochgestelltes f' },
  er: { parts: [{ g: 'r' }], hint: 'r auf der Grundlinie' },
  nur: { parts: [{ g: 'nur', level: 1 }], hint: 'Haken mit Flachstrich, hochgestellt' },
  hat: { parts: [{ g: 'h' }], hint: 'h' },
  hast: { parts: [{ g: 'h' }], hint: 'h' },
  habe: { parts: [{ g: 'h' }], hint: 'h (hab…)' },
  haben: { parts: [{ g: 'h' }], hint: 'h (hab…)' },
  sich: { parts: [{ g: 'sich' }], hint: 'gebogener Ganzlängenstrich' },
};

export const VOWELS = ['äu', 'au', 'eu', 'ei', 'a', 'e', 'i', 'o', 'u', 'ö', 'ü', 'ä'];

// Wirkung eines Selbstlauts auf das folgende Mitlautzeichen (§ 3.1, Tabelle)
export const VOWEL_RULES = {
  e: { shift: 0, wide: false, thick: false, label: 'enge Verbindung' },
  o: { shift: 0, wide: true, thick: false, label: 'weite Verbindung' },
  a: { shift: 0, wide: false, thick: true, label: 'Verstärkung, eng' },
  'ö': { shift: 0, wide: true, thick: true, label: 'Verstärkung, weit' },
  i: { shift: 0.5, wide: false, thick: false, label: 'Hochstellung, eng' },
  ei: { shift: 0.5, wide: true, thick: false, label: 'Hochstellung, weit' },
  'ü': { shift: 0.5, wide: false, thick: true, label: 'Hochstellung mit Verstärkung, eng' },
  'ä': { shift: 0.5, wide: true, thick: true, label: 'Hochstellung mit Verstärkung, weit' },
  u: { shift: -0.5, wide: false, thick: false, label: 'Tiefstellung, eng' },
  eu: { shift: -0.5, wide: true, thick: false, label: 'Tiefstellung, weit' },
  au: { shift: -0.5, wide: false, thick: true, label: 'Tiefstellung mit Verstärkung, eng' },
  'äu': { shift: -0.5, wide: true, thick: true, label: 'Tiefstellung mit Verstärkung, weit' },
};

// Mitlautfolgen mit eigenem Zeichen, längste zuerst
const CLUSTERS = [
  'schm', 'schn', 'schr', 'schw', 'spr', 'str', 'mpf', 'pfr', 'ndr', 'rdr',
  'sch', 'cht', 'sp', 'st', 'mp', 'pf', 'nd', 'ng', 'rd', 'rr', 'rs', 'ss',
  'br', 'cr', 'dr', 'fr', 'gr', 'kr', 'pr', 'tr', 'wr', 'zr', 'zw', 'qu', 'ch',
];
// Nur im Stammanlaut zulässig (§ 2.6)
const ANLAUT_ONLY = new Set(['st', 'str', 'sp', 'spr']);

const SINGLE = new Set(['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);

const GE_EXCEPTIONS = new Set(['gebet', 'gemüt', 'genet', 'gelt', 'gerät']);

// Rechtschreibliche Vereinfachungen der Kurzschrift: Dehnungszeichen und Doppelmitlaute
// entfallen (außer ll, ss, rr), ä wird in der Regel wie e geschrieben.
export function normalize(word) {
  let w = word.toLowerCase().normalize('NFC');
  w = w.replace(/[^a-zäöüß]/g, '');
  w = w
    .replace(/äu/g, 'eu')
    .replace(/ä/g, 'e')
    .replace(/a[iy]/g, 'ei')
    .replace(/ey/g, 'ei')
    .replace(/ieh/g, 'i')
    .replace(/ie/g, 'i')
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/dt/g, 't')
    .replace(/ck/g, 'k')
    .replace(/tz/g, 'z')
    .replace(/c(?![hk])/g, 'k')
    .replace(/q(?!u)/g, 'k');
  // Dehnungs-h nach Selbstlaut vor Mitlaut oder am Wortende
  w = w.replace(/([aeiouöü])h(?=[^aeiouöü]|$)/g, '$1');
  // Doppelselbstlaute
  w = w.replace(/aa/g, 'a').replace(/ee/g, 'e').replace(/oo/g, 'o');
  // Doppelmitlaute (ll wird wie l geschrieben, rr und ss behalten eigene Zeichen)
  w = w.replace(/([bdfgklmnptz])\1/g, '$1');
  w = w.replace(/ß/g, 'ss');
  // y zwischen Mitlauten wie i (Typ, System)
  w = w.replace(/(^|[^aeiouöü])y(?=[^aeiouöü]|$)/g, '$1i');
  return w;
}

function readVowel(w, i) {
  for (const v of VOWELS) if (w.startsWith(v, i)) return v;
  return null;
}

function readConsonant(w, i, stemStart) {
  for (const c of CLUSTERS) {
    if (!w.startsWith(c, i)) continue;
    if (ANLAUT_ONLY.has(c) && !stemStart) continue;
    return c;
  }
  const ch = w[i];
  if (SINGLE.has(ch)) return ch;
  return null;
}

// Liefert { items, kuerzel, normalized }
// item: { g, vowel, level?, thick?, kz? } | { final: vowel }
export function parseWord(raw) {
  const lower = raw.toLowerCase();
  if (KUERZEL[lower]) {
    return {
      kuerzel: lower,
      normalized: lower,
      items: KUERZEL[lower].parts.map((p) => ({ ...p, vowel: null, kz: true })),
    };
  }
  let w = normalize(raw);
  const items = [];
  let pos = 0;
  let stemStart = true;

  // Vorsilben-Kürzel ge- und ver-
  if (w.length >= 6 && w.startsWith('ge') && w.endsWith('t') && !GE_EXCEPTIONS.has(w) && !readVowel(w, 2)) {
    items.push({ g: 'ge', vowel: null, kz: true, prefix: 'ge' });
    pos = 2;
  } else if (w.length >= 6 && w.startsWith('ver') && !readVowel(w, 3)) {
    items.push({ g: 'schale', vowel: null, kz: true, prefix: 'ver' });
    pos = 3;
  }

  // Nachsilbe -ung
  let suffix = null;
  if (w.length >= 5 && w.endsWith('ung') && !readVowel(w, w.length - 4)) {
    suffix = 'ung';
    w = w.slice(0, -3);
  }

  let pending = null;
  while (pos < w.length) {
    const v = readVowel(w, pos);
    if (v) {
      if (pending) items.push({ final: pending, hiatus: true }); // Selbstlaut auf Selbstlaut
      pending = v;
      pos += v.length;
      stemStart = false;
      continue;
    }
    const c = readConsonant(w, pos, stemStart);
    if (!c) {
      pos++;
      continue;
    }
    items.push({ g: c, vowel: pending });
    pending = null;
    pos += c.length;
    stemStart = false;
  }
  if (suffix) {
    items.push({ g: 'ung', vowel: pending, kz: true, suffix: 'ung' });
    pending = null;
  }
  if (pending) items.push({ final: pending });
  return { items, kuerzel: null, normalized: w + (suffix || '') };
}

// Beschreibt die Zerlegung in Worten (für Lösungshinweise)
export function explain(raw) {
  const { items, kuerzel } = parseWord(raw);
  if (kuerzel) return `Kürzel „${kuerzel}“: ${KUERZEL[kuerzel].hint}`;
  const out = [];
  items.forEach((it, idx) => {
    if (it.final) {
      out.push(`${it.hiatus ? 'Selbstlaut' : 'Auslaut'} ${it.final} buchstäblich`);
      return;
    }
    if (it.prefix) {
      out.push(`Vorsilbe ${it.prefix}-`);
      return;
    }
    if (it.suffix) {
      out.push(`${it.vowel ? it.vowel + ' → ' : ''}Nachsilbe -ung`);
      return;
    }
    if (it.vowel) {
      out.push(`${idx === 0 ? 'Anlaut ' : ''}${it.vowel} → ${VOWEL_RULES[it.vowel].label} → ${it.g}`);
    } else {
      out.push(idx === 0 ? it.g : `${it.g} (möglichst eng)`);
    }
  });
  return out.join(' · ');
}
