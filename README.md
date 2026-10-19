# steno-tutor – Lernportal Kurzschrift

Lernprogramm zur Erlernung und Anwendung der **Deutschen Einheitskurzschrift (DEK)**, Stufe
**Verkehrsschrift** nach der Systemurkunde von 1968 („Wiener Urkunde“). Die Verkehrsschrift ist die
Grundlage der Eil- und Redeschrift, mit der die Parlamentsstenografen des Deutschen Bundestages
die Plenarsitzungen mitschreiben.

Gestaltet als Website im Stil der frühen 2000er Jahre – in Schwarz-Rot-Gold und mit allem, was zu
einer ordentlichen deutschen Behörde gehört (Aktenzeichen, Formblätter, Wartemarke, Stempel und
Bescheid mit Rechtsbehelfsbelehrung). Das „Bundesamt für Kurzschriftwesen“ ist frei erfunden.

## Funktionen

| Bereich | Richtung | Beschreibung |
|---|---|---|
| **Lerneinheiten** (12) | – | Lehrstoff, Zeichentafel, Übungen und Prüfung mit Bescheid |
| Nachspuren | Vorlage → Stift | Sollform im Schreibfeld nachfahren |
| Schreiben | Text → Kurzschrift | Wort mit Stift schreiben, automatische Bewertung |
| Lesen | Kurzschrift → Text | Ankreuzen oder Freitext |
| Hördiktat | Audio → Kurzschrift | Wort wird vorgelesen (Web Speech API), Tempo einstellbar |
| **Übertragungsstelle** | Text/Sprache → Kurzschrift | beliebiger Text oder Spracheingabe, SVG-Export |
| **Lesesaal** | Kurzschrift → Text/Audio | Lesetraining mit dem gesamten Wortschatz |
| **Schreibstube** | Handschrift → Text/Audio | mehrzeiliges Schreibfeld mit Worterkennung |
| **Zeichentafel** | – | alle Mitlautzeichen, Selbstlautregeln und Kürzel, animiert |

### Stifteingabe (Apple Pencil, S-Pen)

- Pointer Events mit `getCoalescedEvents()` für flüssige Linien, Strichstärke nach Stiftdruck
  (fester drücken = Verstärkung für a, ö, ü, au).
- Handballen-Erkennung: Sobald ein Stift erkannt wurde, werden Fingerberührungen ignoriert
  (abschaltbar unter *Hilfe & Einstellungen*).
- Kein Scrollen, Zoomen oder Markieren im Schreibfeld (`touch-action: none`).
- Als Web-App installierbar („Zum Home-Bildschirm“) und offline nutzbar (Service Worker).

## Technik

Reines HTML/CSS/JavaScript (ES-Module), keine Abhängigkeiten, kein Build-Schritt.

```
js/steno/glyphs.js    Zeichenvorrat: alle Mitlautzeichen parametrisch als Vektorstriche
js/steno/parser.js    Wortzerlegung: Rechtschreibvereinfachungen, Mitlautfolgen, Kürzel, Vor-/Nachsilben
js/steno/layout.js    Satz des Wortbildes: Verbindungen, Hoch-/Tiefstellung, Verstärkung
js/steno/render.js    SVG-Ausgabe mit Schreibanimation
js/recognizer.js      Handschrifterkennung (Punktwolkenvergleich mit Lage- und Größenbezug)
js/pad.js             Schreibfeld für Stift, Finger und Maus
js/speech.js          Sprachausgabe und Spracheingabe
js/lessons.js         Lehrplan
js/exercise.js        Übungen, Prüfung, Bescheid
js/app.js             Seiten und Navigation
```

### Kurzschrift-Engine

Die Selbstlaute werden wie in der DEK nicht als Zeichen geschrieben, sondern am folgenden Mitlaut
angedeutet (§ 3 der Urkunde):

| Verbindungsart | einfach | verstärkt |
|---|---|---|
| enge Verbindung | e (ä) | a |
| weite Verbindung | o | ö |
| enge Hochstellung | i | ü |
| weite Hochstellung | ei | ä |
| enge Tiefstellung | u | au |
| weite Tiefstellung | eu | äu |

Die Stellung des zuletzt geschriebenen Zeichens bestimmt die Anschlusszeile des nächsten (§ 4.1).
Auslautende Selbstlaute werden buchstäblich geschrieben (§ 3.2). Die Zeichenformen wurden nach den
Zeichentafeln der Urkunde gestaltet und rechnerisch erzeugt; sie geben die Urkunde vereinfacht
wieder. Sonderregeln wie das Aufstrich-t und die meisten der über hundert Kürzel sind nicht oder nur
teilweise umgesetzt.

### Handschrifterkennung

Die Schrift wird in Stufen-Koordinaten (Abstand der Schreiblinien) erfasst und per
Punktwolkenvergleich (angelehnt an den $P-Erkenner) mit den Sollformen verglichen – **ohne**
Größennormierung, denn Größe und Stellung zur Grundlinie tragen in der Kurzschrift Bedeutung
(t ↔ tr, i ↔ e). Toleriert werden ±25 % Größe und ±0,3 Stufen Höhenversatz. Eine Schriftprobe gilt als
richtig, wenn sie der Sollform am nächsten kommt und mit keinem anderen Wort des bisherigen
Wortschatzes verwechselbar ist.

## Starten

```bash
npm start          # http://localhost:8080
npm test           # Engine- und Erkennungsprüfungen (Node ≥ 18)
node tests/e2e.mjs # Durchklick-Test im Browser (benötigt Playwright, Server muss laufen)
```

### Veröffentlichung

Der Workflow `.github/workflows/pages.yml` prüft jeden Push und veröffentlicht den Stand von `main`
auf GitHub Pages. Dazu einmalig unter *Settings → Pages → Build and deployment* die Quelle
**GitHub Actions** wählen.

## Quellen

- Systemurkunde der Deutschen Einheitskurzschrift (Wiener Urkunde), 20. Juni 1968, abgedruckt als
  Anlage B der österreichischen Verordnung BGBl. Nr. 171/1969.
- Wikipedia: [Deutsche Einheitskurzschrift](https://de.wikipedia.org/wiki/Deutsche_Einheitskurzschrift)

## Hinweis

Dies ist ein Lernprogramm und kein amtliches Lehrmittel. Alle Lerndaten verbleiben im Browser
(`localStorage`).
