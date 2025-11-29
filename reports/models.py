from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class ExportFormat(models.TextChoices):
    PDF = "pdf", _("PDF")
    CSV = "csv", _("CSV")


class ReportArchive(models.Model):
    """
    Stores export metadata for auditing and manager review.
    """

    sheet = models.ForeignKey(
        "counts.CountSheet",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_exports",
    )
    location = models.ForeignKey(
        "locations.Location",
        on_delete=models.PROTECT,
        related_name="report_exports",
    )
    frequency = models.CharField(max_length=32)
    count_date = models.DateField()
    exported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_exports",
    )
    export_format = models.CharField(max_length=8, choices=ExportFormat.choices, default=ExportFormat.PDF)
    export_url = models.URLField(
        blank=True,
        help_text=_("Optional link to stored export (e.g., cloud storage)."),
    )
    payload_snapshot = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Lightweight snapshot of the export contents for quick reference."),
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_exports_submitted",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    export_notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = _("Report Archive")
        verbose_name_plural = _("Report Archive")

    def __str__(self) -> str:
        return f"{self.location} {self.frequency} {self.count_date}"


__all__ = ["ExportFormat", "ReportArchive"]
