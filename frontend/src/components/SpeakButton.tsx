import { useCallback, useEffect, useRef, useState } from "react";

interface SpeakButtonProps {
  text: string;
  language: string;
  onSpeakingChange?: (speaking: boolean) => void;
}

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const handler = () => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        window.speechSynthesis.onvoiceschanged = null;
        resolve(voices);
      }
    };

    window.speechSynthesis.onvoiceschanged = handler;

    setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    }, 3000);
  });
}

function findVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const exact = voices.find((v) => v.lang.startsWith(lang));
  if (exact) return exact;

  const langBase = lang.split("-")[0];
  const base = voices.find((v) => v.lang.startsWith(langBase));
  if (base) return base;

  return voices.find((v) => v.default) || voices[0];
}

export function SpeakButton({ text, language, onSpeakingChange }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [ready, setReady] = useState(false);

  const speakingRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const warmedUp = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateSpeaking = useCallback((value: boolean) => {
    speakingRef.current = value;
    setSpeaking(value);
    onSpeakingChange?.(value);
  }, [onSpeakingChange]);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
      return;
    }

    getVoices().then((voices) => {
      voicesRef.current = voices;
      if (voices.length === 0) {
        setSupported(false);
        return;
      }
      setReady(true);
    });
  }, []);

  const warmUp = useCallback(() => {
    if (warmedUp.current || !window.speechSynthesis) return;
    warmedUp.current = true;

    const dummy = new SpeechSynthesisUtterance("");
    dummy.volume = 0;
    window.speechSynthesis.speak(dummy);
    window.speechSynthesis.cancel();
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = undefined;
    }
    updateSpeaking(false);
  }, [updateSpeaking]);

  const handleSpeak = useCallback(() => {
    if (!text || !window.speechSynthesis || !ready) return;

    if (speakingRef.current) {
      stopSpeaking();
      return;
    }

    warmUp();

    // Show wave animation immediately on click, before speech starts
    updateSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1;
    utterance.pitch = 1;

    const voice = findVoice(voicesRef.current, language);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    const clearHeartbeat = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = undefined;
      }
    };

    utterance.onstart = () => {
      heartbeatRef.current = setInterval(() => {
        try {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } catch {
          // Ignore errors from pause/resume on unsupported platforms
        }
      }, 8000);
    };

    utterance.onend = () => {
      clearHeartbeat();
      updateSpeaking(false);
    };

    utterance.onerror = (e) => {
      clearHeartbeat();
      if (e.error === "canceled" || e.error === "interrupted") return;
      updateSpeaking(false);
    };

    utteranceRef.current = utterance;

    speakTimeoutRef.current = setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [text, language, ready, warmUp, stopSpeaking, updateSpeaking]);

  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = undefined;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!supported) {
    return (
      <button
        disabled
        title="Text-to-speech not supported in this browser"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
        Speak
      </button>
    );
  }

  return (
    <button
      onClick={handleSpeak}
      disabled={!text || !ready}
      title={!ready ? "Loading speech engine..." : speaking ? "Stop speaking" : "Read aloud"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        !text || !ready
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : speaking
            ? "text-accent bg-accent/10 cursor-pointer"
            : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
      }`}
    >
      {!ready ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </>
      ) : speaking ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Stop
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 010 14.14" />
            <path d="M15.54 8.46a5 5 0 010 7.07" />
          </svg>
          Speak
        </>
      )}
    </button>
  );
}
