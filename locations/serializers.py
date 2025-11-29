from rest_framework import serializers
from .models import Location, LocationOverride
from inventory.serializers import CatalogItemSerializer


# -----------------------------------
# :: Location Serializer Class
# -----------------------------------


"""
Serializes the Location model, exposing all key fields as read-only.
"""


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = (
            "id",
            "name",
            "code",
            "timezone",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


# -----------------------------------
# :: Location Over Serializer Class
# -----------------------------------

"""
Serializes LocationOverride with item and location relations, 
handling write-only IDs and providing a readable frequency display.
"""


class LocationOverrideSerializer(serializers.ModelSerializer):
    item = CatalogItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        source="item",
        queryset=LocationOverride._meta.get_field(
            "item").remote_field.model.objects.active(),
        write_only=True,
    )
    location_id = serializers.PrimaryKeyRelatedField(
        source="location",
        queryset=Location.objects.filter(is_active=True),
        write_only=True,
    )
    frequency_display = serializers.CharField(
        source="get_frequency_display", read_only=True)

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Defines the LocationOverrideSerializer metadata, specifying fields to include and which ones are read-only.
    """

    class Meta:
        model = LocationOverride
        fields = (
            "id",
            "location",
            "location_id",
            "item",
            "item_id",
            "par_level",
            "order_point",
            "frequency",
            "frequency_display",
            "storage_location",
            "min_order_qty",
            "is_active",
            "notes",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "location", "item",
                            "frequency_display", "created_at", "updated_at")
