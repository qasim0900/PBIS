from django.urls import path
from .views import ReportArchiveViewSet, download_report_csv
# ViewSet function mappings for reports
urlpatterns = [
    path('archives/', ReportArchiveViewSet.as_view({'get': 'list', 'post': 'create'}), name='report-archive-list'),
    path('archives/<int:pk>/', ReportArchiveViewSet.as_view({'get': 'retrieve'}), name='report-archive-detail'),
    path('archives/<int:archive_id>/download/csv/', download_report_csv, name='report-download-csv'),
]