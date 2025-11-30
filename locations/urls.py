from .views import LocationViewSet, LocationOverrideViewSet
from rest_framework.routers import DefaultRouter
# -----------------------------------
# :: URL Patterns
# -----------------------------------

"""
Define URL routing for the count/location app.
"""

router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'location-overrides', LocationOverrideViewSet, basename='location-override')

urlpatterns = router.urls
