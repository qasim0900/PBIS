from .models import Vendor
from .serializers import VendorSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

class VendorViewSet(ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = (IsAuthenticated,)
    search_fields = ("name", "contact_person")
    ordering_fields = ("name", "created_at")
    ordering = ("name",)
