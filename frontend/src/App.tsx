import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamFeed from './components/WebcamFeed';
import LandingScreen from './components/LandingScreen';
import AlertToast from './components/AlertToast';
import type { AlertToastData } from './components/AlertToast';
import AlertLog from './components/AlertLog';
import type { AlertLogEntry } from './components/AlertLog';
import { useAlertSound } from './hooks/useAlertSound';
import { createSession, logTelemetryEvent } from './utils/apiLogger';

function App() {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [drowsiness, setDrowsiness] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [yawnCount, setYawnCount] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { alertDrowsiness, alertCellPhone, alertYawning, initAudio } = useAlertSound();

  // Toast + Log + Stats state
  const [toasts, setToasts] = useState<AlertToastData[]>([]);
  const [alertLog, setAlertLog] = useState<AlertLogEntry[]>([]);
  const [stats, setStats] = useState({ drowsy: 0, phone: 0, yawns: 0 });
  const toastIdRef = useRef(0);

  // Helper: fires sound, shows toast, logs event, bumps stat
  const pushAlert = (
    type: AlertToastData['type'],
    message: string,
    label: string,
    soundFn: () => void
  ) => {
    soundFn();
    const id = ++toastIdRef.current;
    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    setToasts(prev => [...prev, { id, type, message }]);
    setAlertLog(prev => [...prev, { id, type, timestamp, label }]);
    setStats(prev => ({
      drowsy: prev.drowsy + (type === 'drowsiness' ? 1 : 0),
      phone:  prev.phone  + (type === 'phone'      ? 1 : 0),
      yawns:  prev.yawns  + (type === 'yawning'    ? 1 : 0),
    }));
    // Auto-dismiss toast after 4s
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleSystemStart = () => {
    initAudio();
    setIsSystemActive(true);
  };

  // 1. Initialize DB Session on Load
  useEffect(() => {
    createSession().then(id => {
      if (id) {
        setSessionId(id);
        console.log("Connected to Backend Session ID:", id);
      }
    });
  }, []);

  // 2. Track Yawning Limits and POST to DB
  const isYawningRef = useRef(false);
  const yawnCountRef = useRef(0); // Ref prevents React Strict Mode double-increment bug

  const handleYawnUpdate = (currentlyYawning: boolean) => {
    if (currentlyYawning && !isYawningRef.current) {
      yawnCountRef.current += 1;
      const newCount = yawnCountRef.current;
      setYawnCount(newCount);
      if (newCount > 3) {
        pushAlert('yawning', 'Excessive yawning detected!', 'EXCESSIVE YAWNING', alertYawning);
        if (sessionId) logTelemetryEvent(sessionId, "EXCESSIVE_YAWNING");
      }
    }
    isYawningRef.current = currentlyYawning;
  };

  // Track drowsiness without triggering unnecessary re-renders
  const drowsinessRef = useRef(drowsiness);
  useEffect(() => {
    drowsinessRef.current = drowsiness;
  }, [drowsiness]);

  // 3. Trigger alarm if drowsiness stays critical
  useEffect(() => {
    const alarmInterval = setInterval(() => {
      if (drowsinessRef.current > 70) {
        pushAlert('drowsiness', 'Driver drowsiness critical!', 'CRITICAL DROWSINESS', alertDrowsiness);
        if (sessionId) logTelemetryEvent(sessionId, "CRITICAL_DROWSINESS");
      }
    }, 1500);
    return () => clearInterval(alarmInterval);
  }, [alertDrowsiness, sessionId]);

  // 4. Object Detection Analytics (Cell Phone 2-Second Hold Rule)
  const lastObjectLog = useRef<number>(0);
  const phoneStartTimeRef = useRef<number | null>(null);
  const lastPhoneAlertRef = useRef<number>(0);

  useEffect(() => {
    if (detectedObjects.includes("cell phone")) {
      const now = Date.now();
      if (!phoneStartTimeRef.current) {
        phoneStartTimeRef.current = now;
      } else if (now - phoneStartTimeRef.current > 2000) {
        if (now - lastPhoneAlertRef.current > 10000) {
          pushAlert('phone', 'Phone usage while driving!', 'PHONE DETECTED', alertCellPhone);
          lastPhoneAlertRef.current = now;
        }
        phoneStartTimeRef.current = now;
        if (sessionId && (now - lastObjectLog.current > 3000)) {
          logTelemetryEvent(sessionId, "CELLPHONE_DETECTED_WARNING");
          lastObjectLog.current = now;
        }
      }
    } else {
      phoneStartTimeRef.current = null;
    }
  }, [detectedObjects, sessionId, alertCellPhone]);

  // Calculate status colors dynamically
  const statusColor = drowsiness > 70 ? 'from-red-500 to-orange-500' : drowsiness > 40 ? 'from-yellow-500 to-orange-500' : 'from-blue-500 to-indigo-500';
  const severityText = drowsiness > 70 ? 'CRITICAL' : drowsiness > 40 ? 'WARNING' : 'NORMAL';

  return (
    <div className="min-h-screen bg-vividDark text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">

      {/* Global Toast Notifications */}
      <AlertToast toasts={toasts} />

      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-white/5 bg-black/40 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            <div className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-xl border border-white/20"></div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              DriveSafe AI
            </h1>
            <p className="text-xs font-medium text-blue-300/60 uppercase tracking-widest hidden sm:block">
              Intelligent Telemetry Core
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          {/* Stats Counters — only show when active */}
          {isSystemActive && (
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-red-400 font-bold">{stats.drowsy}</span>
                <span className="text-gray-500">Drowsy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-orange-400 font-bold">{stats.phone}</span>
                <span className="text-gray-500">Phone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-yellow-400 font-bold">{stats.yawns}</span>
                <span className="text-gray-500">Yawns</span>
              </div>
            </div>
          )}

          {/* System Status Indicator */}
          <div className="flex items-center space-x-2">
            {isSystemActive ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-sm font-semibold tracking-wider hidden sm:block uppercase">System Online</span>
              </>
            ) : (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                <span className="text-yellow-400 text-sm font-semibold tracking-wider hidden sm:block uppercase">System Standby</span>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Conditional rendering: Landing Screen OR Main Dashboard */}
      <AnimatePresence mode="wait">
        {!isSystemActive ? (
          <LandingScreen key="landing" onStart={handleSystemStart} />
        ) : (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10 hidden-scrollbar mt-4"
          >
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">

              {/* Left Panel: Analytics */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="xl:col-span-1 space-y-6"
              >
                {/* Driver Analytics Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    Driver Analytics
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs mb-2 text-gray-400 font-medium">
                        <span>Drowsiness Score</span>
                        <span className={drowsiness > 70 ? 'text-red-400 font-bold' : 'text-blue-400'}>{severityText} ({drowsiness}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          animate={{ width: `${Math.max(drowsiness, 2)}%` }}
                          transition={{ type: "spring", bounce: 0.2 }}
                          className={`h-full bg-gradient-to-r ${statusColor}`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2 text-gray-400 font-medium">
                        <span>Focus Level</span>
                        <span className={drowsiness > 40 ? 'text-orange-400' : 'text-purple-400'}>{drowsiness > 40 ? 'Dropped' : 'Optimal'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div animate={{ width: drowsiness > 40 ? "40%" : "98%" }} transition={{ duration: 0.5 }} className={`h-full bg-gradient-to-r ${drowsiness > 40 ? 'from-orange-500 to-yellow-500' : 'from-purple-500 to-pink-500'}`} />
                      </div>
                    </div>

                    {/* Yawn Counter */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between text-xs mb-1 text-gray-400 font-medium">
                        <span>Yawn Tracking</span>
                        <span className={yawnCount > 3 ? 'text-red-400 font-bold' : 'text-gray-300 font-mono'}>{yawnCount} Strikes</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Alert system triggers on 4th yawn.</p>
                    </div>
                  </div>
                </div>

                {/* Detected Objects Card */}
                <div className="bg-gradient-to-br from-blue-900/20 to-black/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500 rounded-full -mt-10 -mr-10"></div>
                  <h3 className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-3 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">Detected Objects (AI Scan)</h3>
                  <div className="min-h-[4rem] flex items-center">
                    {detectedObjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {detectedObjects.map((obj, i) => (
                          <motion.span
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={`${obj}-${i}`}
                            className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded shadow-[0_0_15px_rgba(239,68,68,0.2)] text-[11px] font-mono font-bold uppercase tracking-wider"
                          >
                            [!] {obj}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-light text-emerald-400/80 tracking-wide font-mono">
                        {"<"} Clean Cabin {">"}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Alert History Log */}
                <AlertLog entries={alertLog} />

              </motion.div>

              {/* Center Panel: Camera */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.4 }}
                className="xl:col-span-3 flex flex-col"
              >
                <WebcamFeed
                  onDrowsinessUpdate={setDrowsiness}
                  onDetectUpdate={setDetectedObjects}
                  onYawnUpdate={handleYawnUpdate}
                />
              </motion.div>

            </div>
          </motion.main>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
