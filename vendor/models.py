from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

class Vendor(models.Model):
    name = models.CharField(max_length=255, unique=True,
                            verbose_name=_("Vendor Name"))
    color = models.CharField(
        max_length=7,
        default="#6B5B95",
        verbose_name=_("Display Color"),
        help_text=_("Hex color for reports e.g. #6B5B95"),
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message=_("Enter a valid hex color code.")
            )
        ]
    )
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    location = models.ManyToManyField(
        'locations.Location',
        blank=True,
        verbose_name=_("Locations")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)
        verbose_name = _("Vendor")
        verbose_name_plural = _("Vendors")

    def __str__(self):
        return self.name
