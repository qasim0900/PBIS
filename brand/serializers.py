from .models import Brand
from rest_framework import serializers

class BrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'description',
            'created_at',
            'updated_at',
        ]

    def validate_name(self, value):
        """Validate brand name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Brand name cannot be empty.")
        
        value = value.strip().title()
        
        if len(value) < 2:
            raise serializers.ValidationError("Brand name must be at least 2 characters long.")
        
        if len(value) > 100:
            raise serializers.ValidationError("Brand name must be 100 characters or less.")
        
        # Check for duplicate names (case-insensitive)
        queryset = Brand.objects.filter(name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                f"A brand with the name '{value}' already exists."
            )

        return value


    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Description must be 500 characters or less.")
        return value.strip() if value else ""
