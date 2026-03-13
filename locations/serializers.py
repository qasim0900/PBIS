from rest_framework import serializers
from .models import Location


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Location name cannot be empty."
            )

        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Location name must be at least 2 characters long."
            )

        if len(value) > 255:
            raise serializers.ValidationError(
                "Location name must be 255 characters or less."
            )
        queryset = Location.objects.filter(name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                f"A location with the name '{value}' already exists."
            )

        return value

    def validate_description(self, value):
        if value:
            return value.strip()
        return value

    def create(self, validated_data):
        validated_data.setdefault("is_active", True)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
