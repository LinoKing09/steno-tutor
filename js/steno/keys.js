// Übungsgegenstände werden über Schlüssel angesprochen:
//   "Wort"  – ein Wort (bzw. Kürzel)
//   "#b"    – ein einzelnes Mitlautzeichen
//   "~e"    – ein Selbstlaut am Wortende (buchstäbliches Zeichen)

import { layoutWord, layoutGlyph, layoutFinal } from './layout.js';
import { GLYPHS, DESC, FINAL_DESC } from './glyphs.js';
import { explain } from './parser.js';

export const isGlyphKey = (key) => key.startsWith('#') || key.startsWith('~');

export function layoutFor(key) {
  if (key.startsWith('#')) return layoutGlyph(key.slice(1));
  if (key.startsWith('~')) return layoutFinal(key.slice(1));
  return layoutWord(key);
}

export function keyLabel(key) {
  if (key.startsWith('#')) return GLYPHS[key.slice(1)].name;
  if (key.startsWith('~')) return key.slice(1) + ' am Wortende';
  return key;
}

export function keyExplain(key) {
  if (key.startsWith('#')) return `Zeichen ${GLYPHS[key.slice(1)].name}: ${DESC[key.slice(1)] || ''}`;
  if (key.startsWith('~')) return `${key.slice(1)} am Wortende: ${FINAL_DESC[key.slice(1)] || 'buchstäbliches Zeichen'}`;
  return explain(key);
}
