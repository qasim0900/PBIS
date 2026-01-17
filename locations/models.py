from django.db import models
from django.utils.translation import gettext_lazy as _


# -----------------------------------
# :: Location Class
# -----------------------------------
"""
Defines a Location model with unique name and code, timezone, active status, timestamps, and default alphabetical ordering.
"""


class Location(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
        help_text=_("Human-readable location name."),
    )
    code = models.SlugField(
        max_length=32,
        unique=True,
        help_text=_("Short unique code used in exports and views."),
    )
    timezone = models.CharField(
        max_length=64,
        default="UTC",
        help_text=_("Timezone for scheduling and exports."),
    )
    frequency = models.ForeignKey(
        'frequency.Frequency',
        on_delete=models.PROTECT,
        related_name="locations"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Specifies default alphabetical ordering by name and defines the string representation of the object as its name.
    """

    class Meta:
        ordering = ("name",)
        verbose_name = _("Location")
        verbose_name_plural = _("Locations")
    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns the name of the object as its string representation.
    """

    def __str__(self):
        return self.name
