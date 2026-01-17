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

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Meta class for InventoryItemSerializer defining model and fields.
    """

    class Meta:
        model = CountEntry

    class Meta:
        model = CountEntry
        fields = [
            'id',
            'sheet',
            'item',
            'item_detail',
            'item_name',
            'on_hand_quantity',
            'calculated_qty_to_order',
            'calculated_order_units',
            'highlight_state',
            'highlight_display',
            'notes'
        ]
        read_only_fields = [
            'calculated_qty_to_order',
            'calculated_order_units',
            'highlight_state',
            'highlight_display',
        ]


class CountSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountSheet
        fields = '__all__'
        read_only_fields = ['submitted_by', 'submitted_at',
                            'created_by', 'updated_by', 'created_at', 'updated_at']
