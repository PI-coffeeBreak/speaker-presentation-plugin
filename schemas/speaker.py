from pydantic import BaseModel, Field
from typing import Optional

class SpeakerBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str
    image: Optional[str] = None
    activity_id: Optional[int] = None

class SpeakerCreate(BaseModel):
    name: str
    description: str = None
    image: Optional[str] = None
    activity_id: Optional[int] = None

class Speaker(SpeakerBase):
    id: int

    class Config:
        from_attributes = True
