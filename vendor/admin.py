from django.contrib import admin
from .models import Vendor
from django.utils.html import format_html

# -------------------------
# :: Vendor Admin
# -------------------------

""" 
Admin interface for Vendor model.
Provides list display, filtering, searching, and ordering capabilities.
"""


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):

    # ---------------------
    # :: List Display
    # ---------------------

    """ 
    Fields to display in the admin list view for Vendor model.
    """

    list_display = (
        "name",
        "contact_person",
        "phone",
        "email",
        "get_locations",
        "created_at",
        "updated_at",
    )

    # ---------------------
    # :: List Filter
    # ---------------------

    """ 
    Fields to filter in the admin list view for Vendor model.
    """

    list_filter = (
        "location",
        "created_at",
        "updated_at",
    )

    # -----------------------
    # :: Search Fields
    # -----------------------

    """ 
    Fields to search in the admin list view for Vendor model.
    """
    search_fields = (
        "name",
        "contact_person",
        "phone",
        "email",
        "notes",
        "location__name",
    )

    # -----------------------
    # :: Ordering Fields
    # -----------------------

    """ 
    Fields to order by in the admin list view for Vendor model.
    """

    ordering = ("name",)

    # -----------------------
    # :: ReadOnly Fields
    # -----------------------

    """ 
    Fields to make read-only in the admin interface.
    """

    readonly_fields = ("created_at", "updated_at")

    # ----------------------------------
    # :: Get Locations Name Function
    # ----------------------------------

    """ 
    Returns a comma-separated list of location names for the vendor.
    """

    def get_locations(self, obj):
        return ", ".join([loc.name for loc in obj.location.all()])
    get_locations.short_description = "Locations"

    # -----------------------------
    # :: Colored Name Function
    # -----------------------------

    """ 
    Returns a colored name for the vendor.
    """

    def colored_name(self, obj):
        return format_html(
            '<span style="color:{};">{}</span>',
            obj.color,
            obj.name
        )
    colored_name.short_description = "Vendor Name"
