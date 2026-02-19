from .router import router
from .schemas.speaker_component import SpeakerComponent
from coffeebreak import ComponentRegistry


def REGISTER():
    ComponentRegistry.register_component(SpeakerComponent)


def UNREGISTER():
    ComponentRegistry.unregister_component("SpeakerComponent")
