from pydantic import BaseModel, Field
from typing import Optional

class SpeakerBase(BaseModel):
    name: str = Field(..., max_length=255)
    role: str = None
    description: str = None
    image: Optional[str] = None
    activity_id: Optional[int] = None
    # social media links
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    

class SpeakerCreate(BaseModel):
    name: str
    role: str = None
    description: str = None
    image: Optional[str] = None
    activity_id: Optional[int] = None
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None

class Speaker(SpeakerBase):
    id: int

    class Config:
        from_attributes = True
