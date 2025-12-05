from datetime import date, timedelta
from django.db.models import Prefetch
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from users.permissions import ManagersOnly, StaffCanSubmitCounts, is_manager
from locations.models import Location
from .models import CountSheet, CountEntry
from .serializers import (
    CountSheetSerializer,
    CountSheetSummarySerializer,
    EnsureCountSheetSerializer,
    SubmitCountSheetSerializer,
    CountEntrySerializer,
    CountEntryAuditSerializer,
)
from .pagination import TenPerPagePagination


# --------------------------------------
# :: LocationScopedMixin
# --------------------------------------
class LocationScopedMixin:
    """
    Restrict querysets and validate user access based on assigned locations.
    Managers, admins, and superusers get full access.
    """

    def restrict_queryset_by_location(self, queryset, field_name="location_id"):
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if is_manager(user):
            return queryset
        assigned_ids = user.assigned_locations.values_list("id", flat=True)
        return queryset.filter(**{f"{field_name}__in": assigned_ids})

    def restrict_entry_queryset(self, queryset):
        return self.restrict_queryset_by_location(queryset, "sheet__location_id")

    def validate_location_access(self, user, location):
        if not is_manager(user) and not user.assigned_locations.filter(pk=location.pk).exists():
            raise PermissionDenied("You are not assigned to this location.")


# --------------------------------------
# :: CountSheetViewSet
# --------------------------------------
class CountSheetViewSet(LocationScopedMixin, viewsets.ModelViewSet):
    serializer_class = CountSheetSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["count_date", "location__name", "frequency"]
    ordering = ["-count_date"]

    def get_queryset(self):
        queryset = CountSheet.objects.select_related(
            "location", "created_by", "submitted_by"
        )
        include_entries = self.request.query_params.get("include_entries")
        if self.action in {"retrieve", "submit"} or (include_entries and include_entries.lower() in {"1", "true"}):
            queryset = queryset.prefetch_related(
                Prefetch("entries", queryset=CountEntry.objects.select_related(
                    "item", "override"))
            )
        return self.restrict_queryset_by_location(queryset)

    def filter_queryset(self, queryset):
        params = self.request.query_params

        # Dynamic filters
        filters_map = {
            "location": "location_id",
            "frequency": "frequency",
            "status": "status",
            "count_date": "count_date",
        }

        for param, field in filters_map.items():
            if value := params.get(param):
                queryset = queryset.filter(**{field: value})

        # Frequency-specific ranges
        frequency = params.get("frequency")
        if frequency:
            today = date.today()
            freq_map = {
                "mon/wed": lambda qs: qs.filter(
                    count_date__range=(
                        today - timedelta(days=today.weekday()), today + timedelta(days=6)),
                    count_date__week_day__in=[2, 4],
                ),
                "weekly": lambda qs: qs.filter(count_date__gte=today - timedelta(days=7)),
                "bi-weekly": lambda qs: qs.filter(count_date__gte=today - timedelta(days=14)),
                "monthly": lambda qs: qs.filter(count_date__gte=today.replace(day=1)),
                "semi-annual": lambda qs: qs.filter(count_date__gte=today - timedelta(days=180)),
            }
            queryset = freq_map.get(frequency.lower(), lambda qs: qs)(queryset)

        return queryset

    def get_serializer_class(self):
        include_entries = self.request.query_params.get("include_entries")
        if self.action == "list" and not (include_entries and include_entries.lower() in {"1", "true"}):
            return CountSheetSummarySerializer
        return super().get_serializer_class()

    def create(self, request, *args, **kwargs):
        serializer = EnsureCountSheetSerializer(
            data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        location = serializer.validated_data["location"]
        self.validate_location_access(request.user, location)

        sheet = CountSheet.objects.ensure_daily_sheet(
            location=location,
            frequency=serializer.validated_data["frequency"],
            target_date=serializer.validated_data.get("count_date"),
            created_by=request.user,
        )

        response_serializer = self.get_serializer(sheet)
        data = response_serializer.data

        if not serializer.validated_data.get("include_entries", True):
            data.pop("entries", None)

        status_code = status.HTTP_201_CREATED if getattr(
            sheet, "_was_created", False) else status.HTTP_200_OK
        return Response(data, status=status_code)

    @action(detail=True, methods=["post"], permission_classes=[StaffCanSubmitCounts])
    def submit(self, request, pk=None):
        sheet = self.get_object()
        if sheet.locked:
            raise ValidationError("Sheet is already locked.")
        serializer = SubmitCountSheetSerializer(
            data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        sheet.submit(request.user)
        return Response(self.get_serializer(sheet).data)

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def reset(self, request, pk=None):
        sheet = self.get_object()
        sheet.reset()
        return Response(self.get_serializer(sheet).data)

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def lock(self, request, pk=None):
        sheet = self.get_object()
        if not sheet.locked:
            sheet.locked = True
            sheet.save(update_fields=["locked", "updated_at"])
        return Response(self.get_serializer(sheet).data)

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def unlock(self, request, pk=None):
        sheet = self.get_object()
        sheet.locked = False
        sheet.save(update_fields=["locked", "updated_at"])
        return Response(self.get_serializer(sheet).data)

    @action(detail=False, methods=["get"])
    def today(self, request):
        location_id = request.query_params.get("location")
        frequency = request.query_params.get("frequency")
        if not location_id or not frequency:
            raise ValidationError(
                "Both 'location' and 'frequency' query parameters are required.")

        location = Location.objects.filter(
            pk=location_id, is_active=True).first()
        if not location:
            raise ValidationError("Invalid location.")

        self.validate_location_access(request.user, location)

        sheet = CountSheet.objects.ensure_daily_sheet(
            location=location,
            frequency=frequency,
            target_date=date.today(),
            created_by=request.user,
        )
        return Response(self.get_serializer(sheet).data)


# --------------------------------------
# :: CountEntryViewSet
# --------------------------------------
class CountEntryViewSet(LocationScopedMixin, viewsets.ModelViewSet):
    serializer_class = CountEntrySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["item__name",
                       "override__display_order", "sheet__count_date"]
    ordering = ["override__display_order"]
    pagination_class = TenPerPagePagination

    queryset = CountEntry.objects.select_related(
        "sheet", "sheet__location", "item", "override", "override__location"
    ).all()

    def get_queryset(self):
        return self.restrict_entry_queryset(self.queryset)

    def filter_queryset(self, queryset):
        params = self.request.query_params
        filters_map = {
            "sheet": "sheet_id",
            "location": "sheet__location_id",
            "frequency": "sheet__frequency",
            "highlight": "highlight_state",
            "status": "sheet__status",
        }

        for param, field in filters_map.items():
            if value := params.get(param):
                queryset = queryset.filter(**{field: value})

        if not params.get("include_inactive", "").lower() in {"1", "true"}:
            queryset = queryset.filter(
                item__is_active=True, override__is_active=True)

        return queryset

    def perform_update(self, serializer):
        if serializer.instance.sheet.locked and not is_manager(self.request.user):
            raise PermissionDenied(
                "Sheet is locked. Contact a manager to make changes.")
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def history(self, request, pk=None):
        entry = self.get_object()
        serializer = CountEntryAuditSerializer(
            entry.audit_log.order_by("-changed_at"), many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="low-stock")
    def low_stock(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        highlights = ["low"]
        if request.query_params.get("include_near", "").lower() in {"1", "true"}:
            highlights.append("near")
        queryset = queryset.filter(highlight_state__in=highlights)
        return Response(self.get_serializer(queryset, many=True).data)
