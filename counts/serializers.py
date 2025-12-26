from typing import Any, Dict
from rest_framework import serializers
from locations.models import CountFrequency, Location
from inventory.serializers import CatalogItemSerializer
from .models import CountEntry, CountEntryAudit, CountSheet
from locations.serializers import LocationSerializer, LocationOverrideSerializer

# -----------------------------------------
# :: Count Entry Audit Serializer Class
# -----------------------------------------

"""
Serializes CountEntryAudit records with all fields read-only, showing who made the change and the quantity updates.
"""


class CountEntryAuditSerializer(serializers.ModelSerializer):
    changed_by = serializers.StringRelatedField()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Defines the serializer's model, includes all relevant audit fields, and makes them read-only.
    """

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


# -----------------------------------
# :: Count Entry Serializer Class
# -----------------------------------

"""
Serializes CountEntry with read-only fields for inventory and override data,
allows updating on_hand_quantity and notes, and tracks who updated the entry.
"""


class CountEntrySerializer(serializers.ModelSerializer):
    item = CatalogItemSerializer(read_only=True)
    location = serializers.CharField(
        source="sheet.location.name", read_only=True)
    location_id = serializers.IntegerField(
        source="sheet.location_id", read_only=True)
    override = LocationOverrideSerializer(read_only=True)
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
    count_unit = serializers.CharField(
        source="item.count_unit", read_only=True)
    order_unit = serializers.CharField(
        source="item.order_unit", read_only=True)
    pack_size = serializers.DecimalField(
        max_digits=9, decimal_places=2, source="item.pack_size", read_only=True)
    pack_ratio_display = serializers.CharField(
        source="item.pack_ratio_display", read_only=True)
    vendor = serializers.SerializerMethodField()
    vendor_id = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()
    qty_below_order_point = serializers.SerializerMethodField()
    is_critical = serializers.SerializerMethodField()
    highlight_state = serializers.CharField(read_only=True)

    class Meta:
        model = CountEntry
        fields = (
            "id",
            "sheet_id",
            "location_id",
            "location",
            "override",
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
            "count_unit",
            "order_unit",
            "pack_size",
            "pack_ratio_display",
            "vendor",
            "vendor_id",
            "vendor_name",
            "qty_below_order_point",
            "is_critical",
        )
        read_only_fields = (
            "id", "sheet_id", "location_id", "location", "item", "par_level",
            "order_point", "storage_location", "min_order_qty", "frequency",
            "frequency_display", "calculated_qty_to_order", "calculated_order_units",
            "highlight_state", "highlight_display", "updated_at", "updated_by",
            "vendor", "vendor_id", "vendor_name", "count_unit", "order_unit",
            "pack_size", "pack_ratio_display", "qty_below_order_point", "is_critical",
        )

    def get_vendor(self, obj):
        from counts.utils import get_effective_vendor
        vendor = get_effective_vendor(obj.override, obj.item)
        if vendor:
            return {"id": vendor.id, "name": vendor.name}
        return None

    def get_vendor_id(self, obj):
        from counts.utils import get_effective_vendor
        vendor = get_effective_vendor(obj.override, obj.item)
        return vendor.id if vendor else None

    def get_vendor_name(self, obj):
        from counts.utils import get_effective_vendor
        vendor = get_effective_vendor(obj.override, obj.item)
        return vendor.name if vendor else None

    def get_qty_below_order_point(self, obj):
        return obj.on_hand_quantity <= obj.override.order_point

    def get_is_critical(self, obj):
        return obj.on_hand_quantity <= obj.override.order_point
    # -----------------------------------
    # :: Update Function
    # -----------------------------------

    """
    Updates a CountEntry instance's on_hand_quantity and notes, optionally sets who updated it, and saves the changes.
    """

    def update(self, instance: CountEntry, validated_data: Dict[str, Any]) -> CountEntry:
        for attr in ("on_hand_quantity", "notes"):
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        updated_by = validated_data.pop("updated_by", None)
        if updated_by is not None:
            instance.updated_by = updated_by
        instance.save()
        return instance


# -----------------------------------
# :: Count Sheet Serializer Class
# -----------------------------------

"""
Serializes CountSheet with read-only fields, including related location and entries, 
and provides computed fields for submission status and entry count.
"""


class CountSheetSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    entries = CountEntrySerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source="get_status_display", read_only=True)
    frequency_display = serializers.CharField(
        source="get_frequency_display", read_only=True)
    is_submitted = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Defines the serializer for CountSheet with all fields read-only and adds methods to return submission status and total entry count.
    """

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

    # -----------------------------------
    # :: Get is Submitted Function
    # -----------------------------------

    """
    Returns the submission status of the CountSheet as a boolean.
    """

    def get_is_submitted(self, obj: CountSheet) -> bool:
        return obj.is_submitted

    # -----------------------------------
    # :: Get Entry Count Function
    # -----------------------------------

    """
    Returns the total number of entries associated with the CountSheet.
    """

    def get_entry_count(self, obj: CountSheet) -> int:
        return obj.entries.count()


# ----------------------------------------------
# :: Count Sheet Summary Serializer Class
# ----------------------------------------------

"""
Creates a CountSheet serializer that excludes the detailed entries field for a summarized view.
"""


class CountSheetSummarySerializer(CountSheetSerializer):

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Defines the serializer metadata to inherit from CountSheetSerializer but exclude the entries field for a summary representation.
    """

    class Meta(CountSheetSerializer.Meta):
        fields = tuple(
            f for f in CountSheetSerializer.Meta.fields if f not in {"entries"})


# ---------------------------------------------
# :: Ensure Count Sheet Serializer Class
# ---------------------------------------------

"""
Validates input data to ensure a count sheet can be created, including location,
frequency, optional count date, and whether to include entries.
"""


class EnsureCountSheetSerializer(serializers.Serializer):
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.filter(is_active=True),
    )
    frequency = serializers.ChoiceField(choices=CountFrequency.choices)
    count_date = serializers.DateField(required=False)
    include_entries = serializers.BooleanField(required=False, default=True)


# ----------------------------------------
# :: Submit Count Sheet Serializer Class
# ----------------------------------------
"""
Validates optional notes provided when submitting a count sheet.
"""


class SubmitCountSheetSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)
