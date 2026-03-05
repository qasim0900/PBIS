from django.db import models
from django.utils.translation import gettext_lazy as _

class Frequency(models.Model):
    frequency_name = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_("Frequency Name"),
        help_text=_("Human readable frequency name e.g Daily, Weekly, Monthly"),
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Description"),
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Frequency"
        verbose_name_plural = "Frequencies"
        ordering = ["frequency_name"]

    def __str__(self):
        return self.frequency_name
