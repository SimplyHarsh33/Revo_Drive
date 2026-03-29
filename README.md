# DriveSafe AI (Advanced Edge AI Telemetry)

![DriveSafe Architecture](https://img.shields.io/badge/Architecture-FastAPI%20%7C%20React-blue)
![AI Models](https://img.shields.io/badge/Edge%20AI-MediaPipe%20%7C%20TF.js-red)

DriveSafe AI is a privacy-first, zero-cost Edge AI telematics solution designed to seamlessly monitor driver drowsiness, inactions, and distracted behaviors directly inside the browser. It implements sophisticated algorithmic approaches (like EAR and MAR calculation over 468 facial 3D landmarks) leveraging client GPUs via WebAssembly and WebGL.

## 🚀 Key Features
* **Zero-Server Inference:** MediaPipe and TensorFlow.js models load and execute 100% on the client's laptop camera, enforcing total video-privacy design.
* **Eye Aspect Ratio (EAR):** Tracks millisecond-accurate eyelid dropping frequency to detect micro-sleep conditions and sound real-time alarms.
* **Mouth Aspect Ratio (MAR):** Computes lip stretching bounds to identify heavy yawning.
* **COCO-SSD TF.js Engine:** Specifically polls every 5 frames via WebGL acceleration to flag illegal cell phone use without choking the UI thread.
* **FastAPI Persistence:** Background WebSocket events and telemetry dumps securely flow into a PostgreSQL schema orchestrated by Docker.

## ⚙️ Team Credits & Engineering Leads
* **Harsh** - Backend System Architecture, FastAPI Design, and Data Modeling (Lead)
* **Jivit** - Senior UI/UX Integration, React Hooks, and Web Audio API Management
* **Mallika** - Computer Vision Core Algorithms (EarCalculator | MAR/MediaPipe Mesh Logic)
* **Divyanshu** - Machine Learning (TensorFlow.js & Canvas Visual Tracking/Bounding Boxes)
* **Hemant** - Cloud DevOps, Deployment Scripting, & Database Orchestration

## 🔌 Quickstart
Make sure you have `Docker`, `Python 3.10`, and `Node 20+` installed.

```bash
# Build the Python Backend & DB Services
make start-backend

# Spin up the AI Visualizer Dashboard
make start-frontend
```

## 🛠 Project Structure
* `/frontend`: React + Vite UI + Edge ML Hooks.
* `/database`: SQLite / PostgreSQL definitions.
* `/models`: Pydantic input/output schemas.
* `/routers`: FastAPI endpoint logic.
* `main.py`: Core orchestration.
