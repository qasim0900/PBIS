from typing import Any, Dict
from rest_framework import serializers
from locations.serializers import LocationSerializer
from locations.models import CountFrequency, Location
from inventory.serializers import CatalogItemSerializer
from .models import CountEntry, CountEntryAudit, CountSheet


# --------------------------------------
# :: CountEntryAuditSerializer
# --------------------------------------
class CountEntryAuditSerializer(serializers.ModelSerializer):
    """
    Serializer for CountEntryAudit records. All fields are read-only.
    Shows who made changes, previous and new quantities, timestamp, and notes.
    """
    changed_by = serializers.StringRelatedField()

    class Meta:
        model = CountEntryAudit
        fields = (
            "id",
            "previous_on_hand",
            "new_on_hand",
            "changed_at",
            "changed_by",
            "note",
        )
        read_only_fields = fields


# --------------------------------------
# :: CountEntrySerializer
# --------------------------------------
class CountEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for CountEntry.
    - Read-only: inventory/override data and computed fields
    - Writable: on_hand_quantity, notes
    - Includes location name and ID from related sheet
    """
    item = CatalogItemSerializer(read_only=True)
    location = serializers.CharField(
        source="sheet.location.name", read_only=True)
    location_id = serializers.IntegerField(
        source="sheet.location_id", read_only=True)
    sheet_id = serializers.IntegerField(read_only=True)
    frequency = serializers.CharField(
        source="override.frequency", read_only=True)
    frequency_display = serializers.CharField(
        source="override.get_frequency_display", read_only=True)
    par_level = serializers.DecimalField(
        max_digits=9, decimal_places=2, source="override.par_level", read_only=True)
    order_point = serializers.DecimalField(
        max_digits=9, decimal_places=2, source="override.order_point", read_only=True)
    storage_location = serializers.CharField(
        source="override.storage_location", read_only=True)
    min_order_qty = serializers.DecimalField(
        max_digits=9, decimal_places=2, source="override.min_order_qty", read_only=True)
    highlight_display = serializers.CharField(
        source="get_highlight_state_display", read_only=True)

    class Meta:
        model = CountEntry
        fields = (
            "id",
            "sheet_id",
            "location_id",
            "location",
            "item",
            "par_level",
            "order_point",
            "storage_location",
            "min_order_qty",
            "frequency",
            "frequency_display",
            "on_hand_quantity",
            "calculated_qty_to_order",
            "calculated_order_units",
            "highlight_state",
            "highlight_display",
            "notes",
            "updated_at",
            "updated_by",
        )
        read_only_fields = tuple(
            f for f in fields if f not in {"on_hand_quantity", "notes"}
        )

    def update(self, instance: CountEntry, validated_data: Dict[str, Any]) -> CountEntry:
        """
        Updates CountEntry instance with on_hand_quantity and notes.
        Tracks updated_by if provided.
        """
        instance.on_hand_quantity = validated_data.get(
            "on_hand_quantity", instance.on_hand_quantity)
        instance.notes = validated_data.get("notes", instance.notes)
        instance.updated_by = validated_data.get(
            "updated_by", instance.updated_by)
        instance.save(
            update_fields=["on_hand_quantity", "notes", "updated_by", "updated_at"])
        return instance


# --------------------------------------
# :: CountSheetSerializer
# --------------------------------------
class CountSheetSerializer(serializers.ModelSerializer):
    """
    Serializer for CountSheet.
    Includes related location and entries, computed fields for submission status and entry count.
    """
    location = LocationSerializer(read_only=True)
    entries = CountEntrySerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source="get_status_display", read_only=True)
    frequency_display = serializers.CharField(
        source="get_frequency_display", read_only=True)
    is_submitted = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()

    class Meta:
        model = CountSheet
        fields = (
            "id",
            "location",
            "frequency",
            "frequency_display",
            "count_date",
            "status",
            "status_display",
            "is_submitted",
            "locked",
            "created_by",
            "submitted_by",
            "submitted_at",
            "created_at",
            "updated_at",
            "entry_count",
            "entries",
        )
        read_only_fields = fields

    def get_is_submitted(self, obj: CountSheet) -> bool:
        return obj.is_submitted

    def get_entry_count(self, obj: CountSheet) -> int:
        return obj.entries.count()


# --------------------------------------
# :: CountSheetSummarySerializer
# --------------------------------------
class CountSheetSummarySerializer(CountSheetSerializer):
    """
    Summary serializer for CountSheet.
    Excludes detailed entries to reduce payload size.
    """
    class Meta(CountSheetSerializer.Meta):
        fields = tuple(
            f for f in CountSheetSerializer.Meta.fields if f != "entries")


# --------------------------------------
# :: EnsureCountSheetSerializer
# --------------------------------------
class EnsureCountSheetSerializer(serializers.Serializer):
    """
    Validates input data to ensure a CountSheet can be created.
    Includes location, frequency, optional count_date, and optional include_entries flag.
    """
    location_id = serializers.PrimaryKeyRelatedField(
        source="location",
        queryset=Location.objects.filter(is_active=True)
    )
    frequency = serializers.ChoiceField(choices=CountFrequency.choices)
    count_date = serializers.DateField(required=False)
    include_entries = serializers.BooleanField(default=True, required=False)


# --------------------------------------
# :: SubmitCountSheetSerializer
# --------------------------------------
class SubmitCountSheetSerializer(serializers.Serializer):
    """
    Validates optional note when submitting a CountSheet.
    """
    note = serializers.CharField(required=False, allow_blank=True)
