from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ReportArchiveViewSet, download_report_csv

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------

"""
Registers the `ReportArchiveViewSet` with the router under the URL prefix `archives` for API routing.
"""
router = DefaultRouter()
router.register(r'archives', ReportArchiveViewSet, basename='report-archive')

# -----------------------------------
# :: Custom Endpoints
# -----------------------------------

""" 
Defines a custom URL pattern to download a CSV version of a specific report archive by its `archive_id`.
"""
custom_urls = [
    path(
        'archives/<int:archive_id>/download/csv/',
        download_report_csv,
        name='report-archive-download-csv'
    ),
]

# -----------------------------------
# :: Combine URLs
# -----------------------------------

""" 
Combines the default router URLs with the custom CSV download URL for the report archives.
"""
urlpatterns = router.urls + custom_urls
