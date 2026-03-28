# Backend Dockerfile for Railway / Render Deployment
FROM python:3.10-slim

WORKDIR /app

# Install dependencies first for Docker caching layer optimization
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
