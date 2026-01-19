from .models import Location
from rest_framework import serializers
from frequency.models import Frequency
# -----------------------------------
# :: Location Serializer Class
# -----------------------------------

"""
Serializes the Location model, exposing all key fields as read-only.
"""


class LocationSerializer(serializers.ModelSerializer):
    frequency = serializers.PrimaryKeyRelatedField(
        queryset=Frequency.objects.all()
    )

    # -----------------------------
    # :: Meta Class
    # -----------------------------

    """ 
    Meta class for User Registration Serializer
    """

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

    # ---------------------------------
    # :: Create Location Function
    # ---------------------------------

    """
    Create Location instance with is_active set to True by default.
    """

    def create(self, validated_data):
        validated_data['is_active'] = True
        return super().create(validated_data)

    # ---------------------------------
    # :: Update Location Function
    # ---------------------------------

    """
    Update Location instance with is_active set to True by default.
    """

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
