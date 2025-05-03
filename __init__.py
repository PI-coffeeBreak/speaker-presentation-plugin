from .router import router
from .schemas.speaker_component import SpeakerComponent
from services.component_registry import ComponentRegistry
from services.ui.plugin_settings import create_plugin_setting, delete_plugin_setting_by_title
from schemas.plugin_setting import PluginSetting
import logging

logger = logging.getLogger("coffeebreak.speaker")

PLUGIN_TITLE = "speaker-presentation-plugin"
PLUGIN_DESCRIPTION = "A plugin for presenting speakers in a conference or event setting."

async def register_plugin():
    ComponentRegistry.register_component(SpeakerComponent)
    logger.debug("Speaker presentation plugin registered.")

    setting = PluginSetting(
        title=PLUGIN_TITLE,
        description=PLUGIN_DESCRIPTION,
        inputs=[]
    )
    await create_plugin_setting(setting)

    return router

async def unregister_plugin():
    ComponentRegistry.unregister_component("SpeakerComponent")
    await delete_plugin_setting_by_title(PLUGIN_TITLE)
    logger.debug("Speaker presentation plugin unregistered.")

REGISTER = register_plugin
UNREGISTER = unregister_plugin

SETTINGS = {}
DESCRIPTION = PLUGIN_DESCRIPTION

CONFIG_PAGE = True
