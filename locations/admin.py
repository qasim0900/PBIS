from .models import Location
from django.contrib import admin
from django.utils.html import format_html

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "description",
        "active_status",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


    fieldsets = (
        ("Basic Information", {
            "fields": (
                "name",
                "description",
                "is_active",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            ),
            "classes": ("collapse",)
        }),
    )

    def active_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Inactive</span>'
        )
    active_status.short_description = "Status"
    active_status.admin_order_field = "is_active"

