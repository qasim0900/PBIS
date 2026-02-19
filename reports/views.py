from .models import Report
from django.db.models import Max
from django.db import transaction
from rest_framework import status
from rest_framework import viewsets
from counts.models import CountEntry
from django.db.models import Prefetch
from .serializers import ReportSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import IsAdminOrManager
from rest_framework.exceptions import ValidationError
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


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    pagination_class = ReportCursorPagination

    def get_queryset(self):
        queryset = Report.objects.all()
        params = self.request.query_params
        try:
            location_id = int(params.get("location")) if params.get(
                "location") else None
            frequency_id = int(params.get("frequency")) if params.get(
                "frequency") else None
        except ValueError:
            return Report.objects.none()
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        if frequency_id:
            queryset = queryset.filter(frequency_id=frequency_id)
        if params.get("latest_only") == "true":
            latest_id = queryset.aggregate(latest_id=Max("id"))["latest_id"]
            if latest_id is not None:
                queryset = queryset.filter(id=latest_id)
            else:
                return Report.objects.none()
        return queryset

    @action(detail=False, methods=["post"])
    def delete(self, request):
        location_id = request.data.get("location_id")
        frequency_id = request.data.get("frequency_id")

        if not location_id:
            return Response({"error": "location_id is required"}, status=400)

        try:
            with transaction.atomic():
                reports_qs = Report.objects.filter(location__id=location_id)
                if frequency_id:
                    reports_qs = reports_qs.filter(frequency__id=frequency_id)

                report_ids = list(reports_qs.values_list("id", flat=True))
                count_entries_qs = CountEntry.objects.filter(sheet_id__in=report_ids)
                count_entries_deleted_count, _ = count_entries_qs.delete()
                reports_deleted_count, _ = Report.objects.filter(id__in=report_ids).delete()

            return Response({
                "status": "success",
                "reports_deleted": reports_deleted_count,
                "count_entries_deleted": count_entries_deleted_count
            }, status=200)

        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=500)
