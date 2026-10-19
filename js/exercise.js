// Übungsbausteine: Nachspuren, Schreiben (Text → Kurzschrift), Lesen (Kurzschrift → Text),
// Hördiktat (Audio → Kurzschrift) sowie die Prüfung mit abschließendem Bescheid.

import { h, add, put, stamp, vorgangsnummer, shuffle, bearbeiten, knopf, heute } from './ui.js';
import { StenoPad } from './pad.js';
import { grade } from './recognizer.js';
import { wordSvg } from './steno/render.js';
import { explain, parseWord } from './steno/parser.js';
import { layoutFor, keyLabel, keyExplain, isGlyphKey } from './steno/keys.js';
import { speak, canSpeak } from './speech.js';
import * as store from './store.js';

export const TYPES = {
  nachspuren: { name: 'Nachspuren', formblatt: 'KS-1', titel: 'Nachspuren der Sollform' },
  schreiben: { name: 'Schreiben', formblatt: 'KS-2', titel: 'Übertragung Text → Kurzschrift' },
  lesen: { name: 'Lesen', formblatt: 'KS-3', titel: 'Übertragung Kurzschrift → Text' },
  diktat: { name: 'Hördiktat', formblatt: 'KS-4', titel: 'Hördiktat Audio → Kurzschrift' },
};

const signature = (w) => JSON.stringify(parseWord(w).items);

// Zwei Wörter gelten als gleich, wenn sie dieselbe Kurzform haben (Beet = Bett)
export function sameSteno(a, b) {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (!x) return false;
  return x === y || signature(x) === signature(y);
}

function settings() {
  return store.load().einstellungen;
}

function scoreBar(score) {
  const n = Math.round(score / 10);
  return h(
    'span',
    { class: 'balken', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(score), 'aria-label': 'Übereinstimmung' },
    ...Array.from({ length: 10 }, (_, i) => h('i', { class: i < n ? 'voll' : '' })),
  );
}

// Sollform eines Übungsgegenstands (Wort, „#Zeichen“ oder „~Auslautvokal“) als SVG
export function keySvg(key, opts = {}) {
  return wordSvg(keyLabel(key), { ...opts, layout: layoutFor(key) });
}

function solutionBox(key) {
  const svg = h('div', { class: 'sollform', html: keySvg(key, { scale: 54, animate: true }) });
  return h(
    'div',
    { class: 'loesung' },
    h('div', { class: 'loesung-kopf' }, 'Sollform für „', h('b', {}, keyLabel(key)), '“'),
    svg,
    h('div', { class: 'zerlegung' }, keyExplain(key)),
    knopf('↻ Schreibweise abspielen', () => {
      svg.innerHTML = keySvg(key, { scale: 54, animate: true });
    }, { class: 'klein' }),
  );
}

function sayButton(word, label = '🔊 Vorlesen') {
  return canSpeak() ? knopf(label, () => speak(word, { rate: settings().tempo }), { class: 'klein', 'aria-label': 'Wort vorlesen' }) : null;
}

// Eine einzelne Aufgabe. Liefert ein Promise mit { ok, score }.
export function renderTask(host, task, ctx) {
  return new Promise((resolve) => {
    const t = TYPES[task.type];
    const nr = vorgangsnummer();
    window.__letzteAufgabe = task.word; // Testhilfe für den automatischen Durchklick-Test
    const kopf = h(
      'div',
      { class: 'vorgangskopf' },
      h('span', {}, `Vorgang ${nr}`),
      h('span', {}, `Formblatt ${t.formblatt}: ${t.titel}`),
      ctx.position ? h('span', {}, `Aufgabe ${ctx.position}`) : null,
    );
    const auftrag = h('div', { class: 'auftrag' });
    const arbeit = h('div', { class: 'arbeitsflaeche' });
    const werkzeug = h('div', { class: 'werkzeug' });
    const ergebnis = h('div', { class: 'ergebnis', 'aria-live': 'polite' });
    const box = h('div', { class: 'vorgang' }, kopf, auftrag, arbeit, werkzeug, ergebnis);
    put(host, box);

    let done = false;
    const finish = (res) => {
      if (done) return;
      done = true;
      if (ctx.lessonId && !ctx.exam) store.recordExercise(ctx.lessonId, task.type, res.ok);
      const weiter = knopf(ctx.exam ? 'Nächste Aufgabe ▸' : 'Nächster Vorgang ▸', () => resolve(res), { class: 'primaer' });
      put(werkzeug, weiter);
      setTimeout(() => weiter.focus(), 50);
    };

    if (task.type === 'lesen') {
      renderReading(task, ctx, { auftrag, arbeit, werkzeug, ergebnis, finish });
      return;
    }

    // Schreibaufgaben
    const glyphTask = isGlyphKey(task.word);
    const label = keyLabel(task.word);
    if (glyphTask) {
      add(
        auftrag,
        task.type === 'nachspuren' ? 'Spuren Sie das blau vorgedruckte Zeichen nach: ' : 'Schreiben Sie aus dem Gedächtnis das Zeichen: ',
        h('b', { class: 'zielwort gross' }, label),
        h('small', {}, keyExplain(task.word)),
      );
    } else if (task.type === 'nachspuren') {
      add(auftrag, 'Spuren Sie die blau vorgedruckte Sollform nach: ', h('b', { class: 'zielwort' }, task.word), ' ', sayButton(task.word) || '');
    } else if (task.type === 'schreiben') {
      add(auftrag, 'Übertragen Sie in Kurzschrift: ', h('b', { class: 'zielwort gross' }, task.word), ' ', sayButton(task.word) || '');
    } else if (task.type === 'diktat') {
      const play = knopf('▶ Diktat abspielen', () => {
        if (canSpeak()) speak(task.word, { rate: settings().tempo });
        else {
          play.replaceWith(h('b', { class: 'zielwort' }, task.word));
        }
      }, { class: 'primaer' });
      add(auftrag, 
        canSpeak()
          ? 'Hören Sie das Diktat und schreiben Sie das Wort in Kurzschrift. '
          : 'Ihr Browser bietet keine Sprachausgabe an. Ersatzverfahren: Lassen Sie sich das Wort anzeigen. ',
        play,
      );
      if (canSpeak() && ctx.autoplay) setTimeout(() => speak(task.word, { rate: settings().tempo }), 300);
    }

    const padHost = h('div', { class: 'padhost' });
    add(arbeit, padHost);
    const fingerPref = settings().finger;
    const pad = new StenoPad(padHost, { rows: 1, allowFinger: fingerPref ?? undefined });
    if (task.type === 'nachspuren') pad.setGuide(task.word);

    const pruefen = knopf('✔ Prüfen lassen', async () => {
      const strokes = pad.rowStrokes(0);
      if (!strokes.length) {
        put(ergebnis, h('div', { class: 'hinweis' }, 'Das Formular ist unvollständig: Feld „Schriftprobe“ wurde nicht ausgefüllt.'));
        return;
      }
      await bearbeiten(ergebnis);
      const g = grade(strokes, task.word, ctx.pool || []);
      pad.showSolution(task.word, 0);
      put(ergebnis, 
        h(
          'div',
          { class: 'bescheidchen ' + (g.ok ? 'gut' : 'schlecht') },
          stamp(g.ok ? 'ANERKANNT' : 'NACHBESSERN', g.ok ? 'blau' : 'rot'),
          h('div', {}, 'Übereinstimmung mit der Sollform: ', h('b', {}, g.score + ' %'), ' ', scoreBar(g.score)),
          g.ok
            ? h('p', {}, 'Die Schriftprobe entspricht den Vorgaben der Systemurkunde.')
            : h(
                'p',
                {},
                g.confusedWith
                  ? `Ihre Schrift ähnelt eher ${isGlyphKey(g.confusedWith) ? 'dem Zeichen' : 'dem Wort'} „${keyLabel(g.confusedWith)}“. `
                  : 'Die Abweichung von der Sollform ist zu groß. ',
                'Vergleichen Sie mit der rot gestrichelten Sollform im Schreibfeld.',
              ),
          solutionBox(task.word),
        ),
      );
      if (task.type === 'diktat') speak(task.word, { rate: settings().tempo });
      finish({ ok: g.ok, score: g.score, word: task.word, type: task.type });
    }, { class: 'primaer' });

    add(werkzeug, 
      pruefen,
      knopf('↶ Rückgängig', () => pad.undo()),
      knopf('✖ Feld leeren', () => pad.clear()),
      ctx.exam
        ? null
        : knopf('? Lösung zeigen', () => {
            put(ergebnis, solutionBox(task.word));
            pad.showSolution(task.word, 0);
            finish({ ok: false, score: 0, word: task.word, type: task.type, aufgegeben: true });
          }),
    );
  });
}

function renderReading(task, ctx, { auftrag, arbeit, werkzeug, ergebnis, finish }) {
  add(auftrag, 'Lesen Sie die Kurzschrift und geben Sie das Wort an:');
  const svgHost = h('div', { class: 'lesebild', html: wordSvg(task.word, { scale: 54 }) });
  add(arbeit, svgHost);

  const pool = (ctx.pool || []).filter((w) => !sameSteno(w, task.word));
  const choices = shuffle([task.word, ...shuffle(pool).slice(0, 3)]);
  const name = 'wahl-' + Math.random().toString(36).slice(2);
  const form = h('form', { class: 'formular', onsubmit: (e) => e.preventDefault() });
  add(form, 
    h('div', { class: 'formzeile' }, h('span', { class: 'formlabel' }, '1. Bitte Zutreffendes ankreuzen:')),
    h(
      'div',
      { class: 'ankreuzen' },
      ...choices.map((c) =>
        h('label', { class: 'kreuz' }, h('input', { type: 'radio', name, value: c }), h('span', {}, c)),
      ),
    ),
    h(
      'div',
      { class: 'formzeile' },
      h('label', { class: 'formlabel', for: name + '-frei' }, '2. oder Freitext (Feld 2 hat Vorrang):'),
      h('input', { type: 'text', id: name + '-frei', class: 'eingabe', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Wort eingeben' }),
    ),
  );
  add(arbeit, form);

  const pruefen = knopf('✔ Antrag einreichen', async () => {
    const frei = form.querySelector('input[type=text]').value.trim();
    const radio = form.querySelector('input[type=radio]:checked');
    const answer = frei || radio?.value || '';
    if (!answer) {
      put(ergebnis, h('div', { class: 'hinweis' }, 'Das Formular ist unvollständig: Bitte kreuzen Sie an oder füllen Sie Feld 2 aus.'));
      return;
    }
    await bearbeiten(ergebnis);
    const ok = sameSteno(answer, task.word);
    put(ergebnis, 
      h(
        'div',
        { class: 'bescheidchen ' + (ok ? 'gut' : 'schlecht') },
        stamp(ok ? 'ANERKANNT' : 'ABGELEHNT', ok ? 'blau' : 'rot'),
        h('p', {}, ok ? `Richtig: „${task.word}“.` : `Ihre Angabe „${answer}“ ist unzutreffend. Richtig wäre: „${task.word}“.`),
        h('div', { class: 'zerlegung' }, explain(task.word)),
      ),
    );
    speak(task.word, { rate: settings().tempo });
    finish({ ok, score: ok ? 100 : 0, word: task.word, type: 'lesen' });
  }, { class: 'primaer' });
  form.addEventListener('submit', () => pruefen.click());
  add(werkzeug, pruefen);
}

// Endlose Übungsreihe. type „zeichen“: Einzelzeichen, jedes erst nachspuren, dann frei schreiben.
export function practice(host, { lesson, type, pool, keys = lesson.woerter }) {
  let queue = [];
  let runde = 0;
  let richtig = 0;
  let gesamt = 0;
  const nachgespurt = new Set();
  const zaehler = h('div', { class: 'zaehler' });
  const taskHost = h('div');
  put(host, zaehler, taskHost);
  const updateZaehler = () => {
    put(zaehler,
      h('span', {}, `Bearbeitete Vorgänge: ${gesamt}`),
      h('span', {}, `davon anerkannt: ${richtig}`),
      h('span', {}, `Quote: ${gesamt ? Math.round((100 * richtig) / gesamt) : 0} %`),
    );
  };
  const next = async () => {
    if (!queue.length) {
      // erste Runde in der Reihenfolge des Lehrstoffs, danach gemischt
      queue = runde++ === 0 && type === 'zeichen' ? keys.slice().reverse() : shuffle(keys);
    }
    const key = queue[queue.length - 1];
    let taskType = type;
    if (type === 'zeichen') taskType = nachgespurt.has(key) ? 'schreiben' : 'nachspuren';
    updateZaehler();
    const res = await renderTask(taskHost, { type: taskType, word: key }, { lessonId: lesson.id, pool, autoplay: gesamt > 0 });
    if (type === 'zeichen' && taskType === 'nachspuren' && !res.aufgegeben) {
      // nach erfolgreichem Nachspuren folgt dasselbe Zeichen aus dem Gedächtnis, sonst noch einmal nachspuren
      if (res.ok) nachgespurt.add(key);
    } else {
      queue.pop();
      if (type === 'zeichen') nachgespurt.delete(key);
    }
    if (!res.aufgegeben) {
      gesamt++;
      if (res.ok) richtig++;
    }
    next();
  };
  next();
}

// Prüfung über eine Lerneinheit mit Bescheid: zwei Einzelzeichen (falls vorhanden), dann Wörter
export function exam(host, { lesson, pool, drills = [], drillPool = [], onDone }) {
  const words = shuffle(lesson.woerter);
  const zeichen = shuffle(drills).slice(0, 2);
  const plan = ['schreiben', 'lesen', 'schreiben', 'diktat', 'lesen', 'schreiben', 'diktat', 'lesen'].slice(zeichen.length);
  const tasks = [
    ...zeichen.map((key) => ({ type: 'schreiben', word: key, zeichen: true })),
    ...plan.map((type, i) => ({ type, word: words[i % words.length] })),
  ];
  const results = [];
  const run = async (i) => {
    if (i >= tasks.length) {
      const punkte = results.filter((r) => r.ok).length;
      const bestanden = punkte >= Math.ceil(tasks.length * 0.6);
      store.update(() => {
        const l = store.lesson(lesson.id);
        const prev = l.pruefung;
        if (!prev || punkte >= prev.punkte) l.pruefung = { punkte, von: tasks.length, bestanden, datum: new Date().toISOString() };
      });
      put(host, bescheid(lesson, punkte, tasks.length, bestanden, results));
      onDone?.(bestanden);
      return;
    }
    const t = tasks[i];
    const res = await renderTask(host, t, { lessonId: lesson.id, pool: t.zeichen ? drillPool : pool, exam: true, position: `${i + 1} von ${tasks.length}`, autoplay: true });
    results.push(res);
    run(i + 1);
  };
  run(0);
}

function bescheid(lesson, punkte, von, bestanden, results) {
  const akte = store.load();
  const az = `${akte.aktenzeichen}-L${String(lesson.nr).padStart(2, '0')}`;
  return h(
    'div',
    { class: 'bescheid' },
    h(
      'div',
      { class: 'bescheid-kopf' },
      h('div', {}, h('b', {}, 'Bundesamt für Kurzschriftwesen'), h('br'), 'Referat K 3 – Verkehrsschrift', h('br'), 'Prüfungsstelle'),
      h('div', { class: 'rechts' }, 'Aktenzeichen: ', h('b', {}, az), h('br'), 'Datum: ', heute()),
    ),
    h('div', { class: 'anschrift' }, akte.name || 'An die Antragstellerin / den Antragsteller', h('br'), '– persönlich –'),
    h('h3', {}, `Bescheid über die Prüfung zur Lerneinheit ${lesson.nr}`),
    h('p', {}, `Sehr geehrte Damen und Herren,`),
    h(
      'p',
      {},
      `auf Ihren Antrag vom heutigen Tage ergeht folgender Bescheid: Die Prüfung zur Lerneinheit ${lesson.nr} („${lesson.titel}“) wurde mit `,
      h('b', {}, `${punkte} von ${von} Punkten`),
      bestanden ? ' bestanden.' : ' nicht bestanden.',
    ),
    h(
      'table',
      { class: 'amtstabelle' },
      h('tr', {}, h('th', {}, 'Nr.'), h('th', {}, 'Art'), h('th', {}, 'Gegenstand'), h('th', {}, 'Ergebnis')),
      ...results.map((r, i) =>
        h('tr', {}, h('td', {}, String(i + 1)), h('td', {}, isGlyphKey(r.word) ? 'Zeichen' : TYPES[r.type].name), h('td', {}, keyLabel(r.word)), h('td', {}, r.ok ? 'anerkannt' : 'nicht anerkannt')),
      ),
    ),
    h('p', {}, h('b', {}, 'Begründung: '), bestanden
      ? 'Die erforderliche Mindestpunktzahl von 60 % wurde erreicht. Die Zulassung zur nächsten Lerneinheit wird hiermit erteilt.'
      : 'Die erforderliche Mindestpunktzahl von 60 % wurde nicht erreicht. Eine Wiederholung ist jederzeit und gebührenfrei zulässig.'),
    h('p', { class: 'rechtsbehelf' }, h('b', {}, 'Rechtsbehelfsbelehrung: '), 'Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden. Der Widerspruch ist in Verkehrsschrift abzufassen und mit einer Abschrift in Langschrift einzureichen. (Dies ist ein Lernprogramm; der Bescheid ist nicht rechtsverbindlich.)'),
    h('div', { class: 'unterschrift' }, stamp(bestanden ? 'BEWILLIGT' : 'ABGELEHNT', bestanden ? 'blau' : 'rot'), h('div', {}, 'Im Auftrag', h('br'), h('span', { class: 'krakel' }, 'gez. Kürzel'), h('br'), 'Der Kurzschriftbeauftragte')),
    h('div', { class: 'werkzeug' }, knopf('🖨 Bescheid drucken', () => window.print())),
  );
}
