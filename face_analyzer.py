"""
ML Core Component: face_analyzer.py (Mallika)
Domain: Computer Vision Core + Project Architecture
Python-side EAR/MAR via scipy meant for backend validation or batch processing.
"""

from scipy.spatial import distance as dist

def euclidean_distance(pt1, pt2):
    return dist.euclidean(pt1, pt2)

def calculate_ear(eye_landmarks):
    """
    Computes the Eye Aspect Ratio (EAR).
    eye_landmarks is a list of 6 (x, y) tuples representing the eye.
    Based on Soukupova & Cech 2016 paper.
    """
    if len(eye_landmarks) < 6:
        return 0.0

    # Vertical eye distances (|p2-p6| and |p3-p5|)
    A = euclidean_distance(eye_landmarks[1], eye_landmarks[5])
    B = euclidean_distance(eye_landmarks[2], eye_landmarks[4])

    # Horizontal eye distance (|p1-p4|)
    C = euclidean_distance(eye_landmarks[0], eye_landmarks[3])

    if C == 0:
        return 0.0

    # EAR calculation
    ear = (A + B) / (2.0 * C)
    return ear

def check_drowsiness(left_eye, right_eye, ear_threshold=0.25):
    """
    Checks if the combined EAR is below the drowsiness threshold.
    Returns boolean (True if drowsy) and the calculated composite EAR.
    """
    left_ear = calculate_ear(left_eye)
    right_ear = calculate_ear(right_eye)
    
    avg_ear = (left_ear + right_ear) / 2.0
    
    is_drowsy = avg_ear < ear_threshold
    return is_drowsy, avg_ear
