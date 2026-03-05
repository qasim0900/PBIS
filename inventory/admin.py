from django.contrib import admin
from .models import InventoryItem
from django.utils.html import format_html


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
        "vendor__name",
        "storage_location",
        "helper_text",
        "notes",
    )

    ordering = ("display_order", "name")

    readonly_fields = (
        "created_at",
        "updated_at",
        "pack_ratio_display",
    )

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
                "pack_ratio_display",
                "helper_text",
            )
        }),
        ("Stock Levels", {
            "fields": (
                "par_level",
                "order_point",
            )
        }),
        ("Storage & Notes", {
            "fields": (
                "storage_location",
                "notes",
            )
        }),
        ("Display", {
            "fields": ("display_order",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    def location_display(self, obj):
        return obj.location.name if obj.location else "-"
    location_display.short_description = "Location"
    location_display.admin_order_field = "location__name"

    def category_display(self, obj):
        return obj.get_category_display()
    category_display.short_description = "Category"

    def vendor_display(self, obj):
        if not obj.vendor:
            return "No Vendor"

        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 4px; color: white;">{}</span>',
            obj.vendor.color or "#6B5B95",
            obj.vendor.name
        )
    vendor_display.short_description = "Vendor"
    vendor_display.admin_order_field = "vendor__name"

    def pack_ratio(self, obj):
        if not obj.pack_size or obj.pack_size == 1:
            return f"1 {obj.order_unit}"
        plural = "s" if obj.pack_size != 1 else ""
        return f"1 {obj.order_unit} = {obj.pack_size} {obj.count_unit}{plural}"
    pack_ratio.short_description = "Pack Ratio"

    def pack_ratio_display(self, obj):
        return self.pack_ratio(obj)
    pack_ratio_display.short_description = "Pack Ratio"

    def unit_display(self, obj):
        return obj.unit.display_name if obj.unit else "-"
    unit_display.short_description = "Unit"
    unit_display.admin_order_field = "unit__name"
