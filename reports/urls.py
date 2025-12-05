from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportArchiveViewSet, download_report_csv

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------

"""
Professional URL routing for report archives.

- Standard CRUD endpoints are handled by DRF DefaultRouter.
- Custom CSV download route is defined separately.
- Scalable for future custom actions (Excel, PDF exports, etc.)
"""

router = DefaultRouter()
router.register(r'archives', ReportArchiveViewSet, basename='report-archive')

# -----------------------------------
# :: Custom Endpoints
# -----------------------------------

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

urlpatterns = router.urls + custom_urls
