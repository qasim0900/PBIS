from django.contrib import admin
from .models import Frequency

# -------------------------
# :: Frequency Admin
# -------------------------

""" 
Admin interface for Frequency model.
Provides list display, filtering, searching, and ordering capabilities.
"""


@admin.register(Frequency)
class FrequencyAdmin(admin.ModelAdmin):

    # ---------------------
    # :: List Display
    # ---------------------

    """ 
    Fields to display in the admin list view for Vendor model.
    """

    list_display = (
        "id",
        "frequency_name",
        "description",
        "is_active",
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
        "is_active",
        "created_at",
    )

    # -----------------------
    # :: Search Fields
    # -----------------------

    """ 
    Fields to search in the admin list view for Vendor model.
    """

    search_fields = ("frequency_name", "description")

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
    This organises **Inventory item fields into sections** in Django Admin, grouping related fields (basic info, units, stock levels, 
    storage, display, timestamps) and collapsing less-used ones.
    """

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "frequency_name",
                "description",
            )
        }),
        ("Status", {
            "fields": (
                "is_active",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
