// Lernportal Kurzschrift – Seitensteuerung
import { h, add, put, esc, stamp, fenster, knopf, toast, heute, shuffle } from './ui.js';
import { LESSONS, lessonById, wordsUpTo, allWords } from './lessons.js';
import { wordSvg, textSvg, glyphSvg } from './steno/render.js';
import { layoutGlyph, layoutText, layoutWord } from './steno/layout.js';
import { GLYPHS, URKUNDE_ORDER } from './steno/glyphs.js';
import { explain, KUERZEL, VOWEL_RULES, parseWord } from './steno/parser.js';
import { practice, exam, TYPES, sameSteno } from './exercise.js';
import { StenoPad } from './pad.js';
import { rank, segmentWords } from './recognizer.js';
import { speak, canSpeak, listen, canListen, stopSpeaking } from './speech.js';
import * as store from './store.js';

const main = document.getElementById('inhalt');

// ---------------------------------------------------------------------------
// Hilfsfunktionen

function lessonStatus(l) {
  const a = store.load().lektionen[l.id];
  if (a?.pruefung?.bestanden) return 'bewilligt';
  if (a && (a.gelesen || Object.keys(a.uebungen).length)) return 'bearbeitung';
  return 'offen';
}

function statusStamp(s) {
  if (s === 'bewilligt') return stamp('BEWILLIGT', 'blau');
  if (s === 'bearbeitung') return h('span', { class: 'status-bearb' }, 'in Bearbeitung');
  return h('span', { class: 'status-offen' }, 'offen');
}

function wordCard(word, { scale = 40, note } = {}) {
  const svgBox = h('div', { class: 'wortbild', html: wordSvg(word, { scale }) });
  const card = h(
    'figure',
    { class: 'wortkarte', tabindex: '0', title: 'Antippen zum Abspielen der Schreibweise' },
    svgBox,
    h('figcaption', {}, h('b', {}, word), note ? h('small', {}, note) : null),
  );
  const play = () => {
    svgBox.innerHTML = wordSvg(word, { scale, animate: true });
    if (canSpeak()) speak(word, { rate: store.load().einstellungen.tempo });
  };
  card.addEventListener('click', play);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play();
    }
  });
  return card;
}

function glyphCard(id, { thick = false } = {}) {
  const g = GLYPHS[id];
  const box = h('div', { class: 'wortbild', html: glyphSvg(layoutGlyph(id, { thick }), { scale: 40 }) });
  const card = h('figure', { class: 'zeichenkarte', tabindex: '0', title: 'Antippen: Schreibrichtung zeigen' }, box, h('figcaption', {}, h('b', {}, g.name), h('small', {}, g.size)));
  const play = () => {
    box.innerHTML = glyphSvg(layoutGlyph(id, { thick }), { scale: 40, animate: true });
  };
  card.addEventListener('click', play);
  card.addEventListener('keydown', (e) => (e.key === 'Enter' ? play() : null));
  return card;
}

function setTitle(t) {
  document.title = `${t} – Lernportal Kurzschrift`;
  const bc = document.getElementById('brotkrumen');
  if (bc) bc.textContent = t;
}

function updateSidebar() {
  const a = store.load();
  const done = LESSONS.filter((l) => a.lektionen[l.id]?.pruefung?.bestanden).length;
  const el = document.getElementById('rand-akte');
  if (el)
    put(el, 
      h('div', {}, 'Aktenzeichen:'),
      h('div', { class: 'az' }, a.aktenzeichen),
      a.name ? h('div', {}, 'Antragsteller/in: ', h('b', {}, a.name)) : null,
      h('div', {}, `Bewilligte Lerneinheiten: ${done} / ${LESSONS.length}`),
      h('div', { class: 'fortschritt', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(LESSONS.length), 'aria-valuenow': String(done) }, h('i', { style: { width: (100 * done) / LESSONS.length + '%' } })),
    );
  const z = document.getElementById('zaehler');
  if (z) put(z, ...String(4711 + a.besuche).padStart(7, '0').split('').map((d) => h('span', {}, d)));
}

// ---------------------------------------------------------------------------
// Seiten

const pages = {
  start() {
    setTitle('Startseite');
    const akte = store.load();
    const nameInput = h('input', { type: 'text', class: 'eingabe', id: 'antrag-name', value: akte.name || '', placeholder: 'Vor- und Zuname', autocomplete: 'name' });
    const demo = shuffle(['Bundestag', 'Kurzschrift', 'Protokoll', 'Sitzung', 'Präsident', 'Verwaltung', 'Stempel'])[0];
    const demoBox = h('div', { class: 'wortbild gross', html: wordSvg(demo, { scale: 46, animate: true }) });
    put(main, 
      fenster(
        'Amtliche Bekanntmachung',
        h('h1', {}, 'Willkommen im Lernportal für Deutsche Einheitskurzschrift'),
        h(
          'p',
          { class: 'einleitung' },
          'Hier erlernen Sie Schritt für Schritt die ',
          h('b', {}, 'Verkehrsschrift der Deutschen Einheitskurzschrift (DEK)'),
          ' nach der Systemurkunde von 1968 („Wiener Urkunde“) – die Grundlage der Redeschrift, mit der im Deutschen Bundestag jede Plenarsitzung mitgeschrieben wird.',
        ),
        h(
          'div',
          { class: 'zweispaltig' },
          h(
            'div',
            {},
            h('h2', {}, 'Leistungsumfang'),
            h(
              'ul',
              { class: 'pfeilliste' },
              h('li', {}, h('a', { href: '#/lektionen' }, '12 Lerneinheiten'), ' mit Lehrstoff, Zeichentafel und Prüfung'),
              h('li', {}, 'Schreiben mit ', h('b', {}, 'Apple Pencil'), ', ', h('b', {}, 'S-Pen'), ', Finger oder Maus – mit Handballen-Erkennung'),
              h('li', {}, h('a', { href: '#/uebersetzer' }, 'Übertragungsstelle'), ': Text oder Sprache → Kurzschrift'),
              h('li', {}, h('a', { href: '#/lesesaal' }, 'Lesesaal'), ': Kurzschrift → Text'),
              h('li', {}, h('a', { href: '#/schreibstube' }, 'Schreibstube'), ': Ihre Handschrift → Text und Sprache'),
              h('li', {}, 'Hördiktate mit einstellbarer Diktiergeschwindigkeit'),
            ),
          ),
          h(
            'div',
            { class: 'kasten-gelb' },
            h('h2', {}, 'Kurzschrift des Tages'),
            demoBox,
            h('p', { class: 'mitte' }, h('b', {}, demo), h('br'), h('small', {}, explain(demo))),
            knopf('↻ Noch einmal schreiben', () => {
              demoBox.innerHTML = wordSvg(demo, { scale: 46, animate: true });
            }, { class: 'klein' }),
          ),
        ),
      ),
      fenster(
        'Formular A 1 – Antrag auf Teilnahme',
        h(
          'form',
          {
            class: 'formular',
            onsubmit: (e) => {
              e.preventDefault();
              store.update((a) => {
                a.name = nameInput.value.trim();
              });
              updateSidebar();
              toast(`Ihr Antrag wurde unter dem Aktenzeichen ${store.load().aktenzeichen} erfasst.`);
              location.hash = '#/lektion/l1';
            },
          },
          h('table', { class: 'formtabelle' },
            h('tr', {}, h('th', {}, h('label', { for: 'antrag-name' }, 'Name (freiwillig)')), h('td', {}, nameInput)),
            h('tr', {}, h('th', {}, 'Aktenzeichen'), h('td', {}, h('code', {}, akte.aktenzeichen), ' (wird automatisch vergeben)')),
            h('tr', {}, h('th', {}, 'Datum'), h('td', {}, heute())),
          ),
          h('p', { class: 'klein' }, 'Ihre Angaben verbleiben ausschließlich in Ihrem Browser. Eine Übermittlung an Behörden findet nicht statt.'),
          h('button', { type: 'submit', class: 'knopf primaer' }, 'Antrag stellen und mit Lerneinheit 1 beginnen ▸'),
        ),
      ),
      fenster(
        'Neuigkeiten aus dem Amt',
        h(
          'ul',
          { class: 'news' },
          h('li', {}, h('span', { class: 'datum' }, heute()), h('span', { class: 'neu' }, 'NEU!'), ' Hördiktat jetzt mit Spracheingabe in der Übertragungsstelle.'),
          h('li', {}, h('span', { class: 'datum' }, '01.08.1968'), ' Die Wiener Urkunde tritt in Kraft.'),
          h('li', {}, h('span', { class: 'datum' }, '20.09.1924'), ' Die Deutsche Einheitskurzschrift wird geschaffen.'),
        ),
      ),
    );
  },

  lektionen() {
    setTitle('Verzeichnis der Lerneinheiten');
    const rows = LESSONS.map((l) =>
      h(
        'tr',
        {},
        h('td', { class: 'mitte' }, String(l.nr)),
        h('td', {}, h('a', { href: `#/lektion/${l.id}` }, h('b', {}, l.titel)), h('br'), h('small', {}, l.kurz)),
        h('td', { class: 'mitte klein' }, l.paragraf),
        h('td', { class: 'mitte' }, statusStamp(lessonStatus(l))),
      ),
    );
    put(main, 
      fenster(
        'Verzeichnis der Lerneinheiten (Anlage 1)',
        h('p', {}, 'Die Lerneinheiten bauen aufeinander auf. Es wird empfohlen, sie in der angegebenen Reihenfolge zu bearbeiten. Ein formeller Antrag auf Freischaltung ist nicht erforderlich.'),
        h('table', { class: 'amtstabelle breit' }, h('thead', {}, h('tr', {}, h('th', {}, 'Nr.'), h('th', {}, 'Gegenstand'), h('th', {}, 'Rechtsgrundlage'), h('th', {}, 'Status'))), h('tbody', {}, ...rows)),
      ),
    );
  },

  lektion(id, tab = 'lehrstoff') {
    const lesson = lessonById(id);
    if (!lesson) return pages.nichtgefunden();
    setTitle(`Lerneinheit ${lesson.nr}`);
    store.update(() => {
      store.lesson(id).gelesen = true;
    });
    const pool = wordsUpTo(lesson.nr);
    const tabs = [
      ['lehrstoff', 'Lehrstoff'],
      ['zeichen', 'Zeichen'],
      ['nachspuren', 'Nachspuren'],
      ['schreiben', 'Schreiben'],
      ['lesen', 'Lesen'],
      ['diktat', 'Hördiktat'],
      ['pruefung', 'Prüfung'],
    ];
    const body = h('div', { class: 'reiterinhalt' });
    const reiter = h(
      'div',
      { class: 'reiter', role: 'tablist' },
      ...tabs.map(([k, label]) => h('a', { href: `#/lektion/${id}/${k}`, class: k === tab ? 'aktiv' : '', role: 'tab', 'aria-selected': k === tab ? 'true' : 'false' }, label)),
    );
    const prev = LESSONS[lesson.nr - 2];
    const next = LESSONS[lesson.nr];
    put(main, 
      fenster(
        `Lerneinheit ${lesson.nr} · ${lesson.paragraf}`,
        h('h1', {}, lesson.titel),
        reiter,
        body,
        h(
          'div',
          { class: 'blaettern' },
          prev ? h('a', { href: `#/lektion/${prev.id}`, class: 'knopf' }, `◂ Lerneinheit ${prev.nr}`) : h('span'),
          h('a', { href: '#/lektionen', class: 'knopf' }, 'Verzeichnis'),
          next ? h('a', { href: `#/lektion/${next.id}`, class: 'knopf' }, `Lerneinheit ${next.nr} ▸`) : h('span'),
        ),
      ),
    );

    if (tab === 'lehrstoff') {
      const examples = lesson.woerter.slice(0, 8);
      add(body, 
        h('div', { class: 'lehrtext', html: lesson.lehrstoff }),
        h('h2', {}, 'Beispiele (antippen zum Abspielen)'),
        h('div', { class: 'kartenreihe' }, ...examples.map((w) => wordCard(w, { note: explain(w) }))),
        lesson.saetze ? h('h2', {}, 'Beispielsätze') : null,
        ...(lesson.saetze || []).map((s) => h('div', { class: 'satz' }, h('div', { class: 'satzbild', html: textSvg(s, { scale: 24, maxWidth: 30 }) }), h('div', {}, s, ' ', canSpeak() ? knopf('🔊', () => speak(s), { class: 'klein', 'aria-label': 'Satz vorlesen' }) : ''))),
        h('p', {}, h('a', { href: `#/lektion/${id}/zeichen`, class: 'knopf primaer' }, 'Weiter zu den Zeichen ▸')),
      );
    } else if (tab === 'zeichen') {
      add(body, 
        lesson.zeichen.length ? h('h2', {}, 'Neue Zeichen') : null,
        lesson.zeichen.length ? h('div', { class: 'kartenreihe' }, ...lesson.zeichen.map((g) => glyphCard(g))) : null,
        lesson.vokale.length ? h('h2', {}, 'Selbstlaute dieser Lerneinheit') : null,
        lesson.vokale.length ? vowelTable(lesson.vokale) : null,
        lesson.kuerzel ? h('h2', {}, 'Kürzel dieser Lerneinheit') : null,
        lesson.kuerzel ? h('div', { class: 'kartenreihe' }, ...lesson.kuerzel.map((k) => wordCard(k, { note: KUERZEL[k]?.hint }))) : null,
        h('p', {}, h('a', { href: `#/lektion/${id}/nachspuren`, class: 'knopf primaer' }, 'Weiter zum Nachspuren ▸')),
      );
    } else if (['nachspuren', 'schreiben', 'lesen', 'diktat'].includes(tab)) {
      const info = {
        nachspuren: 'Fahren Sie die vorgedruckte Sollform mit Stift oder Finger nach. So prägen Sie sich Form, Größe und Stellung ein.',
        schreiben: 'Schreiben Sie das angegebene Wort in Kurzschrift auf die Linien. Achten Sie auf Größe und Höhe der Zeichen.',
        lesen: 'Lesen Sie die Kurzschrift. Wörter mit gleicher Kurzform (z. B. Beet und Bett) werden gleichermaßen anerkannt.',
        diktat: 'Das Wort wird Ihnen vorgelesen. Schreiben Sie es in Kurzschrift. Die Geschwindigkeit stellen Sie unter „Hilfe & Einstellungen“ ein.',
      }[tab];
      const host = h('div');
      add(body, h('p', { class: 'hinweiszeile' }, info), host);
      practice(host, { lesson, type: tab, pool });
    } else if (tab === 'pruefung') {
      const a = store.lesson(id).pruefung;
      const host = h('div');
      add(body, 
        h(
          'div',
          { class: 'kasten-grau' },
          h('p', {}, 'Die Prüfung umfasst ', h('b', {}, '8 Aufgaben'), ' (Schreiben, Lesen, Hördiktat). Zum Bestehen sind mindestens 60 % erforderlich. Hilfen stehen während der Prüfung nicht zur Verfügung.'),
          a ? h('p', {}, 'Bisheriges Ergebnis: ', h('b', {}, `${a.punkte} von ${a.von} Punkten`), ' ', statusStamp(a.bestanden ? 'bewilligt' : 'offen')) : null,
        ),
        host,
      );
      add(host, knopf('Prüfungsverfahren eröffnen ▸', () => exam(host, { lesson, pool, onDone: updateSidebar }), { class: 'primaer' }));
    }
  },

  uebersetzer() {
    setTitle('Übertragungsstelle');
    const ta = h('textarea', { class: 'eingabe', rows: '4', id: 'ue-text', 'aria-label': 'Zu übertragender Text' }, 'Der Bundestag hat das Gesetz beschlossen.');
    const out = h('div', { class: 'stenoausgabe' });
    const protokoll = h('div');
    const animate = h('input', { type: 'checkbox', id: 'ue-anim', checked: true });
    const render = () => {
      const text = ta.value.trim();
      if (!text) {
        put(out, h('p', { class: 'hinweis' }, 'Bitte geben Sie einen Text ein.'));
        put(protokoll);
        return;
      }
      const width = Math.max(14, Math.min(40, Math.floor(out.clientWidth / 26) - 3));
      out.innerHTML = textSvg(text, { scale: 26, maxWidth: width, animate: animate.checked });
      const words = [...new Set(text.match(/[A-Za-zÄÖÜäöüß]+/g) || [])].slice(0, 60);
      put(protokoll, 
        h('details', {}, h('summary', {}, `Zerlegungsprotokoll (${words.length} Wörter)`), h('table', { class: 'amtstabelle breit' }, h('tr', {}, h('th', {}, 'Wort'), h('th', {}, 'Kurzschrift'), h('th', {}, 'Zerlegung')), ...words.map((w) => h('tr', {}, h('td', {}, w), h('td', { html: wordSvg(w, { scale: 22, lines: false, pad: 0.3 }) }), h('td', { class: 'klein' }, explain(w)))))),
      );
    };
    const mic = knopf('🎤 Spracheingabe', async () => {
      if (!canListen()) {
        toast('Ihr Browser unterstützt keine Spracheingabe. Bitte verwenden Sie Safari oder Chrome.', 'fehler');
        return;
      }
      mic.disabled = true;
      mic.textContent = '🎤 Ich höre zu …';
      try {
        const text = await listen({ onInterim: (t) => (ta.value = t) });
        if (text) ta.value = text;
        render();
      } catch (e) {
        toast(e.message, 'fehler');
      } finally {
        mic.disabled = false;
        mic.textContent = '🎤 Spracheingabe';
      }
    });
    const download = knopf('💾 Ausfertigung speichern (SVG)', () => {
      const svg = out.querySelector('svg');
      if (!svg) return;
      const styled = svg.outerHTML.replace('<svg ', '<svg style="background:#fff" ').replace(/class="ink anim"/g, 'class="ink"').replace('</svg>', '<style>.ink{fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round}.ink-fill{fill:#000}.steno-lines line{stroke:#99a;stroke-width:1}.steno-lines line.grund{stroke:#446;stroke-width:1.5}.steno-lines line.ober,.steno-lines line.grenze{stroke-dasharray:3 3}</style></svg>');
      const a = h('a', { href: URL.createObjectURL(new Blob([styled], { type: 'image/svg+xml' })), download: 'kurzschrift.svg' });
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    put(main, 
      fenster(
        'Übertragungsstelle – Text und Sprache in Kurzschrift',
        h('p', {}, 'Geben Sie einen beliebigen deutschen Text ein oder sprechen Sie ihn ein. Die Übertragung erfolgt nach den Regeln der Verkehrsschrift (mit den in diesem Lernprogramm behandelten Kürzeln).'),
        h('div', { class: 'formular' }, h('label', { class: 'formlabel', for: 'ue-text' }, 'Feld 1: Text in Langschrift'), ta),
        h(
          'div',
          { class: 'werkzeug' },
          knopf('✎ Übertragen', render, { class: 'primaer' }),
          mic,
          canSpeak() ? knopf('🔊 Vorlesen', () => speak(ta.value, { rate: store.load().einstellungen.tempo })) : null,
          canSpeak() ? knopf('■ Stopp', () => stopSpeaking()) : null,
          download,
          h('label', { class: 'kreuz' }, animate, h('span', {}, 'Schreibablauf zeigen')),
        ),
        out,
        protokoll,
      ),
    );
    requestAnimationFrame(render);
  },

  lesesaal() {
    setTitle('Lesesaal');
    const words = allWords();
    const bild = h('div', { class: 'lesebild' });
    const input = h('input', { type: 'text', class: 'eingabe', placeholder: 'Ihre Lesung', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Gelesenes Wort' });
    const ergebnis = h('div', { class: 'ergebnis', 'aria-live': 'polite' });
    let word = '';
    let stats = { r: 0, g: 0 };
    const zaehler = h('div', { class: 'zaehler' });
    const next = () => {
      word = words[Math.floor(Math.random() * words.length)];
      bild.innerHTML = wordSvg(word, { scale: 56 });
      input.value = '';
      put(ergebnis);
      put(zaehler, h('span', {}, `Gelesen: ${stats.g}`), h('span', {}, `richtig: ${stats.r}`));
      input.focus({ preventScroll: true });
    };
    const check = (e) => {
      e?.preventDefault();
      if (!input.value.trim()) return;
      const ok = sameSteno(input.value, word);
      stats.g++;
      if (ok) stats.r++;
      put(ergebnis, h('div', { class: 'bescheidchen ' + (ok ? 'gut' : 'schlecht') }, stamp(ok ? 'ANERKANNT' : 'ABGELEHNT', ok ? 'blau' : 'rot'), h('p', {}, ok ? `Richtig: „${word}“` : `Richtig wäre: „${word}“`), h('div', { class: 'zerlegung' }, explain(word))));
      if (canSpeak()) speak(word, { rate: store.load().einstellungen.tempo });
      put(zaehler, h('span', {}, `Gelesen: ${stats.g}`), h('span', {}, `richtig: ${stats.r}`));
    };
    put(main, 
      fenster(
        'Lesesaal – Kurzschrift in Text übertragen',
        h('p', {}, 'Lesen Sie das Kurzschriftbild und tragen Sie das Wort ein. Der Wortschatz umfasst alle Lerneinheiten.'),
        zaehler,
        bild,
        h('form', { class: 'formular inline', onsubmit: check }, input, h('button', { type: 'submit', class: 'knopf primaer' }, '✔ Prüfen'), knopf('Überspringen ▸', next), knopf('Auflösung', () => {
          input.value = word;
          check();
        })),
        ergebnis,
      ),
    );
    next();
  },

  schreibstube() {
    setTitle('Schreibstube');
    const host = h('div', { class: 'padhost' });
    const out = h('div', { class: 'ergebnis', 'aria-live': 'polite' });
    const settings = store.load().einstellungen;
    const vocab = [...new Set([...allWords(), ...Object.keys(KUERZEL)])];
    put(main, 
      fenster(
        'Schreibstube – Handschrift in Text übertragen',
        h('p', {}, 'Schreiben Sie Wörter in Kurzschrift auf die Linien – mit Lücken zwischen den Wörtern. Die Schreibstube erkennt Wörter aus dem Wortschatz der Lerneinheiten (', String(vocab.length), ' Einträge) und liest das Ergebnis vor.'),
        host,
        h(
          'div',
          { class: 'werkzeug' },
          knopf('✔ Auswerten', () => evaluate(), { class: 'primaer' }),
          knopf('↶ Rückgängig', () => pad.undo()),
          knopf('✖ Blatt leeren', () => {
            pad.clear();
            put(out);
          }),
        ),
        out,
      ),
    );
    const pad = new StenoPad(host, { rows: 3, perWidth: 20, allowFinger: settings.finger ?? undefined });
    const evaluate = () => {
      const lines = [];
      for (let r = 0; r < pad.rows; r++) {
        const groups = segmentWords(pad.rowStrokes(r));
        for (const g of groups) {
          const res = rank(g, vocab, 8);
          if (res.length) lines.push({ row: r, best: res[0], alt: res.slice(1, 4) });
        }
      }
      if (!lines.length) {
        put(out, h('div', { class: 'hinweis' }, 'Es liegt keine Schriftprobe vor.'));
        return;
      }
      const text = lines.map((l) => l.best.word).join(' ');
      put(out, 
        h(
          'div',
          { class: 'bescheidchen gut' },
          h('div', { class: 'formlabel' }, 'Übertragung in Langschrift:'),
          h('p', { class: 'uebertragung' }, text),
          h(
            'table',
            { class: 'amtstabelle' },
            h('tr', {}, h('th', {}, 'Zeile'), h('th', {}, 'Erkannt'), h('th', {}, 'Sicherheit'), h('th', {}, 'Alternativen')),
            ...lines.map((l) => h('tr', {}, h('td', {}, String(l.row + 1)), h('td', {}, h('b', {}, l.best.word)), h('td', {}, l.best.score + ' %'), h('td', { class: 'klein' }, l.alt.map((a) => a.word).join(', ')))),
          ),
          canSpeak() ? knopf('🔊 Vorlesen', () => speak(text, { rate: settings.tempo })) : null,
        ),
      );
      if (canSpeak()) speak(text, { rate: settings.tempo });
    };
  },

  zeichentafel() {
    setTitle('Zeichentafel');
    put(main, 
      fenster(
        'Zeichentafel nach § 2 der Systemurkunde (Mitlaute)',
        h('p', {}, 'Alle Mitlautzeichen der Verkehrsschrift in der Reihenfolge der Urkunde. Antippen zeigt die Schreibrichtung.'),
        h('div', { class: 'kartenreihe dicht' }, ...URKUNDE_ORDER.map((g) => glyphCard(g))),
      ),
      fenster('Selbstlaute nach § 3 (sinnbildliche Darstellung)', vowelTable(Object.keys(VOWEL_RULES))),
      fenster('Kürzel (Auswahl nach § 5)', h('div', { class: 'kartenreihe dicht' }, ...Object.keys(KUERZEL).filter((k) => k !== 'daß').map((k) => wordCard(k, { scale: 34, note: KUERZEL[k].hint })))),
    );
  },

  akte() {
    setTitle('Meine Akte');
    const a = store.load();
    const rows = LESSONS.map((l) => {
      const d = a.lektionen[l.id];
      const u = d ? Object.values(d.uebungen).reduce((s, x) => ({ r: s.r + x.richtig, g: s.g + x.gesamt }), { r: 0, g: 0 }) : { r: 0, g: 0 };
      return h('tr', {}, h('td', { class: 'mitte' }, String(l.nr)), h('td', {}, h('a', { href: `#/lektion/${l.id}` }, l.titel)), h('td', { class: 'mitte' }, u.g ? `${u.r} / ${u.g}` : '–'), h('td', { class: 'mitte' }, d?.pruefung ? `${d.pruefung.punkte} / ${d.pruefung.von}` : '–'), h('td', { class: 'mitte' }, statusStamp(lessonStatus(l))));
    });
    const alle = LESSONS.every((l) => a.lektionen[l.id]?.pruefung?.bestanden);
    put(main, 
      fenster(
        `Akte ${a.aktenzeichen}`,
        h('table', { class: 'formtabelle' }, h('tr', {}, h('th', {}, 'Antragsteller/in'), h('td', {}, a.name || '(nicht angegeben)')), h('tr', {}, h('th', {}, 'Angelegt am'), h('td', {}, new Date(a.angelegt).toLocaleDateString('de-DE')))),
        h('table', { class: 'amtstabelle breit' }, h('tr', {}, h('th', {}, 'Nr.'), h('th', {}, 'Lerneinheit'), h('th', {}, 'Übungen (richtig/gesamt)'), h('th', {}, 'Prüfung'), h('th', {}, 'Status')), ...rows),
        h(
          'div',
          { class: 'werkzeug' },
          alle ? knopf('🏅 Urkunde ausstellen', () => urkunde()) : h('span', { class: 'klein' }, 'Die Urkunde wird nach Bestehen aller 12 Prüfungen ausgestellt.'),
          knopf('🗑 Akte vernichten', () => {
            if (confirm('Soll die Akte einschließlich aller Prüfungsergebnisse unwiderruflich dem Aktenvernichter zugeführt werden?')) {
              store.reset();
              updateSidebar();
              toast('Die Akte wurde ordnungsgemäß vernichtet. Ein neues Aktenzeichen wurde vergeben.');
              pages.akte();
            }
          }),
        ),
      ),
    );
  },

  hilfe() {
    setTitle('Hilfe & Einstellungen');
    const s = store.load().einstellungen;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const finger = h('input', { type: 'checkbox', id: 'set-finger', checked: s.finger ?? !coarse });
    finger.addEventListener('change', () => store.update((a) => (a.einstellungen.finger = finger.checked)));
    const tempo = h('input', { type: 'range', min: '0.5', max: '1.3', step: '0.05', value: String(s.tempo), id: 'set-tempo' });
    const tempoOut = h('output', {}, Math.round(s.tempo * 100) + ' %');
    tempo.addEventListener('input', () => {
      store.update((a) => (a.einstellungen.tempo = +tempo.value));
      tempoOut.textContent = Math.round(tempo.value * 100) + ' %';
    });
    put(main, 
      fenster(
        'Einstellungen (Formblatt E 1)',
        h(
          'table',
          { class: 'formtabelle' },
          h('tr', {}, h('th', {}, h('label', { for: 'set-finger' }, 'Fingereingabe zulassen')), h('td', {}, finger, ' ', h('small', {}, 'Abschalten, wenn Sie mit Apple Pencil oder S-Pen schreiben und die Hand auflegen (Handballen-Erkennung). Sobald ein Stift erkannt wird, werden Fingerberührungen ohnehin ignoriert, solange dieses Feld nicht angekreuzt ist.'))),
          h('tr', {}, h('th', {}, h('label', { for: 'set-tempo' }, 'Diktiergeschwindigkeit')), h('td', {}, tempo, ' ', tempoOut, ' ', canSpeak() ? knopf('Probe', () => speak('Die Sitzung ist eröffnet.', { rate: +tempo.value }), { class: 'klein' }) : h('small', {}, 'Sprachausgabe nicht verfügbar'))),
        ),
      ),
      fenster(
        'Hilfe zur Bedienung',
        h('h2', {}, 'Schreiben mit Apple Pencil (iPad) und S-Pen (Samsung)'),
        h('ul', { class: 'pfeilliste' },
          h('li', {}, 'Öffnen Sie das Lernportal in Safari (iPad) bzw. Chrome oder Samsung Internet (Galaxy Tab). Über „Zum Home-Bildschirm“ lässt es sich wie eine App starten und funktioniert danach auch ohne Netz.'),
          h('li', {}, 'Das Schreibfeld reagiert auf den Stiftdruck: Fester aufdrücken erzeugt die ', h('b', {}, 'Verstärkung'), ' (für a, ö, ü, au).'),
          h('li', {}, 'Sie können die Hand beim Schreiben auflegen. Nach dem ersten Stiftstrich werden Berührungen mit Finger oder Handballen ignoriert.'),
          h('li', {}, 'Schreiben Sie im Liniennetz: Die durchgezogene Linie ist die ', h('b', {}, 'Grundlinie'), ', darüber Oberlinie und Obergrenze, darunter die Untergrenze.'),
        ),
        h('h2', {}, 'Wie wird bewertet?'),
        h('p', {}, 'Ihre Schrift wird mit der Sollform verglichen – unter Berücksichtigung von Größe und Stellung zur Grundlinie, denn beides trägt in der Kurzschrift Bedeutung. Kleine Abweichungen in Größe (± 25 %) und Höhe werden toleriert. Anerkannt wird eine Schriftprobe, wenn sie der Sollform am nächsten kommt und nicht mit einem anderen Wort des bisherigen Wortschatzes verwechselbar ist.'),
        h('h2', {}, 'Grundlage und Grenzen'),
        h('p', {}, 'Die Zeichenformen sind nach der Systemurkunde der Deutschen Einheitskurzschrift (Wiener Urkunde vom 20. Juni 1968, in Kraft seit 1. August 1968) gestaltet und werden rechnerisch erzeugt. Sie geben die Urkunde vereinfacht wieder; Sonderregeln (z. B. Aufstrich-t, viele Kürzel, Verschmelzungen) sind nur teilweise umgesetzt. Für Prüfungen vor einer Kammer oder einem Stenografenverband ist das amtliche Lehrmaterial maßgeblich.'),
        h('p', { class: 'klein' }, 'Das „Bundesamt für Kurzschriftwesen“ ist eine Erfindung dieses Lernprogramms. Es handelt sich nicht um ein Angebot einer Behörde der Bundesrepublik Deutschland.'),
      ),
    );
  },

  nichtgefunden() {
    setTitle('Fehler 404');
    put(main, fenster('Fehler 404 – Vorgang nicht auffindbar', h('p', {}, 'Die angeforderte Seite ist nicht vorhanden oder wurde ordnungsgemäß archiviert.'), h('p', {}, h('a', { href: '#/', class: 'knopf' }, 'Zur Startseite'))));
  },
};

function vowelTable(vowels) {
  const base = 'Rete';
  const rows = vowels
    .filter((v) => VOWEL_RULES[v])
    .map((v) => {
      const example = { e: 'Rede', o: 'Rose', a: 'Rat', 'ö': 'Löwe', i: 'Riese', ei: 'Reise', 'ü': 'Rübe', 'ä': 'Räte', u: 'Rute', eu: 'Reue', au: 'Raute', 'äu': 'Räume' }[v] || base;
      return h('tr', {}, h('td', { class: 'mitte' }, h('b', { class: 'gross' }, v)), h('td', {}, VOWEL_RULES[v].label), h('td', {}, wordCard(example, { scale: 30 })));
    });
  return h('table', { class: 'amtstabelle' }, h('tr', {}, h('th', {}, 'Selbstlaut'), h('th', {}, 'Darstellung'), h('th', {}, 'Beispiel')), ...rows);
}

function urkunde() {
  const a = store.load();
  const w = h(
    'div',
    { class: 'urkunde' },
    h('div', { class: 'urkunde-rand' },
      h('div', { class: 'flaggenband' }),
      h('h1', {}, 'Urkunde'),
      h('p', {}, 'Hiermit wird bescheinigt, dass'),
      h('p', { class: 'urkunde-name' }, a.name || 'die Inhaberin / der Inhaber dieser Akte'),
      h('p', {}, 'sämtliche zwölf Lerneinheiten der Verkehrsschrift der Deutschen Einheitskurzschrift erfolgreich bearbeitet und die vorgeschriebenen Prüfungen bestanden hat.'),
      h('div', { class: 'urkunde-steno', html: textSvg('Herzlichen Glückwunsch', { scale: 30, maxWidth: 24 }) }),
      h('p', {}, `Aktenzeichen ${a.aktenzeichen} · ausgestellt am ${heute()}`),
      h('div', { class: 'unterschrift' }, stamp('BEURKUNDET', 'blau'), h('div', {}, h('span', { class: 'krakel' }, 'gez. Kürzel'), h('br'), 'Der Kurzschriftbeauftragte')),
      h('p', { class: 'klein' }, 'Nicht amtliche Teilnahmebescheinigung eines Lernprogramms.'),
    ),
    h('div', { class: 'werkzeug noprint' }, knopf('🖨 Drucken', () => window.print()), knopf('Schließen', () => pages.akte())),
  );
  put(main, w);
}

// ---------------------------------------------------------------------------
// Steuerung

function route() {
  stopSpeaking();
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [page, ...args] = parts;
  const fn = page ? pages[page] : pages.start;
  document.querySelectorAll('#navi a').forEach((a) => a.classList.toggle('aktiv', a.getAttribute('href') === '#/' + (page || '') || (page === 'lektion' && a.getAttribute('href') === '#/lektionen')));
  try {
    (fn || pages.nichtgefunden)(...args);
  } catch (e) {
    console.error(e);
    put(main, fenster('Systemfehler', h('p', {}, 'Bei der Bearbeitung ist ein Fehler aufgetreten: ', h('code', {}, esc(e.message)))));
  }
  updateSidebar();
  main.focus({ preventScroll: true });
  if (!location.hash.includes('/lektion/') || parts.length < 3) window.scrollTo(0, 0);
}

store.update((a) => (a.besuche = (a.besuche || 0) + 1));
window.addEventListener('hashchange', route);
route();

const datum = document.getElementById('heute');
if (datum) datum.textContent = heute();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Für Tests und Neugierige
window.stenoTutor = { parseWord, layoutText, layoutWord };
