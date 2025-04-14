from utils.api import Router
from .router import router
from .schemas.speaker_component import Speaker
from services.component_registry import ComponentRegistry


def register_plugin():
    ComponentRegistry.register_component(Speaker)
    print("Speaker presentation plugin registered.")
    return router


def unregister_plugin():
    ComponentRegistry.unregister_component("Speaker")
    print("Speaker presentation plugin unregistered.")


REGISTER = register_plugin
UNREGISTER = unregister_plugin