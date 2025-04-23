from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from dependencies.database import get_db
from dependencies.auth import check_role
from ..models.speaker import Speaker as SpeakerModel
from ..schemas.speaker import SpeakerCreate, Speaker as SpeakerSchema
from services.media import MediaService
from ..utils.media import is_valid_uuid, is_valid_url, slugify
from utils.api import Router
from uuid import uuid4

router = Router()

@router.post("/", response_model=SpeakerSchema)
def create_speaker(
    speaker: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    image = speaker.image

    if not image or not is_valid_url(image):
        alias = f"{slugify(speaker.name)}-{uuid4()}"
        media = MediaService.register(
            db=db,
            max_size=10 * 1024 * 1024,
            allows_rewrite=True,
            valid_extensions=['.jpg', '.jpeg', '.png', '.webp'],
            alias=alias
        )
        image = media.uuid

    new_speaker = SpeakerModel(**speaker.dict(exclude={"image"}), image=image)
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
    user: dict = Depends(check_role(["manage_speakers"]))
):
    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    update_data = speaker_data.dict(exclude_unset=True)
    new_image = update_data.get("image")

    if new_image:
        if is_valid_uuid(speaker.image) and is_valid_url(new_image):
            MediaService.unregister(db, speaker.image, force=True)
        elif is_valid_uuid(speaker.image) and not is_valid_url(new_image):
            update_data.pop("image", None)
        elif is_valid_url(speaker.image) and not is_valid_url(new_image):
            media = MediaService.register(
                db=db,
                max_size=10 * 1024 * 1024,
                allows_rewrite=True,
                valid_extensions=['.jpg', '.jpeg', '.png', '.webp'],
                alias=f"{slugify(speaker.name)}-{uuid4()}"
            )
            update_data["image"] = media.uuid

    for key, value in update_data.items():
        setattr(speaker, key, value)

    db.commit()
    db.refresh(speaker)
    return speaker

@router.delete("/{speaker_id}", response_model=SpeakerSchema)
def delete_speaker(
    speaker_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    if is_valid_uuid(speaker.image):
        MediaService.unregister(db, speaker.image, force=True)

    db.delete(speaker)
    db.commit()
    return speaker

@router.delete("/{speaker_id}/image", response_model=SpeakerSchema)
def remove_speaker_image(
    speaker_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    speaker = db.query(SpeakerModel).filter_by(id=speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    if is_valid_uuid(speaker.image):
        MediaService.unregister(db, speaker.image, force=True)
    else:
        raise HTTPException(status_code=404, detail="Current image is external or not found")

    speaker.image = None
    db.commit()
    db.refresh(speaker)
    return speaker