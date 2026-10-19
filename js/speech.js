// Sprachausgabe (Diktat) und Spracheingabe über die Web-Speech-Schnittstellen des Browsers.

let voices = [];
function loadVoices() {
  try {
    voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  } catch {
    voices = [];
  }
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function germanVoice() {
  if (!voices.length) loadVoices();
  return (
    voices.find((v) => v.lang === 'de-DE' && /anna|helena|petra|markus|google/i.test(v.name)) ||
    voices.find((v) => v.lang === 'de-DE') ||
    voices.find((v) => v.lang && v.lang.startsWith('de'))
  );
}

// Liest einen Text vor. rate: 0.5 (langsames Diktat) … 1.5
export function speak(text, { rate = 0.85 } = {}) {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve(false);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = rate;
    const v = germanVoice();
    if (v) u.voice = v;
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel();
}

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const canListen = () => !!Recognition;

// Nimmt einen gesprochenen Satz auf und liefert den erkannten Text
export function listen({ onInterim } = {}) {
  return new Promise((resolve, reject) => {
    if (!Recognition) return reject(new Error('Spracheingabe wird von diesem Browser nicht unterstützt.'));
    const rec = new Recognition();
    rec.lang = 'de-DE';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let final = '';
    rec.onresult = (ev) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      onInterim?.(final + interim);
    };
    rec.onerror = (ev) => reject(new Error(ev.error === 'not-allowed' ? 'Kein Zugriff auf das Mikrofon erteilt.' : 'Spracheingabe fehlgeschlagen: ' + ev.error));
    rec.onend = () => resolve(final.trim());
    rec.start();
  });
}
