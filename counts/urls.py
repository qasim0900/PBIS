from django.urls import path
from .views import (
    CountSheetListView,
    CountSheetDetailView,
    CountSheetCreateView,
    CountSheetUpdateView,
    CountSheetDeleteView,
    CountEntryListView,
    CountEntryDetailView,
    CountEntryCreateView,
    CountEntryUpdateView,
    CountEntryDeleteView,
    LowStockView,
)

# -----------------------------------
# :: URL Patterns for Counts App
# -----------------------------------
urlpatterns = [

    # ------------------- COUNT SHEETS ------------------- #
    path("sheets/", CountSheetListView.as_view(), name="countsheet-list"),
    path("sheets/create/", CountSheetCreateView.as_view(),
         name="countsheet-create"),
    path("sheets/<int:pk>/", CountSheetDetailView.as_view(),
         name="countsheet-detail"),
    path("sheets/<int:pk>/update/",
         CountSheetUpdateView.as_view(), name="countsheet-update"),
    path("sheets/<int:pk>/delete/",
         CountSheetDeleteView.as_view(), name="countsheet-delete"),

    # ------------------- COUNT ENTRIES ------------------ #
    path("entries/", CountEntryListView.as_view(), name="countentry-list"),
    path("entries/create/", CountEntryCreateView.as_view(),
         name="countentry-create"),
    path("entries/<int:pk>/", CountEntryDetailView.as_view(),
         name="countentry-detail"),
    path("entries/<int:pk>/update/",
         CountEntryUpdateView.as_view(), name="countentry-update"),
    path("entries/<int:pk>/delete/",
         CountEntryDeleteView.as_view(), name="countentry-delete"),

    # ------------------- SPECIAL VIEWS ------------------ #
    path("low-stock/", LowStockView.as_view(), name="low-stock"),
]
