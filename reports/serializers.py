from rest_framework import serializers
from counts.models import CountSheet
from locations.models import CountFrequency, Location
from locations.serializers import LocationSerializer
from users.serializers import UserSerializer
from .models import ExportFormat, ReportArchive


# -----------------------------------
# :: ReportArchive Serializer
# -----------------------------------

class ReportArchiveSerializer(serializers.ModelSerializer):
    """
    Serializer for ReportArchive model.

    Features:
    - Provides read-only nested representations for related fields
      (location, exported_by, submitted_by)
    - Supports writing via primary key fields for location and sheet
    - Designed for API use and admin reporting
    """

    # Nested read-only serializers for human-friendly output
    location = LocationSerializer(read_only=True)
    exported_by = UserSerializer(read_only=True)
    submitted_by = UserSerializer(read_only=True)

    # Write-only fields for POST/PUT requests
    location_id = serializers.PrimaryKeyRelatedField(
        source="location",
        queryset=Location.objects.filter(is_active=True),
        write_only=True,
    )
    sheet_id = serializers.PrimaryKeyRelatedField(
        source="sheet",
        queryset=CountSheet.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = ReportArchive
        fields = (
            "id",
            "sheet",
            "sheet_id",
            "location",
            "location_id",
            "frequency",
            "count_date",
            "exported_by",
            "export_format",
            "export_url",
            "payload_snapshot",
            "submitted_by",
            "submitted_at",
            "export_notes",
            "created_at",
        )
        read_only_fields = (
            "id",
            "sheet",
            "location",
            "exported_by",
            "submitted_by",
            "submitted_at",
            "created_at",
        )


# -----------------------------------
# :: RecordExport Serializer
# -----------------------------------

class RecordExportSerializer(serializers.Serializer):
    """
    Serializer for initiating a record export.

    Designed for API endpoints that trigger exports of count sheets
    with associated location and frequency.
    """

    sheet_id = serializers.PrimaryKeyRelatedField(
        source="sheet",
        queryset=CountSheet.objects.all(),
        required=False,
        allow_null=True,
    )
    location_id = serializers.PrimaryKeyRelatedField(
        source="location",
        queryset=Location.objects.filter(is_active=True),
    )
    frequency = serializers.ChoiceField(choices=CountFrequency.choices)
    count_date = serializers.DateField()
    export_format = serializers.ChoiceField(choices=ExportFormat.choices)
    export_url = serializers.URLField(required=False, allow_blank=True)
    payload_snapshot = serializers.JSONField(required=False)
    export_notes = serializers.CharField(required=False, allow_blank=True)

    def validate_count_date(self, value):
        """
        Optional: Add validation logic if needed (e.g., no future dates).
        """
        # Example: prevent exporting for future dates
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError(
                "Count date cannot be in the future.")
        return value
