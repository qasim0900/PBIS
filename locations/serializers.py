from rest_framework import serializers
from .models import Location, LocationOverride
from inventory.serializers import CatalogItemSerializer
from rest_framework.validators import UniqueTogetherValidator
from inventory.models import CatalogItem
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

    # Related fields for read
    location_name = serializers.CharField(source="location.name", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = LocationOverride
        fields = [
            "id",
            "location_id",
            "location_name",   # Added
            "item_id",
            "item_name",       # Added
            "par_level",
            "order_point",
            "frequency",
            "storage_location",
            "min_order_qty",
            "is_active",
        ]

    def validate(self, data):
        par = data.get("par_level")
        op = data.get("order_point")
        if op and par and op > par:
            raise serializers.ValidationError(
                "Order point cannot exceed par level."
            )
        return data

    def create(self, validated_data):
        location = validated_data.pop("location_id")
        item = validated_data.pop("item_id")
        obj, created = LocationOverride.objects.update_or_create(
            location=location,
            item=item,
            defaults=validated_data
        )
        return obj

    def update(self, instance, validated_data):
        if "location_id" in validated_data:
            instance.location = validated_data.pop("location_id")
        if "item_id" in validated_data:
            instance.item = validated_data.pop("item_id")
        return super().update(instance, validated_data)