from counts.models import CountEntry, CountSheet
from rest_framework import serializers
from inventory.serializers import InventoryItemSerializer
from inventory.models import InventoryItem

# -----------------------------------
# :: Count Entry Serializer Function
# -----------------------------------


"""
Serializer for CountEntry model, including related fields and computed properties.
"""


class CountEntrySerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),
        write_only=True
    )
    item_detail = InventoryItemSerializer(source="item", read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    highlight_display = serializers.CharField(
        source='get_highlight_state_display', read_only=True
    )

    pack_size = serializers.DecimalField(
        source='item.pack_size',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    count_unit = serializers.CharField(
        source='item.count_unit', read_only=True)
    order_unit = serializers.CharField(
        source='item.order_unit', read_only=True)
    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Meta class for InventoryItemSerializer defining model and fields.
    """

    class Meta:
        model = CountEntry
        fields = [
            'id', 'sheet', 'pack_size', 'count_unit', 'order_unit', 'item', 'item_detail', 'item_name',
            'on_hand_quantity', 'calculated_qty_to_order', 'calculated_order_units',
            'highlight_state', 'highlight_display', 'notes', 'par_level', 'order_point'
        ]
        read_only_fields = [
            'calculated_qty_to_order',
            'calculated_order_units',
            'highlight_state',
            'highlight_display'
        ]

    def validate_on_hand_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value
        
    def create(self, validated_data):
        entry = CountEntry(**validated_data)
        entry.save(recalculate=True)
        return entry
    
    def update(self, instance, validated_data):
        for attr in ("on_hand_quantity", "notes"):
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        updated_by = validated_data.pop("updated_by", None)
        if updated_by is not None:
            instance.updated_by = updated_by
        instance.save(recalculate=True) 
        return instance


class CountSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountSheet
        fields = '__all__'
        read_only_fields = ['submitted_by', 'submitted_at',
                            'created_by', 'updated_by', 'created_at', 'updated_at']
