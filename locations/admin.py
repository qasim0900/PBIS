from django.contrib import admin
from .models import Location, LocationOverride

# -----------------------------------
# :: Location Admin
# -----------------------------------

""" 
Custom Django admin for Location displaying key fields, enabling search, filters, ordering, and read-only timestamps.
"""


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "timezone",
                    "is_active", "created_at", "updated_at")
    list_filter = ("is_active", "timezone")
    search_fields = ("name", "code")
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")


# -----------------------------------
# :: Location Override Admin
# -----------------------------------


""" 
Custom Django admin for LocationOverride displaying key fields, 
enabling search, filters, ordering, read-only timestamps, and supporting autocomplete for location and item.
"""


@admin.register(LocationOverride)
class LocationOverrideAdmin(admin.ModelAdmin):
    list_display = (
        "item",
        "location",
        "par_level",
        "order_point",
        "frequency",
        "storage_location",
        "min_order_qty",
        "is_active",
        "display_order",
    )
    list_filter = ("location", "frequency", "is_active")
    search_fields = ("item__name", "location__name", "storage_location")
    ordering = ("location__name", "display_order", "item__name")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("location", "item")
    fieldsets = (
        (None, {
            "fields": (
                "location",
                "item",
                "par_level",
                "order_point",
                "frequency",
                "storage_location",
                "min_order_qty",
                "is_active",
                "display_order",
                "notes",
            )
        }),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
