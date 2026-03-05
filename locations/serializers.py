from .models import Location
from rest_framework import serializers
from frequency.models import Frequency

class LocationSerializer(serializers.ModelSerializer):
    frequency = serializers.PrimaryKeyRelatedField(
        queryset=Frequency.objects.all()
    )

    class Meta:
        model = Location
        fields = [
            'id',
            'name',
            'code',
            'timezone',
            'frequency',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['is_active'] = True
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
