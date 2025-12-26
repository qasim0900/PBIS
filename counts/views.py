from datetime import date
from django.db import transaction
from users.models import UserRole
from django.utils import timezone
from locations.models import Location
from .models import CountSheet, CountEntry
from rest_framework.decorators import action
from .pagination import TenPerPagePagination
from rest_framework.response import Response
from django.db.models.functions import Coalesce
from django.db.models import F, Value, CharField
from rest_framework import viewsets, filters, status
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

# ------------------------------------------
# :: Location Scoped Mixin Class
# ------------------------------------------

"""
This mixin restricts querysets and access based on a user's assigned locations, allowing only admins or superusers full access.
"""


class LocationScopedMixin:

    # ------------------------------------------
    # :: restrict queryset Function
    # ------------------------------------------

    """
    This method limits a queryset to locations assigned to the authenticated user, 
    giving full access only to admins or superusers.
    """

    def _restrict_queryset(self, queryset):
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        return queryset.filter(
            location_id__in=user.assigned_locations.values_list(
                "id", flat=True)
        )

    # ------------------------------------------
    # :: restrict entry queryset Function
    # ------------------------------------------

    """
    This method filters a queryset of entries to include only those linked to locations assigned to the
    authenticated user, while admins and superusers get full access.
    """

    def _restrict_entry_queryset(self, queryset):
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        return queryset.filter(
            sheet__location_id__in=user.assigned_locations.values_list(
                "id", flat=True)
        )

    # ------------------------------------------
    # :: validate location access Function
    # ------------------------------------------

    """
    This method checks if a user has access to a specific location and raises a permission error if they don't, 
    while admins and superusers bypass the check.
    """

    def _validate_location_access(self, user, location):
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return
        if user.assigned_locations.filter(pk=location.pk).exists():
            return
        raise PermissionDenied("You are not assigned to this location.")


# ------------------------------------------
# :: Count Sheet ViewSet Class
# ------------------------------------------
"""
DRF viewset for managing inventory count sheets with location-based access, 
CRUD, bulk updates, reports, and sheet control actions.
"""


class CountSheetViewSet(LocationScopedMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("count_date", "location__name", "frequency")
    ordering = ("-count_date",)
    queryset = CountSheet.objects.select_related(
        "location", "created_by", "submitted_by"
    ).prefetch_related("entries__item", "entries__override")

    # --------------------------
    # :: create Function
    # --------------------------

    """
    This method overrides the default `create` to validate location and frequency,
    ensure user access, create or fetch a daily sheet, and return its serialized data.

    """

    def create(self, request, *args, **kwargs):
        location_id = request.data.get('location')
        frequency = request.data.get('frequency')

        if not location_id or not frequency:
            return Response(
                {"error": "location and frequency are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            location = Location.objects.get(pk=location_id, is_active=True)
        except Location.DoesNotExist:
            return Response(
                {"error": "Location not found or inactive"},
                status=status.HTTP_400_BAD_REQUEST
            )
        self._validate_location_access(request.user, location)
        sheet = CountSheet.objects.ensure_daily_sheet(
            location=location,
            frequency=frequency,
            target_date=date.today(),
            created_by=request.user,
        )
        serializer = self.get_serializer(sheet)
        return Response(serializer.data, status=status.HTTP_201_CREATED if sheet._was_created else status.HTTP_200_OK)

    # ------------------------------------------
    # :: validate location access Function
    # ------------------------------------------

    """
    This method returns the count sheet queryset filtered by optional query parameters: location, frequency, and status.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        if location_id := self.request.query_params.get('location'):
            qs = qs.filter(location_id=location_id)
        if frequency := self.request.query_params.get('frequency'):
            qs = qs.filter(frequency=frequency)
        if status := self.request.query_params.get('status'):
            qs = qs.filter(status=status)
        return qs

    # ------------------------------------------
    # :: get serializer class Function
    # ------------------------------------------

    """
    This method selects a different serializer for listing (`CountSheetSummarySerializer`) 
    versus other actions (`CountSheetSerializer`).
    """

    def get_serializer_class(self):
        if self.action == "list":
            return CountSheetSummarySerializer
        return CountSheetSerializer

    # ------------------------------------------
    # :: ensure sheet Function
    # ------------------------------------------

    """
    This action ensures a daily count sheet exists for a given location and frequency, 
    validates user access, and returns the serialized sheet.
    """

    @action(detail=False, methods=["post"])
    def ensure_sheet(self, request):
        serializer = EnsureCountSheetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        location = serializer.validated_data["location"]
        frequency = serializer.validated_data["frequency"]
        count_date = serializer.validated_data.get(
            "count_date", timezone.localdate()
        )

        self._validate_location_access(request.user, location)

        sheet = CountSheet.objects.ensure_daily_sheet(
            location=location,
            frequency=frequency,
            target_date=count_date,
            created_by=request.user if is_manager(request.user) else None,
        )

        include_entries = request.data.get("include_entries", True)
        response_serializer = self.get_serializer(
            sheet,
            context={"request": request, "include_entries": include_entries},
        )

        return Response(response_serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------
    # :: bulk update counts Function
    # ------------------------------------------

    """
    This action bulk-updates count entries for a sheet, handles validation and errors, 
    optionally submits the sheet, and returns a summary of updated entries.
    """

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, StaffCanSubmitCounts],
    )
    @transaction.atomic
    def bulk_update_counts(self, request, pk=None):
        sheet = self.get_object()

        if sheet.locked or sheet.is_submitted:
            return Response(
                {"error": "Sheet is locked or already submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        entries_data = request.data.get("entries", [])
        submit_sheet = request.data.get("submit_sheet", False)

        if not entries_data:
            raise ValidationError("At least one entry is required.")

        updated_entries = []
        errors = []

        for row in entries_data:
            entry_id = row.get("entry_id")

            if not entry_id:
                errors.append("Missing entry_id")
                continue

            try:
                entry = CountEntry.objects.get(id=entry_id, sheet=sheet)
            except CountEntry.DoesNotExist:
                errors.append(
                    f"Entry {entry_id} not found or does not belong to this sheet"
                )
                continue

            if "on_hand_quantity" in row:
                entry.on_hand_quantity = row["on_hand_quantity"]

            if "notes" in row:
                entry.notes = row.get("notes", "")

            entry.updated_by = request.user
            entry.save(recalculate=True)

            updated_entries.append(entry)
        if errors:
            return Response(
                {
                    "message": "Some entries could not be processed.",
                    "errors": errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = "Counts updated successfully."

        if submit_sheet:
            sheet.submit(user=request.user)
            message = "Counts updated and sheet submitted successfully."

        return Response(
            {
                "message": message,
                "sheet_id": sheet.id,
                "is_submitted": sheet.is_submitted,
                "updated_count": len(updated_entries),
                "updated_entries": CountEntrySerializer(
                    updated_entries, many=True
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------
    # :: order report Function
    # ------------------------------------------

    """
    This action generates an order report for a submitted sheet, 
    optionally filtering to show only items that need to be ordered.
    """

    @action(detail=True, methods=["get"])
    def order_report(self, request, pk=None):
        sheet = self.get_object()

        if not sheet.is_submitted:
            return Response(
                {"message": "Sheet not submitted yet.", "items": []},
                status=status.HTTP_200_OK,
            )

        entries = sheet.entries.all().order_by(
            "override__display_order", "item__name"
        )

        show_only_orders = (
            request.query_params.get("only_orders", "false").lower() in {
                "true", "1"}
        )

        if show_only_orders:
            entries = entries.filter(calculated_order_units__gt=0)

        return Response(
            {
                "sheet": CountSheetSummarySerializer(sheet).data,
                "items": CountEntrySerializer(entries, many=True).data,
                "only_orders": show_only_orders,
                "generated_at": timezone.now(),
            },
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------
    # :: Submit Function
    # ------------------------------------------

    """
    This action submits a count sheet, locks it, generates a report snapshot, and archives it for future reference.
    """

    @action(detail=True, methods=["post"], permission_classes=[StaffCanSubmitCounts])
    def submit(self, request, pk=None):
        sheet = self.get_object()
        if sheet.locked:
            raise ValidationError("Sheet is already locked.")

        serializer = SubmitCountSheetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from reports.models import ReportArchive, ExportFormat

        with transaction.atomic():
            sheet.submit(user=request.user)

            report_items = []
            for entry in sheet.entries.select_related("item", "override"):
                override = entry.override
                item = entry.item

                report_items.append({
                    "item_name": item.name,
                    "category": item.category or "N/A",
                    "count_unit": item.count_unit,
                    "pack_size": str(item.pack_size),
                    "par_level": str(override.par_level),
                    "order_point": str(override.order_point),
                    "on_hand_quantity": str(entry.on_hand_quantity),
                    "order_units": str(entry.calculated_order_units),
                    "highlight": entry.get_highlight_state_display(),
                })

            ReportArchive.objects.create(
                sheet=sheet,
                location=sheet.location,
                frequency=sheet.frequency,
                count_date=sheet.count_date,
                exported_by=request.user,
                submitted_by=request.user,
                submitted_at=timezone.now(),
                export_format=ExportFormat.PDF,
                payload_snapshot={
                    "count_date": str(sheet.count_date),
                    "items": report_items,
                },
                export_notes=serializer.validated_data.get("note", ""),
            )

        return Response(self.get_serializer(sheet).data)

    # ------------------------------------------
    # :: reset Function
    # ------------------------------------------

    """
    This manager-only action resets a count sheet to its initial state and returns the updated sheet data.
    """

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def reset(self, request, pk=None):
        sheet = self.get_object()
        sheet.reset()
        return Response(self.get_serializer(sheet).data)

    # ------------------------------------------
    # :: lock Function
    # ------------------------------------------

    """
    This manager-only action locks a count sheet to prevent edits and returns the updated sheet data.
    """

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def lock(self, request, pk=None):
        sheet = self.get_object()
        sheet.locked = True
        sheet.save(update_fields=["locked", "updated_at"])
        return Response(self.get_serializer(sheet).data)

    # ------------------------------------------
    # :: unlock Function
    # ------------------------------------------

    """
    This manager-only action unlocks a count sheet to allow edits and returns the updated sheet data.
    """

    @action(detail=True, methods=["post"], permission_classes=[ManagersOnly])
    def unlock(self, request, pk=None):
        sheet = self.get_object()
        sheet.locked = False
        sheet.save(update_fields=["locked", "updated_at"])
        return Response(self.get_serializer(sheet).data)

    # ------------------------------------------
    # :: today Function
    # ------------------------------------------

    """
    This action fetches today's count sheet for a given location and frequency, validates access, and optionally includes all entries in the response.
    """

    @action(detail=False, methods=["get"])
    def today(self, request):
        location_id = request.query_params.get("location")
        frequency = request.query_params.get("frequency")

        if not location_id or not frequency:
            raise ValidationError("location and frequency are required.")

        location = Location.objects.get(pk=location_id, is_active=True)
        self._validate_location_access(request.user, location)
        sheet = CountSheet.objects.ensure_period_sheet(
            location=location,
            frequency=frequency,
            created_by=request.user,
        )

        serializer = self.get_serializer(sheet)
        data = serializer.data

        if request.query_params.get("include_entries") == "true":
            data["entries"] = CountEntrySerializer(
                sheet.entries.all().order_by("override__display_order", "item__name"),
                many=True
            ).data

        return Response(data)


# ------------------------------------------
# :: Count Entry ViewSet Class
# ------------------------------------------

"""
DRF viewset for managing inventory count entries with location-based access, 
updates, audit history, and low-stock reporting.
"""


class CountEntryViewSet(LocationScopedMixin, viewsets.ModelViewSet):
    serializer_class = CountEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("item__name", "override__display_order")
    ordering = ("override__display_order",)
    pagination_class = TenPerPagePagination
    queryset = CountEntry.objects.select_related(
        "sheet", "sheet__location", "item", "override"
    )

    # ------------------------------------------
    # :: get queryset Function
    # ------------------------------------------

    """
    This method returns the queryset of count entries filtered to only include entries in locations assigned to the 
    authenticated user.
    """

    def get_queryset(self):
        return self._restrict_entry_queryset(self.queryset)

    # ------------------------------------------
    # :: perform update Function
    # ------------------------------------------

    """
    This method updates a count entry, preventing edits on locked sheets for non-managers and recording the user who made the change.
    """

    def perform_update(self, serializer):
        entry = serializer.instance
        if entry.sheet.locked and not is_manager(self.request.user):
            raise PermissionDenied("Sheet is locked.")
        serializer.save(updated_by=self.request.user)

    # ------------------------------------------
    # :: History Function
    # ------------------------------------------

    """
    This action retrieves the audit history of a specific count entry, showing all changes in reverse chronological order.
    """

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        entry = self.get_object()
        serializer = CountEntryAuditSerializer(
            entry.audit_log.all().order_by("-changed_at"), many=True
        )
        return Response(serializer.data)

    # ------------------------------------------
    # :: Low Stock Function
    # ------------------------------------------

    """
    This action returns a list of low (and optionally near-low) stock entries with item, vendor, location, on-hand quantity, order quantity, and capitalised status.
    """

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        qs = self.filter_queryset(self.get_queryset())
        highlights = ["low"]
        if request.query_params.get("include_near") in {"1", "true", "True"}:
            highlights.append("near")
        qs = qs.filter(highlight_state__in=highlights)
        qs = qs.select_related(
            'item',
            'override__vendor',
            'sheet__location'
        )
        vendor_name = Coalesce(
            'override__vendor__name',
            Value(''),
            output_field=CharField()
        )

        location_name = F('sheet__location__name')

        data = qs.annotate(
            Item=F('item__name'),
            Vendor=vendor_name,
            Location=location_name,
            On_Hand=F('on_hand_quantity'),
            Order_Qty=F('calculated_qty_to_order'),
            Status=F('highlight_state')
        ).values(
            'Item', 'Vendor', 'Location', 'On_Hand', 'Order_Qty', 'Status'
        ).order_by('Item', 'Location')

        result = []
        for row in data:
            status = row['Status']
            if status:
                row['Status'] = status.capitalize()
            else:
                row['Status'] = ''
            result.append(row)
        return Response(result)
