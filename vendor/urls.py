from django.urls import path
from .views import VendorViewSet


# -----------------------------------
# :: URL Pattren
# -----------------------------------

"""
Defines the URL patterns for Vendor-related endpoints.
"""

urlpatterns = [
    path(
        "vendors/",
        VendorViewSet.as_view({"get": "list"}),
        name="vendor-list",
    ),
    path(
        "vendors/create/",
        VendorViewSet.as_view({"post": "create"}),
        name="vendor-create",
    ),
    path(
        "vendors/<int:pk>/",
        VendorViewSet.as_view({"get": "retrieve"}),
        name="vendor-retrieve",
    ),
    path(
        "vendors/<int:pk>/update/",
        VendorViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="vendor-update",
    ),
    path(
        "vendors/<int:pk>/delete/",
        VendorViewSet.as_view({"delete": "destroy"}),
        name="vendor-delete",
    ),
]
