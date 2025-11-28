"use client";

import { useCallback, useEffect, useRef } from "react";

// Sound URLs - using free game sounds from public CDNs
const SOUNDS = {
  // UI Interactions
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  hover: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  
  // Success/Achievement
  success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  levelUp: "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3",
  
  // Game Events
  countdown: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
  scoreUp: "https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3",
  coin: "https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3",
  
  // Notifications
  notification: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3",
  
  // Special
  whoosh: "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3",
  pop: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
  swoosh: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",
} as const;

type SoundName = keyof typeof SOUNDS;

interface UseGameSoundsOptions {
  volume?: number;
  enabled?: boolean;
}

/**
 * Hook for playing game sounds with caching and volume control
 */
export function useGameSounds(options: UseGameSoundsOptions = {}) {
  const { volume = 0.5, enabled = true } = options;
  const audioCache = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
  const isEnabled = useRef(enabled);

  useEffect(() => {
    isEnabled.current = enabled;
  }, [enabled]);

  // Preload commonly used sounds
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Preload priority sounds
    const preloadSounds: SoundName[] = ["click", "success", "coin", "pop"];
    preloadSounds.forEach((name) => {
      const audio = new Audio(SOUNDS[name]);
      audio.preload = "auto";
      audio.volume = volume;
      audioCache.current.set(name, audio);
    });

    return () => {
      audioCache.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioCache.current.clear();
    };
  }, [volume]);

  const play = useCallback(
    (name: SoundName, customVolume?: number) => {
      if (!isEnabled.current || typeof window === "undefined") return;

      try {
        let audio = audioCache.current.get(name);
        
        if (!audio) {
          audio = new Audio(SOUNDS[name]);
          audioCache.current.set(name, audio);
        }

        // Clone for overlapping sounds
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = customVolume ?? volume;
        clone.play().catch(() => {
          // Ignore autoplay restrictions
        });

        // Clean up clone after playing
        clone.addEventListener("ended", () => {
          clone.remove();
        });
      } catch {
        // Silently fail if sound can't play
      }
    },
    [volume]
  );

  // Convenience methods
  const playClick = useCallback(() => play("click", 0.3), [play]);
  const playSuccess = useCallback(() => play("success"), [play]);
  const playWin = useCallback(() => play("win", 0.6), [play]);
  const playCoin = useCallback(() => play("coin", 0.4), [play]);
  const playPop = useCallback(() => play("pop", 0.4), [play]);
  const playError = useCallback(() => play("error", 0.4), [play]);
  const playNotification = useCallback(() => play("notification", 0.4), [play]);
  const playScoreUp = useCallback(() => play("scoreUp", 0.3), [play]);
  const playWhoosh = useCallback(() => play("whoosh", 0.3), [play]);
  const playSwoosh = useCallback(() => play("swoosh", 0.3), [play]);

  return {
    play,
    playClick,
    playSuccess,
    playWin,
    playCoin,
    playPop,
    playError,
    playNotification,
    playScoreUp,
    playWhoosh,
    playSwoosh,
  };
}

export type { SoundName };
export { SOUNDS };
