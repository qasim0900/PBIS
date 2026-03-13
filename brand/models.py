from django.db import models
from django.utils.translation import gettext_lazy as _

class Brand(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_("Brand Name")
    )
    
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )

    class Meta:
        ordering = ("name",)
        verbose_name = _("Brand")
        verbose_name_plural = _("Brands")

    def __str__(self):
        return self.name

