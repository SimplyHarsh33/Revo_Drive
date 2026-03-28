/**
 * EAR (Eye Aspect Ratio) and MAR (Mouth Aspect Ratio) Calculator
 * Based on Soukupova & Cech 2016 paper.
 */

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

// Euclidean distance between two 3D landmarks
const euclideanDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark): number => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + 
    Math.pow(p1.y - p2.y, 2) + 
    Math.pow(p1.z - p2.z, 2)
  );
};

/**
 * Calculates EAR for one eye given 6 specific landmarks.
 * p1 = Left/Right corner
 * p2, p3 = Top landmarks
 * p4 = Right/Left corner
 * p5, p6 = Bottom landmarks
 */
export const calculateEAR = (landmarks: NormalizedLandmark[], indices: number[]): number => {
  if (!landmarks || indices.length < 6) return 0;

  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const vertical1 = euclideanDistance(p2, p6);
  const vertical2 = euclideanDistance(p3, p5);
  const horizontal = euclideanDistance(p1, p4);

  // EAR formula: (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
  return (vertical1 + vertical2) / (2.0 * horizontal);
};

export const calculateMAR = (landmarks: NormalizedLandmark[], indices: number[]): number => {
  // MAR formula for yawning
  if (!landmarks || indices.length < 6) return 0;
  
  const vertical = euclideanDistance(landmarks[indices[2]], landmarks[indices[5]]); // upper lip to lower lip
  const horizontal = euclideanDistance(landmarks[indices[0]], landmarks[indices[3]]); // left corner to right corner
  
  return vertical / horizontal;
};

// Calculate the final 0-100 Drowsiness Score
export const calculateDrowsinessScore = (leftEAR: number, rightEAR: number, EAR_THRESHOLD = 0.25): number => {
  const avgEAR = (leftEAR + rightEAR) / 2.0;
  
  // If EAR is above threshold, drowsiness is 0.
  // If EAR drops below threshold, score shoots up to 100.
  if (avgEAR >= EAR_THRESHOLD) {
    return 0; // Fully awake
  }
  
  // Scale between 0 and 100 based on how far below threshold it is
  const severity = (EAR_THRESHOLD - avgEAR) / EAR_THRESHOLD; 
  return Math.min(Math.round(severity * 100 * 3), 100); 
};
