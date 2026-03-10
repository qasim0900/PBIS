from .models import Report
from django.db.models import Max
from django.db import transaction
from rest_framework import status
from rest_framework import viewsets
from counts.models import CountEntry
from django.db.models import Prefetch
from .serializers import ReportSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import IsAdminOrManager
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination

class ReportCursorPagination(CursorPagination):
    page_size = 50
    ordering = "-created_at"

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    pagination_class = ReportCursorPagination

    def get_queryset(self):
        queryset = Report.objects.all()
        params = self.request.query_params
        
        try:
            location_id = int(params.get("location")) if params.get("location") else None
            frequency_id = int(params.get("frequency")) if params.get("frequency") else None
        except (ValueError, TypeError) as e:
            # Invalid parameter format
            return Report.objects.none()
        
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        if frequency_id:
            queryset = queryset.filter(frequency_id=frequency_id)
        
        if params.get("latest_only") == "true":
            latest_id = queryset.aggregate(latest_id=Max("id"))["latest_id"]
            if latest_id is not None:
                queryset = queryset.filter(id=latest_id)
            else:
                return Report.objects.none()
        
        return queryset

    @action(detail=False, methods=["post"])
    def delete(self, request):
        """Delete reports by location and optionally frequency"""
        location_id = request.data.get("location_id")
        frequency_id = request.data.get("frequency_id")

        # Validation
        if not location_id:
            return Response(
                {"error": "Location is required to delete reports"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            location_id = int(location_id)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid location ID format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if frequency_id:
            try:
                frequency_id = int(frequency_id)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid frequency ID format"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            with transaction.atomic():
                # Build query
                reports_qs = Report.objects.filter(location__id=location_id)
                if frequency_id:
                    reports_qs = reports_qs.filter(frequency__id=frequency_id)

                # Check if reports exist
                if not reports_qs.exists():
                    return Response(
                        {"error": "No reports found matching the criteria"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Get report IDs
                report_ids = list(reports_qs.values_list("id", flat=True))
                
                # Delete count entries first (foreign key constraint)
                count_entries_qs = CountEntry.objects.filter(sheet_id__in=report_ids)
                count_entries_deleted_count, _ = count_entries_qs.delete()
                
                # Delete reports
                reports_deleted_count, _ = Report.objects.filter(id__in=report_ids).delete()

            return Response({
                "status": "success",
                "message": f"Successfully deleted {reports_deleted_count} report(s) and {count_entries_deleted_count} entries",
                "reports_deleted": reports_deleted_count,
                "count_entries_deleted": count_entries_deleted_count,
                "deleted_ids": report_ids
            }, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Report deletion error: {str(e)}", exc_info=True)
            
            return Response(
                {"error": f"An unexpected error occurred while deleting reports. Please try again or contact support."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
