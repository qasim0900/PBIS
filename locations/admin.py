from .models import Location
from django.contrib import admin
from django.utils.html import format_html

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "code",
        "timezone",
        "frequency_display",
        "active_status",
        "item_count",
        "created_at",
    )

    list_filter = (
        "is_active",
        "timezone",
        "frequency",
    )

    search_fields = (
        "name",
        "code",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "item_count",
    )

    prepopulated_fields = {
        "code": ("name",)
    }

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "name",
                "code",
                "timezone",
                "is_active",
            )
        }),
        ("Frequency Settings", {
            "fields": (
                "frequency",
                "frequency_display",
            )
        }),
        ("Statistics", {
            "fields": (
                "item_count",
            ),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            ),
            "classes": ("collapse",)
        }),
    )

    def frequency_display(self, obj):
        if obj.frequency:
            return obj.frequency.__str__()
        return "—"
    frequency_display.short_description = "Frequency"
    frequency_display.admin_order_field = "frequency__recurrence_type"

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

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Items"
    item_count.admin_order_field = "items__count"
