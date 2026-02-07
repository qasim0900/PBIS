from django.urls import path
from .views import CountEntryViewSet, CountSheetViewSet

# -------------------------------------
# :: URL Patterns
# -------------------------------------

"""
URL patterns for CountEntryViewSet
"""
urlpatterns = [
    path(
        "count-entries/",
        CountEntryViewSet.as_view({"get": "list"}),
        name="countentry-list",
    ),
    path(
        "count-entries/create/",
        CountEntryViewSet.as_view({"post": "create"}),
        name="countentry-create",
    ),
    path(
        "count-entries/<int:pk>/",
        CountEntryViewSet.as_view({"get": "retrieve"}),
        name="countentry-retrieve",
    ),
    path(
        "count-entries/<int:pk>/update/",
        CountEntryViewSet.as_view(
            {"put": "update", "patch": "partial_update"}),
        name="countentry-update",
    ),
    path(
        "count-entries/<int:pk>/delete/",
        CountEntryViewSet.as_view({"delete": "destroy"}),
        name="countentry-delete",
    ),
    path(
        "count-sheets/",
        CountSheetViewSet.as_view({"get": "list"}),
        name="countsheet-list",
    ),
    path(
        "count-sheets/create/",
        CountSheetViewSet.as_view({"post": "create"}),
        name="countsheet-create",
    ),
    path(
        "count-sheets/<int:pk>/",
        CountSheetViewSet.as_view({"get": "retrieve"}),
        name="countsheet-retrieve",
    ),
    path(
        "count-sheets/<int:pk>/update/",
        CountSheetViewSet.as_view(
            {"put": "update", "patch": "partial_update"}),
        name="countsheet-update",
    ),
    path(
        "count-sheets/<int:pk>/delete/",
        CountSheetViewSet.as_view({"delete": "destroy"}),
        name="countsheet-delete",
    ),
    path(
        "count-sheets/<int:pk>/submit/",
        CountSheetViewSet.as_view({"post": "submit"}),
        name="countsheet-submit",
    ),
]
