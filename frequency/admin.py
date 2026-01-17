from django.contrib import admin
from .models import Frequency, RecurrenceType

# -------------------------
# :: Frequency Admin
# -------------------------

""" 
Admin interface for Frequency model.
Provides list display, filtering, searching, and ordering capabilities.
"""


@admin.register(Frequency)
class FrequencyAdmin(admin.ModelAdmin):

    # ---------------------
    # :: List Display
    # ---------------------

    """ 
    Fields to display in the admin list view for Vendor model.
    """

    list_display = (
        "id",
        "recurrence_display",
        "days_range",
        "runs_per_week",
        "runs_per_month",
        "is_active",
        "times_run",
        "created_at",
        "updated_at",
    )

    # ---------------------
    # :: List Filter
    # ---------------------

    """ 
    Fields to filter in the admin list view for Vendor model.
    """

    list_filter = (
        "recurrence_type",
        "is_active",
        "start_day",
        "end_day",
    )

    # -----------------------
    # :: Search Fields
    # -----------------------

    """ 
    Fields to search in the admin list view for Vendor model.
    """

    search_fields = ("recurrence_type",)

    # -----------------------
    # :: ReadOnly Fields
    # -----------------------

    """ 
    Fields to make read-only in the admin interface.
    """

    readonly_fields = (
        "created_at",
        "updated_at",
        "runs_per_week",
        "runs_per_month",
        "runs_per_year",
    )

    # -----------------------
    # :: fieldsets Fields
    # -----------------------

    """ 
    This organises **Inventory item fields into sections** in Django Admin, grouping related fields (basic info, units, stock levels, 
    storage, display, timestamps) and collapsing less-used ones.
    """

    fieldsets = (
        ("Recurrence Settings", {
            "fields": (
                "recurrence_type",
                "start_day",
                "end_day",
                "days_range",
            )
        }),
        ("Runs & Status", {
            "fields": (
                "is_active",
                "times_run",
                "runs_per_week",
                "runs_per_month",
                "runs_per_year",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

    # -------------------------------------
    # :: recurrence_display Function
    # -------------------------------------

    """ 
    This defines a **custom admin column** that shows the **human-readable recurrence type** of a Frequency object, labelled “Type”.
    """

    def recurrence_display(self, obj):
        return obj.get_recurrence_type_display()
    recurrence_display.short_description = "Type"

    # -------------------------------------
    # :: days_range Function
    # -------------------------------------

    """ 
    This defines a **custom admin column** that shows the **day range for weekly recurrence**,
    displaying “All week” if unspecified, labelled “Days”.
    """

    def days_range(self, obj):
        if obj.recurrence_type != RecurrenceType.WEEKLY:
            return "-"
        if not obj.start_day and not obj.end_day:
            return "All week"
        start = obj.get_start_day_display() if obj.start_day else "?"
        end = obj.get_end_day_display() if obj.end_day else "?"
        return f"{start} - {end}"
    days_range.short_description = "Days"

    # -------------------------------------
    # :: runs_per_week Function
    # -------------------------------------

    """ 
    This defines a **custom admin column** that calculates the **number of runs per week** for a Frequency object, labelled “Runs/Week”.
    """

    def runs_per_week(self, obj):
        if obj.recurrence_type == RecurrenceType.DAILY.value:
            return 7
        elif obj.recurrence_type == RecurrenceType.WEEKLY.value:
            if not obj.start_day or not obj.end_day:
                return 7
            days_map = {'mon': 0, 'tue': 1, 'wed': 2,
                        'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6}
            start = days_map[obj.start_day]
            end = days_map[obj.end_day]
            if start <= end:
                return end - start + 1
            return None
        return None
    runs_per_week.short_description = "Runs/Week"

    # -------------------------------------
    # :: runs_per_month Function
    # -------------------------------------

    """ 
    This defines a **custom admin column** that calculates the **estimated number of runs per month** for a Frequency object, labelled “Runs/Month”.
    """

    def runs_per_month(self, obj):
        if obj.recurrence_type == RecurrenceType.DAILY.value:
            return 30
        elif obj.recurrence_type == RecurrenceType.WEEKLY.value:
            runs_week = self.runs_per_week(obj)
            return runs_week * 4 if runs_week else None
        elif obj.recurrence_type == RecurrenceType.MONTHLY.value:
            return obj.times_run or 1
        return None
    runs_per_month.short_description = "Runs/Month"

    # -------------------------------------
    # :: runs_per_year Function
    # -------------------------------------

    """ 
    This defines a **custom admin column** that calculates the **estimated number of runs per year** for a Frequency object, labelled “Runs/Year”.
    """

    def runs_per_year(self, obj):
        if obj.recurrence_type == RecurrenceType.DAILY.value:
            return 365
        elif obj.recurrence_type == RecurrenceType.WEEKLY.value:
            runs_week = self.runs_per_week(obj)
            return runs_week * 52 if runs_week else None
        elif obj.recurrence_type == RecurrenceType.MONTHLY.value:
            return (obj.times_run or 1) * 12
        elif obj.recurrence_type == RecurrenceType.YEARLY.value:
            return obj.times_run or 1
        return None
    runs_per_year.short_description = "Runs/Year"
