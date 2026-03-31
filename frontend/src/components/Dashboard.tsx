import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: number;
  event_type: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
}

interface Session {
  id: number;
  start_time: string;
  end_time: string | null;
  events: Event[];
}

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('http://localhost:8000/sessions/');
        if (res.ok) {
          const data: Session[] = await res.json();
          // Sort by ID descending (newest first)
          data.sort((a, b) => b.id - a.id);
          setSessions(data);
        }
      } catch (err) {
        console.error("Failed to fetch sessions from Backend database:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const countEvents = (events: Event[], typeMatch: string) => {
    return events.filter(e => e.event_type.includes(typeMatch)).length;
  };

  const formatDate = (isoString: string) => {
    // Force JavaScript to treat the naive Python timestamp as strict UTC
    const utcString = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
    const d = new Date(utcString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
  };

  return (
    <div className="w-full text-white bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[80vh] hidden-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-bold tracking-widest text-blue-400 uppercase drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse"></span>
          Historical Flight Log Archives
        </h2>
        <div className="px-5 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-mono text-blue-300">
          TOTAL DB LOGS: {sessions.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-60">
           <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 font-mono tracking-widest uppercase text-xs animate-pulse">Querying SQLite Database...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-mono border border-dashed border-gray-700 rounded-xl">
           <p>No historical driving telemetry found in `database.db`.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, ease: "easeOut" }}
              key={session.id} 
              className="bg-gradient-to-r from-black/80 to-blue-900/10 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300 group shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-blue-900/40 border-2 border-blue-500/30 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:bg-blue-600/30 group-hover:border-blue-400 transition-all">
                    <span className="text-[9px] text-blue-300 font-mono font-bold tracking-widest">TRIP</span>
                    <span className="text-lg font-bold text-white leading-tight">#{session.id}</span>
                  </div>
                  <div>
                    <h3 className="font-mono text-sm text-gray-300 mb-1 flex items-center gap-2">
                       <span className="w-2 h-2 rounded bg-gray-500"></span>
                       Start: <span className="text-white">{formatDate(session.start_time)}</span>
                    </h3>
                    <h3 className="font-mono text-xs text-gray-400 flex items-center gap-2">
                       <span className={`w-2 h-2 rounded ${session.end_time || index !== 0 ? 'bg-gray-700' : 'bg-green-500'}`}></span>
                       End: {session.end_time ? formatDate(session.end_time) : index === 0 ? <span className="text-green-400 font-bold uppercase tracking-widest animate-pulse border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded">Live Now</span> : <span className="text-gray-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-700 rounded bg-gray-800/50">Connection Closed</span>}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center justify-center w-20 py-2 bg-red-500/5 border border-red-500/20 rounded-xl group-hover:bg-red-500/10 transition-colors">
                         <span className="text-red-400 font-bold text-xl">{countEvents(session.events, 'DROWSINESS')}</span>
                         <span className="text-[9px] text-red-500/80 uppercase tracking-widest font-bold mt-1">Drowsy</span>
                      </div>
                      <div className="flex flex-col items-center justify-center w-20 py-2 bg-orange-500/5 border border-orange-500/20 rounded-xl group-hover:bg-orange-500/10 transition-colors">
                         <span className="text-orange-400 font-bold text-xl">{countEvents(session.events, 'CELLPHONE')}</span>
                         <span className="text-[9px] text-orange-500/80 uppercase tracking-widest font-bold mt-1">Phone</span>
                      </div>
                      <div className="flex flex-col items-center justify-center w-20 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl group-hover:bg-yellow-500/10 transition-colors">
                         <span className="text-yellow-400 font-bold text-xl">{countEvents(session.events, 'YAWNING')}</span>
                         <span className="text-[9px] text-yellow-500/80 uppercase tracking-widest font-bold mt-1">Yawns</span>
                      </div>
                      <div className="flex flex-col items-center justify-center w-20 py-2 bg-purple-500/5 border border-purple-500/20 rounded-xl group-hover:bg-purple-500/10 transition-colors">
                         <span className="text-purple-400 font-bold text-xl">{countEvents(session.events, 'DISTRACTED')}</span>
                         <span className="text-[9px] text-purple-500/80 uppercase tracking-widest font-bold mt-1">Gaze</span>
                      </div>
                   </div>
                   
                   <motion.div animate={{ rotate: expandedId === session.id ? 180 : 0 }} className="text-gray-500 group-hover:text-blue-400 pr-2">
                     ▼
                   </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === session.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-black/40"
                  >
                    <div className="p-5 md:p-6">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Granular Incident Log</h4>
                      
                      {session.events.length === 0 ? (
                        <p className="text-sm font-mono text-gray-500 italic">No incidents recorded this trip.</p>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto hidden-scrollbar pr-2">
                          {session.events.map(ev => {
                            const isDrowsy = ev.event_type.includes("DROWSY") || ev.event_type.includes("DROWSINESS");
                            const isPhone = ev.event_type.includes("PHONE") || ev.event_type.includes("CELLPHONE");
                            const color = isDrowsy ? "text-red-400" : isPhone ? "text-orange-400" : "text-yellow-400";
                            const dotColor = isDrowsy ? "bg-red-500" : isPhone ? "bg-orange-500" : "bg-yellow-500";
                            
                            return (
                              <div key={ev.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                                  <span className={`font-bold font-mono text-xs uppercase tracking-wider ${color}`}>
                                    {ev.event_type}
                                  </span>
                                </div>
                                
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-[10px] text-gray-400 font-mono">{formatDate(ev.timestamp)}</span>
                                  <span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">
                                    GPS: LAT {ev.latitude ? ev.latitude.toFixed(4) : "UKN"} • LNG {ev.longitude ? ev.longitude.toFixed(4) : "UKN"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
