from .models import CatalogItem
from rest_framework import serializers

# -----------------------------------
# :: Catalog Item Serializer
# -----------------------------------

""" 
This serializer formats catalog item data, including readable category and pack ratio fields, with key item details and metadata.
"""


class CatalogItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True
    )
    pack_ratio_display = serializers.CharField(
        read_only=True
    )

    class Meta:
        model = CatalogItem
        fields = (
            "id",
            "name",
            "category",
            "category_display",
            "vendor",
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

    """ 
    This method customises the serialized output by clearing notes/helper text for inactive items and appending 
    "units" to the pack ratio display.
    """

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.is_active:
            data["notes"] = None
            data["helper_text"] = None
        if instance.pack_ratio_display:
            data["pack_ratio_display"] = f"{instance.pack_ratio_display} units"
        return data
