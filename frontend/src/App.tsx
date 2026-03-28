import React from 'react';
import { motion } from 'framer-motion';
import WebcamFeed from './components/WebcamFeed';

function App() {
  return (
    <div className="min-h-screen bg-vividDark text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
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

        <div className="flex gap-4 items-center">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-semibold tracking-wider hidden sm:block uppercase">System Online</span>
          </div>
          <button className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium text-sm text-gray-300 hover:text-white backdrop-blur-md tracking-wide">
            Settings
          </button>
        </div>
      </motion.header>

      {/* Main Layout */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10 hidden-scrollbar mt-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">
          
          {/* Left Panel: Analytics */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-1 space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
               <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                 Driver Analytics
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-xs mb-2 text-gray-400 font-medium">
                     <span>Drowsiness Score</span>
                     <span className="text-blue-400">Low</span>
                   </div>
                   <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: "15%" }} transition={{ delay: 0.8 }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between text-xs mb-2 text-gray-400 font-medium">
                     <span>Focus Level</span>
                     <span className="text-purple-400">98%</span>
                   </div>
                   <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} transition={{ delay: 0.5, duration: 1 }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-black/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500 rounded-full -mt-10 -mr-10"></div>
               <h3 className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-2">Deployed Edge Models</h3>
               <p className="text-2xl font-light text-white mb-2 tracking-wide">Active</p>
               <div className="flex gap-2 text-[10px] font-mono font-bold text-blue-200/60 uppercase">
                 <span className="px-2 py-1 bg-white/5 rounded border border-white/10">FaceMesh</span>
                 <span className="px-2 py-1 bg-white/5 rounded border border-white/10">COCO-SSD</span>
               </div>
            </div>
          </motion.div>

          {/* Center Panel: Camera */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.4 }}
            className="xl:col-span-3 flex flex-col"
          >
            <WebcamFeed />
          </motion.div>
          
        </div>
      </main>
      
    </div>
  );
}

export default App;
