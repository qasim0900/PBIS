from django.contrib import admin
from counts.models import CountEntry
from django.utils.html import format_html

@admin.register(CountEntry)
class CountEntryAdmin(admin.ModelAdmin):

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

    list_filter = (
        "highlight_state",
        ("sheet__status", admin.ChoicesFieldListFilter),
        ("sheet__count_date", admin.DateFieldListFilter),
    )

    search_fields = (
        "item__name",
    )

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

    def sheet_status(self, obj):
        return obj.sheet.get_status_display() if obj.sheet else "-"
    sheet_status.short_description = "Status"

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

    def sheet_count_date(self, obj):
        return obj.sheet.count_date if obj.sheet else "-"
    sheet_count_date.short_description = "Count Date"
    sheet_count_date.admin_order_field = "sheet__count_date"

    def sheet_updated_at(self, obj):
        return obj.sheet.updated_at if obj.sheet else "-"
    sheet_updated_at.short_description = "Updated At"

    def sheet_created_at(self, obj):
        return obj.sheet.created_at if obj.sheet else "-"
    sheet_created_at.short_description = "Created At"

    def sheet_submitted_at(self, obj):
        return obj.sheet.submitted_at if obj.sheet else "-"
    sheet_submitted_at.short_description = "Submitted At"

    def sheet_notes(self, obj):
        return obj.sheet.notes if obj.sheet else ""
    sheet_notes.short_description = "Notes"

    def sheet_submitted_by(self, obj):
        return obj.sheet.submitted_by if obj.sheet else "-"
    sheet_submitted_by.short_description = "Submitted By"

    def sheet_created_by(self, obj):
        return obj.sheet.created_by if obj.sheet else "-"
    sheet_created_by.short_description = "Created By"

    def sheet_updated_by(self, obj):
        return obj.sheet.updated_by if obj.sheet else "-"
    sheet_updated_by.short_description = "Updated By"
