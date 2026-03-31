import { motion, AnimatePresence } from 'framer-motion';

export interface AlertToastData {
  id: number;
  type: 'drowsiness' | 'phone' | 'yawning' | 'distracted';
  message: string;
}

interface AlertToastProps {
  toasts: AlertToastData[];
}

const toastConfig = {
  drowsiness: {
    icon: '😴',
    label: 'DROWSINESS ALERT',
    color: 'from-red-600/90 to-red-800/90',
    border: 'border-red-500/60',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.5)]',
    dot: 'bg-red-400',
  },
  phone: {
    icon: '📱',
    label: 'PHONE DETECTED',
    color: 'from-orange-600/90 to-orange-800/90',
    border: 'border-orange-500/60',
    glow: 'shadow-[0_0_40px_rgba(249,115,22,0.5)]',
    dot: 'bg-orange-400',
  },
  yawning: {
    icon: '🥱',
    label: 'EXCESSIVE YAWNING',
    color: 'from-yellow-600/90 to-yellow-800/90',
    border: 'border-yellow-500/60',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.5)]',
    dot: 'bg-yellow-400',
  },
  distracted: {
    icon: '👀',
    label: 'DISTRACTED GAZE',
    color: 'from-purple-600/90 to-purple-800/90',
    border: 'border-purple-500/60',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.5)]',
    dot: 'bg-purple-400',
  },
};

const AlertToast: React.FC<AlertToastProps> = ({ toasts }) => {
  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 120, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 120, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r ${cfg.color} backdrop-blur-xl border ${cfg.border} ${cfg.glow} max-w-xs`}
            >
              {/* Pulsing dot */}
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.dot}`}></span>
              </span>

              <div>
                <p className="text-[10px] font-bold tracking-widest text-white/70 uppercase mb-0.5">{cfg.label}</p>
                <p className="text-sm font-semibold text-white leading-tight">{toast.message}</p>
              </div>

              <span className="text-2xl ml-1">{cfg.icon}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AlertToast;
