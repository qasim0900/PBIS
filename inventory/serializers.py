from .models import CatalogItem
from rest_framework import serializers

# -----------------------------------
# :: Category Item Serializer Class
# -----------------------------------

"""
Serializes CatalogItem with all fields read-only, including human-readable category and pack ratio.
"""


class CatalogItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display", read_only=True)
    pack_ratio_display = serializers.CharField(read_only=True)

    # -----------------------------------
    # :: Active Class
    # -----------------------------------

    """
    Defines metadata for CatalogItemSerializer, specifying included fields and marking all as read-only.
    """

    class Meta:
        model = CatalogItem
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
        read_only_fields = fields
