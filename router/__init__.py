from coffeebreak.api import Router
from .speaker import router as speaker_router

router = Router()
router.include_router(speaker_router, "/speakers")

__all__ = ["router"]