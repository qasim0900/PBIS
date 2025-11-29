from django.urls import path
from .views import LocationViewSet, LocationOverrideViewSet

# -----------------------------------
# :: URL Patterns
# -----------------------------------

"""
Define URL routing for the count/location app.
"""

# ViewSet mappings
location_list = LocationViewSet.as_view({
    "get": "list",
})

location_detail = LocationViewSet.as_view({
    "get": "retrieve",
})

location_override_list = LocationOverrideViewSet.as_view({
    "get": "list",
    "post": "create",
})

location_override_detail = LocationOverrideViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

urlpatterns = [
    # ------------------- LOCATIONS ----------------- #
    path("locations/", location_list, name="location-list"),
    path("locations/<int:pk>/", location_detail, name="location-detail"),

    # ---------------- LOCATION OVERRIDES ---------------- #
    path("location-overrides/", location_override_list,
         name="location-override-list"),
    path("location-overrides/<int:pk>/", location_override_detail,
         name="location-override-detail"),
]
