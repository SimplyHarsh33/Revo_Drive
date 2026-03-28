import { useCallback, useRef } from 'react';

export const useAlertSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

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

    // Audio volume envelope (fades out so it doesn't click sharply)
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const playCriticalAlarm = useCallback(() => {
    // Play a harsh, double-pulse sawtooth wave for emergency awake alerts
    playBeep(440, 'sawtooth', 0.1);
    setTimeout(() => playBeep(880, 'sawtooth', 0.2), 150);
  }, [playBeep]);

  return { playBeep, playCriticalAlarm, initAudio };
};
