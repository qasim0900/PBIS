from users.models import UserRole
from rest_framework import serializers
from rest_framework.response import Response
from .models import Location, LocationOverride
from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from users.permissions import ReadOnlyUnlessManager, is_manager
from .serializers import LocationOverrideSerializer, LocationSerializer

# -----------------------------------
# :: Location Over Serializer Class
# -----------------------------------

"""
Exposes active locations. Staff only see assigned locations.
"""


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "code")
    ordering_fields = ("name", "code")
    ordering = ("name",)

    # -----------------------------------
    # :: Get Query Set Function
    # -----------------------------------

    """
    Returns active Location objects filtered by the user's role
    and assigned locations, restricting access for non-admins/managers.
    """

    def get_queryset(self):
        queryset = Location.objects.filter(is_active=True)
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        if getattr(user, "role", None) == UserRole.MANAGER:
            return queryset
        return queryset.filter(assigned_users=user)


# -----------------------------------
# :: Location Over Serializer Class
# -----------------------------------
"""
CRUD for per-location overrides. Staff get read-only access.
"""


class LocationOverrideViewSet(viewsets.ModelViewSet):
    serializer_class = LocationOverrideSerializer
    permission_classes = (ReadOnlyUnlessManager,)
    queryset = (
        LocationOverride.objects.select_related("location", "item")
        .filter(location__is_active=True)
        .order_by("location__name", "display_order", "item__name")
    )
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("item__name", "location__name", "storage_location")
    ordering_fields = ("display_order", "item__name", "location__name")

    # -----------------------------------
    # :: Get Query Set Function
    # -----------------------------------

    """
    Returns a filtered queryset of objects based on the authenticated user's
    role and assigned locations, optionally filtering by a specific location ID.
    """

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return queryset
        location_id = self.request.query_params.get("location")
        if getattr(user, "role", None) == UserRole.MANAGER and not location_id:
            return queryset
        assigned_locations = user.assigned_locations.values_list(
            "id", flat=True)
        queryset = queryset.filter(location_id__in=assigned_locations)
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        return queryset

    # -----------------------------------
    # :: Ensure Location access Function
    # -----------------------------------

    """
    Checks that the user has permission to access or modify a location,
    allowing only admins or managers assigned to that location.
    """

    def _ensure_location_access(self, location: Location):
        user = self.request.user
        if user.is_superuser or getattr(user, "role", None) == UserRole.ADMIN:
            return
        if not is_manager(user):
            raise PermissionDenied("Only managers can modify overrides.")
        if not user.assigned_locations.filter(pk=location.pk).exists():
            raise PermissionDenied("You are not assigned to this location.")

    # -----------------------------------
    # :: Perform Create Function
    # -----------------------------------

    """
    Ensures the user has access to the location before creating a LocationOverride instance.
    """

    def perform_create(self, serializer):
        location = serializer.validated_data["location"]
        self._ensure_location_access(location)
        serializer.save()

    # -----------------------------------
    # :: Perform update Function
    # -----------------------------------

    """
    Checks location access before updating a LocationOverride instance.
    """

    def perform_update(self, serializer):
        location = serializer.instance.location
        self._ensure_location_access(location)
        serializer.save()

    # -----------------------------------
    # :: Destroy Function
    # -----------------------------------

    """
    Verifies location access before deleting a LocationOverride instance and returns a 204 response.
    """

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self._ensure_location_access(instance.location)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # -----------------------------------
    # :: Validate Function
    # -----------------------------------

    """
    Validates that order_point does not exceed par_level when creating or updating a record.
    """

    def validate(self, data):
        par = data.get(
            "par_level", self.instance.par_level if self.instance else None)
        op = data.get(
            "order_point", self.instance.order_point if self.instance else None)

        if op and par and op > par:
            raise serializers.ValidationError(
                "Order point cannot exceed par level.")
        return data
