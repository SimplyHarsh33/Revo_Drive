@echo off
title DriveSafe AI Backend Server
echo ========================================================
echo       Starting FastAPI Backend - DriveSafe AI
echo ========================================================
echo.
echo Launching Uvicorn ASGI server on Port 8000...
echo Make sure your webcam is ready and database is set up!
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
