from .models import Report
from django.contrib import admin


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "location",
        "period_start",
        "entry_count",
        "is_active",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "location",
        ("period_start", admin.DateFieldListFilter),
        "created_at",
    )

    search_fields = (
        "location__name",
        "period_start",
    )

    ordering = ("-period_start", "-created_at")

    readonly_fields = (
        "created_at",
        "updated_at",
        "entry_count",
    )

    fieldsets = (
        ("Report Info", {
            "fields": (
                "location",
                "period_start",
                "is_active",
                "entry_count",
            )
        }),
        ("Linked Count Sheets", {
            "fields": ("count_entries",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    def entry_count(self, obj):
        return obj.count_entries.count()
    entry_count.short_description = "Count Sheets"
    entry_count.admin_order_field = "count_entries__count"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return super().has_change_permission(request, obj)
