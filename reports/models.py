from django.db import models
from django.utils.translation import gettext_lazy as _

# -----------------------------------
# :: Report Model
# -----------------------------------

"""
This model represents a report entry that links an inventory item with its
vendor, location, frequency, and optional count sheet for tracking and exporting survey or stock data.
"""


class Report(models.Model):
    location = models.ForeignKey(
        "locations.Location", on_delete=models.PROTECT, null=True, db_index=True)
    frequency = models.ForeignKey(
        "frequency.Frequency", on_delete=models.PROTECT, null=True, db_index=True)
    period_start = models.DateField(null=True, blank=True)
    count_entries = models.ManyToManyField(
        'counts.CountEntry', related_name='reports')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # -----------------------------------
    # :: Report Model
    # -----------------------------------

    """
    Meta information for the Report model.
    """

    class Meta:
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")
        ordering = ["-created_at"]

    # -----------------------------------
    # :: Report Model
    # -----------------------------------

    """
    String representation of the Report model.
    """

    def __str__(self) -> str:
        return f"Entry #{self.id or '?'} - {self.created_at}"
