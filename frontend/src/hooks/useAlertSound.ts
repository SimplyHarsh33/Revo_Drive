import { useCallback, useRef } from 'react';

export const useAlertSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isSpeakingRef = useRef(false);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playBeep = useCallback((frequency = 880, type: OscillatorType = 'sine', duration = 0.2) => {
    const ctx = initAudio();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  /**
   * Plays a short attention beep, then speaks the given voice message aloud.
   * Has a cooldown to prevent the same message from repeating too quickly.
   */
  const playVoiceAlert = useCallback((message: string) => {
    // Cooldown: if already speaking, don't interrupt or stack
    if (isSpeakingRef.current) return;

    // 1. Play an attention-grabbing beep first
    playBeep(660, 'sawtooth', 0.08);
    setTimeout(() => playBeep(880, 'sawtooth', 0.12), 120);

    // 2. After beep, fire the voice message
    setTimeout(() => {
      if ('speechSynthesis' in window) {
        // Cancel any leftover speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.95;    // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        isSpeakingRef.current = true;

        utterance.onend = () => {
          // Allow next alert after speech finishes + 3s cooldown
          setTimeout(() => {
            isSpeakingRef.current = false;
          }, 3000);
        };

        utterance.onerror = () => {
          isSpeakingRef.current = false;
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback: just keep beeping if browser lacks speech support
        isSpeakingRef.current = false;
      }
    }, 300);

  }, [playBeep]);

  // --- Named alert shortcuts ---

  const alertDrowsiness = useCallback(() => {
    playVoiceAlert("Alert! Driver drowsiness detected. Please pull over and take a rest!");
  }, [playVoiceAlert]);

  const alertCellPhone = useCallback(() => {
    playVoiceAlert("Warning! Mobile phone usage detected while driving. Put it down!");
  }, [playVoiceAlert]);

  const alertYawning = useCallback(() => {
    playVoiceAlert("Caution! Excessive yawning detected. Take a break before continuing!");
  }, [playVoiceAlert]);

  const alertDistracted = useCallback(() => {
    playVoiceAlert("Warning! Keep your eyes on the road. Distracted driving detected!");
  }, [playVoiceAlert]);

  // Legacy alias kept so nothing else breaks
  const playCriticalAlarm = alertDrowsiness;

  return { playBeep, playVoiceAlert, playCriticalAlarm, alertDrowsiness, alertCellPhone, alertYawning, alertDistracted, initAudio };
};
