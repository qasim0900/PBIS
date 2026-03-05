from .models import Report
from rest_framework import serializers
from counts.serializers import CountEntrySerializer
from locations.serializers import LocationSerializer

class ReportSerializer(serializers.ModelSerializer):
    count_entries = CountEntrySerializer(many=True, read_only=True)
    location = LocationSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'count_entries',
            'location',
            'period_start',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
