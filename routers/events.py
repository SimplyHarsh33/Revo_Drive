from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models import schemas
from services import session_logger

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.post("/", response_model=schemas.Event)
def log_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_session = session_logger.get_session(db, session_id=event.session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_logger.log_event(db=db, event=event)
