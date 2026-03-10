from counts.models import CountEntry, CountSheet
from rest_framework import serializers
from inventory.serializers import InventoryItemSerializer
from inventory.models import InventoryItem

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
        
        # Get par_level for validation
        # During bulk create, we need to get it from the current entry being validated
        par_level = None
        
        # Try to get from the root serializer context (for single creates)
        if isinstance(self.initial_data, dict):
            par_level = self.initial_data.get('par_level')
        
        # For bulk creates, get from parent's initial_data
        if not par_level and hasattr(self, 'parent') and self.parent:
            # Get the index of current item being validated
            if hasattr(self.parent, 'initial_data') and isinstance(self.parent.initial_data, list):
                # Find which item in the list we're validating
                for item_data in self.parent.initial_data:
                    if isinstance(item_data, dict) and item_data.get('on_hand_quantity') == value:
                        par_level = item_data.get('par_level')
                        break
        
        # If still not found, try to get from the item instance
        if not par_level and self.instance:
            item = self.instance.item if hasattr(self.instance, 'item') else None
            if item and hasattr(item, 'par_level'):
                par_level = item.par_level
        
        # Only validate if we have a par_level to compare against
        if par_level and value > par_level:
            raise serializers.ValidationError(
                f"Current count ({value}) cannot exceed Par Level ({par_level}). "
                "Please verify your count or adjust the Par Level if needed."
            )
        
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
