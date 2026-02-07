from django.db import models
from django.utils.translation import gettext_lazy as _

# -----------------------------------
# :: Brand Class
# -----------------------------------

"""
Defines the Brand model with fields for brand details and contact information.
"""

class Brand(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_("Brand Name")
    )
    
    vendor = models.ForeignKey(
        'vendor.Vendor',
        on_delete=models.SET_NULL,
        related_name="brands",
        null=True,
        blank=True,
        verbose_name=_("Vendor")
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

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns the string representation of the Brand instance.
    """

    def __str__(self):
        return self.name

