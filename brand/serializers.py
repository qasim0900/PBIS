from .models import Brand
from rest_framework import serializers

# -----------------------------------
# :: Brand Serializer Class
# -----------------------------------

"""
Defines the serializer for the Brand model, handling validation and data representation.
"""


class BrandSerializer(serializers.ModelSerializer):

    # -----------------------------
    # :: Meta Class
    # -----------------------------

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

    # -----------------------------------
    # :: validate_name Function
    # -----------------------------------

    """
    Validates the brand name to ensure uniqueness and proper formatting.
    """

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
