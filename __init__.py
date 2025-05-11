from .schemas.speaker_component import SpeakerComponent
from services.component_registry import ComponentRegistry
import logging

logger = logging.getLogger("coffeebreak.speaker")

PLUGIN_TITLE = "speaker-presentation-plugin"
NAME = "Speaker Presentation"
DESCRIPTION = "A plugin for presenting speakers in a conference or event setting."

async def register_plugin():
    ComponentRegistry.register_component(SpeakerComponent)
    logger.debug("Speaker presentation plugin registered.")

async def unregister_plugin():
    ComponentRegistry.unregister_component("SpeakerComponent")
    logger.debug("Speaker presentation plugin unregistered.")

REGISTER = register_plugin
UNREGISTER = unregister_plugin

CONFIG_PAGE = True
