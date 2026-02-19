from django.db import models
from django.utils.translation import gettext_lazy as _


# -----------------------------------
# :: Frequency Class
# -----------------------------------


"""
Model to store frequency options: days, weeks, months.
Allows tracking or scheduling recurring tasks/events.
"""


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

    # -----------------------------------
    # :: Meta CLass
    # -----------------------------------

    """
    This Meta class sets the human-readable singular and plural names for
    the model and orders query results by recurrence type, start day, and end day.
    """

    class Meta:
        verbose_name = "Frequency"
        verbose_name_plural = "Frequencies"
        ordering = ["frequency_name"]

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    This code returns a string showing the start and end day if the 
    recurrence is weekly, otherwise it returns the recurrence type.
    """

    def __str__(self):
        return self.frequency_name
