from .models import Frequency
from rest_framework import serializers

class FrequencySerializer(serializers.ModelSerializer):

    class Meta:
        model = Frequency
        fields = [
            "id",
            "frequency_name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_frequency_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Inventory List name cannot be empty.")
        
        value = value.strip()
        
        if len(value) < 2:
            raise serializers.ValidationError("Inventory List name must be at least 2 characters long.")
        
        if len(value) > 100:
            raise serializers.ValidationError("Inventory List name must be 100 characters or less.")
        
        queryset = Frequency.objects.filter(frequency_name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                f"An Inventory List with the name '{value}' already exists."
            )

        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Description must be 500 characters or less.")
        return value.strip() if value else ""
