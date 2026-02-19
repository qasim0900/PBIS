from django.contrib import admin
from .models import InventoryItem
from django.utils.html import format_html

# -------------------------
# :: Inventory Admin
# -------------------------

""" 
Admin interface for Inventory model.
Provides list display, filtering, searching, and ordering capabilities.
"""


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):

    # ---------------------
    # :: List Display
    # ---------------------

    """ 
    Fields to display in the admin list view for Vendor model.
    """

    list_display = (
        "name",
        "location_display",
        "category_display",
        "vendor_display",
        "pack_ratio",
        "par_level",
        "order_point",
        "is_active",
        "display_order",
    )

    # ---------------------
    # :: List Filter
    # ---------------------

    """ 
    Fields to filter in the admin list view for Vendor model.
    """

    list_filter = (
        "location",
        "category",
        "vendor",
        "is_active",
        "frequency",
    )

    # -----------------------
    # :: Search Fields
    # -----------------------

    """ 
    Fields to search in the admin list view for Vendor model.
    """

    search_fields = (
        "name",
        "vendor__name",
        "storage_location",
        "helper_text",
        "notes",
    )

    # -----------------------
    # :: Ordering Fields
    # -----------------------

    """ 
    Fields to order by in the admin list view for Vendor model.
    """

    ordering = ("display_order", "name")

    # -----------------------
    # :: ReadOnly Fields
    # -----------------------

    """ 
    Fields to make read-only in the admin interface.
    """

    readonly_fields = (
        "created_at",
        "updated_at",
        "pack_ratio_display",
    )


    # -----------------------
    # :: fieldsets Fields
    # -----------------------

    """ 
    This organises **Inventory item fields into sections** in Django Admin, grouping related fields (basic info, units, stock levels, 
    storage, display, timestamps) and collapsing less-used ones.
    """
    
    fieldsets = (
        ("Basic Info", {
            "fields": (
                "name",
                "location",
                "portion_size",
                "portion_cost",
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

    # ----------------------------------
    # :: Locations Display Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the related **Location name** for an object, labelled “Location” and sortable by `location.name`.
    """

    def location_display(self, obj):
        return obj.location.name if obj.location else "-"
    location_display.short_description = "Location"
    location_display.admin_order_field = "location__name"

    # ----------------------------------
    # :: category_display Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the **human-readable category** of an object, labelled “Category”.
    """

    def category_display(self, obj):
        return obj.get_category_display()
    category_display.short_description = "Category"

    # ----------------------------------
    # :: vendor_display Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that displays the **vendor name with a coloured badge**, shows 
    “No Vendor” if absent, is labelled “Vendor”, and sortable by `vendor.name`.
    """

    def vendor_display(self, obj):
        if not obj.vendor:
            return "No Vendor"

        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 4px; color: white;">{}</span>',
            obj.vendor.color or "#6B7280",
            obj.vendor.name
        )
    vendor_display.short_description = "Vendor"
    vendor_display.admin_order_field = "vendor__name"

    # ----------------------------------
    # :: pack_ratio Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that displays the **pack ratio** of an item in a readable format, labelled “Pack Ratio”.
    """

    def pack_ratio(self, obj):
        if not obj.pack_size or obj.pack_size == 1:
            return f"1 {obj.order_unit}"
        plural = "s" if obj.pack_size != 1 else ""
        return f"1 {obj.order_unit} = {obj.pack_size} {obj.count_unit}{plural}"
    pack_ratio.short_description = "Pack Ratio"

    # ----------------------------------
    # :: pack_ratio_display Function
    # ----------------------------------

    """ 
    This defines a **Django Admin display method** that reuses `pack_ratio` to show the **pack ratio** in the list view, labelled “Pack Ratio”.
    """

    def pack_ratio_display(self, obj):
        return self.pack_ratio(obj)
    pack_ratio_display.short_description = "Pack Ratio"
