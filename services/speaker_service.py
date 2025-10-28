from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from ..models.speaker import Speaker as SpeakerModel
from ..schemas.speaker import SpeakerCreate
from coffeebreak.models import ActivityModel as Activity
from coffeebreak import MediaService
from ..utils.media import is_valid_uuid, is_valid_url, slugify
from uuid import uuid4
from fastapi import HTTPException

class SpeakerService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, activity_id: Optional[int] = None) -> List[SpeakerModel]:
        """Get all speakers, optionally filtered by activity, ordered by order field then name"""
        query = self.db.query(SpeakerModel)
        if activity_id is not None:
            query = query.filter(SpeakerModel.activity_id == activity_id)
        return query.order_by(SpeakerModel.order.asc(), SpeakerModel.name.asc()).all()
    
    def get_by_id(self, speaker_id: int) -> SpeakerModel:
        """Get a speaker by ID"""
        speaker = self.db.query(SpeakerModel).filter(SpeakerModel.id == speaker_id).first()
        if not speaker:
            raise HTTPException(status_code=404, detail="Speaker not found")
        return speaker
    
    def create(self, speaker_data: SpeakerCreate) -> SpeakerModel:
        """Create a new speaker"""
        # Handle image
        image = speaker_data.image

        if not image or not is_valid_url(image):
            alias = f"{slugify(speaker_data.name)}-{uuid4()}"
            media = MediaService.register(
                db=self.db,
                max_size=10 * 1024 * 1024,
                allows_rewrite=True,
                valid_extensions=['.jpg', '.jpeg', '.png', '.webp'],
                alias=alias
            )
            image = media.uuid

        # Check if activity exists when activity_id is provided
        if speaker_data.activity_id:
            activity = self.db.query(Activity).filter(Activity.id == speaker_data.activity_id).first()
            if not activity:
                raise HTTPException(status_code=404, detail="Activity not found")

        # Create speaker
        new_speaker = SpeakerModel(
            name=speaker_data.name,
            role=speaker_data.role,
            description=speaker_data.description,
            image=image,
            activity_id=speaker_data.activity_id,
            order=speaker_data.order if speaker_data.order is not None else 0,
            linkedin=speaker_data.linkedin,
            facebook=speaker_data.facebook,
            instagram=speaker_data.instagram,
            youtube=speaker_data.youtube
        )

        self.db.add(new_speaker)
        self.db.commit()
        self.db.refresh(new_speaker)
        return new_speaker

    def create_many(self, speakers_data: List[SpeakerCreate]) -> List[SpeakerModel]:
        """Create multiple speakers in batch"""
        new_speakers = []

        for speaker_data in speakers_data:
            # Handle image
            image = speaker_data.image

            if not image or not is_valid_url(image):
                alias = f"{slugify(speaker_data.name)}-{uuid4()}"
                media = MediaService.register(
                    db=self.db,
                    max_size=10 * 1024 * 1024,
                    allows_rewrite=True,
                    valid_extensions=['.jpg', '.jpeg', '.png', '.webp'],
                    alias=alias
                )
                image = media.uuid

            # Check if activity exists when activity_id is provided
            if speaker_data.activity_id:
                activity = self.db.query(Activity).filter(Activity.id == speaker_data.activity_id).first()
                if not activity:
                    raise HTTPException(status_code=404, detail=f"Activity with id {speaker_data.activity_id} not found")

            # Create speaker
            new_speaker = SpeakerModel(
                name=speaker_data.name,
                role=speaker_data.role,
                description=speaker_data.description,
                image=image,
                activity_id=speaker_data.activity_id,
                linkedin=speaker_data.linkedin,
                facebook=speaker_data.facebook,
                instagram=speaker_data.instagram,
                youtube=speaker_data.youtube
            )

            self.db.add(new_speaker)
            new_speakers.append(new_speaker)

        self.db.commit()
        for speaker in new_speakers:
            self.db.refresh(speaker)

        return new_speakers
    
    def update(self, speaker_id: int, speaker_data: SpeakerCreate) -> SpeakerModel:
        """Update an existing speaker"""
        speaker = self.get_by_id(speaker_id)
        
        # Check if activity exists when activity_id is provided
        if speaker_data.activity_id:
            activity = self.db.query(Activity).filter(Activity.id == speaker_data.activity_id).first()
            if not activity:
                raise HTTPException(status_code=404, detail="Activity not found")

        # Handle image changes
        update_data = speaker_data.model_dump(exclude_unset=True)
        new_image = update_data.get("image")
        
        if new_image:
            print(f"Updating speaker image. Old: {speaker.image}, New: {new_image}")
            if is_valid_uuid(speaker.image) and is_valid_url(new_image):
                # Replace stored image with external URL
                MediaService.unregister(self.db, speaker.image, force=True)
                speaker.image = new_image
            elif is_valid_uuid(speaker.image) and not is_valid_url(new_image):
                # Ignore invalid new image, keep existing one
                update_data.pop("image", None)
            elif is_valid_url(speaker.image) and not is_valid_url(new_image):
                # Replace external URL with stored image
                media = MediaService.register(
                    db=self.db,
                    max_size=10 * 1024 * 1024,
                    allows_rewrite=True,
                    valid_extensions=['.jpg', '.jpeg', '.png', '.webp'],
                    alias=f"{slugify(speaker.name)}-{uuid4()}"
                )
                speaker.image = media.uuid
            else:
                # Both are URLs or other cases, simply update
                speaker.image = new_image
        
        # Update all other fields
        for key, value in update_data.items():
            if key != "image":  # Skip image as we handled it separately
                setattr(speaker, key, value)

        self.db.commit()
        self.db.refresh(speaker)
        return speaker
    
    def delete(self, speaker_id: int) -> SpeakerModel:
        """Delete a speaker"""
        speaker = self.get_by_id(speaker_id)
        
        # Clean up media resource if it's a UUID
        if is_valid_uuid(speaker.image):
            MediaService.unregister(self.db, speaker.image, force=True)

        # Create a copy of the speaker data before deleting
        speaker_copy = SpeakerModel(
            id=speaker.id,
            name=speaker.name,
            role=speaker.role,
            description=speaker.description,
            image=speaker.image,
            activity_id=speaker.activity_id,
            linkedin=speaker.linkedin,
            facebook=speaker.facebook,
            instagram=speaker.instagram,
            youtube=speaker.youtube
        )
        
        self.db.delete(speaker)
        self.db.commit()
        return speaker_copy
    
    def remove_image(self, speaker_id: int) -> SpeakerModel:
        """Remove a speaker's image"""
        speaker = self.get_by_id(speaker_id)
        
        if not speaker.image:
            raise HTTPException(status_code=404, detail="Speaker has no image")
            
        if is_valid_uuid(speaker.image):
            MediaService.unregister(self.db, speaker.image, force=True)
        
        speaker.image = None
        self.db.commit()
        self.db.refresh(speaker)
        return speaker