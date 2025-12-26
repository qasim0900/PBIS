from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, LocationOverrideViewSet

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------

""" 
Registers `Location` and `LocationOverride` viewsets with the router for REST API endpoints.
"""
router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'location-overrides', LocationOverrideViewSet,
                basename='location-override')


# -----------------------------------
# :: URL Pattren
# -----------------------------------

""" 
Includes all the registered router URLs in the `urlpatterns` for the Django app.
"""

urlpatterns = router.urls
