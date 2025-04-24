from fastapi import Depends, HTTPException, Path
from utils.api import Router
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import check_role
from ..models.speaker import Speaker as SpeakerModel
from ..schemas.speaker import SpeakerCreate, Speaker as SpeakerSchema
from services.media import MediaService

router = Router()

@router.post("/", response_model=SpeakerSchema)
def create_speaker(
    speaker: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers", "organizer"]))
):
    existing_speaker = db.query(SpeakerModel).filter_by(name=speaker.name).first()
    if existing_speaker:
        raise HTTPException(status_code=400, detail="Speaker already exists")
    
    media = MediaService.register(
        db=db,
        max_size=50 * 1024 * 1024,
        allows_rewrite=True,
        valid_extensions=['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        alias="speaker_image"
    )

    db_speaker = SpeakerModel(
        **speaker.model_dump(exclude={"image"}),
        image=media.uuid
    )
    db.add(db_speaker)
    db.commit()
    db.refresh(db_speaker)
    return db_speaker

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
    
    # Update basic fields
    speaker.name = speaker_data.name
    speaker.description = speaker_data.description
    
    # Only update image if it's different from the current one
    if speaker_data.image != speaker.image:
        # Register new media for the image
        media = MediaService.register(
            db=db,
            max_size=50 * 1024 * 1024,
            allows_rewrite=True,
            valid_extensions=['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            alias="speaker_image"
        )
        speaker.image = media.uuid

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

