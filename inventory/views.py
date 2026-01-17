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
        qs = InventoryItem.objects.select_related("location", "frequency")
        location = self.request.query_params.get("location")
        frequency = self.request.query_params.get("dateRange")
        filters = {}
        if location and location.isdigit():
            filters["location_id"] = int(location)
        if frequency and frequency.isdigit():
            filters["frequency_id"] = int(frequency)
        if filters:
            qs = qs.filter(**filters)
        return qs
