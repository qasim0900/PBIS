from django.urls import path
from .views import ReportArchiveViewSet

# ViewSet function mappings for reports
report_archive_list = ReportArchiveViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

report_archive_detail = ReportArchiveViewSet.as_view({
    'get': 'retrieve',
    'delete': 'destroy',
})

urlpatterns = [
    path('archives/', report_archive_list, name='report-archive-list'),
    path('archives/<int:pk>/', report_archive_detail, name='report-archive-detail'),
]
