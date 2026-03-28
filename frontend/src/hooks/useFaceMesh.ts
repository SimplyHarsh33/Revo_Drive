import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { calculateEAR, calculateDrowsinessScore } from '../utils/earCalculator';

// Landmark indices for eyes
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

export const useFaceMesh = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [drowsinessScore, setDrowsinessScore] = useState(0);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    async function initModel() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      
      faceLandmarkerRef.current = landmarker;
      setIsLoaded(true);
      console.log("FaceMesh Model Loaded (WASM/GPU)");
    }
    initModel();

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startInference = useCallback(() => {
    if (!faceLandmarkerRef.current || !videoRef.current) return;
    const video = videoRef.current;
    
    let lastVideoTime = -1;
    
    const analyzeFrame = () => {
      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        lastVideoTime = video.currentTime;
        const results = faceLandmarkerRef.current!.detectForVideo(video, performance.now());
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          
          const leftEAR = calculateEAR(landmarks, LEFT_EYE);
          const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
          
          const score = calculateDrowsinessScore(leftEAR, rightEAR, 0.25);
          setDrowsinessScore(score);
        } else {
          setDrowsinessScore(0); // No face detected
        }
      }
      
      animationRef.current = requestAnimationFrame(analyzeFrame);
    };
    
    analyzeFrame();
  }, [videoRef]);

  return { isLoaded, drowsinessScore, startInference };
};
