from pydantic import BaseModel, Field
from typing import Optional

class SpeakerBase(BaseModel):
    name: str = Field(..., max_length=255)
    role: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    activity_id: Optional[int] = None
    order: Optional[int] = 0
    # social media links
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None


class SpeakerCreate(BaseModel):
    name: str
    role: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    activity_id: Optional[int] = None
    order: Optional[int] = 0
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None

class Speaker(SpeakerBase):
    id: int

    class Config:
        from_attributes = True
