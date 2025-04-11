from pydantic import BaseModel, Field
from schemas.ui.page import BaseComponentSchema


class SpeakerComponent(BaseComponentSchema):
    name: str = Field(..., description="Speaker name")
    description: str = Field(..., description="Speaker description")
    image: str = Field(..., description="Speaker image URL")
