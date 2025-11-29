from rest_framework import serializers

from counts.models import CountSheet
from locations.models import CountFrequency, Location
from locations.serializers import LocationSerializer
from users.serializers import UserSerializer

from .models import ExportFormat, ReportArchive


class ReportArchiveSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
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
    exported_by = UserSerializer(read_only=True)
    submitted_by = UserSerializer(read_only=True)

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


__all__ = ["RecordExportSerializer", "ReportArchiveSerializer"]

