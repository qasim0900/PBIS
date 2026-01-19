from .models import Report
from rest_framework import viewsets
from .serializers import ReportSerializer
from users.permissions import IsAdminOrManager
from rest_framework.permissions import IsAuthenticated


# -----------------------------------
# :: Report View Class
# -----------------------------------

"""
Exposes Report records.
Only Admin or Manager can access.
"""


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
