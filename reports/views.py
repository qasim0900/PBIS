from rest_framework import filters, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import UserRole
from users.permissions import is_manager

from locations.models import Location
from .models import ReportArchive
from .serializers import RecordExportSerializer, ReportArchiveSerializer


class ReportArchiveViewSet(viewsets.ModelViewSet):
    serializer_class = ReportArchiveSerializer
    permission_classes = (IsAuthenticated,)
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
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        assigned_ids = user.assigned_locations.values_list("id", flat=True)
        return queryset.filter(location_id__in=assigned_ids)

    def _validate_location_access(self, user, location: Location):
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
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
        if not is_manager(request.user) and not request.user.assigned_locations.filter(pk=location.pk).exists():
            raise PermissionDenied("Only assigned staff can record exports for this location.")

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


__all__ = ["ReportArchiveViewSet"]
