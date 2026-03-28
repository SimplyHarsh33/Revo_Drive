from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EventBase(BaseModel):
    event_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class EventCreate(EventBase):
    session_id: int

class Event(EventBase):
    id: int
    session_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionBase(BaseModel):
    pass

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    events: List[Event] = []

    class Config:
        from_attributes = True
