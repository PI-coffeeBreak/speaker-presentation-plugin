from pydantic import BaseModel

class SpeakerBase(BaseModel):
    name: str
    description: str
    image: str

class SpeakerCreate(SpeakerBase):
    pass

class Speaker(SpeakerBase):
    id: int

    class Config:
        from_attributes = True
