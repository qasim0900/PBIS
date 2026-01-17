from .models import Location
from users.models import UserRole
from rest_framework import viewsets
from .serializers import LocationSerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated


# -----------------------------------
# :: Location Over Serializer Class
# -----------------------------------

"""
Exposes active locations. Staff only see assigned locations.
"""


class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = (IsAuthenticated, IsAdminOrManager)

    # -----------------------------------
    # :: Get Query Set Function
    # -----------------------------------

    """
    Returns active Location objects filtered by the user's role
    and assigned locations, restricting access for non-admins/managers.
    """

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Location.objects.none()
        queryset = Location.objects.filter(is_active=True)
        if user.is_superuser or getattr(user, "role", None) != UserRole.STAFF:
            return queryset
        return queryset.filter(assigned_users=user)
