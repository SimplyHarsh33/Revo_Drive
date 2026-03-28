import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFaceMesh } from '../hooks/useFaceMesh';
import { useObjectDetect } from '../hooks/useObjectDetect';

interface WebcamFeedProps {
  onDrowsinessUpdate: (score: number) => void;
  onDetectUpdate: (items: string[]) => void;
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({ onDrowsinessUpdate, onDetectUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded: isFaceLoaded, drowsinessScore, isYawning, startInference: startFaceMesh } = useFaceMesh(videoRef, canvasRef);
  const { isLoaded: isObjectLoaded, detectedItems, startDetection: startObjectDetect } = useObjectDetect(videoRef);

  useEffect(() => {
    onDrowsinessUpdate(drowsinessScore);
  }, [drowsinessScore, onDrowsinessUpdate]);

  useEffect(() => {
    let activeAlerts = [...detectedItems];
    if (isYawning && !activeAlerts.includes("Yawning Detected")) {
      activeAlerts.push("Yawning Detected");
    }
    onDetectUpdate(activeAlerts);
  }, [detectedItems, isYawning, onDetectUpdate]);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
        setError("Camera access denied or unavailable.");
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleVideoLoad = () => {
    // Start ML loops once video is actively playing!
    if(isFaceLoaded) startFaceMesh();
    if(isObjectLoaded) startObjectDetect();
  }

  // Effect to re-trigger if ML models load late
  useEffect(() => {
    if (isFaceLoaded && videoRef.current?.readyState === 4) startFaceMesh();
    if (isObjectLoaded && videoRef.current?.readyState === 4) startObjectDetect();
  }, [isFaceLoaded, isObjectLoaded, startFaceMesh, startObjectDetect]);

  return (
    <div className="relative w-full aspect-video bg-[#02050A] rounded-3xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] group">
      
      {/* Decorative High-Tech Corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-500/50 rounded-tl-3xl z-20 transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-[inset_2px_2px_15px_rgba(59,130,246,0.3)]"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/50 rounded-tr-3xl z-20 transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-[inset_-2px_2px_15px_rgba(59,130,246,0.3)]"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500/50 rounded-bl-3xl z-20 transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-[inset_2px_-2px_15px_rgba(59,130,246,0.3)]"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/50 rounded-br-3xl z-20 transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-[inset_-2px_-2px_15px_rgba(59,130,246,0.3)]"></div>

      {/* Top Overlay HUD */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-6 inset-x-8 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase drop-shadow-[0_0_10px_currentColor]">Camera View 01</span>
          <span className="text-xs font-mono text-gray-300/80 tracking-wider">RES: 1280x720 • FPS: 30</span>
        </div>
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 mt-1 py-1.5 rounded-full border border-red-500/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]"></div>
          <span className="text-[10px] font-bold tracking-widest text-red-100 uppercase">Live Trace</span>
        </motion.div>
      </div>

      {/* Crosshair Overlay (subtle) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent mix-blend-screen"></div>
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mix-blend-screen"></div>
        <div className="absolute w-40 h-40 border border-blue-400/40 rounded-full mix-blend-screen"></div>
        <div className="absolute w-64 h-64 border border-blue-400/10 rounded-full mix-blend-screen animate-pulse"></div>
      </div>

      {error ? (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#02050A]">
          <svg className="w-12 h-12 text-red-500/50 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 font-medium tracking-wide">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedData={handleVideoLoad}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0 filter contrast-125 brightness-[1.05] grayscale-[0.2]"
          />
          {/* Canvas for Drawing FaceMesh over standard video */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-10 pointer-events-none"
          />
        </>
      )}
      
      {/* Bottom Overlay HUD */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-6 left-8 z-20 pointer-events-none w-full">
        <div className="flex gap-4">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl shadow-lg">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Location</p>
            <p className="text-sm font-mono text-white tracking-widest">LAT 34.050 • LNG -118.243</p>
          </div>
          <div className="bg-blue-900/40 backdrop-blur-md border border-blue-500/40 px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <p className="text-[10px] text-blue-300 uppercase tracking-widest mb-1 font-semibold">AI Scanner</p>
            <p className="text-sm font-mono text-blue-100 tracking-wider">
              {isFaceLoaded && isObjectLoaded ? "FaceMesh + TF.js Active" : "Initializing AI..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamFeed;
