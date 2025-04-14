from schemas.ui.page import BaseComponentSchema
from schemas.ui.components.text import Text
from schemas.ui.components.title import Title
from schemas.ui.components.image import Image
from typing import Optional, Dict
from pydantic import Field


class SpeakerComponent(BaseComponentSchema):
    title: Title = Field(..., description="Name/title of the speaker")
    description: Text = Field(..., description="Speaker biography or description")
    image: Image = Field(..., description="Speaker image")
    contacts: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Speaker contacts (email, LinkedIn, etc.)"
    )