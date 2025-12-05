from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from .models import Location, LocationOverride
from inventory.models import CatalogItem
from inventory.serializers import CatalogItemSerializer


# -----------------------------------
# :: Location Serializer
# -----------------------------------

class LocationSerializer(serializers.ModelSerializer):
    """
    Serializer for Location model.

    Features:
    - All key fields exposed as read-only
    - Suitable for list and detail endpoints
    """

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
# :: LocationOverride Serializer
# -----------------------------------

class LocationOverrideSerializer(serializers.ModelSerializer):
    """
    Serializer for LocationOverride model.

    Features:
    - Accepts `location_id` and `item_id` for writes
    - Returns `location_name` and `item_name` for read
    - Validates `order_point` <= `par_level`
    - Performs smart `update_or_create` for writes
    """

    # Write-only fields for relational links
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        write_only=True
    )
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=CatalogItem.objects.all(),
        write_only=True
    )

    # Read-only fields for display
    location_name = serializers.CharField(
        source="location.name", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)
    frequency_display = serializers.CharField(
        source="get_frequency_display", read_only=True)

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
            "frequency_display",
            "storage_location",
            "min_order_qty",
            "is_active",
        ]

        # Ensure uniqueness at the serializer level
        validators = [
            UniqueTogetherValidator(
                queryset=LocationOverride.objects.all(),
                fields=['location', 'item'],
                message="This item already has an override for the selected location."
            )
        ]

    # -----------------------------------
    # :: Validation
    # -----------------------------------

    def validate(self, data):
        """
        Ensure order_point does not exceed par_level
        """
        par = data.get("par_level")
        op = data.get("order_point")
        if par is not None and op is not None and op > par:
            raise serializers.ValidationError(
                "Order point cannot exceed par level.")
        return data

    # -----------------------------------
    # :: Create / Update Logic
    # -----------------------------------

    def create(self, validated_data):
        """
        Smart creation with update_or_create to avoid duplicates
        """
        location = validated_data.pop("location_id")
        item = validated_data.pop("item_id")
        obj, created = LocationOverride.objects.update_or_create(
            location=location,
            item=item,
            defaults=validated_data
        )
        return obj

    def update(self, instance, validated_data):
        """
        Smart update: handle location/item changes, then delegate to super()
        """
        if "location_id" in validated_data:
            instance.location = validated_data.pop("location_id")
        if "item_id" in validated_data:
            instance.item = validated_data.pop("item_id")
        return super().update(instance, validated_data)
