"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tone = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
};

const AUDIO_STORAGE_KEY = "doctor-dunk:fx";

let sharedContext: AudioContext | null = null;
let sharedEnabled = false;
const listeners = new Set<(value: boolean) => void>();

const prefersSoundOn =
  typeof window !== "undefined" &&
  window.localStorage.getItem(AUDIO_STORAGE_KEY) === "on";

sharedEnabled = prefersSoundOn;

const notify = (value: boolean) => {
  listeners.forEach((listener) => listener(value));
};

const ensureContext = async () => {
  if (typeof window === "undefined") return null;
  if (!sharedContext) {
    sharedContext = new window.AudioContext();
  }
  if (sharedContext.state === "suspended") {
    try {
      await sharedContext.resume();
    } catch {
      return null;
    }
  }
  return sharedContext;
};

const setEnabled = async (value: boolean) => {
  sharedEnabled = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUDIO_STORAGE_KEY, value ? "on" : "off");
  }

  if (value) {
    await ensureContext();
  }

  notify(value);
};

const playToneSequence = async (tones: Tone[]) => {
  if (!sharedEnabled || tones.length === 0) return;
  const context = await ensureContext();
  if (!context) return;

  let offset = context.currentTime;
  tones.forEach(({ frequency, duration, type = "triangle", volume = 0.25 }) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(volume, offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, offset + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(offset);
    oscillator.stop(offset + duration);

    offset += duration * 0.85;
  });
};

export function useGameAudio() {
  const [isEnabled, setIsEnabled] = useState<boolean>(sharedEnabled);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    listeners.add(setIsEnabled);
    return () => {
      mountedRef.current = false;
      listeners.delete(setIsEnabled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AUDIO_STORAGE_KEY);
    if (stored === "on" && !sharedEnabled) {
      setEnabled(true);
    }
  }, []);

  const prime = useCallback(async () => {
    if (!sharedEnabled) {
      await setEnabled(true);
    } else {
      await ensureContext();
    }
  }, []);

  const toggleFx = useCallback(async () => {
    await setEnabled(!sharedEnabled);
  }, []);

  const enableFx = useCallback(async () => {
    if (!sharedEnabled) {
      await setEnabled(true);
    }
  }, []);

  const disableFx = useCallback(async () => {
    if (sharedEnabled) {
      await setEnabled(false);
    }
  }, []);

  const playClick = useCallback(() => {
    void playToneSequence([
      { frequency: 420, duration: 0.08, type: "square", volume: 0.3 },
      { frequency: 640, duration: 0.09, type: "sawtooth", volume: 0.2 },
    ]);
  }, []);

  const playScore = useCallback(() => {
    void playToneSequence([
      { frequency: 520, duration: 0.12, type: "triangle", volume: 0.3 },
      { frequency: 840, duration: 0.18, type: "square", volume: 0.25 },
      { frequency: 620, duration: 0.14, type: "triangle", volume: 0.2 },
    ]);
  }, []);

  const playAlert = useCallback(() => {
    void playToneSequence([
      { frequency: 260, duration: 0.16, type: "sine", volume: 0.25 },
      { frequency: 180, duration: 0.2, type: "triangle", volume: 0.22 },
    ]);
  }, []);

  return {
    isEnabled,
    prime,
    toggleFx,
    enableFx,
    disableFx,
    playClick,
    playScore,
    playAlert,
  };
}

