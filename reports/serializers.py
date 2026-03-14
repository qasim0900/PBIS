from .models import Report
from rest_framework import serializers
from counts.serializers import CountEntrySerializer
from locations.serializers import LocationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ReportSerializer(serializers.ModelSerializer):
    count_entries = CountEntrySerializer(many=True, read_only=True)
    location = LocationSerializer(read_only=True)
    frequency_name = serializers.CharField(source='frequency.frequency_name', read_only=True)
    created_by_detail = serializers.SerializerMethodField()
    updated_by_detail = serializers.SerializerMethodField()
    deleted_by_detail = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'count_entries',
            'location',
            'frequency',
            'frequency_name',
            'period_start',
            'is_active',
            'created_by', 'created_by_detail', 'created_at',
            'updated_by', 'updated_by_detail', 'updated_at',
            'deleted_by', 'deleted_by_detail', 'deleted_at',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'created_by', 'updated_by', 'deleted_by', 'deleted_at'
        ]

    def get_created_by_detail(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None

    def get_updated_by_detail(self, obj):
        if obj.updated_by:
            return {
                'id': obj.updated_by.id,
                'username': obj.updated_by.username,
                'email': obj.updated_by.email
            }
        return None

    def get_deleted_by_detail(self, obj):
        if obj.deleted_by:
            return {
                'id': obj.deleted_by.id,
                'username': obj.deleted_by.username,
                'email': obj.deleted_by.email
            }
        return None
