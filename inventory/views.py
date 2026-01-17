from .models import InventoryItem
from rest_framework import viewsets, filters
from .serializers import InventoryItemSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser


# -----------------------------------
# :: InventoryItem ViewSet
# -----------------------------------


""" 
InventoryItem ViewSet for managing inventory items via API.
"""


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

    # -----------------------------------
    # :: Queryset with smart filters
    # -----------------------------------

    """
    Returns a filtered queryset based on query parameters.
    """

    def get_queryset(self):
        qs = InventoryItem.objects.active().with_relations()
        location_id = self.request.query_params.get("location")
        frequency_id = self.request.query_params.get("dateRange")
        
        if location_id and location_id.isdigit():
            qs = qs.for_location(int(location_id))
        if frequency_id and frequency_id.isdigit():
            qs = qs.filter(frequency_id=int(frequency_id))
            
        return qs
