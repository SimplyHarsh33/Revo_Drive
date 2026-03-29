import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingScreenProps {
  onStart: () => void;
}

const bootSequence = [
  { id: 1, text: 'Initializing Edge AI Runtime...', delay: 0 },
  { id: 2, text: 'Loading MediaPipe WASM Cores...', delay: 0.5 },
  { id: 3, text: 'Bootstrapping TensorFlow.js WebGL...', delay: 1.0 },
  { id: 4, text: 'Requesting Camera Permissions...', delay: 1.5 },
  { id: 5, text: 'All Systems Nominal. Ready.', delay: 2.0, success: true },
];

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  const [isBooting, setIsBooting] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleInitialize = () => {
    if (isBooting) return;
    setIsBooting(true);
    setBootStep(0);

    bootSequence.forEach((step, index) => {
      setTimeout(() => {
        setBootStep(index + 1);
        if (index === bootSequence.length - 1) {
          setTimeout(() => {
            setIsDone(true);
            setTimeout(onStart, 600);
          }, 600);
        }
      }, step.delay * 1000);
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02050A] overflow-hidden"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-700/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-700/15 blur-[150px] rounded-full pointer-events-none" />

      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Center Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        {/* Glassmorphic Card */}
        <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(59,130,246,0.1)]">

          {/* Logo / Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="w-20 h-20 rounded-2xl border border-blue-500/30 flex items-center justify-center"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                className="absolute inset-2 rounded-xl border border-indigo-400/20 flex items-center justify-center"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  {/* Eye icon */}
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              DriveSafe AI
            </h1>
            <p className="text-xs text-blue-300/50 uppercase tracking-[0.25em] mt-2 font-medium">
              Edge Telemetry & Driver Intelligence System
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-white/20 text-xs">v2.0 CORE</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 mb-8 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              This system performs <span className="text-blue-400 font-semibold">real-time Edge AI inference</span> entirely within your browser. No video data leaves your device. Camera access is required to begin monitoring.
            </p>
          </div>

          {/* Boot Sequence Log */}
          <AnimatePresence>
            {isBooting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-black/60 border border-white/5 rounded-xl p-4 mb-6 font-mono text-xs overflow-hidden"
              >
                {bootSequence.slice(0, bootStep).map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 mb-1 last:mb-0 ${step.success ? 'text-emerald-400' : 'text-blue-300/70'}`}
                  >
                    <span>{step.success ? '✓' : '›'}</span>
                    <span>{step.text}</span>
                    {!step.success && bootStep === step.id && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="text-blue-400"
                      >▋</motion.span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Button */}
          {!isDone && (
            <motion.button
              id="initialize-system-btn"
              onClick={handleInitialize}
              disabled={isBooting}
              whileHover={!isBooting ? { scale: 1.02 } : {}}
              whileTap={!isBooting ? { scale: 0.98 } : {}}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
                ${isBooting
                  ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_45px_rgba(59,130,246,0.6)] border border-blue-500/30'
                }`}
            >
              {isBooting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"
                  />
                  Booting AI Cores...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9 10l2 2 4-4" />
                  </svg>
                  Initialize System
                </>
              )}
            </motion.button>
          )}

        </div>

        {/* Version Tag */}
        <p className="text-center text-white/15 text-xs mt-4 tracking-widest font-mono">
          POWERED BY MEDIAPIPE • TENSORFLOW.JS • FASTAPI
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LandingScreen;
