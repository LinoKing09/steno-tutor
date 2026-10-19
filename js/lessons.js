// Lehrplan: Lerneinheiten zur Verkehrsschrift der Deutschen Einheitskurzschrift.
// Aufbau jeder Einheit: neue Zeichen bzw. Regel lernen → Zeichen einzeln üben → daraus Wörter bilden.
// Jede Einheit verwendet nur Zeichen und Regeln, die bis dahin eingeführt wurden
// (wird in tests/engine.test.js geprüft).
//
// zeichen: neue Mitlautzeichen · vokale: neue Selbstlautregeln · drill: zusätzliche Übungszeichen
// (z. B. „~e“ = e am Wortende) · kuerzel: neue Kürzel · woerter: Übungswörter

export const LESSONS = [
  {
    id: 'l1',
    nr: 1,
    titel: 'Die ersten Zeichen: b, r, t – und das e',
    paragraf: '§ 1, § 2, § 3',
    kurz: 'Schreibraum, drei Mitlaute und das enge e. Erste Wörter: Bett, Rebe, Teer.',
    zeichen: ['b', 'r', 't'],
    drill: ['~e'],
    vokale: ['e'],
    lehrstoff: `
      <p>Die Kurzschrift wird in einem <b>Schreibraum aus vier Linien</b> geschrieben: <i>Obergrenze,
      Oberlinie, Grundlinie</i> (durchgezogen) und <i>Untergrenze</i>. Den Abstand zweier Linien nennt die
      Systemurkunde eine <b>Stufe</b>. Größe und Stellung eines Zeichens tragen Bedeutung – schreiben Sie
      daher immer genau im Liniennetz.</p>
      <h3>Die drei ersten Mitlaute</h3>
      <ul>
        <li><b>t</b> – ein gerader Abstrich von der Oberlinie zur Grundlinie, leicht nach rechts geneigt.</li>
        <li><b>b</b> – derselbe Abstrich, aber <b>unten gerundet</b>. Nur der Fuß unterscheidet b von t!</li>
        <li><b>r</b> – ein <b>kleiner</b> Strich, der schräg nach rechts unten auf die Grundlinie fällt.</li>
      </ul>
      <h3>Das e</h3>
      <p>Selbstlaute bekommen in der Kurzschrift <b>kein eigenes Zeichen</b>, wenn ein Mitlaut folgt. Man
      deutet sie durch die <b>Verbindung</b> an. Für das <b>e</b> verbindet man <b>eng</b>: Vom Ende des
      einen Zeichens führt ein kurzer, dünner Haarstrich hinauf zum Anfang des nächsten.</p>
      <ul>
        <li><b>e zwischen Mitlauten</b>: enge Verbindung (b·e·t = <i>Bett</i>).</li>
        <li><b>e am Wortende</b>: ein eigenes Zeichen, ein kurzer Aufstrich (<i>Rebe</i>).</li>
        <li><b>e am Wortanfang</b>: ein kurzer Anstrich von der Grundlinie zum ersten Mitlaut (<i>Erbe</i>).</li>
      </ul>
      <p class="merke">Merke: Doppelte Mitlaute werden nur einmal geschrieben, Dehnungszeichen entfallen.
      Darum sehen <i>Bett</i> und <i>Beet</i> gleich aus – der Zusammenhang entscheidet.</p>`,
    woerter: ['Bett', 'Beet', 'Bete', 'Beere', 'Rebe', 'Erbe', 'Ebbe', 'Tee', 'Teer', 'rette', 'betet'],
  },
  {
    id: 'l2',
    nr: 2,
    titel: 'Die Zeichen n und d',
    paragraf: '§ 2.1, § 2.3',
    kurz: 'Ein kleiner Bogen und das erste Zeichen mit Schleife.',
    zeichen: ['n', 'd'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>n</b> – ein <b>kleiner, flacher Bogen</b> auf der Grundlinie, höchstens eine halbe Stufe hoch (§ 2.3).</li>
        <li><b>d</b> – ein Abstrich von einer Stufe mit einer <b>Kopfschleife</b> und unten gerundet.</li>
      </ul>
      <p>Mit b, r, t, n, d und dem e lassen sich schon viele Wörter schreiben. Achten Sie auf die enge
      Verbindung: Der Haarstrich zwischen den Zeichen bleibt kurz.</p>
      <p class="merke">Merke: Das Doppel-n in <i>nennen</i> oder <i>Tenne</i> wird nur einmal geschrieben.</p>`,
    woerter: ['nett', 'Rente', 'retten', 'beten', 'Rede', 'reden', 'Ernte', 'Ente', 'denen', 'beben', 'Tenne', 'nennen'],
  },
  {
    id: 'l3',
    nr: 3,
    titel: 'Vergrößerung bedeutet „+ r“: tr, br – und nd',
    paragraf: '§ 2.1',
    kurz: 'Doppelt so groß = mit r. Erste Mitlautfolge nd.',
    zeichen: ['tr', 'br', 'nd'],
    vokale: [],
    lehrstoff: `
      <p>Ein Grundgedanke der Einheitskurzschrift: <b>Wird ein Zeichen doppelt so groß geschrieben, kommt ein
      r hinzu.</b></p>
      <ul>
        <li><b>tr</b> – das t in zwei Stufen Höhe (Grundlinie bis Obergrenze).</li>
        <li><b>br</b> – das b in zwei Stufen Höhe.</li>
      </ul>
      <p>Häufige Mitlautfolgen ohne Selbstlaut dazwischen haben eigene Zeichen. Die erste ist <b>nd</b>: ein
      einstufiges Zeichen mit <b>waagerechter</b> Kopfschleife, unten gerundet.</p>
      <p class="merke">Merke: Folgen zwei Mitlaute ohne Selbstlaut aufeinander und gibt es kein eigenes
      Zeichen, werden sie <b>möglichst eng</b> aneinandergereiht (§ 4.2) – wie bei <i>Rentner</i> (n·t·n).</p>`,
    woerter: ['treten', 'trennen', 'Trend', 'Brett', 'Bretter', 'Brenner', 'Ende', 'enden', 'Rentner', 'bereden'],
  },
  {
    id: 'l4',
    nr: 4,
    titel: 'Die kleinen Zeichen s, ss/ß und l',
    paragraf: '§ 2.1, § 2.4, § 4.1 b',
    kurz: 'Schleifen auf der Grundlinie.',
    zeichen: ['s', 'ss', 'l'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>s</b> – eine kleine, <b>linkswendige</b> Schleife mit Ausstrich.</li>
        <li><b>ss / ß</b> – ein kleiner, <b>rechtswendiger</b> Kreis. Beim ss bestimmt der obere Rand die Anschlusszeile.</li>
        <li><b>l</b> – ein winziges Häkchen mit Schleife.</li>
      </ul>
      <p class="merke">Merke (§ 2.4): <b>l und s werden am Wortende ohne Ausstrich geschrieben</b> (<i>Esel</i>, <i>Rest</i> endet aber auf t).</p>`,
    woerter: ['lesen', 'Esel', 'Seele', 'Nest', 'Test', 'Rest', 'essen', 'Teller', 'Sessel', 'besser', 'lernen', 'selten', 'Elster'],
  },
  {
    id: 'l5',
    nr: 5,
    titel: 'Die Zeichen k, g und h',
    paragraf: '§ 2.1',
    kurz: 'Ein Bogen und zwei Zeichen mit gerundetem Kopf.',
    zeichen: ['k', 'g', 'h'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>k</b> – ein gleichmäßiger <b>Bogen</b>, etwa eine halbe Stufe hoch – deutlich größer als das n.</li>
        <li><b>g</b> – ein Abstrich von einer Stufe, <b>oben mit einem Haken</b> (rechtswendig gerundet), unten spitz.</li>
        <li><b>h</b> – ein Abstrich von einer Stufe mit <b>weitem Oberbogen</b>, unten gerundet.</li>
      </ul>
      <p>Vergleichen Sie die Köpfe und Füße der einstufigen Zeichen:</p>
      <table class="amtstabelle">
        <tr><th>Zeichen</th><th>Kopf</th><th>Fuß</th></tr>
        <tr><td>t</td><td>spitz</td><td>spitz</td></tr>
        <tr><td>b</td><td>spitz</td><td>gerundet</td></tr>
        <tr><td>d</td><td>Schleife</td><td>gerundet</td></tr>
        <tr><td>g</td><td>Haken</td><td>spitz</td></tr>
        <tr><td>h</td><td>weiter Bogen</td><td>gerundet</td></tr>
      </table>
      <p class="merke">Merke: Das Dehnungs-h wird nicht geschrieben (<i>kehren</i> = k·e·r·e·n).</p>`,
    woerter: ['Kette', 'Kessel', 'Keller', 'kennen', 'Geld', 'Held', 'geben', 'Regel', 'Hecke', 'kehren', 'Kerl', 'heben', 'legen', 'Segel', 'Kegel'],
  },
  {
    id: 'l6',
    nr: 6,
    titel: 'Die Zeichen m und w',
    paragraf: '§ 2.1',
    kurz: 'Ein Kopf mit Ecke und ein gewölbtes Zeichen.',
    zeichen: ['m', 'w'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>m</b> – eine Stufe, beginnt mit einem <b>kurzen Anstrich nach rechts und einer Ecke</b>, unten gerundet.</li>
        <li><b>w</b> – eine Stufe, <b>linkswendig gewölbt</b> wie ein schmales „C“, unten gerundet.</li>
      </ul>
      <p>Damit kennen Sie die wichtigsten einstufigen Zeichen. Üben Sie besonders den Unterschied zwischen
      <b>h</b> (weiter Bogen) und <b>m</b> (Ecke).</p>`,
    woerter: ['Messe', 'nehmen', 'Welt', 'Wetter', 'Wege', 'Hemd', 'Wesen', 'Welle', 'melken', 'Werk', 'Wette', 'Meer'],
  },
  {
    id: 'l7',
    nr: 7,
    titel: 'Das o – die weite Verbindung',
    paragraf: '§ 3.1 a',
    kurz: 'Für o wird weit verbunden.',
    zeichen: [],
    vokale: ['o'],
    lehrstoff: `
      <p>Jetzt kommt die zweite Selbstlautregel. Für <b>o</b> verbindet man <b>weit</b>: Der Haarstrich zum
      nächsten Zeichen ist etwa <b>dreimal so lang</b> wie beim e.</p>
      <p>Vergleichen Sie: <i>Rede</i> (eng) und <i>Rose</i> (weit), <i>Tenne</i> und <i>Tonne</i>.</p>
      <p class="merke">Merke: Die Länge des Haarstrichs ist bedeutungstragend. Schreiben Sie das e wirklich eng
      und das o deutlich weit.</p>`,
    woerter: ['Tor', 'Rose', 'Ton', 'Not', 'Boden', 'oben', 'loben', 'Sonne', 'Gott', 'Wolke', 'Ort', 'Moment', 'Kosten', 'Tonne'],
  },
  {
    id: 'l8',
    nr: 8,
    titel: 'Das a – die Verstärkung – und ng',
    paragraf: '§ 3.1 a, § 2.1',
    kurz: 'Für a wird das folgende Zeichen verstärkt.',
    zeichen: ['ng'],
    vokale: ['a'],
    lehrstoff: `
      <p>Für <b>a</b> verbindet man eng, schreibt aber das <b>folgende Zeichen verstärkt</b> – also mit Druck,
      dicker als gewöhnlich. Auf dem Tablet drücken Sie dazu den Stift fester auf.</p>
      <p>Seit der Wiener Urkunde von 1968 soll die Verkehrsschrift auch ohne Verstärkungen lesbar bleiben;
      die Erkennung dieses Lernprogramms bewertet daher in erster Linie die Form.</p>
      <p>Neues Zeichen: <b>ng</b> – ein Strich schräg nach rechts unten mit kleinem Aufschwung (<i>lang</i>, <i>Gang</i>).</p>`,
    woerter: ['Tag', 'Wagen', 'Rat', 'Name', 'Dame', 'Bad', 'Tante', 'Hand', 'Land', 'Wand', 'lang', 'Gang', 'Rand', 'Garten', 'Mann', 'Salat'],
  },
  {
    id: 'l9',
    nr: 9,
    titel: 'i und ei – die Hochstellung',
    paragraf: '§ 3.1 a, b; § 4.1',
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
    id: 'l10',
    nr: 10,
    titel: 'u, eu und au – die Tiefstellung',
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
      <p>Damit kennen Sie das ganze System: <b>Weite</b> (eng/weit), <b>Höhe</b> (normal/hoch/tief) und
      <b>Druck</b> (normal/verstärkt) ergeben zusammen zwölf Unterscheidungen.</p>`,
    woerter: ['gut', 'Mut', 'Hund', 'Bund', 'rund', 'Huhn', 'Leute', 'heute', 'Haus', 'Maus', 'laut', 'Baum', 'Traum', 'Bude', 'Kunde', 'Beute', 'Raum'],
  },
  {
    id: 'l11',
    nr: 11,
    titel: 'Die Umlaute ö und ü (ä, äu)',
    paragraf: '§ 3.1 a',
    kurz: 'Umlaute = bekannte Stellung plus Verstärkung.',
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
    id: 'l12',
    nr: 12,
    titel: 'Die Zeichen f, p, v und j',
    paragraf: '§ 2.1, § 2.2',
    kurz: 'Die ersten zweistufigen Zeichen (Oberlängen).',
    zeichen: ['f', 'p', 'v', 'j'],
    vokale: [],
    lehrstoff: `
      <p>Diese Zeichen reichen <b>zwei Stufen</b> hoch, von der Grundlinie bis zur Obergrenze (Oberlängen):</p>
      <ul>
        <li><b>f</b> – mit Kopfschleife, unten gerundet (wie ein großes d).</li>
        <li><b>p</b> – linkswendig gewölbt, unten gerundet (wie ein großes w).</li>
        <li><b>v</b> – oben nach rechts, unten nach links geschwungen.</li>
        <li><b>j</b> – gerader Abstrich mit kleinem Fuß.</li>
      </ul>
      <p class="merke">Merke: ph wird wie f geschrieben (<i>Photo</i> = f·o·t·o).</p>`,
    woerter: ['Fett', 'Feld', 'fallen', 'tief', 'Seife', 'Hafen', 'Kaffee', 'Pause', 'Papier', 'Puppe', 'Post', 'Vater', 'Volk', 'Jahr', 'Junge', 'Pilot'],
  },
  {
    id: 'l13',
    nr: 13,
    titel: 'Die Zeichen ch, cht, sch und z',
    paragraf: '§ 2.1, § 2.2',
    kurz: 'Weiter Oberbogen und die ersten Ganzlängen.',
    zeichen: ['ch', 'cht', 'sch', 'z'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>ch</b> – zwei Stufen, mit <b>weitem Oberbogen</b>, unten spitz. <b>cht</b> ist unten gerundet.</li>
        <li><b>sch</b> – eine <b>Ganzlänge</b>: von der Oberlinie bis zur Untergrenze, oben mit Haken, unten mit Schleife.</li>
        <li><b>z</b> – gerade von der Oberlinie bis zur Untergrenze, unten mit Schleife.</li>
      </ul>
      <p class="merke">Merke: tz wird wie z, ck wie k geschrieben (<i>Katze</i> = k·a·z·e).</p>`,
    woerter: ['Buch', 'Koch', 'Nacht', 'Licht', 'Fisch', 'Tisch', 'Schule', 'Schiff', 'Zahl', 'Zug', 'Zeit', 'Katze', 'Schatz', 'Kirche', 'Woche'],
  },
  {
    id: 'l14',
    nr: 14,
    titel: 'x, qu und die Anlautfolgen st, sp, str, spr',
    paragraf: '§ 2.1, § 2.6',
    kurz: 'Eigene Zeichen für st und sp – aber nur am Stammanfang.',
    zeichen: ['x', 'qu', 'st', 'sp', 'str', 'spr'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>x</b> – zwei Stufen, „3“-förmiger Kopf, unten nach links.</li>
        <li><b>qu</b> – zwei Stufen, kleine Kopfschleife links, unten gerundet.</li>
        <li><b>st</b>, <b>sp</b> – Ganzlängen mit Fußschleife; <b>str</b>, <b>spr</b> reichen bis zur Obergrenze.</li>
      </ul>
      <p class="merke">Merke (§ 2.6): <b>st</b> und <b>str</b> (ebenso sp und spr) werden in deutschen Wörtern
      <b>nur im Stammanlaut</b> verwendet: <i>Stadt</i>, <i>Sprache</i>. Im Wortinneren schreibt man s und t
      getrennt (<i>Kosten</i>, <i>Rest</i>).</p>`,
    woerter: ['Hexe', 'Text', 'Quelle', 'Stadt', 'Stuhl', 'Straße', 'Sprache', 'Stern', 'Spiel', 'Stein', 'Sport', 'Strom', 'Spur'],
  },
  {
    id: 'l15',
    nr: 15,
    titel: 'Mitlautfolgen mit r: dr, fr, gr, kr, pr, wr',
    paragraf: '§ 2.1',
    kurz: 'Wieder gilt meist: größer = + r.',
    zeichen: ['dr', 'fr', 'gr', 'kr', 'pr', 'wr', 'zr', 'cr'],
    vokale: [],
    lehrstoff: `
      <p>Für die Folgen mit <b>r</b> gibt es eigene Zeichen. Viele folgen der bekannten Regel
      „<b>doppelte Größe = + r</b>“:</p>
      <ul>
        <li><b>gr</b> = g in zwei Stufen · <b>kr</b> = großer k-Bogen · <b>zr</b> = z bis zur Obergrenze</li>
        <li><b>dr</b>, <b>fr</b> = d bzw. f, aber <b>unten spitz</b> statt gerundet</li>
        <li><b>pr</b>, <b>wr</b> = p bzw. w mit linkswendigem Kopf, unten spitz</li>
      </ul>`,
    woerter: ['drei', 'Drache', 'Freund', 'Frage', 'frei', 'groß', 'Gras', 'Kraft', 'Kreis', 'Preis', 'Prost', 'Grund'],
  },
  {
    id: 'l16',
    nr: 16,
    titel: 'Weitere Mitlautfolgen: schw, pf, mp, rd …',
    paragraf: '§ 2.1',
    kurz: 'Verschmolzene Zeichen für häufige Folgen.',
    zeichen: ['schm', 'schn', 'schr', 'schw', 'zw', 'mp', 'mpf', 'pf', 'pfr', 'rd', 'rdr', 'ndr', 'rr', 'rs'],
    vokale: [],
    lehrstoff: `
      <ul>
        <li><b>schm, schn, schr, schw</b> – das sch mit m-Kopf, waagerechter Schleife, Oberlänge bzw. weitem Bogen.</li>
        <li><b>zw</b> – das z mit großer Fußschleife.</li>
        <li><b>mp, mpf</b> – das m mit Fußschleife (mpf bis zur Untergrenze).</li>
        <li><b>pf, pfr</b> – zwei Stufen mit großer Kopfschleife.</li>
        <li><b>rd, rdr, ndr</b> – Kopfschleifen-Zeichen; <b>rr</b> – großer r-Strich; <b>rs</b> – r mit Schleife.</li>
      </ul>
      <p class="merke">Merke: Das rr hat ein eigenes Zeichen, ebenso ss. Alle anderen Doppelmitlaute werden einfach geschrieben.</p>`,
    woerter: ['Schmerz', 'Schnee', 'Schrift', 'Schwester', 'Schwan', 'zwei', 'Lampe', 'Kampf', 'Kopf', 'Apfel', 'Erde', 'Herr', 'Kurs', 'Pferd'],
  },
  {
    id: 'l17',
    nr: 17,
    titel: 'Selbstlaute am Wortanfang und Wortende',
    paragraf: '§ 3.2',
    kurz: 'Ohne folgenden Mitlaut wird der Selbstlaut buchstäblich geschrieben.',
    zeichen: [],
    drill: ['~o', '~i', '~ei', '~u', '~eu', '~a'],
    vokale: ['ä', 'äu'],
    lehrstoff: `
      <p>Folgt auf einen Selbstlaut <b>kein Mitlaut</b> – also am Wortende oder vor einem weiteren Selbstlaut –,
      so wird er <b>buchstäblich</b> mit einem eigenen Zeichen geschrieben (§ 3.2). Das e am Wortende kennen Sie
      schon aus Lerneinheit 1:</p>
      <ul>
        <li><b>e</b>: kurzer Aufstrich · <b>o</b>: langer Flachstrich · <b>i</b>: steiler Aufstrich · <b>ei</b>: langer Aufstrich</li>
        <li><b>u</b>: kurzer Abstrich unter die Linie · <b>eu</b>: langer Abstrich</li>
        <li><b>a, ö, ü, ä, au, äu</b>: die entsprechenden Zeichen verstärkt</li>
      </ul>
      <p>Steht ein Selbstlaut <b>am Wortanfang</b>, beginnt man mit einem <b>Anstrich</b> von der Grundlinie
      und deutet den Selbstlaut am ersten Mitlaut an: <i>Ofen</i> = weiter Anstrich zu f.</p>`,
    woerter: ['Kuh', 'Knie', 'Auto', 'Kino', 'Sofa', 'Oma', 'Opa', 'Uhu', 'Bau', 'Idee', 'Ufer', 'Abend', 'Ofen', 'Igel', 'Eule'],
  },
  {
    id: 'l18',
    nr: 18,
    titel: 'Kürzel I: der, die, das, und, ist …',
    paragraf: '§ 5.2',
    kurz: 'Die häufigsten Wörter erhalten feste Kurzformen.',
    zeichen: [],
    vokale: [],
    kuerzel: ['der', 'die', 'das', 'den', 'dem', 'des', 'und', 'ist', 'ich', 'mit', 'nicht', 'er'],
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
    id: 'l19',
    nr: 19,
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

// Einzeln zu übende Zeichen einer Lektion: neue Mitlautzeichen, Zusatzzeichen und Kürzel
export function drillKeys(lesson) {
  return [...lesson.zeichen.map((g) => '#' + g), ...(lesson.drill || []), ...(lesson.kuerzel || [])];
}

// Alle bis einschließlich Lektion nr eingeführten Einzelzeichen (Vergleichskandidaten für Zeichenübungen)
export function drillKeysUpTo(nr) {
  return LESSONS.filter((l) => l.nr <= nr).flatMap(drillKeys);
}
