from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponse
import csv

from locations.models import Location
from .models import ReportArchive
from .serializers import RecordExportSerializer, ReportArchiveSerializer
from users.permissions import ManagersOnly, is_manager


# -----------------------------------
# :: Report Archive ViewSet
# -----------------------------------

class ReportArchiveViewSet(viewsets.ModelViewSet):
    serializer_class = ReportArchiveSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = (filters.OrderingFilter,)
    ordering = ("-created_at",)

    def get_queryset(self):
        # YE SABSE SAHI HAI — prefetch + all records
        return ReportArchive.objects.select_related(
            "sheet", "location", "exported_by", "submitted_by"
        ).all()

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)  # ordering etc.
        params = self.request.query_params
        
        if location_id := params.get("location"):
            queryset = queryset.filter(location_id=location_id)
        if frequency := params.get("frequency"):
            queryset = queryset.filter(frequency=frequency)
            
        return queryset

    # -----------------------------------
    # :: Create Report Archive
    # -----------------------------------

    def create(self, request, *args, **kwargs):
        serializer = RecordExportSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        location = data["location"]
        self._validate_location_access(request.user, location)

        sheet = data.get("sheet")
        export = ReportArchive.objects.create(
            sheet=sheet,
            location=location,
            frequency=data["frequency"],
            export_format=data["export_format"],
            export_url=data.get("export_url", ""),
            payload_snapshot=data.get("payload_snapshot") or {},
            export_notes=data.get("export_notes", ""),
            exported_by=request.user,
            submitted_by=getattr(sheet, "submitted_by", None),
            submitted_at=getattr(sheet, "submitted_at", None),
        )

        response_serializer = self.get_serializer(export)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# -----------------------------------
# :: CSV Download Utility
# -----------------------------------

def download_report_csv(request, archive_id):
    """
    Download a report archive as CSV.

    Features:
    - Uses payload_snapshot if available
    - Falls back to sheet entries if payload_snapshot is empty
    - Professional CSV headers and dynamic filename
    """
    try:
        archive = ReportArchive.objects.select_related(
            "location", "sheet").get(id=archive_id)
    except ReportArchive.DoesNotExist:
        return HttpResponse("Report not found", status=404)

    items = archive.payload_snapshot.get("items", [])

    # Fall back to sheet entries if snapshot is empty
    if not items and archive.sheet:
        items = archive.sheet.entries.values(
            "item__name", "counted_quantity", "par_level",
            "quantity_to_order", "storage_location", "notes"
        )

    filename = f'PurpleBanana_{archive.location.name}_{archive.frequency}_{archive.count_date}.csv'
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    writer = csv.writer(response)
    writer.writerow(["Item Name", "Counted Qty", "Par Level",
                    "Qty to Order", "Storage", "Notes"])

    for item in items:
        writer.writerow([
            item.get("item_name") or item.get("item__name", ""),
            item.get("counted_quantity", ""),
            item.get("par_level", ""),
            item.get("quantity_to_order", ""),
            item.get("storage_location", ""),
            item.get("notes", ""),
        ])

    return response
