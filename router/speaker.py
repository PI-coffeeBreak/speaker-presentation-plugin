from fastapi import Depends, HTTPException, Path
from utils.api import Router
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import check_role
from ..models.speaker import Speaker as SpeakerModel
from ..schemas.speaker import SpeakerCreate, Speaker as SpeakerSchema

router = Router()

@router.post("/", response_model=SpeakerSchema)
def create_speaker(
    speaker: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers", "organizer"]))
):
    new_speaker = SpeakerModel(**speaker.dict())
    db.add(new_speaker)
    db.commit()
    db.refresh(new_speaker)
    return new_speaker

@router.get("/", response_model=list[SpeakerSchema])
def list_speakers(db: Session = Depends(get_db)):
    return db.query(SpeakerModel).all()

@router.get("/{speaker_id}", response_model=SpeakerSchema)
def get_speaker(speaker_id: int, db: Session = Depends(get_db)):
    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    return speaker

@router.put("/{speaker_id}", response_model=SpeakerSchema)
def update_speaker(
    speaker_id: int,
    speaker_data: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers", "organizer"]))
):
    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    
    for key, value in speaker_data.dict().items():
        setattr(speaker, key, value)

    db.commit()
    db.refresh(speaker)
    return speaker

@router.delete("/{speaker_id}", response_model=SpeakerSchema)
def delete_speaker(
    speaker_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers", "organizer"]))
):
    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    db.delete(speaker)
    db.commit()
    return speaker