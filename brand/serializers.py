from .models import Brand
from rest_framework import serializers

class BrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'vendor',
            'description',
            'created_at',
            'updated_at',
        ]

    def validate_name(self, value):
        value = value.strip().title()
        queryset = Brand.objects.filter(name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Brand with this name already exists."
            )

        return value
