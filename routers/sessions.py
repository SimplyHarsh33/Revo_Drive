from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.db import get_db
from models import schemas
from services import session_logger

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"]
)

@router.post("/", response_model=schemas.Session)
def start_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    return session_logger.create_session(db=db, session=session)

@router.get("/", response_model=List[schemas.Session])
def read_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sessions = session_logger.get_sessions(db, skip=skip, limit=limit)
    return sessions

@router.get("/{session_id}", response_model=schemas.Session)
def read_session(session_id: int, db: Session = Depends(get_db)):
    db_session = session_logger.get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session

@router.put("/{session_id}/end", response_model=schemas.Session)
def end_session(session_id: int, db: Session = Depends(get_db)):
    db_session = session_logger.end_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session
