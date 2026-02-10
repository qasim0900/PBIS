from .models import Report
from rest_framework import viewsets
from .serializers import ReportSerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination
from rest_framework.decorators import action
from rest_framework.response import Response

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
        queryset = Report.objects.filter(is_visible=True).select_related(
            "location", "frequency"
        ).prefetch_related("count_entries")  # optimize ManyToMany

        location_id = self.request.query_params.get("location")
        frequency_id = self.request.query_params.get("frequency")
        latest_only = self.request.query_params.get("latest_only")

        if location_id:
            queryset = queryset.filter(location_id=location_id)

        if frequency_id:
            queryset = queryset.filter(frequency_id=frequency_id)

        if latest_only == "true" and location_id:
            filter_kwargs = {"location_id": location_id, "is_visible": True}
            if frequency_id:
                filter_kwargs["frequency_id"] = frequency_id

            latest_report = Report.objects.filter(
                **filter_kwargs
            ).order_by("-created_at").first()
            if latest_report:
                queryset = queryset.filter(id=latest_report.id)
            else:
                queryset = queryset.none()

        return queryset

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        report = self.get_object()
        report.is_visible = False
        report.save()
        return Response({"status": "report hidden from UI"})


    @action(detail=False, methods=["post"])
    def delete_report(self, request):
        report_id = request.data.get("id")
        if not report_id:
            return Response({"error": "Report ID is required"}, status=400)
        try:
            report = Report.objects.get(id=report_id)
            report.is_visible = False
            report.save()
            return Response({"status": "report hidden from UI"})
        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)
