from rest_framework import status
from .models import CountEntry, CountSheet
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .serializers import CountEntrySerializer, CountSheetSerializer
# ------------------------------------------
# :: Count Entry ViewSet Class
# ------------------------------------------

"""
DRF viewset for managing inventory count entries with location-based access, 
updates, audit history, and low-stock reporting.
"""


class CountEntryViewSet(viewsets.ModelViewSet):
    serializer_class = CountEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("item__name",)
    ordering = ("item__name",)
    queryset = CountEntry.objects.select_related(
        "sheet", "sheet__location", "item"
    )

    # ------------------------------------------
    # :: create Function
    # ------------------------------------------

    """
    Override create to handle bulk creation of count entries.
    """

    def create(self, request, *args, **kwargs):
        many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class CountSheetViewSet(viewsets.ModelViewSet):
    serializer_class = CountSheetSerializer
    permission_classes = [IsAuthenticated]
    queryset = CountSheet.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user, updated_by=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        sheet = self.get_object()
        try:
            sheet.submit(request.user)
            return Response({'status': 'submitted'}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
