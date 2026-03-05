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
