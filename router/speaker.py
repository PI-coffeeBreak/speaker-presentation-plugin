from fastapi import Depends, HTTPException, Path, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from dependencies.database import get_db
from dependencies.auth import check_role
from ..models.speaker import Speaker as SpeakerModel
from ..schemas.speaker import SpeakerCreate, Speaker as SpeakerSchema
from services.media import MediaService
from ..utils.uuid import is_valid_uuid
from utils.api import Router

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

from ..utils.uuid import is_valid_uuid

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

    update_data = speaker_data.dict()

    # Se a imagem atual for UUID, não permite atualização direta
    if is_valid_uuid(speaker.image):
        update_data.pop("image", None)

    for key, value in update_data.items():
        setattr(speaker, key, value)

    db.commit()
    db.refresh(speaker)
    return speaker

@router.put("/{speaker_id}/image", response_model=SpeakerSchema)
def upload_speaker_image(
    speaker_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers", "organizer"]))
):
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    if is_valid_uuid(speaker.image):
        MediaService.create_or_replace(db, speaker.image, file.file, file.filename)
    else:
        media = MediaService.register(
            db=db,
            max_size=10 * 1024 * 1024,
            allows_rewrite=True,
            valid_extensions=['.jpg', '.jpeg', '.png', '.webp'],
            alias=file.filename
        )
        MediaService.create(db=db, uuid=media.uuid, data=file.file, filename=file.filename)
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
    
    if is_valid_uuid(speaker.image):
        MediaService.unregister(db, speaker.image, force=True)

    db.delete(speaker)
    db.commit()
    return speaker