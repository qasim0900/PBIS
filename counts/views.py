from rest_framework import status
from .models import CountEntry, CountSheet
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .serializers import CountEntrySerializer, CountSheetSerializer

class CountEntryViewSet(viewsets.ModelViewSet):
    serializer_class = CountEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("item__name",)
    ordering = ("item__name",)
    queryset = CountEntry.objects.select_related(
        "sheet", "sheet__location", "item"
    )

    def create(self, request, *args, **kwargs):
        many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='soft-delete')
    def soft_delete(self, request, pk=None):
        entry = self.get_object()
        entry.soft_delete(request.user)
        return Response({'status': 'deleted'}, status=status.HTTP_200_OK)

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

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        sheet = self.get_object()
        print("request",request)
        try:
            sheet.submit(request.user)
            return Response({'status': 'submitted'}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='soft-delete')
    def soft_delete(self, request, pk=None):
        sheet = self.get_object()
        sheet.soft_delete(request.user)
        return Response({'status': 'deleted'}, status=status.HTTP_200_OK)
