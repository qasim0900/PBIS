from .models import Location
from rest_framework import viewsets
from .serializers import LocationSerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated


class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    queryset = Location.objects.filter(is_active=True)

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Location.objects.none()

        return Location.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
