import { useEffect, useRef, useState, useCallback } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export const useObjectDetect = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
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
      console.log("COCO-SSD Model Loaded for Object Detection");
    }
    initModel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startDetection = useCallback(() => {
    if (!modelRef.current || !videoRef.current) return;
    const video = videoRef.current;
    
    // Optimizaton: Run object detection every 10 frames to save CPU load
    let frameCount = 0;
    
    const detectFrame = async () => {
      if (video.readyState >= 2) {
        frameCount++;
        if (frameCount % 10 === 0) {
          const predictions = await modelRef.current!.detect(video);
          
          // Filter for distracted driving objects with strict 60% confidence threshold
          const items = predictions
             .filter(p => p.score > 0.6) 
             .map(p => p.class);
             
          setDetectedItems(items);
        }
      }
      animationRef.current = requestAnimationFrame(detectFrame);
    };
    
    detectFrame();
  }, [videoRef]);

  return { isLoaded, detectedItems, startDetection };
};
