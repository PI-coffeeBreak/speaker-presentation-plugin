from pydantic import BaseModel, Field
from typing import Optional, Dict

class SpeakerBase(BaseModel):
    name: str
    description: str
    image: str
    contacts: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Optional dictionary with contact methods (e.g., email, linkedin)"
    )

class SpeakerCreate(SpeakerBase):
    pass

class Speaker(SpeakerBase):
    id: int

    class Config:
        from_attributes = True
