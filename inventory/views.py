from .models import InventoryItem
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .serializers import InventoryItemSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from users.models import UserRole


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (FormParser, MultiPartParser, JSONParser)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)

    search_fields = (
        "name",
        "notes",
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
            'vendor', 'brand', 'location', 'frequency', 'default_vendor'
        )
        location_id = self.request.query_params.get("location")
        frequency_id = self.request.query_params.get("dateRange")
        
        if location_id and location_id.isdigit():
            qs = qs.filter(location_id=int(location_id))
        if frequency_id and frequency_id.isdigit():
            qs = qs.filter(frequency_id=int(frequency_id))
            
        return qs

    def create(self, request, *args, **kwargs):
        """Create a new inventory item with enhanced error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except ValidationError as e:
            return Response(
                e.detail, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Update an inventory item with enhanced error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Check if user is trying to update par_level
            if 'par_level' in request.data:
                user = request.user
                if not (user.is_superuser or getattr(user, 'role', None) == UserRole.ADMIN):
                    return Response(
                        {"error": "Only administrators can modify Par Level."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        except ValidationError as e:
            return Response(
                e.detail, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
