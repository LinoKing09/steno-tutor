// Lehrplan: 12 Lerneinheiten zur Verkehrsschrift der Deutschen Einheitskurzschrift.
// Jede Einheit verwendet nur Zeichen, die bis dahin eingeführt wurden (wird in tests/engine.test.js geprüft).

export const LESSONS = [
  {
    id: 'l1',
    nr: 1,
    titel: 'Der Schreibraum und die ersten Zeichen',
    paragraf: '§ 1, § 2, § 3',
    kurz: 'Vier Linien, drei Stufen: t, tr, n, r und das enge e.',
    zeichen: ['t', 'tr', 'n', 'r'],
    vokale: ['e'],
    lehrstoff: `
      <p>Die Kurzschrift wird in einem <b>Schreibraum aus vier Linien</b> gleichen Abstandes geschrieben:
      <i>Obergrenze, Oberlinie, Grundlinie</i> und <i>Untergrenze</i>. Den Abstand zweier Linien nennt die
      Systemurkunde eine <b>Stufe</b>. Alles, was Sie schreiben, richtet sich nach diesem Liniennetz – Größe
      und Stellung eines Zeichens tragen Bedeutung.</p>
      <p>Die Zeichen der Deutschen Einheitskurzschrift (DEK) sind <b>Abstriche</b> (von oben nach unten,
      leicht nach rechts geneigt) und <b>Aufstriche</b> (dünne Haarstriche nach oben). Man unterscheidet
      <b>kleine</b> (halbstufige), <b>mittlere</b> (einstufige) und <b>große</b> Zeichen (zwei oder mehr Stufen).</p>
      <ul>
        <li><b>t</b> ist ein gerader Abstrich von einer Stufe.</li>
        <li><b>tr</b> ist derselbe Strich in doppelter Größe – ein Grundgedanke der DEK: <i>Vergrößerung fügt ein r hinzu</i>.</li>
        <li><b>n</b> ist ein kleiner, flacher Bogen, höchstens eine halbe Stufe hoch.</li>
        <li><b>r</b> ist ein kleiner, nach rechts abfallender Strich.</li>
      </ul>
      <p><b>Selbstlaute werden nicht geschrieben</b>, sondern durch die Verbindung der Mitlaute <i>angedeutet</i>.
      Das häufigste, <b>e</b>, zeigt man durch eine <b>enge Verbindung</b>: Der Haarstrich zum nächsten Zeichen
      bleibt kurz. Steht das e am Wortende, schreibt man es <b>buchstäblich</b> als kurzen Aufstrich.</p>
      <p class="merke">Merke: Doppelte Mitlaute werden nur einmal geschrieben (<i>nett</i> = n·e·t).
      Groß- und Kleinschreibung gibt es in der Kurzschrift nicht.</p>`,
    woerter: ['Tee', 'nett', 'Rente', 'retten', 'treten', 'nennen', 'rennt', 'Ernte', 'Tenne', 'Teer'],
  },
  {
    id: 'l2',
    nr: 2,
    titel: 'Kleine Zeichen: s, ss, l, k',
    paragraf: '§ 2.1 – 2.4',
    kurz: 'Schleifen und Bögen auf der Grundlinie.',
    zeichen: ['s', 'ss', 'l', 'k'],
    vokale: ['e'],
    lehrstoff: `
      <p>In dieser Lerneinheit kommen weitere <b>kleine Zeichen</b> hinzu. Sie stehen auf der Grundlinie
      und reichen höchstens eine halbe Stufe hinauf.</p>
      <ul>
        <li><b>s</b> ist eine kleine, linkswendige Schleife mit Ausstrich.</li>
        <li><b>ss / ß</b> ist ein kleiner, <i>rechtswendiger</i> Kreis. Beim ss bestimmt der obere Rand die Anschlusszeile.</li>
        <li><b>l</b> ist ein winziges Häkchen mit Schleife.</li>
        <li><b>k</b> ist ein gleichmäßiger Bogen von etwa einer halben Stufe Höhe – deutlich größer als n.</li>
      </ul>
      <p>Nach § 2.4 werden <b>l und s am Wortende ohne Ausstrich</b> geschrieben (<i>Esel</i>, <i>Kurs</i>).</p>
      <p class="merke">Merke: n und k unterscheiden sich nur durch die Größe des Bogens. Schreiben Sie das n
      bewusst klein und flach!</p>`,
    woerter: ['lesen', 'Esel', 'Seele', 'Kette', 'Nest', 'Test', 'Rest', 'lernen', 'Kessel', 'essen', 'Kerl', 'Keller', 'kennen', 'Teller'],
  },
  {
    id: 'l3',
    nr: 3,
    titel: 'Mittlere Zeichen: b, d, g, h, m, w',
    paragraf: '§ 2.1, § 2.2',
    kurz: 'Einstufige Abstriche mit Rundungen und Schleifen.',
    zeichen: ['b', 'd', 'g', 'h', 'm', 'w'],
    vokale: ['e'],
    lehrstoff: `
      <p>Die <b>mittleren Zeichen</b> reichen genau eine Stufe von der Grundlinie bis zur Oberlinie. Sie
      unterscheiden sich durch die Gestaltung von <b>Kopf</b> und <b>Fuß</b>:</p>
      <table class="amtstabelle">
        <tr><th>Zeichen</th><th>Kopf</th><th>Fuß</th></tr>
        <tr><td>t</td><td>spitz</td><td>spitz</td></tr>
        <tr><td>b</td><td>spitz</td><td>unten gerundet</td></tr>
        <tr><td>g</td><td>oben gerundet (Haken)</td><td>spitz</td></tr>
        <tr><td>h</td><td>weiter Oberbogen</td><td>unten gerundet</td></tr>
        <tr><td>d</td><td>Kopfschleife</td><td>unten gerundet</td></tr>
        <tr><td>m</td><td>kurzer Anstrich mit Ecke</td><td>unten gerundet</td></tr>
        <tr><td>w</td><td>linkswendig gewölbt</td><td>unten gerundet</td></tr>
      </table>
      <p>Die Unterscheidung „spitz“ oder „rund“ ist entscheidend: <i>t</i> und <i>b</i> sehen sich ähnlich,
      unterscheiden sich aber am Fuß.</p>
      <p class="merke">Merke: Das Dehnungs-h wird nicht geschrieben (<i>nehmen</i> = n·e·m·e·n).</p>`,
    woerter: ['Bett', 'Weg', 'Geld', 'Held', 'Hemd', 'Welt', 'Wetter', 'Decke', 'Messe', 'Regel', 'Leben', 'geben', 'nehmen', 'Besen', 'Degen', 'bewegen'],
  },
  {
    id: 'l4',
    nr: 4,
    titel: 'Die Selbstlaute o und a – weite Verbindung und Verstärkung',
    paragraf: '§ 3.1 a',
    kurz: 'o: weit verbinden. a: das folgende Zeichen verstärken. Dazu nd und ng.',
    zeichen: ['nd', 'ng'],
    vokale: ['o', 'a'],
    lehrstoff: `
      <p>Die Selbstlaute werden <b>sinnbildlich</b> am folgenden Mitlaut dargestellt. Nach der Tabelle der
      Systemurkunde gilt:</p>
      <ul>
        <li><b>o</b>: <b>weite Verbindung</b> – der Haarstrich zum nächsten Zeichen ist etwa dreimal so lang wie beim e.</li>
        <li><b>a</b>: <b>Verstärkung</b> – das folgende Zeichen wird mit Druck (dicker) geschrieben, die Verbindung bleibt eng.</li>
      </ul>
      <p>Auf dem Tablet erzeugen Sie die Verstärkung durch <b>stärkeren Druck mit dem Stift</b>. Die Erkennung
      dieses Lernprogramms bewertet in erster Linie die Form; seit der Wiener Urkunde von 1968 soll die
      Verkehrsschrift auch ohne Verstärkungen lesbar bleiben.</p>
      <p>Neu sind außerdem zwei <b>Mitlautfolgezeichen</b>: <b>nd</b> (mittleres Zeichen mit waagerechter
      Kopfschleife) und <b>ng</b> (schräg nach rechts abfallender Strich mit Aufschwung).</p>
      <p class="merke">Merke: Fehlt zwischen zwei Mitlauten ein Selbstlaut, werden sie <b>möglichst eng</b>
      aneinandergereiht (§ 4.2).</p>`,
    woerter: ['Tor', 'Rose', 'Ton', 'Not', 'Boden', 'oben', 'loben', 'Tag', 'Wagen', 'Rat', 'Name', 'Dame', 'Bad', 'Tante', 'Sonne', 'Monat', 'Hand', 'Land', 'Wand', 'lang', 'Gang', 'Rand'],
  },
  {
    id: 'l5',
    nr: 5,
    titel: 'Die Selbstlaute i und ei – Hochstellung',
    paragraf: '§ 3.1 a, b',
    kurz: 'i: eng hochstellen. ei: weit hochstellen.',
    zeichen: [],
    vokale: ['i', 'ei'],
    lehrstoff: `
      <p>Für <b>i</b> wird das folgende Zeichen um <b>eine halbe Stufe hochgestellt</b> und eng angeschlossen.
      Für <b>ei</b> (auch <i>ai</i>) wird es ebenfalls hochgestellt, aber <b>weit</b> verbunden.</p>
      <p>Wichtig nach § 4.1: <b>Die Stellung des schon geschriebenen Zeichens bestimmt die Anschlusszeile für
      das folgende.</b> Nach einer Hochstellung schreiben Sie also auf der neuen Höhe weiter.</p>
      <p class="merke">Merke: <i>ie</i> und <i>ih</i> werden wie ein einfaches i behandelt (<i>Liebe</i> = l·i·b·e).</p>`,
    woerter: ['Tinte', 'Kind', 'Wind', 'Bild', 'Liebe', 'Mine', 'Kinder', 'Wein', 'Leine', 'Beine', 'klein', 'mein', 'dein', 'beide', 'leise', 'Riese', 'Biene', 'Lied'],
  },
  {
    id: 'l6',
    nr: 6,
    titel: 'Die Selbstlaute u, eu und au – Tiefstellung',
    paragraf: '§ 3.1 a, b',
    kurz: 'u: eng tiefstellen. eu: weit tiefstellen. au: tiefstellen und verstärken.',
    zeichen: [],
    vokale: ['u', 'eu', 'au'],
    lehrstoff: `
      <p>Das Gegenstück zur Hochstellung ist die <b>Tiefstellung</b> um eine halbe Stufe:</p>
      <ul>
        <li><b>u</b>: enge Tiefstellung</li>
        <li><b>eu</b> (auch <i>äu</i>): weite Tiefstellung</li>
        <li><b>au</b>: enge Tiefstellung mit Verstärkung</li>
      </ul>
      <p>Damit kennen Sie das ganze System der Selbstlautandeutung: <b>Weite</b> (eng/weit),
      <b>Höhe</b> (normal/hoch/tief) und <b>Druck</b> (normal/verstärkt) ergeben zusammen zwölf Unterscheidungen.</p>`,
    woerter: ['gut', 'Mut', 'Hund', 'Bund', 'rund', 'Huhn', 'Leute', 'heute', 'Haus', 'Maus', 'laut', 'Baum', 'Traum', 'Bude', 'Kunde', 'Beute', 'Raum'],
  },
  {
    id: 'l7',
    nr: 7,
    titel: 'Umlaute: ö, ü, ä, äu',
    paragraf: '§ 3.1 a',
    kurz: 'Umlaute = Grundform plus Verstärkung.',
    zeichen: [],
    vokale: ['ö', 'ü'],
    lehrstoff: `
      <p>Die Umlaute entstehen durch <b>Verstärkung</b> der bekannten Stellungen:</p>
      <table class="amtstabelle">
        <tr><th>Verbindungsart</th><th>einfach</th><th>verstärkt</th></tr>
        <tr><td>enge Verbindung</td><td>e (ä)</td><td>a</td></tr>
        <tr><td>weite Verbindung</td><td>o</td><td>ö</td></tr>
        <tr><td>enge Hochstellung</td><td>i</td><td>ü</td></tr>
        <tr><td>weite Hochstellung</td><td>ei</td><td>ä</td></tr>
        <tr><td>enge Tiefstellung</td><td>u</td><td>au</td></tr>
        <tr><td>weite Tiefstellung</td><td>eu</td><td>äu</td></tr>
      </table>
      <p>Das aufwendig darzustellende <b>ä</b> wird in der Praxis meist wie <b>e</b> geschrieben, <b>äu</b> wie <b>eu</b>,
      solange keine Verwechslung droht. Dieses Lernprogramm verfährt ebenso.</p>`,
    woerter: ['Löwe', 'böse', 'hören', 'König', 'müde', 'Mühle', 'Tür', 'über', 'Höhle', 'Möbel', 'Bühne', 'Nöte', 'Güte', 'Bäder', 'Häuser', 'Mädel'],
  },
  {
    id: 'l8',
    nr: 8,
    titel: 'Große Zeichen: f, p, ch, sch, j, v, z, x, qu',
    paragraf: '§ 2.1, § 2.2',
    kurz: 'Ober-, Unter- und Ganzlängen.',
    zeichen: ['f', 'p', 'ch', 'cht', 'sch', 'j', 'v', 'z', 'x', 'qu'],
    vokale: [],
    lehrstoff: `
      <p>Die <b>großen Zeichen</b> sind Ober-, Unter- oder Ganzlängen:</p>
      <ul>
        <li><b>Oberlängen</b> (Grundlinie bis Obergrenze): f, p, ch, cht, j, v, x, qu</li>
        <li><b>Ganzlängen</b> (Oberlinie bis Untergrenze, mit Fußschleife): sch, z</li>
      </ul>
      <p>Auch hier entscheiden Kopf und Fuß: <b>f</b> hat eine Kopfschleife, <b>p</b> ist linkswendig gewölbt,
      <b>ch</b> hat einen weiten Oberbogen, <b>cht</b> zusätzlich einen runden Fuß.</p>
      <p class="merke">Merke: ck wird wie k, tz wie z und ph wie f geschrieben.</p>`,
    woerter: ['Fisch', 'Schiff', 'Schule', 'Tisch', 'Buch', 'Koch', 'Nacht', 'Licht', 'Papier', 'Post', 'Jahr', 'Junge', 'Zahl', 'Zug', 'Vater', 'Volk', 'Hexe', 'Quelle', 'Fach', 'Dach'],
  },
  {
    id: 'l9',
    nr: 9,
    titel: 'Mitlautfolgen: st, sp, schw, br, pf …',
    paragraf: '§ 2.1, § 2.5, § 2.6',
    kurz: 'Verschmolzene Zeichen für häufige Mitlautfolgen.',
    zeichen: ['st', 'str', 'sp', 'spr', 'schm', 'schn', 'schr', 'schw', 'zw', 'br', 'dr', 'fr', 'gr', 'kr', 'pr', 'wr', 'mp', 'mpf', 'pf', 'pfr', 'rd', 'rdr', 'ndr', 'rr', 'rs', 'cr', 'zr'],
    vokale: [],
    lehrstoff: `
      <p>Häufige Mitlautfolgen haben ein <b>eigenes Zeichen</b>. Viele davon folgen dem Grundgedanken
      „<b>doppelte Größe = + r</b>“: aus d wird dr, aus g wird gr, aus k wird kr.</p>
      <p>Nach § 2.6 werden <b>st</b> und <b>str</b> (ebenso sp und spr) in deutschen Wörtern <b>nur im
      Stammanlaut</b> verwendet: <i>Stadt</i>, <i>Sprache</i>. Im Wortinneren schreibt man s und t
      getrennt (<i>Rest</i>, <i>Kasten</i>).</p>
      <p class="merke">Merke: Das rr hat ein eigenes Zeichen, ebenso ss. Alle anderen Doppelmitlaute werden einfach geschrieben.</p>`,
    woerter: ['Stadt', 'Stuhl', 'Straße', 'Sprache', 'Schmerz', 'Schnee', 'Schrift', 'Schwester', 'zwei', 'Brot', 'drei', 'Freund', 'groß', 'Kraft', 'Preis', 'Lampe', 'Kampf', 'Kopf', 'Erde', 'Herr', 'Kurs', 'Stern', 'Spiel'],
  },
  {
    id: 'l10',
    nr: 10,
    titel: 'Anlaut und Auslaut der Selbstlaute',
    paragraf: '§ 3.2',
    kurz: 'Steht kein Mitlaut dahinter, wird der Selbstlaut buchstäblich geschrieben.',
    zeichen: [],
    vokale: ['ä', 'äu'],
    lehrstoff: `
      <p>Folgt auf einen Selbstlaut <b>kein Mitlaut</b> – also am Wortende oder vor einem weiteren Selbstlaut –,
      so wird er <b>buchstäblich</b> mit einem eigenen Zeichen geschrieben (§ 3.2):</p>
      <ul>
        <li><b>e</b>: kurzer Aufstrich · <b>o</b>: langer Flachstrich · <b>i</b>: steiler Aufstrich · <b>ei</b>: langer Aufstrich</li>
        <li><b>u</b>: kurzer Abstrich unter die Linie · <b>eu</b>: langer Abstrich</li>
        <li><b>a, ö, ü, ä, au, äu</b>: die entsprechenden Zeichen verstärkt</li>
      </ul>
      <p>Steht ein Selbstlaut <b>am Wortanfang</b>, beginnt man mit einem <b>Anstrich</b> von der Grundlinie
      und deutet den Selbstlaut am ersten Mitlaut an: <i>Ofen</i> = weiter Anstrich zu f.</p>`,
    woerter: ['Kuh', 'Knie', 'Auto', 'Kino', 'Sofa', 'Oma', 'Opa', 'Uhu', 'frei', 'Bau', 'Idee', 'Ufer', 'Abend', 'Ende', 'Ofen', 'Igel', 'Eule'],
  },
  {
    id: 'l11',
    nr: 11,
    titel: 'Kürzel I: der, die, das, und, ist …',
    paragraf: '§ 5.2',
    kurz: 'Die häufigsten Wörter erhalten feste Kurzformen.',
    zeichen: [],
    vokale: [],
    kuerzel: ['der', 'die', 'das', 'dass', 'den', 'dem', 'des', 'und', 'ist', 'ich', 'mit', 'nicht', 'er'],
    lehrstoff: `
      <p><b>Kürzel</b> sind feste Kurzformen für sehr häufige Wörter und Silben. Sie machen einen großen Teil
      jedes Textes aus und sind der Schlüssel zur Schreibgeschwindigkeit.</p>
      <p>Bei den Artikeln entscheidet die <b>Stellung</b>: <i>das</i> ist ein d auf der Grundlinie,
      <i>der</i>, <i>den</i>, <i>dem</i>, <i>des</i> stehen als r, n, m, s <b>auf der Oberlinie</b>.
      <i>und</i> ist ein kurzer Flachstrich auf der Oberlinie, <i>ist</i> ein bloßer Punkt.</p>
      <p class="merke">Hinweis: Die Systemurkunde enthält über hundert Kürzel. Dieses Lernprogramm vermittelt eine
      Auswahl der häufigsten; ihre Darstellung ist an die Urkunde angelehnt, aber vereinfacht.</p>`,
    woerter: ['der', 'die', 'das', 'dass', 'den', 'dem', 'des', 'und', 'ist', 'ich', 'mit', 'nicht', 'er'],
    saetze: ['Ich lese das Buch.', 'Der Hund ist nicht mein Hund.', 'Das Kind und der Vater.'],
  },
  {
    id: 'l12',
    nr: 12,
    titel: 'Kürzel II, Vor- und Nachsilben – Diktat im Plenarsaal',
    paragraf: '§ 5',
    kurz: 'von, für, wir, wird, wenn, kann, nur, hat, sich, ge-, ver-, -ung.',
    zeichen: ['ung'],
    vokale: [],
    kuerzel: ['von', 'für', 'wir', 'wird', 'wenn', 'kann', 'nur', 'hat', 'sich'],
    lehrstoff: `
      <p>Weitere Kürzel: <i>von</i> (v), <i>für</i> (hochgestelltes, verstärktes f), <i>wir</i> (wr) und
      <i>wird</i> (wr auf der Oberlinie), <i>wenn</i> (w), <i>kann</i> (k), <i>nur</i>, <i>hat</i> (h) und <i>sich</i>.</p>
      <p>Häufige <b>Vor- und Nachsilben</b> haben eigene Zeichen:</p>
      <ul>
        <li><b>ge-</b>: gerader Strich von der Mitte der Stufe bis unter die Grundlinie (<i>gesagt</i>)</li>
        <li><b>ver-</b>: kleine Schale (<i>Verkehr</i>, <i>verstehen</i>)</li>
        <li><b>-ung</b>: kleines „ʒ“ unter die Zeile (<i>Ordnung</i>, <i>Sitzung</i>)</li>
      </ul>
      <p>Im Deutschen Bundestag protokollieren die Parlamentsstenografen jede Plenarsitzung in der
      <b>Redeschrift</b>, der höchsten Stufe der DEK. Ihre Grundlage ist die Verkehrsschrift, die Sie hier lernen.</p>`,
    woerter: ['von', 'für', 'wir', 'wird', 'wenn', 'kann', 'nur', 'hat', 'sich', 'gesagt', 'gemacht', 'gelernt', 'verstehen', 'Verkehr', 'Ordnung', 'Sitzung', 'Zeitung', 'Wohnung', 'Rechnung', 'Verwaltung'],
    saetze: [
      'Die Sitzung ist eröffnet.',
      'Wir kommen zur Abstimmung.',
      'Der Bundestag hat das Gesetz beschlossen.',
      'Das Wort hat der Abgeordnete.',
    ],
  },
];

// Wortschatz für die freie Handschrifterkennung (Schreibstube)
export const EXTRA_WORDS = [
  'Bundestag', 'Präsident', 'Abgeordnete', 'Gesetz', 'Antrag', 'Sitzung', 'Protokoll', 'Fraktion', 'Rede', 'Debatte',
  'Kanzler', 'Minister', 'Regierung', 'Plenum', 'Beschluss', 'Ausschuss', 'Stimme', 'Mehrheit', 'Wahl', 'Bürger',
  'Amt', 'Behörde', 'Formular', 'Stempel', 'Akte', 'Bescheid', 'Frist', 'Unterschrift', 'Kurzschrift', 'Stenografie',
  'heute', 'morgen', 'Abend', 'Woche', 'Jahr', 'Zeit', 'Arbeit', 'Hause', 'Stadt', 'Land', 'Wasser', 'Brot',
  'gut', 'neu', 'alt', 'groß', 'klein', 'schön', 'lang', 'kurz', 'schnell', 'langsam',
  'sein', 'haben', 'werden', 'sagen', 'machen', 'gehen', 'kommen', 'sehen', 'lesen', 'schreiben',
  'ja', 'nein', 'auch', 'aber', 'oder', 'noch', 'schon', 'hier', 'dort', 'bitte', 'danke',
];

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id);
}

export function allWords() {
  const set = new Set();
  for (const l of LESSONS) for (const w of l.woerter) set.add(w);
  for (const w of EXTRA_WORDS) set.add(w);
  return [...set];
}

// Alle bis einschließlich Lektion nr eingeführten Wörter (für Vergleichskandidaten)
export function wordsUpTo(nr) {
  return LESSONS.filter((l) => l.nr <= nr).flatMap((l) => l.woerter);
}
