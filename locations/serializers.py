from rest_framework import serializers
from inventory.models import CatalogItem
from .models import Location, LocationOverride


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
        read_only_fields = ("id", "created_at", "updated_at")


# -----------------------------------
# :: Location Over Serializer Class
# -----------------------------------

"""
Serializes LocationOverride with item and location relations,
handling write-only IDs and providing a readable frequency display.
"""


class LocationOverrideSerializer(serializers.ModelSerializer):
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        write_only=True
    )
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=CatalogItem.objects.all(),
        write_only=True
    )
    vendor_id = serializers.IntegerField(source="vendor.id", read_only=True)
    vendor_name = serializers.CharField(
        source="vendor.name", read_only=True, allow_null=True)
    location_name = serializers.CharField(
        source="location.name", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = LocationOverride
        fields = [
            "id",
            "location_id",
            "location_name",
            "item_id",
            "item_name",
            "par_level",
            "order_point",
            "frequency",
            "storage_location",
            "vendor_id",
            "vendor_name",
            "min_order_qty",
            "count",
            "is_active",
        ]

    # -------------------------------------
    # :: create Function
    # -------------------------------------

    """
    Creates a `LocationOverride` by assigning location and item from validated data.
    """

    def create(self, validated_data):
        location = validated_data.pop("location_id")
        item = validated_data.pop("item_id")
        return LocationOverride.objects.create(
            location=location, item=item, **validated_data
        )

    # -------------------------------------
    # :: update Function
    # -------------------------------------

    """
    Updates a `LocationOverride` instance while ignoring any changes to `location_id` and `item_id`.
    """

    def update(self, instance, validated_data):
        validated_data.pop("location_id", None)
        validated_data.pop("item_id", None)
        return super().update(instance, validated_data)

    # -------------------------------------
    # :: validate Function
    # -------------------------------------

    """
    Validates that `par_level` is positive and that `order_point` does not exceed `par_level`.
    """

    def validate(self, data):
        par_level = data.get("par_level", getattr(
            self.instance, "par_level", None))
        order_point = data.get("order_point", getattr(
            self.instance, "order_point", None))

        if par_level is not None and par_level <= 0:
            raise serializers.ValidationError(
                {"par_level": "Par level must be greater than zero."})

        if order_point is not None and par_level is not None and order_point > par_level:
            raise serializers.ValidationError(
                {"order_point": "Order point cannot exceed par level."}
            )
        return data
