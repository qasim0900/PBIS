from rest_framework import serializers
from .models import CatalogItem

# -----------------------------------
# :: Catalog Item Serializer
# -----------------------------------


class CatalogItemSerializer(serializers.ModelSerializer):
    """
    Serializer for CatalogItem with human-readable fields.

    Features:
    - `category_display`: Human-readable name for category (from model `get_category_display`).
    - `pack_ratio_display`: Read-only display value for pack ratio.
    - All fields are read-only except for those meant to be editable.
    """

    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True
    )
    pack_ratio_display = serializers.CharField(
        read_only=True
    )

    class Meta:
        model = CatalogItem
        # Include only essential fields for API efficiency
        fields = (
            "id",
            "name",
            "category",
            "category_display",
            "count_unit",
            "order_unit",
            "pack_size",
            "pack_ratio_display",
            "is_active",
            "helper_text",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "category_display",
            "pack_ratio_display",
            "created_at",
            "updated_at",
        )

    # -----------------------------------
    # :: Smart logic for dynamic fields
    # -----------------------------------

    def to_representation(self, instance):
        """
        Override default representation to:
        1. Include human-readable fields efficiently.
        2. Conditionally hide inactive items (optional example).
        """
        data = super().to_representation(instance)

        # Smart optimization: Avoid showing fields if item is inactive
        if not instance.is_active:
            data["notes"] = None
            data["helper_text"] = None

        # Optional: pack_ratio_display formatting
        if instance.pack_ratio_display:
            data["pack_ratio_display"] = f"{instance.pack_ratio_display} units"

        return data
