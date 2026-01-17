from django.db import models
from django.utils.translation import gettext_lazy as _


# -----------------------------------
# :: Day Class
# -----------------------------------

"""
This `Day` class defines text choices for a model field, allowing only
the seven days of the week as values, each paired with a human-readable label.
"""


class Day(models.TextChoices):
    MONDAY = "mon", _("Monday")
    TUESDAY = "tue", _("Tuesday")
    WEDNESDAY = "wed", _("Wednesday")
    THURSDAY = "thu", _("Thursday")
    FRIDAY = "fri", _("Friday")
    SATURDAY = "sat", _("Saturday")
    SUNDAY = "sun", _("Sunday")


# -----------------------------------
# :: RecurrenceType Class
# -----------------------------------

"""
    This RecurrenceType class defines a set of text choices for a model field, allowing only
    "daily," "weekly," "monthly," or "yearly" values with human-readable labels.
"""


class RecurrenceType(models.TextChoices):
    DAILY = "daily", _("Daily")
    WEEKLY = "weekly", _("Weekly")
    MONTHLY = "monthly", _("Monthly")
    YEARLY = "yearly", _("Yearly")

# -----------------------------------
# :: Frequency Class
# -----------------------------------


"""
Model to store frequency options: days, weeks, months.
Allows tracking or scheduling recurring tasks/events.
"""


class Frequency(models.Model):
    start_day = models.CharField(
        max_length=3,
        choices=Day.choices,
        blank=True,
        null=True,
        help_text=_("Start day of the week (for weekly recurrence)"),
    )
    end_day = models.CharField(
        max_length=3,
        choices=Day.choices,
        blank=True,
        null=True,
        help_text=_("End day of the week (for weekly recurrence)"),
    )
    recurrence_type = models.CharField(
        max_length=10,
        choices=RecurrenceType.choices,
        default=RecurrenceType.WEEKLY,
        help_text=_("Type of recurrence"),
    )

    times_run = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text=_(
            "Configured number of runs per period (e.g., per month for monthly, per year for yearly)"),
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
        verbose_name = _("Frequency")
        verbose_name_plural = _("Frequencies")
        ordering = ["recurrence_type", "start_day", "end_day"]
        constraints = [
            models.UniqueConstraint(
                fields=['recurrence_type', 'start_day',
                        'end_day', 'times_run'],
                name='unique_frequency'
            )
        ]

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    This code returns a string showing the start and end day if the 
    recurrence is weekly, otherwise it returns the recurrence type.
    """

    def __str__(self):
        if self.recurrence_type == self.RecurrenceType.WEEKLY and self.start_day and self.end_day:
            return f"{self.get_start_day_display()} - {self.get_end_day_display()}"
        return self.get_recurrence_type_display()
