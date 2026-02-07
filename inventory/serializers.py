from .models import InventoryItem
from rest_framework import serializers
from vendor.models import Vendor
from locations.models import Location
from frequency.models import Frequency
from brand.models import Brand
from locations.serializers import LocationSerializer

# -----------------------------------
# :: Inventory Item Serilizer Class
# -----------------------------------

"""
Serializer for InventoryItem model to convert model instances to JSON and vice versa.
"""


class InventoryItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )

    name_display = serializers.CharField(
        source='get_name_display',
        read_only=True
    )

    vendor_name = serializers.SerializerMethodField(read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    pack_ratio_display = serializers.SerializerMethodField(read_only=True)

    # ---------- Relations (write) ----------
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        required=False,
        allow_null=True
    )

    default_vendor = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all()
    )

    vendor = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(),
        required=False,
        allow_null=True
    )

    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        required=False,
        allow_null=True
    )

    frequency = serializers.PrimaryKeyRelatedField(
        queryset=Frequency.objects.all(),
        required=False,
        allow_null=True
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )
    # ---------- Meta ----------

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'name',
            'name_display',

            'category',
            'category_display',

            'count_unit',
            'order_unit',
            'pack_size',
            'pack_ratio_display',

            'default_vendor',
            'vendor',
            'vendor_name',

            'brand',
            'brand_name',

            'location',
            'par_level',
            'order_point',

            'frequency',
            'storage_location',

            'helper_text',
            'notes',

            'display_order',
            'is_active',
            'notes',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'category_display',
            'name_display',
            'pack_ratio_display',
            'vendor_name',
            'brand_name',
            'notes',
            'created_at',
            'updated_at',
        ]

    # ---------- Methods ----------
    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None

    def get_pack_ratio_display(self, obj):
        if not obj.order_unit:
            return None

        if obj.pack_size == 1:
            return f"1 {obj.order_unit}"

        unit = obj.count_unit
        plural = "s" if obj.pack_size != 1 else ""
        return f"1 {obj.order_unit} = {obj.pack_size} {unit}{plural}"
