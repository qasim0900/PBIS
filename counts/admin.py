from django.contrib import admin
from counts.models import CountEntry
from django.utils.html import format_html

# -------------------------
# :: CountEntry Admin
# -------------------------

""" 
Admin interface for CountEntry model.
Provides list display, filtering, searching, and ordering capabilities.
"""


@admin.register(CountEntry)
class CountEntryAdmin(admin.ModelAdmin):

    # ---------------------
    # :: List Display
    # ---------------------

    """ 
    Fields to display in the admin list view for Vendor model.
    """

    list_display = (
        "id",
        "item",
        "on_hand_quantity",
        "calculated_qty_to_order",
        "calculated_order_units",
        "highlight_state",
        "sheet_status",
        "sheet_count_date",
        "sheet_updated_at",
    )

    # ---------------------
    # :: List Filter
    # ---------------------

    """ 
    Fields to filter in the admin list view for Vendor model.
    """

    list_filter = (
        "highlight_state",
        ("sheet__status", admin.ChoicesFieldListFilter),
        ("sheet__count_date", admin.DateFieldListFilter),
    )

    # -----------------------
    # :: Search Fields
    # -----------------------

    """ 
    Fields to search in the admin list view for Vendor model.
    """

    search_fields = (
        "item__name",
    )

    # -----------------------
    # :: ReadOnly Fields
    # -----------------------

    """ 
    Fields to make read-only in the admin interface.
    """

    readonly_fields = (
        "calculated_qty_to_order",
        "calculated_order_units",
        "highlight_state",
        "sheet_status_display",
        "sheet_count_date",
        "sheet_notes",
        "sheet_submitted_by",
        "sheet_created_by",
        "sheet_updated_by",
        "sheet_submitted_at",
        "sheet_created_at",
        "sheet_updated_at",
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
                "item",
                "sheet",
                "sheet_status_display",
                "sheet_count_date",
            )
        }),
        ("Stock", {
            "fields": (
                "on_hand_quantity",
                "calculated_qty_to_order",
                "calculated_order_units",
                "highlight_state",
            )
        }),
        ("Notes", {
            "fields": ("sheet_notes",)
        }),
        ("Audit", {
            "fields": (
                "sheet_submitted_by",
                "sheet_created_by",
                "sheet_updated_by",
                "sheet_submitted_at",
                "sheet_created_at",
                "sheet_updated_at",
            )
        }),
    )

    # ----------------------------------
    # :: sheet_status Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the **human-readable status** of the related `CountSheet`, labelled “Status”.
    """

    def sheet_status(self, obj):
        return obj.sheet.get_status_display() if obj.sheet else "-"
    sheet_status.short_description = "Status"

    # ----------------------------------
    # :: sheet_status_display Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that displays the `CountSheet` status with **coloured text** (orange, green, or gray), labelled “Status” in Django Admin.
    """

    def sheet_status_display(self, obj):
        status = obj.sheet.status if obj.sheet else ""
        colors = {
            "draft": "orange",
            "submitted": "green",
            "archived": "gray",
        }
        color = colors.get(status, "black")
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.sheet.get_status_display() if obj.sheet else "-"
        )
    sheet_status_display.short_description = "Status"

    # ----------------------------------
    # :: sheet_count_date Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the **count date of the related CountSheet**, labelled “Count Date” and sortable by `sheet.count_date`.
    """

    def sheet_count_date(self, obj):
        return obj.sheet.count_date if obj.sheet else "-"
    sheet_count_date.short_description = "Count Date"
    sheet_count_date.admin_order_field = "sheet__count_date"

    # ----------------------------------
    # :: sheet_updated_at Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the **last updated timestamp of the related CountSheet**, labelled “Updated At”.
    """

    def sheet_updated_at(self, obj):
        return obj.sheet.updated_at if obj.sheet else "-"
    sheet_updated_at.short_description = "Updated At"

    # ----------------------------------
    # :: sheet_created_at Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the **creation timestamp of the related CountSheet**, labelled “Created At”.
    """

    def sheet_created_at(self, obj):
        return obj.sheet.created_at if obj.sheet else "-"
    sheet_created_at.short_description = "Created At"

    # ----------------------------------
    # :: sheet_submitted_at Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows the **submission timestamp of the related CountSheet**, labelled “Submitted At”.
    """

    def sheet_submitted_at(self, obj):
        return obj.sheet.submitted_at if obj.sheet else "-"
    sheet_submitted_at.short_description = "Submitted At"

    # ----------------------------------
    # :: sheet_notes Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that displays the **notes from the related CountSheet**, labelled “Notes”.
    """

    def sheet_notes(self, obj):
        return obj.sheet.notes if obj.sheet else ""
    sheet_notes.short_description = "Notes"

    # ----------------------------------
    # :: sheet_submitted_by Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows who **submitted the related CountSheet**, labelled “Submitted By”.
    """

    def sheet_submitted_by(self, obj):
        return obj.sheet.submitted_by if obj.sheet else "-"
    sheet_submitted_by.short_description = "Submitted By"

    # ----------------------------------
    # :: sheet_created_by Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows who **created the related CountSheet**, labelled “Created By”.
    """

    def sheet_created_by(self, obj):
        return obj.sheet.created_by if obj.sheet else "-"
    sheet_created_by.short_description = "Created By"

    # ----------------------------------
    # :: sheet_updated_by Function
    # ----------------------------------

    """ 
    This defines a **custom admin column** that shows who **last updated the related CountSheet**, labelled “Updated By”.
    """

    def sheet_updated_by(self, obj):
        return obj.sheet.updated_by if obj.sheet else "-"
    sheet_updated_by.short_description = "Updated By"
