from django.contrib import admin
from .models import Brand

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "vendor",
        "is_vendor_assigned",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "vendor",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
        "vendor__name",
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
            )
        }),
        ("Vendor Information", {
            "fields": (
                "vendor",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

    def is_vendor_assigned(self, obj):
        return bool(obj.vendor)

    is_vendor_assigned.boolean = True
    is_vendor_assigned.short_description = "Vendor Assigned"
