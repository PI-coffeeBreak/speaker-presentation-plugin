from pydantic import Field
from schemas.ui.page import BaseComponentSchema
from typing import Literal


class Speaker(BaseComponentSchema):
    name: Literal["Speaker"] = Field(default="Speaker", title="Component Name")
