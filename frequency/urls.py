from django.urls import path
from .views import FrequencyViewSet

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------

""" 
Includes all the registered router URLs in the `urlpatterns` for the Django app.
"""

urlpatterns = [
    path("frequencies/", FrequencyViewSet.as_view({"get": "list"})),
    path("frequencies/create/", FrequencyViewSet.as_view({"post": "create"})),
    path("frequencies/<int:pk>/update/", FrequencyViewSet.as_view({
        "put": "update",
        "patch": "partial_update",
    })),
]
