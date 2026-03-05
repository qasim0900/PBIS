from django.contrib import admin
from .models import InventoryItem, Unit
from django.utils.html import format_html

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "quantity",
        "description",
        "is_active",
        "created_at",
    )
    list_filter = (
        "is_active",
        "created_at",
    )
    search_fields = (
        "name",
        "description",
    )
    ordering = ("name",)
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    
    fieldsets = (
        ("Unit Info", {
            "fields": (
                "name",
                "quantity",
                "description",
                "is_active",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "unit_display",
        "location_display",
        "category_display",
        "vendor_display",
        "pack_ratio",
        "par_level",
        "order_point",
        "is_active",
        "display_order",
    )

    list_filter = (
        "unit",
        "location",
        "category",
        "vendor",
        "is_active",
        "frequency",
    )
    search_fields = (
        "name",
        "notes",
        "storage_location",
    )
    ordering = ("display_order", "name")

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "name",
                "unit",
                "location",
                "category",
                "vendor",
                "frequency",
                "is_active",
            )
        }),
        ("Units & Packaging", {
            "fields": (
                "count_unit",
                "order_unit",
                "pack_size",
            )
        }),
        ("Stock Levels", {
            "fields": (
                "par_level",
                "order_point",
            )
        }),
        ("Additional Info", {
            "fields": (
                "brand",
                "default_vendor",
                "storage_location",
                "notes",
                "display_order",
            )
        }),
    )

    def unit_display(self, obj):
        return obj.unit.display_name if obj.unit else "-"

    def location_display(self, obj):
        return obj.location.name if obj.location else "-"

    def vendor_display(self, obj):
        return obj.vendor.name if obj.vendor else "-"

    unit_display.short_description = "Unit"
    location_display.short_description = "Location"
    vendor_display.short_description = "Vendor"
