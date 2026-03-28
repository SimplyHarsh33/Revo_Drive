@echo off
echo Initializing React app...
call npx --yes create-vite@latest frontend --template react-ts
cd frontend
echo Installing dependencies...
call npm install
call npm install framer-motion "@tensorflow/tfjs" "@tensorflow-models/coco-ssd" "@mediapipe/tasks-vision"
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p
echo Frontend setup complete!
