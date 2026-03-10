from .models import Location
from rest_framework import serializers
from frequency.models import Frequency
import re

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

    def validate_name(self, value):
        """Validate location name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Location name cannot be empty.")
        
        value = value.strip()
        
        if len(value) < 2:
            raise serializers.ValidationError("Location name must be at least 2 characters long.")
        
        if len(value) > 255:
            raise serializers.ValidationError("Location name must be 255 characters or less.")
        
        # Check for duplicate names (case-insensitive)
        queryset = Location.objects.filter(name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                f"A location with the name '{value}' already exists."
            )

        return value

    def validate_code(self, value):
        """Validate location code"""
        if not value or not value.strip():
            raise serializers.ValidationError("Location code cannot be empty.")
        
        value = value.strip().upper()
        
        if len(value) < 2:
            raise serializers.ValidationError("Location code must be at least 2 characters long.")
        
        if len(value) > 32:
            raise serializers.ValidationError("Location code must be 32 characters or less.")
        
        # Check if code contains only alphanumeric characters and hyphens/underscores
        if not re.match(r'^[A-Z0-9_-]+$', value):
            raise serializers.ValidationError(
                "Location code can only contain uppercase letters, numbers, hyphens, and underscores."
            )
        
        # Check for duplicate codes (case-insensitive)
        queryset = Location.objects.filter(code__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                f"A location with the code '{value}' already exists."
            )

        return value

    def validate_timezone(self, value):
        """Validate timezone"""
        if not value or not value.strip():
            raise serializers.ValidationError("Timezone is required.")
        
        # List of valid timezones (can be expanded)
        valid_timezones = [
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'UTC',
        ]
        
        if value not in valid_timezones:
            raise serializers.ValidationError(
                f"Invalid timezone. Please select a valid timezone."
            )
        
        return value

    def validate_frequency(self, value):
        """Validate frequency"""
        if not value:
            raise serializers.ValidationError("Inventory List is required.")
        
        # Check if frequency exists and is active
        if not value.is_active:
            raise serializers.ValidationError(
                f"The selected Inventory List '{value.frequency_name}' is not active."
            )
        
        return value

    def create(self, validated_data):
        validated_data['is_active'] = True
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
