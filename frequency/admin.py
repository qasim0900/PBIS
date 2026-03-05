from django.contrib import admin
from .models import Frequency

@admin.register(Frequency)
class FrequencyAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "frequency_name",
        "description",
        "is_active",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = ("frequency_name", "description")

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "frequency_name",
                "description",
            )
        }),
        ("Status", {
            "fields": (
                "is_active",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
