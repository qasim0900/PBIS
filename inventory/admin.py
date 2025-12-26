from .models import CatalogItem
from django.contrib import admin

# -----------------------------------
# :: Catalog Item Admin Class
# -----------------------------------

"""
Custom Django admin for CatalogItem providing list display, 
filters, search, read-only fields, validation on save, and organized fieldsets for better usability.
"""


@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "count_unit",
        "order_unit",
        "pack_size",
        "pack_ratio_display",
        "is_active",
        "created_at",
        "updated_at",
    )
    list_filter = ("category", "is_active")
    search_fields = ("name", "category", "count_unit", "order_unit", "notes")
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at", "pack_ratio_display")
    fieldsets = (
        (None, {
            "fields": (
                "name",
                "category",
                "count_unit",
                "order_unit",
                "pack_size",
                "helper_text",
                "notes",
                "is_active",
            )
        }),
        ("Readonly Info", {
            "fields": ("pack_ratio_display", "created_at", "updated_at")
        }),
    )
    # -----------------------------------
    # :: Save Model Function
    # -----------------------------------

    """
    Validate pack_size before saving.
    """

    def save_model(self, request, obj, form, change):
        if obj.pack_size <= 0:
            raise ValueError("Pack size must be greater than zero.")
        super().save_model(request, obj, form, change)
