from .models import Frequency
from rest_framework import viewsets
from .serializers import FrequencySerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated


# -----------------------------------
# :: Frequency View Class
# -----------------------------------

"""
Exposes active Frequency. Staff only see assigned Frequency.
"""


class FrequencyViewSet(viewsets.ModelViewSet):
    queryset = Frequency.objects.all()
    serializer_class = FrequencySerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
