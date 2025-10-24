from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from coffeebreak.db import DB as get_db
from coffeebreak.auth import check_role
from ..models.speaker import Speaker as SpeakerModel
from ..schemas.speaker import SpeakerCreate, Speaker as SpeakerSchema
from ..services.speaker_service import SpeakerService
from coffeebreak import Router

router = Router()

@router.post("/", response_model=SpeakerSchema)
def create_speaker(
    speaker: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    """Create a new speaker"""
    try:
        return SpeakerService(db).create(speaker)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/", response_model=List[SpeakerSchema])
def list_speakers(
    activity_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all speakers, optionally filtered by activity_id"""
    try:
        return SpeakerService(db).get_all(activity_id=activity_id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/{speaker_id}", response_model=SpeakerSchema)
def get_speaker(speaker_id: int, db: Session = Depends(get_db)):
    """Get a specific speaker by ID"""
    try:
        speaker = SpeakerService(db).get_by_id(speaker_id)
        if not speaker:
            raise HTTPException(status_code=404, detail="Speaker not found")
        return speaker
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/{speaker_id}", response_model=SpeakerSchema)
def update_speaker(
    speaker_id: int,
    speaker_data: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    """Update a speaker"""
    try:
        speaker = SpeakerService(db).get_by_id(speaker_id)
        if not speaker:
            raise HTTPException(status_code=404, detail="Speaker not found")
        return SpeakerService(db).update(speaker_id, speaker_data)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.patch("/{speaker_id}", response_model=SpeakerSchema)
def partial_update_speaker(
    speaker_id: int,
    speaker_data: SpeakerCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    """Partially update a speaker"""
    try:
        speaker = SpeakerService(db).get_by_id(speaker_id)
        if not speaker:
            raise HTTPException(status_code=404, detail="Speaker not found")
        return SpeakerService(db).update(speaker_id, speaker_data)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/{speaker_id}", response_model=SpeakerSchema)
def delete_speaker(
    speaker_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    """Delete a speaker"""
    try:
        speaker = SpeakerService(db).get_by_id(speaker_id)
        if not speaker:
            raise HTTPException(status_code=404, detail="Speaker not found")
        SpeakerService(db).delete(speaker_id)
        return speaker
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/{speaker_id}/image", response_model=SpeakerSchema)
def remove_speaker_image(
    speaker_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(check_role(["manage_speakers"]))
):
    """Remove a speaker's image"""
    try:
        speaker = SpeakerService(db).get_by_id(speaker_id)
        if not speaker:
            raise HTTPException(status_code=404, detail="Speaker not found")
        return SpeakerService(db).remove_image(speaker_id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/by-activity/{activity_id}", response_model=List[SpeakerSchema])
def get_speakers_by_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):
    """Get all speakers for a specific activity"""
    try:
        return SpeakerService(db).get_all(activity_id=activity_id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
