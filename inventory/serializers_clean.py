from .models import InventoryItem, Unit
from rest_framework import serializers
from vendor.models import Vendor
from locations.models import Location
from frequency.models import Frequency
from brand.models import Brand
from locations.serializers import LocationSerializer

class UnitSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Unit
        fields = [
            'id',
            'name',
            'quantity',
            'description',
            'display_name',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'display_name',
            'created_at',
            'updated_at',
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value

class InventoryItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(read_only=True)
    vendor_name = serializers.SerializerMethodField(read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_display = serializers.CharField(source='unit.display_name', read_only=True)
    pack_ratio_display = serializers.SerializerMethodField(read_only=True)

    unit = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(),
        required=False,
        allow_null=True
    )
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        required=False,
        allow_null=True
    )

    default_vendor = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all()
    )

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'name',
            'name_display',
            'category',
            'category_display',
            'unit',
            'unit_name',
            'unit_display',
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
            'notes',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'category_display',
            'name_display',
            'unit_name',
            'unit_display',
            'pack_ratio_display',
            'vendor_name',
            'brand_name',
            'created_at',
            'updated_at',
        ]

    def get_pack_ratio_display(self, obj):
        if obj.pack_size and obj.order_unit and obj.count_unit:
            return f"1 {obj.order_unit} = {obj.pack_size} {obj.count_unit}"
        return "N/A"

    def validate_par_level(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Par level cannot be negative.")

    def validate_order_point(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Order point cannot be negative.")
