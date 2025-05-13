from pydantic import Field
from schemas.ui.page import BaseComponentSchema
from typing import List, Optional, Literal
from .speaker import Speaker as SpeakerSchema
from enum import Enum


class Speaker(BaseComponentSchema):
    name: Literal["Speaker"] = Field(default="Speaker", title="Component Name")


class SpeakerCardStyle(str, Enum):
    SIMPLE = "simple"
    DETAILED = "detailed"
    GRID = "grid"


class SpeakerComponent(BaseComponentSchema):
    """
    Component to display speakers information
    
    This component can show one or multiple speakers with optional
    information about their activities.
    """
    title: str = Field(default="Speakers", description="Component title")
    description: str = Field(default=None, description="Optional component description")
    display_style: SpeakerCardStyle = Field(default=SpeakerCardStyle.SIMPLE, description="How to display speaker cards")
    activity: Optional[int] = Field(default=None, description="ID of the activity to filter speakers by")
