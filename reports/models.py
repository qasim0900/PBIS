from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone

class Report(models.Model):
    location = models.ForeignKey(
        "locations.Location", on_delete=models.PROTECT, null=True, db_index=True)
    frequency = models.ForeignKey(
        "frequency.Frequency", on_delete=models.PROTECT, null=True, db_index=True)
    period_start = models.DateField(null=True, blank=True)
    count_entries = models.ManyToManyField(
        'counts.CountEntry', related_name='reports')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reports_created", db_index=True
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reports_updated", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reports_deleted"
    )

    def __str__(self) -> str:
        return f"Entry {self.id} - {self.location}" 

    def soft_delete(self, user):
        """Soft delete the report with user tracking"""
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.is_active = False
        self.save(update_fields=['deleted_at', 'deleted_by', 'is_active'])

    @property
    def is_deleted(self):
        """Check if report is soft deleted"""
        return self.deleted_at is not None

    class Meta:
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['location', 'period_start']),
            models.Index(fields=['frequency', 'period_start']),
            models.Index(fields=['created_at', 'created_by']),
            models.Index(fields=['deleted_at']),
        ]
