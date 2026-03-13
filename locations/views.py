from .models import Location
from users.models import UserRole
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .serializers import LocationSerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = (IsAuthenticated, IsAdminOrManager)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Location.objects.none()
        queryset = Location.objects.filter(is_active=True)
        # Remove assigned_users filter since Location model doesn't have this field
        # All authenticated users can see all active locations
        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new location with enhanced error handling"""
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
                {"error": "Validation failed", "details": e.detail}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Location creation error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred. Please try again.", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Update a location with enhanced error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
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
