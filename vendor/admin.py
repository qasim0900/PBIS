from django.contrib import admin
from .models import Vendor
from django.utils.html import format_html

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "contact_person",
        "phone",
        "email",
        "get_locations",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "location",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
        "contact_person",
        "phone",
        "email",
        "notes",
        "location__name",
    )

    ordering = ("name",)

    readonly_fields = ("created_at", "updated_at")

    def get_locations(self, obj):
        return ", ".join([loc.name for loc in obj.location.all()])
    get_locations.short_description = "Locations"

    def colored_name(self, obj):
        return format_html(
            '<span style="color:{};">{}</span>',
            obj.color,
            obj.name
        )
    colored_name.short_description = "Vendor Name"
