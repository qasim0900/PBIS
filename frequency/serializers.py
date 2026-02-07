from .models import Frequency
from rest_framework import serializers

# -----------------------------------
# :: Frequency Serializer Class
# -----------------------------------

"""
Serializes the Frequency model, exposing all key fields as read-only.
"""


class FrequencySerializer(serializers.ModelSerializer):

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """ 
    Meta class for FrequencySerializer defining model and fields.
    """
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
