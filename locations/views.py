from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from users.models import UserRole
from users.permissions import ReadOnlyUnlessManager, is_manager

from .models import Location, LocationOverride
from .serializers import LocationSerializer, LocationOverrideSerializer


# -----------------------------------
# :: Location ViewSet
# -----------------------------------

class LocationViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD for active locations.

    Access control:
    - Admins and managers see all active locations
    - Staff see only assigned locations
    """
    serializer_class = LocationSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "code")
    ordering_fields = ("name", "code")
    ordering = ("name",)

    def get_queryset(self):
        """
        Returns active locations filtered by user's role.
        """
        user = self.request.user
        if not user.is_authenticated:
            return Location.objects.none()

        queryset = Location.objects.filter(is_active=True)

        if user.is_superuser or getattr(user, "role", None) in {UserRole.ADMIN, UserRole.MANAGER}:
            return queryset

        # Staff: only assigned locations
        return queryset.filter(assigned_users=user)


# -----------------------------------
# :: LocationOverride ViewSet
# -----------------------------------

class LocationOverrideViewSet(viewsets.ModelViewSet):
    """
    CRUD for per-location overrides.

    Access control:
    - Staff: read-only access
    - Managers/Admins: full access to assigned locations
    """
    serializer_class = LocationOverrideSerializer
    permission_classes = (ReadOnlyUnlessManager,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("item__name", "location__name", "storage_location")
    ordering_fields = ("display_order", "item__name", "location__name")
    ordering = ("location__name", "display_order", "item__name")

    # Smart queryset: prefetch related objects and filter active locations
    queryset = LocationOverride.objects.select_related("location", "item").filter(
        location__is_active=True
    )

    # -----------------------------------
    # :: Helper: Check location access
    # -----------------------------------

    def _ensure_location_access(self, location: Location):
        """
        Ensure the user has permission to access or modify a location.
        Admins/Managers have access; staff do not.
        """
        user = self.request.user
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return
        if not is_manager(user):
            raise PermissionDenied("Only managers can modify overrides.")
        if not user.assigned_locations.filter(pk=location.pk).exists():
            raise PermissionDenied("You are not assigned to this location.")

    # -----------------------------------
    # :: Get filtered queryset
    # -----------------------------------

    def get_queryset(self):
        """
        Filter queryset based on user's role and assigned locations.
        Optional filtering by location ID via query params.
        """
        user = self.request.user
        queryset = super().get_queryset()

        if not user.is_authenticated:
            return queryset.none()

        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset

        location_id = self.request.query_params.get("location")
        assigned_locations = user.assigned_locations.values_list(
            "id", flat=True)

        if getattr(user, "role", None) == UserRole.MANAGER:
            if location_id:
                queryset = queryset.filter(location_id=location_id)
            else:
                queryset = queryset.filter(location_id__in=assigned_locations)
        else:
            # Staff: read-only assigned locations
            queryset = queryset.filter(location_id__in=assigned_locations)

        return queryset

    # -----------------------------------
    # :: Create / Update / Destroy
    # -----------------------------------

    def perform_create(self, serializer):
        """
        Ensure the user has access before creating a LocationOverride.
        Uses update_or_create to prevent duplicates.
        """
        location = serializer.validated_data.pop("location_id")
        item = serializer.validated_data.pop("item_id")
        self._ensure_location_access(location)

        # Smart creation/update
        LocationOverride.objects.update_or_create(
            location=location,
            item=item,
            defaults=serializer.validated_data
        )

    def perform_update(self, serializer):
        """
        Ensure the user has access before updating a LocationOverride.
        """
        self._ensure_location_access(serializer.instance.location)
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """
        Ensure the user has access before deleting a LocationOverride.
        """
        instance = self.get_object()
        self._ensure_location_access(instance.location)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
