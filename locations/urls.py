from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, LocationOverrideViewSet

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------


router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'location-overrides', LocationOverrideViewSet, basename='location-override')

urlpatterns = router.urls
