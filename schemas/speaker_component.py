from pydantic import BaseModel, Field
from schemas.ui.page import BaseComponentSchema


class SpeakerComponent(BaseComponentSchema):
    name: str = Field(..., description="Speaker name")
    description: str = Field(..., description="Speaker description")
    image: str = Field(..., description="Speaker image URL")
    contacts: dict = Field(
        default_factory=dict,
        description="Optional dictionary with contact methods (e.g., email, linkedin)"
    )
