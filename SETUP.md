# DriveSafe AI — Setup Guide

Run the full stack (backend + frontend) on **any** machine in minutes.

---

## Prerequisites

| Tool | Required Version | Download |
|------|-----------------|---------|
| Python | 3.10 or 3.11 | https://python.org/downloads |
| Node.js | 18+ (LTS) | https://nodejs.org |
| npm | comes with Node.js | — |
| Git | any | https://git-scm.com |

---

## 1 — Clone the project

```bash
git clone <your-repo-url>
cd RevoDrive
```

---

## 2 — Backend Setup (FastAPI)

### a) Create a virtual environment (recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### b) Install all backend dependencies
```bash
pip install -r requirements.txt
```

### c) Start the backend server
```bash
uvicorn main:app --reload
```

✅ Backend runs at: **http://127.0.0.1:8000**  
📖 API docs at: **http://127.0.0.1:8000/docs**

---

## 3 — Frontend Setup (React + Vite)

Open a **new terminal window** (keep backend running).

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

---

## 4 — Running Both Together (Quick Reference)

| Terminal | Command | URL |
|----------|---------|-----|
| Terminal 1 | `uvicorn main:app --reload` (run from `RevoDrive/`) | http://127.0.0.1:8000 |
| Terminal 2 | `npm run dev` (run from `RevoDrive/frontend/`) | http://localhost:5173 |

---

## Troubleshooting

### `ModuleNotFoundError` on backend start
Make sure your virtual environment is activated before running uvicorn.

### Frontend can't reach backend (CORS / network error)
The backend already allows all origins (`*`) in development. Make sure the backend is running **before** opening the frontend.

### Port already in use
```bash
# Run backend on a different port
uvicorn main:app --reload --port 8001
```

### `npm install` fails
Delete `node_modules` and `package-lock.json` then retry:
```bash
rm -rf node_modules package-lock.json
npm install
```
