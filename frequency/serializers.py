from rest_framework import serializers
from .models import Frequency, RecurrenceType

# -----------------------------------
# :: Frequency Serializer Class
# -----------------------------------

"""
Serializes the Frequency model, exposing all key fields as read-only.
"""


class FrequencySerializer(serializers.ModelSerializer):
    recurrence_display = serializers.CharField(
        source='get_recurrence_type_display',
        read_only=True,
        required=False,
        allow_null=True,
    )
    common_frequency = serializers.SerializerMethodField()
    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """ 
    Meta class for FrequencySerializer defining model and fields.
    """
    class Meta:
        model = Frequency
        fields = [
            "id", "recurrence_type", "start_day", "recurrence_display",
            "end_day", "times_run", 'common_frequency', "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_common_frequency(self, obj):
        if obj.start_day and obj.end_day:
            start = obj.get_start_day_display() or "?"
            end = obj.get_end_day_display() or "?"
            return f"{start} - {end}"

        if obj.recurrence_type:
            return obj.get_recurrence_type_display() or obj.recurrence_type.capitalize()

        return None

    def validate(self, attrs):
        recurrence_type = attrs.get("recurrence_type")
        start_day = attrs.get("start_day")
        end_day = attrs.get("end_day")

        has_recurrence = bool(recurrence_type)
        has_days = bool(start_day) and bool(end_day)  # Dono zaroori hain

        # 1. Dono ek saath nahi hone chahiye
        if has_recurrence and has_days:
            raise serializers.ValidationError(
                "Cannot provide both recurrence_type and start_day/end_day at the same time."
            )

        # 2. Kam se kam ek to dena hi padega
        if not has_recurrence and not has_days:
            raise serializers.ValidationError(
                "You must provide either recurrence_type OR both start_day and end_day."
            )

        # Koi bhi force mat karo — model clean() sambhal lega
        return attrs

    # -----------------------------------
    # :: get_days_range Function
    # -----------------------------------

    """ 
    Returns a string representation of the days range for weekly recurrence.
    """

    def get_days_range(self, obj):
        if obj.recurrence_type != 'weekly':
            return None
        if not obj.start_day and not obj.end_day:
            return "All week"
        start = obj.get_start_day_display() if obj.start_day else "?"
        end = obj.get_end_day_display() if obj.end_day else "?"
        return f"{start} - {end}"

    # -----------------------------------
    # :: get_runs_per_week Function
    # -----------------------------------

    """ 
    Calculates the number of runs per week based on recurrence type.
    """

    def get_runs_per_week(self, obj):
        if obj.recurrence_type == 'daily':
            return 7
        elif obj.recurrence_type == 'weekly':
            if not obj.start_day or not obj.end_day:
                return 7
            days_map = {'mon': 0, 'tue': 1, 'wed': 2,
                        'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6}
            start = days_map[obj.start_day]
            end = days_map[obj.end_day]
            return (end - start + 1) if start <= end else None
        return None

    # -----------------------------------
    # :: get_runs_per_month Function
    # -----------------------------------

    """ 
    Calculates the number of runs per month based on recurrence type.
    """

    def get_runs_per_month(self, obj):
        if obj.recurrence_type == 'daily':
            return 30
        elif obj.recurrence_type == 'weekly':
            runs_week = self.get_runs_per_week(obj)
            return runs_week * 4 if runs_week else None
        elif obj.recurrence_type == 'monthly':
            return obj.times_run or 1
        return None

    # -----------------------------------
    # :: get_runs_per_year Function
    # -----------------------------------

    """ 
    Calculates the number of runs per year based on recurrence type.
    """

    def get_runs_per_year(self, obj):
        if obj.recurrence_type == 'daily':
            return 365
        elif obj.recurrence_type == 'weekly':
            runs_week = self.get_runs_per_week(obj)
            return runs_week * 52 if runs_week else None
        elif obj.recurrence_type == 'monthly':
            return (obj.times_run or 1) * 12
        elif obj.recurrence_type == 'yearly':
            return obj.times_run or 1
        return None
