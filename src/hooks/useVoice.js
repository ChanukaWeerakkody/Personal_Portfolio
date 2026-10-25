import { useCallback, useEffect, useRef, useState } from 'react';

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/** Thin wrapper over the Web Speech API. `supported` is false on Firefox and some webviews. */
export function useVoice(onResult) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const cb = useRef(onResult);
  cb.current = onResult;

  const stop = useCallback(() => recRef.current?.stop(), []);

  const start = useCallback(() => {
    if (!SR) return;
    setError(null);
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => { setListening(false); setError(e.error === 'not-allowed' ? 'Microphone permission denied' : 'Could not hear that'); };
    rec.onresult = (e) => cb.current?.(e.results[0][0].transcript);
    recRef.current = rec;
    try { rec.start(); } catch { /* already started */ }
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported: !!SR, listening, error, start, stop };
}

export function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.02;
  window.speechSynthesis.speak(u);
}
