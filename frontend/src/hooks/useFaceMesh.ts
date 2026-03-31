import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { calculateEAR, calculateMAR, calculateDrowsinessScore } from '../utils/earCalculator';

const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
// MOUTH indices matched to calculateMAR expectations (left_corner, _, top_lip, right_corner, _, bottom_lip)
const MOUTH = [61, 0, 13, 291, 0, 14]; 

export const useFaceMesh = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isPaused: boolean = false
) => {
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [drowsinessScore, setDrowsinessScore] = useState(0);
  const [isYawning, setIsYawning] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
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
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      
      faceLandmarkerRef.current = landmarker;
      setIsLoaded(true);
      console.log("FaceMesh Model Loaded with Drawing Output");
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
    if (!faceLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure 2D context exists for DrawingUtils
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const drawingUtils = new DrawingUtils(ctx);
    let lastVideoTime = -1;
    
    const analyzeFrame = () => {
      if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.currentTime !== lastVideoTime && video.readyState >= 2 && video.videoWidth > 0) {
        lastVideoTime = video.currentTime;
        
        if (isPausedRef.current) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setDrowsinessScore(0);
          setIsYawning(false);
          animationRef.current = requestAnimationFrame(analyzeFrame);
          return;
        }

        const results = faceLandmarkerRef.current!.detectForVideo(video, performance.now());
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          
          // Draw the beautiful High-Tech Grid Over The Face
          // drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#3B82F660", lineWidth: 1 }) -> HEAVY ON CPU
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#EF4444", lineWidth: 2 } // Aggressive red for eyes
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#EF4444", lineWidth: 2 }
          );

          // Calculate Drowsiness (EAR) using Mallika's Algorithm
          const leftEAR = calculateEAR(landmarks, LEFT_EYE);
          const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
          const score = calculateDrowsinessScore(leftEAR, rightEAR, 0.25);
          setDrowsinessScore(score);

          // Calculate Yawning (MAR)
          const mar = calculateMAR(landmarks, MOUTH);
          setIsYawning(mar > 0.5); // If mouth is wide open, threshold is ~0.5

          // ----------------------------------------------------
          // Calculate Head Pose (Distracted Gaze)
          // We use physical 3D Face Landmarks because Matrix math can fail if WebGL features differ!
          // ----------------------------------------------------
          const nose = landmarks[1];
          const leftSide = landmarks[33];   // left eye outer corner
          const rightSide = landmarks[263]; // right eye outer corner
          
          // If looking straight, the nose is perfectly in the middle (ratio ~1.0)
          const leftDist = Math.abs(nose.x - leftSide.x);
          const rightDist = Math.abs(rightSide.x - nose.x);
          
          const headYawRatio = leftDist / (rightDist + 0.000001);
          
          // Yaw check: > 2.0 = sharp right turn, < 0.5 = sharp left turn
          const isYawAway = headYawRatio > 2.0 || headYawRatio < 0.5;
          
          // Pitch check (Up/Down): Use forehead(10), nose(1), chin(152)
          const forehead = landmarks[10];
          const chin = landmarks[152];
          
          const faceHeight = Math.abs(chin.y - forehead.y) + 0.000001;
          const noseFromTop = Math.abs(nose.y - forehead.y);
          const pitchRatio = noseFromTop / faceHeight;
          
          // Straight ahead: ratio ~0.55-0.65
          // Looking down (phone in lap): ratio > 0.75 (nose moves toward chin)
          // Looking up (away from road): ratio < 0.42 (nose moves toward forehead)
          const isPitchAway = pitchRatio > 0.75 || pitchRatio < 0.42;
          
          setIsDistracted(isYawAway || isPitchAway);

        } else {
          setDrowsinessScore(0); 
          setIsYawning(false);
          setIsDistracted(false);
        }
      }
      
      animationRef.current = requestAnimationFrame(analyzeFrame);
    };
    
    analyzeFrame();
  }, [videoRef, canvasRef]);

  return { isLoaded, drowsinessScore, isYawning, isDistracted, startInference };
};
