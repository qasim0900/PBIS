from django.contrib import admin
from .models import CountSheet, CountEntry, CountEntryAudit

# --------------------------------------
# :: Count Entry Inline for CountSheet
# --------------------------------------

""" 
Defines an inline admin for CountEntry, showing key fields with most read-only, while allowing edits to on_hand_quantity and notes.
"""


class CountEntryInline(admin.TabularInline):
    model = CountEntry
    extra = 0
    readonly_fields = (
        "item",
        "par_level_display",
        "order_point_display",
        "storage_location_display",
        "min_order_qty_display",
        "frequency_display",
        "calculated_qty_to_order",
        "calculated_order_units",
        "highlight_display",
        "updated_at",
        "updated_by",
    )
    fields = (
        "item",
        "on_hand_quantity",
        "calculated_qty_to_order",
        "calculated_order_units",
        "highlight_display",
        "notes",
        "updated_by",
        "updated_at",
    )
    can_delete = True
    show_change_link = True

    # -----------------------------------
    # :: Par Level Display Function
    # -----------------------------------

    """
    Displays the par_level field in the admin with the label "Par Level".
    """

    def par_level_display(self, obj):
        return obj.par_level
    par_level_display.short_description = "Par Level"

    # -----------------------------------
    # :: Order Point Display Function
    # -----------------------------------

    """
    Displays the order_point field in the admin with the label "Order Point".
    """

    def order_point_display(self, obj):
        return obj.order_point
    order_point_display.short_description = "Order Point"

    # --------------------------------------
    # :: Storage Location Display Function
    # --------------------------------------

    """
    Displays the storage_location field in the admin with the label "Storage Location".
    """

    def storage_location_display(self, obj):
        return obj.storage_location
    storage_location_display.short_description = "Storage Location"

    # -----------------------------------
    # :: Min Order Qty Display Function
    # -----------------------------------

    """
    Displays the min_order_qty field in the admin with the label "Min Order Qty".
    """

    def min_order_qty_display(self, obj):
        return obj.min_order_qty
    min_order_qty_display.short_description = "Min Order Qty"

    # -----------------------------------
    # :: Frequency Function
    # -----------------------------------

    """
    Displays the frequency field in the admin with the label "Frequency".
    """

    def frequency_display(self, obj):
        return obj.frequency
    frequency_display.short_description = "Frequency"

    # -----------------------------------
    # :: High Light Display Function
    # -----------------------------------

    """
    Displays the highlight_state field in the admin with the label "Highlight".
    """

    def highlight_display(self, obj):
        return obj.highlight_state
    highlight_display.short_description = "Highlight"

# -----------------------------------
# :: Count Sheet Admin
# -----------------------------------


""" 
Configures the Django admin for CountSheet, displaying key fields, filters, search, read-only 
fields, and including inline CountEntry details with custom is_submitted and entry_count columns.
"""


@admin.register(CountSheet)
class CountSheetAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "location",
        "frequency_display",
        "count_date",
        "status",
        "is_submitted",
        "locked",
        "created_by",
        "submitted_by",
        "submitted_at",
        "created_at",
        "updated_at",
        "entry_count",
    )
    list_filter = ("location", "frequency", "status", "locked")
    search_fields = ("location__name",)
    readonly_fields = ("created_at", "updated_at",
                       "entry_count", "is_submitted")
    inlines = [CountEntryInline]

    # -----------------------------------
    # :: Is Submit Function
    # -----------------------------------

    """
    Displays the is_submitted status as a boolean in the admin with the label "Submitted?".
    """

    def is_submitted(self, obj):
        return obj.is_submitted
    is_submitted.boolean = True
    is_submitted.short_description = "Submitted?"

    # -----------------------------------
    # :: Entry Count Function
    # -----------------------------------

    """
    Shows the total number of entries for an object in the admin with the label "Entries Count".
    """

    def entry_count(self, obj):
        return obj.entries.count()
    entry_count.short_description = "Entries Count"

    # -----------------------------------
    # :: Frequency Display Function
    # -----------------------------------

    """
    Displays the frequency field in the admin with the label "Frequency".
    """

    def frequency_display(self, obj):
        return obj.frequency
    frequency_display.short_description = "Frequency"


# -----------------------------------
# :: Count Entry Admin
# -----------------------------------


""" 
Configures the Django admin for CountEntry, showing key fields, filters, search, read-only calculated fields, and custom ordering.
"""


@admin.register(CountEntry)
class CountEntryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "sheet",
        "item",
        "on_hand_quantity",
        "calculated_qty_to_order",
        "calculated_order_units",
        "highlight_display",
        "updated_by",
        "updated_at",
    )
    list_filter = ("highlight_state", "sheet__location", "sheet__frequency")
    search_fields = ("item__name", "sheet__location__name")
    readonly_fields = (
        "calculated_qty_to_order",
        "calculated_order_units",
        "highlight_display",
        "updated_at",
        "updated_by",
    )
    ordering = ("sheet__location__name", "item__name")

    # -----------------------------------
    # :: High Light Display Function
    # -----------------------------------

    """
    Displays the highlight_state field in the admin with the label "Highlight".
    """

    def highlight_display(self, obj):
        return obj.highlight_state
    highlight_display.short_description = "Highlight"


# -----------------------------------
# :: Count Entry Audit Admin
# -----------------------------------


""" 
Configures the Django admin for CountEntryAudit, displaying change details, filtering by user, 
providing search, setting all fields as read-only, and ordering by most recent changes.
"""


@admin.register(CountEntryAudit)
class CountEntryAuditAdmin(admin.ModelAdmin):
    list_display = ("id", "entry", "previous_on_hand",
                    "new_on_hand", "changed_by", "changed_at")
    list_filter = ("changed_by",)
    search_fields = ("entry__item__name", "entry__sheet__location__name")
    readonly_fields = ("entry", "previous_on_hand",
                       "new_on_hand", "changed_by", "changed_at", "note")
    ordering = ("-changed_at",)
