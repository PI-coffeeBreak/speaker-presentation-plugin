from pydantic import BaseModel
from typing import Optional

class SpeakerBase(BaseModel):
    name: str
    description: str
    image: Optional[str] = None

class SpeakerCreate(SpeakerBase):
    pass

class Speaker(SpeakerBase):
    id: int

    class Config:
        from_attributes = True
