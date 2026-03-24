from .models import InventoryItem
from rest_framework import serializers
from vendor.models import Vendor
from locations.models import Location
from frequency.models import Frequency
from brand.models import Brand
from users.models import UserRole


class InventoryItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )

    vendor_name = serializers.SerializerMethodField(read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    pack_ratio_display = serializers.SerializerMethodField(read_only=True)

    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        required=False,
        allow_null=True
    )

    default_vendor = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(),
        required=False,
        allow_null=True
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

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'name',
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
            'notes',
            'display_order',
            'is_active',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'category_display',
            'pack_ratio_display',
            'vendor_name',
            'brand_name',
            'created_at',
            'updated_at',
        ]

    def validate_par_level(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Par level cannot be negative.")
        
        request = self.context.get('request')
        if request and hasattr(request, 'user') and 'par_level' in self.initial_data:
            user = request.user
            if not (user.is_superuser or getattr(user, 'role', None) == UserRole.ADMIN):
                instance = getattr(self, 'instance', None)
                if instance is None or instance.par_level != value:
                    raise serializers.ValidationError("Only administrators can modify Par Level.")
        
        return value

    def validate_order_point(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Order point cannot be negative.")
        return value

    def validate_pack_size(self, value):
        if value is not None:
            if value <= 0:
                raise serializers.ValidationError("Pack size must be greater than 0.")
            if not isinstance(value, int) and not value.is_integer():
                raise serializers.ValidationError("Pack size must be a whole number.")
        return value

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Item name is required.")
        
        value = value.strip()
        
        if len(value) < 2:
            raise serializers.ValidationError("Item name must be at least 2 characters long.")
        
        if len(value) > 200:
            raise serializers.ValidationError("Item name must be 200 characters or less.")
        
        return value

    def validate_count_unit(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Count unit is required.")
        
        value = value.strip()
        
        if len(value) > 50:
            raise serializers.ValidationError("Count unit must be 50 characters or less.")
        
        return value

    def validate_order_unit(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Order unit is required.")
        
        value = value.strip()
        
        if len(value) > 50:
            raise serializers.ValidationError("Order unit must be 50 characters or less.")
        
        return value

    def validate_location(self, value):
        if not value:
            raise serializers.ValidationError("Location is required.")
        
        if not value.is_active:
            raise serializers.ValidationError(
                f"The selected location '{value.name}' is not active."
            )
        
        return value

    def validate_frequency(self, value):
        if not value:
            raise serializers.ValidationError("Inventory List is required.")
        
        if not value.is_active:
            raise serializers.ValidationError(
                f"The selected Inventory List '{value.frequency_name}' is not active."
            )
        
        return value

    def validate(self, data):
        return data

    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None

    def get_pack_ratio_display(self, obj):
        if not obj.order_unit:
            return None
        if obj.pack_size == 1:
            return f"1 {obj.order_unit}"
        unit = obj.count_unit or ""
        plural = "s" if obj.pack_size != 1 else ""
        return f"1 {obj.order_unit} = {obj.pack_size} {unit}{plural}"
