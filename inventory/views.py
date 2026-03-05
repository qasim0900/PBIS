from .models import InventoryItem
from rest_framework import viewsets, filters
from .serializers import InventoryItemSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (FormParser, MultiPartParser, JSONParser)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)

    search_fields = (
        "name",
        "notes",
        "helper_text",
        "storage_location",
    )

    ordering_fields = (
        "name",
        "display_order",
        "created_at",
        "updated_at",
    )

    ordering = ("display_order", "name")

    def get_queryset(self):
        qs = InventoryItem.objects.active().select_related(
            'vendor', 'brand', 'location', 'frequency', 'default_vendor', 'unit'
        )
        location_id = self.request.query_params.get("location")
        frequency_id = self.request.query_params.get("dateRange")
        unit_id = self.request.query_params.get("unit")
        
        if location_id and location_id.isdigit():
            qs = qs.filter(location_id=int(location_id))
        if frequency_id and frequency_id.isdigit():
            qs = qs.filter(frequency_id=int(frequency_id))
        if unit_id and unit_id.isdigit():
            qs = qs.filter(unit_id=int(unit_id))
            
        return qs
