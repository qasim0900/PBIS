from .models import Report
from rest_framework import viewsets
from .serializers import ReportSerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination

# -----------------------------------
# :: Report View Class
# -----------------------------------

"""
Exposes Report records.
Only Admin or Manager can access.
"""


class ReportCursorPagination(CursorPagination):
    page_size = 50
    ordering = "-created_at"


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    pagination_class = ReportCursorPagination

    def get_queryset(self):
        queryset = Report.objects.select_related(
            "location", "frequency"
        ).prefetch_related("count_entries")  # optimize ManyToMany

        location_id = self.request.query_params.get("location")
        frequency_id = self.request.query_params.get("frequency")

        if location_id:
            queryset = queryset.filter(location_id=location_id)

        if frequency_id:
            queryset = queryset.filter(frequency_id=frequency_id)

        return queryset
