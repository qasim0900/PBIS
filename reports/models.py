from django.db import models
from django.utils.translation import gettext_lazy as _

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

    class Meta:
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Entry {self.id} - {self.location}" 
