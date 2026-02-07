from .models import Brand
from .serializers import BrandSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

# -----------------------------------
# :: Brand ViewSet Class
# -----------------------------------

"""
Defines the ViewSet for the Brand model, handling CRUD operations and permissions.
"""


class BrandViewSet(ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = (IsAuthenticated,)
    search_fields = ("name",)
    ordering_fields = ("name", "created_at")
    ordering = ("name",)
