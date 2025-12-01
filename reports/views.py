from rest_framework import filters, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from locations.models import Location
from .models import ReportArchive
from .serializers import RecordExportSerializer, ReportArchiveSerializer
from users.permissions import ManagersOnly, is_manager


class ReportArchiveViewSet(viewsets.ModelViewSet):
    serializer_class = ReportArchiveSerializer
    permission_classes = [IsAuthenticated, ManagersOnly]  # ✅ Managers/Admins only
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("count_date", "created_at", "location__name", "frequency")
    ordering = ("-created_at",)
    queryset = ReportArchive.objects.select_related(
        "sheet",
        "location",
        "exported_by",
        "submitted_by",
    )

    def _restrict_queryset(self, queryset):
        user = self.request.user
        # Managers/admins see all records
        if is_manager(user):
            return queryset
        # Staff see only assigned locations
        assigned_ids = user.assigned_locations.values_list("id", flat=True)
        return queryset.filter(location_id__in=assigned_ids)

    def _validate_location_access(self, user, location: Location):
        if is_manager(user):
            return
        if user.assigned_locations.filter(pk=location.pk).exists():
            return
        raise PermissionDenied("You are not assigned to this location.")

    def get_queryset(self):
        return self._restrict_queryset(super().get_queryset())

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params
        location = params.get("location")
        if location:
            queryset = queryset.filter(location_id=location)
        frequency = params.get("frequency")
        if frequency:
            queryset = queryset.filter(frequency=frequency)
        count_date = params.get("count_date")
        if count_date:
            queryset = queryset.filter(count_date=count_date)
        return queryset

    def create(self, request, *args, **kwargs):
        payload = RecordExportSerializer(data=request.data, context={"request": request})
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        location = data["location"]
        self._validate_location_access(request.user, location)

        sheet = data.get("sheet")
        export = ReportArchive.objects.create(
            sheet=sheet,
            location=location,
            frequency=data["frequency"],
            count_date=data["count_date"],
            export_format=data["export_format"],
            export_url=data.get("export_url", ""),
            payload_snapshot=data.get("payload_snapshot") or {},
            export_notes=data.get("export_notes", ""),
            exported_by=request.user,
            submitted_by=sheet.submitted_by if sheet else None,
            submitted_at=sheet.submitted_at if sheet else None,
        )
        serializer = self.get_serializer(export)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



def download_report_csv(request, archive_id):
    try:
        archive = ReportArchive.objects.get(id=archive_id)
    except ReportArchive.DoesNotExist:
        return HttpResponse("Report not found", status=404)

    # Agar payload_snapshot mein actual data hai (recommended)
    items = archive.payload_snapshot.get("items", [])

    # Agar nahi hai to CountSheet se le lo
    if not items and archive.sheet:
        items = archive.sheet.entries.values(
            'item__name', 'counted_quantity', 'quantity_to_order', 'storage_location'
        )

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="PurpleBanana_{archive.location.name}_{archive.frequency}_{archive.count_date}.csv"'

    writer = csv.writer(response)
    writer.writerow(['Item Name', 'Counted Qty', 'Par Level',
                    'Qty to Order', 'Storage', 'Notes'])

    for item in items:
        writer.writerow([
            item.get('item_name') or item.get('item__name'),
            item.get('counted_quantity') or '',
            item.get('par_level') or '',
            item.get('quantity_to_order') or '',
            item.get('storage_location') or '',
            item.get('notes') or '',
        ])

    return response


__all__ = ["ReportArchiveViewSet"]
