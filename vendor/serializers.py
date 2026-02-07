from .models import Vendor
from locations.models import Location
from rest_framework import serializers

# -----------------------------------
# :: Vendor Serializer Class
# -----------------------------------

"""
Defines the serializer for the Vendor model, handling validation and data representation.
"""


class VendorSerializer(serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        required=False,
        allow_null=True
    )
    location_names = serializers.SerializerMethodField(read_only=True)
    # -----------------------------
    # :: Meta Class
    # -----------------------------

    """ 
    Meta class for User Registration Serializer
    """

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

    # -----------------------------------
    # :: validate_name Function
    # -----------------------------------

    """
    Validates the vendor name to ensure uniqueness and proper formatting.
    """

    def validate_name(self, value):
        value = value.strip().title()
        queryset = Vendor.objects.filter(name__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "Vendor with this name already exists.")
        return value
