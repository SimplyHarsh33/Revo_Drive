import { motion, AnimatePresence } from 'framer-motion';

export interface AlertLogEntry {
  id: number;
  type: 'drowsiness' | 'phone' | 'yawning';
  timestamp: string;
  label: string;
}

interface AlertLogProps {
  entries: AlertLogEntry[];
}

const typeStyle = {
  drowsiness: { dot: 'bg-red-500', text: 'text-red-400', icon: '😴' },
  phone:      { dot: 'bg-orange-500', text: 'text-orange-400', icon: '📱' },
  yawning:    { dot: 'bg-yellow-500', text: 'text-yellow-400', icon: '🥱' },
};

const AlertLog: React.FC<AlertLogProps> = ({ entries }) => {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
      <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        Alert History
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <p className="text-xs text-gray-600 font-mono italic text-center py-4">No alerts yet...</p>
          ) : (
            [...entries].reverse().map((entry) => {
              const style = typeStyle[entry.type];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2 border border-white/5"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`}></span>
                  <span className="text-base">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${style.text}`}>{entry.label}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">{entry.timestamp}</span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertLog;
