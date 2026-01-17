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
        read_only=True
    )
    days_range = serializers.SerializerMethodField()
    runs_per_week = serializers.SerializerMethodField()
    runs_per_month = serializers.SerializerMethodField()
    runs_per_year = serializers.SerializerMethodField()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """ 
    Meta class for FrequencySerializer defining model and fields.
    """
    class Meta:
        model = Frequency
        fields = [
            'id',
            'recurrence_type',
            'recurrence_display',
            'start_day',
            'end_day',
            'days_range',
            'times_run',
            'is_active',
            'created_at',
            'updated_at',
            'runs_per_week',
            'runs_per_month',
            'runs_per_year',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'runs_per_week', 'runs_per_month', 'runs_per_year'
        ]

    def validate(self, attrs):
        recurrence_type = attrs.get('recurrence_type')
        start_day = attrs.get('start_day')
        end_day = attrs.get('end_day')
        times_run = attrs.get('times_run')

        has_recurrence = bool(recurrence_type)
        has_days = bool(start_day or end_day)

        if has_recurrence and has_days:
            raise serializers.ValidationError(
                "Select either recurrence type OR start/end days, not both."
            )

        if not has_recurrence and not has_days:
            raise serializers.ValidationError(
                "You must select either recurrence type or start/end days."
            )

        if has_days:
            if not start_day:
                raise serializers.ValidationError(
                    {"start_day": "Start day is required."}
                )
            if not end_day:
                raise serializers.ValidationError(
                    {"end_day": "End day is required."}
                )
            attrs['recurrence_type'] = RecurrenceType.WEEKLY

        if has_recurrence:
            attrs['start_day'] = None
            attrs['end_day'] = None

        qs = Frequency.objects.filter(
            recurrence_type=attrs.get('recurrence_type'),
            start_day=attrs.get('start_day'),
            end_day=attrs.get('end_day'),
            times_run=times_run
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A frequency with the same configuration already exists."
            )

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
