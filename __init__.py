from .router import router

def register_plugin():
    print("Speaker management plugin registered.")

def unregister_plugin():
    print("Speaker management plugin unregistered.")

REGISTER = register_plugin
UNREGISTER = unregister_plugin
