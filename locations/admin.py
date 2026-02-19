from .models import Location
from django.contrib import admin
from django.utils.html import format_html

# -----------------------------
# :: Location Admin Class
# -----------------------------

""" 
This Django Admin configuration customises the **Location** model's admin interface by defining list columns, 
filters, search, read-only fields, auto-generated codes, and grouping fields into organised sections.
"""


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):

    # -----------------------------
    # :: List Display
    # -----------------------------

    """ 
    This specifies which **Location fields are shown as columns** in the Django Admin list view.
    """

    list_display = (
        "name",
        "code",
        "timezone",
        "frequency_display",
        "active_status",
        "item_count",
        "created_at",
    )

    # -----------------------------
    # :: List Filter
    # -----------------------------

    """ 
    This adds **sidebar filters** in Django Admin to filter Location records by **active status, timezone, and frequency**.
    """

    list_filter = (
        "is_active",
        "timezone",
        "frequency",
    )

    # -----------------------------
    # :: Search Fields
    # -----------------------------

    """ 
    This enables **searching Location records** in Django Admin by **name** and **code**.
    """

    search_fields = (
        "name",
        "code",
    )

    # -----------------------------
    # :: ReadOnly Fields
    # -----------------------------

    """ 
    This makes the **created_at, updated_at, and item_count** fields **read-only** in Django Admin, so they cannot be edited.
    """

    readonly_fields = (
        "created_at",
        "updated_at",
        "item_count",
    )

    # -----------------------------
    # :: Prepopulated Fields
    # -----------------------------

    """ 
    This automatically fills the **code** field in Django Admin based on the **name** field.
    """

    prepopulated_fields = {
        "code": ("name",)
    }

    # -----------------------------
    # :: Field Sets
    # -----------------------------

    """ 
    This organises **Location fields into sections** in Django Admin, grouping related fields and collapsing less-used ones like statistics and timestamps.
    """

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

    # -------------------------------
    # :: frequency_display Function
    # -------------------------------

    """ 
    This defines a **custom column** in Django Admin that shows a human-readable **frequency** for each Location, with a label “Frequency” and allows sorting by `frequency.recurrence_type`.
    """

    def frequency_display(self, obj):
        if obj.frequency:
            return obj.frequency.__str__()
        return "—"
    frequency_display.short_description = "Frequency"
    frequency_display.admin_order_field = "frequency__recurrence_type"

    # -----------------------------
    # :: active_status Function
    # -----------------------------

    """ 
    This defines a **custom admin column** showing a coloured, readable **active/inactive status** 
    for each Location, labelled “Status” and sortable by `is_active`.
    """

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

    # -----------------------------
    # :: item_count Function
    # -----------------------------

    """ 
    This defines a **custom admin column** that shows the **number of related items** for each Location, 
    labelled “Items” and sortable by the related items count.
    """

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Items"
    item_count.admin_order_field = "items__count"
