from datetime import date
from users.models import UserRole
from locations.models import Location
from .models import CountEntry, CountSheet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters, status, viewsets
from .pagination import TenPerPagePagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from users.permissions import ManagersOnly, StaffCanSubmitCounts, is_manager
from .serializers import (
    CountEntryAuditSerializer,
    CountEntrySerializer,
    CountSheetSerializer,
    CountSheetSummarySerializer,
    EnsureCountSheetSerializer,
    SubmitCountSheetSerializer,
)


# --------------------------------------
# :: Create Count Entry Audit Function
# --------------------------------------
"""
Creates an audit record for a CountEntry after it's saved, logging initial or changed on_hand_quantity values.
"""


class LocationScopedMixin:

    # -----------------------------------
    # :: Restrict Query Set Function
    # -----------------------------------

    """
    Restricts a queryset to only include locations the current user can access, allowing full access for admins and superusers.
    """

    def _restrict_queryset(self, queryset):
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        assigned_ids = user.assigned_locations.values_list("id", flat=True)
        return queryset.filter(location_id__in=assigned_ids)

    # --------------------------------------
    # :: Restrict Entry Query Set Function
    # --------------------------------------

    """
    Limits a CountEntry queryset to entries in locations assigned to the current user, granting full access to admins and superusers.
    """

    def _restrict_entry_queryset(self, queryset):
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        assigned_ids = user.assigned_locations.values_list("id", flat=True)
        return queryset.filter(sheet__location_id__in=assigned_ids)

    # --------------------------------------
    # :: Validate Location Access Function
    # --------------------------------------

    """
    Checks if a user has access to a location and raises a permission error if they are not assigned or an admin.
    """

    def _validate_location_access(self, user, location):
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return
        if user.assigned_locations.filter(pk=location.pk).exists():
            return
        raise PermissionDenied("You are not assigned to this location.")


# --------------------------------------
# :: Count Sheet View Set Class
# --------------------------------------


"""
Provides a full API for CountSheet, supporting listing, creating, filtering, retrieving, submitting, locking/unlocking, resetting, and fetching today's
sheet, with user access restrictions and conditional serialization for summary or detailed views.
"""


class CountSheetViewSet(LocationScopedMixin, viewsets.ModelViewSet):
    serializer_class = CountSheetSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("count_date", "location__name", "frequency")
    ordering = ("-count_date",)

    # -----------------------------------
    # :: Get QuerySet Function
    # -----------------------------------

    """
    Returns a queryset of CountSheet objects, optionally prefetching related entries for 
    detailed views, and restricts it based on the current user's access.
    """

    def get_queryset(self):
        queryset = CountSheet.objects.select_related(
            "location", "created_by", "submitted_by")
        include_entries = self.request.query_params.get("include_entries")
        action = getattr(self, "action", None)
        if action in {"retrieve", "submit"} or (include_entries and include_entries.lower() in {"1", "true"}):
            queryset = queryset.prefetch_related(
                "entries__item", "entries__override")
        return self._restrict_queryset(queryset)

    # -----------------------------------
    # :: Filter QuerySet Function
    # -----------------------------------

    """
    Filters a CountSheet queryset based on query parameters for location, frequency, status, and count date.
    """

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params
        location = params.get("location")
        if location:
            queryset = queryset.filter(location_id=location)
        frequency = params.get("frequency")
        if frequency:
            queryset = queryset.filter(frequency=frequency)
        status_param = params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        count_date = params.get("count_date")
        if count_date:
            queryset = queryset.filter(count_date=count_date)
        # Support date range filtering via start_date and end_date query params
        start_date = params.get("start_date")
        if start_date:
            queryset = queryset.filter(count_date__gte=start_date)
        end_date = params.get("end_date")
        if end_date:
            queryset = queryset.filter(count_date__lte=end_date)
        return queryset

    # -----------------------------------
    # :: Get Serializer Class
    # -----------------------------------

    """
    Chooses a summary serializer for listing when include_entries is false, otherwise uses the default serializer.
    """

    def get_serializer_class(self):
        include_entries = self.request.query_params.get("include_entries")
        if self.action == "list" and not (include_entries and include_entries.lower() in {"1", "true"}):
            return CountSheetSummarySerializer
        return super().get_serializer_class()

    # -----------------------------------
    # :: Create Function
    # -----------------------------------

    """
    Creates or retrieves a daily CountSheet for a location and frequency, validates user access, optionally excludes entries, 
    and returns the sheet with an appropriate status code.
    """

    def create(self, request, *args, **kwargs):
        serializer = EnsureCountSheetSerializer(
            data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        location = serializer.validated_data["location"]
        self._validate_location_access(request.user, location)
        count_date = serializer.validated_data.get("count_date")
        sheet = CountSheet.objects.ensure_daily_sheet(
            location=location,
            frequency=serializer.validated_data["frequency"],
            target_date=count_date,
            created_by=request.user,
        )
        response_serializer = self.get_serializer(sheet)
        response_data = response_serializer.data
        include_entries = serializer.validated_data.get(
            "include_entries", True)
        if not include_entries:
            response_data = {k: v for k,
                             v in response_data.items() if k != "entries"}
        status_code = status.HTTP_201_CREATED if getattr(
            sheet, "_was_created", False) else status.HTTP_200_OK
        return Response(response_data, status=status_code)

    # -----------------------------------
    # :: Submit Function
    # -----------------------------------

    """
    Submits a CountSheet, validating input and user permissions, and prevents submission if the sheet is locked.
    """

    @action(detail=True, methods=["post"], permission_classes=[StaffCanSubmitCounts])
    def submit(self, request, pk=None):
        sheet = self.get_object()
        serializer = SubmitCountSheetSerializer(
            data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        if sheet.locked:
            raise ValidationError("Sheet is already locked.")
        sheet.submit(request.user)
        return Response(self.get_serializer(sheet).data, status=status.HTTP_200_OK)

    # -----------------------------------
    # :: Reset Function
    # -----------------------------------

    """
    Resets a CountSheet to its initial state, accessible only by managers.
    """

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def reset(self, request, pk=None):
        sheet = self.get_object()
        sheet.reset()
        return Response(self.get_serializer(sheet).data, status=status.HTTP_200_OK)

    # -----------------------------------
    # :: Lock Function
    # -----------------------------------

    """
    Locks a CountSheet to prevent edits, updating its status and timestamp, accessible only by managers.
    """

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def lock(self, request, pk=None):
        sheet = self.get_object()
        if sheet.locked:
            return Response(self.get_serializer(sheet).data, status=status.HTTP_200_OK)
        sheet.locked = True
        sheet.save(update_fields=["locked", "updated_at"])
        return Response(self.get_serializer(sheet).data, status=status.HTTP_200_OK)

    # -----------------------------------
    # :: UnLock Function
    # -----------------------------------

    """
    Unlocks a CountSheet to allow edits, updating its status and timestamp, accessible only by managers.
    """

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def unlock(self, request, pk=None):
        sheet = self.get_object()
        sheet.locked = False
        sheet.save(update_fields=["locked", "updated_at"])
        return Response(self.get_serializer(sheet).data, status=status.HTTP_200_OK)

    # -----------------------------------
    # :: Today Function
    # -----------------------------------

    """
    Convenience endpoint to fetch or create today's sheet for a location/frequency.
    """

    @action(detail=False, methods=["get"])
    def today(self, request):
        location_id = request.query_params.get("location")
        frequency = request.query_params.get("frequency")
        if not location_id or not frequency:
            raise ValidationError(
                "location and frequency query parameters are required.")
        try:
            location = Location.objects.get(pk=location_id, is_active=True)
        except Location.DoesNotExist:
            raise ValidationError("Invalid location.")
        self._validate_location_access(request.user, location)

        sheet = CountSheet.objects.ensure_daily_sheet(
            location=location,
            frequency=frequency,
            target_date=date.today(),
            created_by=request.user,
        )
        serializer = self.get_serializer(sheet)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --------------------------------------
# :: Count Entry ViewSet Class
# --------------------------------------


"""
Allows staff to view and update count entries they are assigned to.
"""


class CountEntryViewSet(LocationScopedMixin, viewsets.ModelViewSet):
    serializer_class = CountEntrySerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ["get", "patch", "head", "options"]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = (
        "item__name", "override__display_order", "sheet__count_date")
    ordering = ("override__display_order",)
    pagination_class = TenPerPagePagination
    queryset = CountEntry.objects.select_related(
        "sheet",
        "sheet__location",
        "item",
        "override",
        "override__location",
    ).all()

    # -----------------------------------
    # :: Get Query Set Function
    # -----------------------------------

    """
    Returns the CountEntry queryset restricted to entries the current user is allowed to access.
    """

    def get_queryset(self):
        return self._restrict_entry_queryset(self.queryset)

    # -----------------------------------
    # :: Filter QuerySet Function
    # -----------------------------------

    """
    Filters a CountEntry queryset based on sheet, location, frequency, highlight state, status, and active flags, applying user-defined query parameters
    """

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params
        sheet_id = params.get("sheet")
        if sheet_id:
            queryset = queryset.filter(sheet_id=sheet_id)
        location_id = params.get("location")
        if location_id:
            queryset = queryset.filter(sheet__location_id=location_id)
        frequency = params.get("frequency")
        if frequency:
            queryset = queryset.filter(sheet__frequency=frequency)
        highlight_state = params.get("highlight")
        if highlight_state:
            queryset = queryset.filter(highlight_state=highlight_state)
        status_param = params.get("status")
        if status_param:
            queryset = queryset.filter(sheet__status=status_param)
        include_inactive = params.get("include_inactive")
        if not include_inactive or include_inactive.lower() not in {"1", "true"}:
            queryset = queryset.filter(
                override__is_active=True, item__is_active=True)
        return queryset

    # -----------------------------------
    # :: Perform Update Function
    # -----------------------------------

    """
    Updates a CountEntry, enforcing sheet lock restrictions and recording the user who made the change.
    """

    def perform_update(self, serializer):
        entry = serializer.instance
        if entry.sheet.locked and not is_manager(self.request.user):
            raise PermissionDenied(
                "Sheet is locked. Contact a manager to make changes.")
        serializer.save(updated_by=self.request.user)

    # -----------------------------------
    # :: History Function
    # -----------------------------------

    """
    Returns the audit history of a CountEntry, showing all changes in reverse chronological order.
    """

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def history(self, request, pk=None):
        entry = self.get_object()
        audit_qs = entry.audit_log.all().order_by("-changed_at")
        serializer = CountEntryAuditSerializer(audit_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # -----------------------------------
    # :: Low Stock Function
    # -----------------------------------

    """
    Returns CountEntry items with low (and optionally near) stock levels for the current user.
    """

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="low-stock")
    def low_stock(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        include_near = request.query_params.get("include_near")
        highlights = ["low"]
        if include_near and include_near.lower() in {"1", "true"}:
            highlights.append("near")
        queryset = queryset.filter(highlight_state__in=highlights)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
