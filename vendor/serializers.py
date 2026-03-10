from .models import Vendor
from locations.models import Location
from rest_framework import serializers
import re

class VendorSerializer(serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        required=False,
        allow_null=True
    )
    location_names = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id',
            'name',
            'color',
            'phone',
            'email',
            'notes',
            'location',
            'location_names',
            'contact_person',
            'created_at',
            'updated_at',
        ]

    def get_location_names(self, obj):
        return [obj.location.name] if obj.location else []

    def validate_name(self, value):
        """Validate vendor name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Vendor name cannot be empty.")
        
        value = value.strip().title()
        
        if len(value) < 2:
            raise serializers.ValidationError("Vendor name must be at least 2 characters long.")
        
        if len(value) > 255:
            raise serializers.ValidationError("Vendor name must be 255 characters or less.")
        
        # Check for duplicate names (case-insensitive)
        queryset = Vendor.objects.filter(name__iexact=value)
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                f"A vendor with the name '{value}' already exists."
            )
        
        return value

    def validate_color(self, value):
        """Validate hex color code"""
        if not value:
            return "#6B5B95"  # Default color
        
        value = value.strip().upper()
        
        # Validate hex color format
        if not re.match(r'^#[0-9A-F]{6}$', value):
            raise serializers.ValidationError(
                "Color must be a valid hex code (e.g., #6B5B95)."
            )
        
        return value

    def validate_email(self, value):
        """Validate email format"""
        if value and value.strip():
            value = value.strip().lower()
            # Basic email validation
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise serializers.ValidationError("Enter a valid email address.")
        
        return value if value else None

    def validate_phone(self, value):
        """Validate phone number"""
        if value and value.strip():
            value = value.strip()
            
            if len(value) > 20:
                raise serializers.ValidationError("Phone number must be 20 characters or less.")
            
            # Allow digits, spaces, hyphens, parentheses, and plus sign
            if not re.match(r'^[\d\s\-\(\)\+]+$', value):
                raise serializers.ValidationError(
                    "Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign."
                )
        
        return value if value else None

    def validate_contact_person(self, value):
        """Validate contact person name"""
        if value and value.strip():
            value = value.strip()
            
            if len(value) > 255:
                raise serializers.ValidationError("Contact person name must be 255 characters or less.")
        
        return value if value else None

    def validate_notes(self, value):
        """Validate notes"""
        if value and value.strip():
            value = value.strip()
            
            if len(value) > 1000:
                raise serializers.ValidationError("Notes must be 1000 characters or less.")
        
        return value if value else None

    def validate_location(self, value):
        """Validate location"""
        if value and not value.is_active:
            raise serializers.ValidationError(
                f"The selected location '{value.name}' is not active."
            )
        
        return value
