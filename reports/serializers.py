from counts.models import CountSheet
from rest_framework import serializers
from users.serializers import UserSerializer
from .models import ExportFormat, ReportArchive
from locations.serializers import LocationSerializer
from locations.models import CountFrequency, Location


# -----------------------------------
# :: Report Archive Serializer Class
# -----------------------------------

""" 
Serializer for `ReportArchive` that handles read-only nested relations for `location`, 
`exported_by`, and `submitted_by`, while allowing write access via `location_id` and `sheet_id`.
"""


class ReportArchiveSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    exported_by = UserSerializer(read_only=True)
    submitted_by = UserSerializer(read_only=True)
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

""" 
Serializer for exporting records, allowing creation of a `ReportArchive` with fields for sheet, location, frequency, count date, format, URL, snapshot, 
and optional notes, including validation to prevent future dates.
"""


class RecordExportSerializer(serializers.Serializer):
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

    # -----------------------------------
    # :: validate count date Function
    # -----------------------------------

    """ 
    Validates that the `count_date` is not set in the future, raising a `ValidationError` if it is.
    """

    def validate_count_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError(
                "Count date cannot be in the future.")
        return value
