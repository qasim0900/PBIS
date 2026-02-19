from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

# -----------------------------------
# :: Vendor Class
# -----------------------------------

"""
Defines the Vendor model with fields for vendor details and contact information.
"""


class Vendor(models.Model):
    name = models.CharField(max_length=255, unique=True,
                            verbose_name=_("Vendor Name"))
    color = models.CharField(
        max_length=7,
        default="#6366F1",
        verbose_name=_("Display Color"),
        help_text=_("Hex color for reports e.g. #EF4444"),
        validators=[
            RegexValidator(
                regex=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
                message=_("Enter a valid hex color code.")
            )
        ]
    )
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    location = models.ForeignKey(
        'locations.Location',
        on_delete=models.CASCADE,
        related_name="vendors",
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)
        verbose_name = _("Vendor")
        verbose_name_plural = _("Vendors")

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns the string representation of the Vendor instance.
    """

    def __str__(self):
        return self.name
