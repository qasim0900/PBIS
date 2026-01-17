from django.urls import path
from .views import LocationViewSet

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------

""" 
Includes all the registered router URLs in the `urlpatterns` for the Django app.
"""

urlpatterns = [
    path("locations/", LocationViewSet.as_view({"get": "list"})),
    path("locations/create/", LocationViewSet.as_view({"post": "create"})),
    path("locations/<int:pk>/update/", LocationViewSet.as_view({
        "put": "update",
        "patch": "partial_update",
    })),
]
