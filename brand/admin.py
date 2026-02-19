from django.contrib import admin
from .models import Brand

# -------------------------
# :: Brand Admin
# -------------------------

""" 
Admin interface for Brand model.
Provides list display, filtering, searching, and ordering capabilities.
"""


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):

    # ---------------------
    # :: List Display
    # ---------------------

    """ 
    Fields to display in the admin list view for Brand model.
    """

    list_display = (
        "id",
        "name",
        "vendor",
        "is_vendor_assigned",
        "created_at",
        "updated_at",
    )

    # ---------------------
    # :: List Filter
    # ---------------------

    """ 
    Fields to filter in the admin list view for Brand model.
    """

    list_filter = (
        "vendor",
        "created_at",
    )

    # -----------------------
    # :: Search Fields
    # -----------------------

    """ 
    Fields to search in the admin list view for Brand model.
    """

    search_fields = (
        "name",
        "description",
        "vendor__name",
    )

    # -----------------------
    # :: ReadOnly Fields
    # -----------------------

    """ 
    Fields to make read-only in the admin interface.
    """

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    # -----------------------
    # :: fieldsets Fields
    # -----------------------

    """ 
    This organises **Brand fields into sections** in Django Admin, grouping related fields (basic info, vendor, timestamps) 
    and collapsing less-used ones.
    """

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

    # -------------------------------------
    # :: is_vendor_assigned Function
    # -------------------------------------

    """ 
    This defines a **custom admin column** that shows whether a vendor is assigned to the brand.
    """

    def is_vendor_assigned(self, obj):
        return bool(obj.vendor)

    is_vendor_assigned.boolean = True
    is_vendor_assigned.short_description = "Vendor Assigned"
