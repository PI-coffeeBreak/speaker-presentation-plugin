from utils.api import Router
from .router import router
from .schemas.speaker_component import SpeakerComponent
from services.component_registry import ComponentRegistry
import logging

logger = logging.getLogger("coffeebreak.plugins.speaker")


def register_plugin():
    ComponentRegistry.register_component(SpeakerComponent)
    logger.debug("Speaker presentation plugin registered.")
    return router


def unregister_plugin():
    ComponentRegistry.unregister_component("SpeakerComponent")
    logger.debug("Speaker presentation plugin unregistered.")

REGISTER = register_plugin
UNREGISTER = unregister_plugin