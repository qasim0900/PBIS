import csv
from .models import ReportArchive
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import RecordExportSerializer, ReportArchiveSerializer


# -----------------------------------
# :: Report Archive ViewSet Class
# -----------------------------------

""" 
Provides a read/write API for `ReportArchive` records with optional 
filtering by location and frequency, ordering by creation date
"""


class ReportArchiveViewSet(viewsets.ModelViewSet):
    serializer_class = ReportArchiveSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = (filters.OrderingFilter,)
    ordering = ("-created_at",)

    # -----------------------------------
    # :: Get Queryset Function
    # -----------------------------------

    """ 
    Returns all `ReportArchive` records with related `sheet`, `location`, 
    `exported_by`, and `submitted_by` objects preloaded for efficient queries.
    """

    def get_queryset(self):
        return ReportArchive.objects.select_related(
            "sheet", "location", "exported_by", "submitted_by"
        ).all()

    # -----------------------------------
    # :: filter queryset function
    # -----------------------------------

    """ 
    Filters the `ReportArchive` queryset by `location` and `frequency` query parameters if provided.
    """

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params
        if location_id := params.get("location"):
            queryset = queryset.filter(location_id=location_id)
        if frequency := params.get("frequency"):
            queryset = queryset.filter(frequency=frequency)
        return queryset

    # -----------------------------------
    # :: Create Function
    # -----------------------------------

    """ 
    Creates a new `ReportArchive` record after validating input and user access, then returns the serialized export data.
    """

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
# :: Download Report CSV Function
# -----------------------------------

""" 
Generates and returns a CSV file for a given `ReportArchive`, using either the snapshot data or the associated sheet entries.
"""


def download_report_csv(request, archive_id):
    try:
        archive = ReportArchive.objects.select_related(
            "location", "sheet").get(id=archive_id)
    except ReportArchive.DoesNotExist:
        return HttpResponse("Report not found", status=404)
    items = archive.payload_snapshot.get("items", [])
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
