import { useCallback, useEffect, useRef, useState } from 'react';
import { parseIntent } from '@/lib/ai/intents';
import type { VoiceIntent } from '@/types/ai';

interface SpeechRecognitionLike {
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

export function useVoiceCommand() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState<VoiceIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    setSupported(!!Ctor);
    if (Ctor) {
      const rec = new Ctor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      recRef.current = rec;
    }
  }, []);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    setIntent(null);
    const rec = recRef.current;
    if (!rec) {
      setError('Voice not supported on this browser');
      return;
    }
    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIntent(parseIntent(text));
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setError(e.error);
      setListening(false);
    };
    setListening(true);
    try {
      rec.start();
    } catch (err) {
      setError(String(err));
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const simulate = useCallback((text: string) => {
    setTranscript(text);
    setIntent(parseIntent(text));
    setError(null);
  }, []);

  return { supported, listening, transcript, intent, error, start, stop, simulate };
}
