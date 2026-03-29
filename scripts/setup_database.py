import os
import sys

# Append root to path so we can import models and db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import engine, Base
from database.models import Session, Event

def initialize_database():
    """
    (Hemant - DevOps Automation Script)
    Drops existing databases and recreates the tables to assert a clean environment 
    for the FastAPI orchestrator before cloud deployment.
    """
    print("Initiating database reset...")
    Base.metadata.drop_all(bind=engine)
    print("Dropped old tables.")
    
    Base.metadata.create_all(bind=engine)
    print("Successfully built clean PostgreSQL / SQLite structures based on Harsh's SQLAlchemy models.")
    print("Database is ready to accept telemetry traffic from the UI stream.")

if __name__ == "__main__":
    initialize_database()
