import { useEffect, useRef, useState, useCallback } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export const useObjectDetect = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isPaused: boolean = false
) => {
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    async function initModel() {
      // Load the COCO-SSD model using WebGL backend automatically via TF.js
      const model = await cocoSsd.load();
      modelRef.current = model;
      setIsLoaded(true);
      console.log("COCO-SSD Model Loaded for Bounding Box Detection");
    }
    initModel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startDetection = useCallback(() => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Optimizaton: Run object detection every 5 frames
    let frameCount = 0;
    
    const detectFrame = async () => {
      if (video.readyState >= 2) {
        if (isPausedRef.current) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setDetectedItems([]);
          animationRef.current = requestAnimationFrame(detectFrame);
          return;
        }

        frameCount++;
        if (frameCount % 30 === 0) {
          const predictions = await modelRef.current!.detect(video);
          
          if (canvas.width !== video.videoWidth) {
             canvas.width = video.videoWidth;
             canvas.height = video.videoHeight;
          }
          
          // Clear previous frames
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the Bounding Boxes!
          predictions.forEach(p => {
             if (p.score > 0.40) {
               const [x, y, width, height] = p.bbox;
               
               // Bounding Box Path
               ctx.strokeStyle = '#EF4444'; // Aggressive Red
               ctx.lineWidth = 4;
               ctx.strokeRect(x, y, width, height);

               // Bounding Box Title Background
               ctx.fillStyle = '#EF4444';
               ctx.fillRect(x - 2, y - 30, width + 4, 30);

               // Bounding Box Text Label (Un-mirror text over mirrored video CSS)
               ctx.save();
               ctx.scale(-1, 1);
               ctx.font = 'bold 18px monospace';
               ctx.fillStyle = '#FFFFFF';
               ctx.fillText(`[!] ${p.class}`, -x - width + 5, y - 8);
               ctx.restore();
             }
          });
          
          // Filter with a more sensitive 40% confidence threshold to update React State Hooks
          const items = predictions
             .filter(p => p.score > 0.40) 
             .map(p => p.class);
             
          setDetectedItems(items);
        }
      }
      animationRef.current = requestAnimationFrame(detectFrame);
    };
    
    detectFrame();
  }, [videoRef, canvasRef]);

  return { isLoaded, detectedItems, startDetection };
};
