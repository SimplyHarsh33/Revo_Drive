# Makefile for RevoDrive / DriveSafe AI
# Owner: Hemant (DevOps)

.PHONY: install start-backend start-frontend db-setup clean

install:
	pip install -r requirements.txt
	cd frontend && npm install

start-backend:
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

start-frontend:
	cd frontend && npm run dev

db-setup:
	python scripts/setup_database.py

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

clean:
	rm -rf __pycache__
	rm -rf frontend/node_modules
