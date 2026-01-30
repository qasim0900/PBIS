from django.urls import path
from brand.views import BrandViewSet



# -----------------------------------
# :: URL Pattren
# -----------------------------------

"""
Defines the URL patterns for Brand-related endpoints.
"""

urlpatterns = [
    path(
        "brands/",
        BrandViewSet.as_view({"get": "list"}),
        name="brand-list",
    ),
    path(
        "brands/create/",
        BrandViewSet.as_view({"post": "create"}),
        name="brand-create",
    ),
    path(
        "brands/<int:pk>/",
        BrandViewSet.as_view({"get": "retrieve"}),
        name="brand-retrieve",
    ),
    path(
        "brands/<int:pk>/update/",
        BrandViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="brand-update",
    ),
    path(
        "brands/<int:pk>/delete/",
        BrandViewSet.as_view({"delete": "destroy"}),
        name="brand-delete",
    ),
]
