from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _

# -----------------------------------
# :: Count Frequency Class
# -----------------------------------

"""
Defines frequency choices for a model field with human-readable labels for scheduling options.
"""


class CountFrequency(models.TextChoices):
    MON_WED = "mon_wed", _("Mon & Wed")
    WEEKLY = "weekly", _("Weekly")
    BIWEEKLY = "biweekly", _("Bi-Weekly")
    MONTHLY = "monthly", _("Monthly")
    SEMIANNUAL = "semiannual", _("Semi-Annual")


# -----------------------------------
# :: Location Class
# -----------------------------------
"""
Defines a Location model with unique name and code, timezone, active status, timestamps, and default alphabetical ordering.
"""


class Location(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.SlugField(
        max_length=32,
        unique=True,
        help_text=_("Short code used in exports and views."),
    )
    timezone = models.CharField(
        max_length=64,
        default="UTC",
        help_text=_("Timezone for scheduling resets and exports."),
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

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns the name of the object as its string representation.
    """

    def __str__(self) -> str:
        return self.name


# -----------------------------------
# :: Location Overr Class
# -----------------------------------


"""
Custom queryset for LocationOverride providing helper methods to filter by active records and by a specific location.
"""


class LocationOverrideQuerySet(models.QuerySet):

    # -----------------------------------
    # :: For Location Function
    # -----------------------------------

    """
    Filters a queryset to include only active records whose related item is also active.
    """

    def active(self):
        return self.filter(is_active=True, item__is_active=True)

    # -----------------------------------
    # :: For Location Function
    # -----------------------------------

    """
    Filters a queryset to include only records associated with the given Location.
    """

    def for_location(self, location: Location):
        return self.filter(location=location)


# -----------------------------------
# :: Location Over Ride Class
# -----------------------------------


"""
Defines LocationOverride, a model linking a location to an inventory item with custom stock levels, 
order points, frequency, and display settings, including validation and helper methods.
"""


class LocationOverride(models.Model):
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name="overrides",
    )
    item = models.ForeignKey(
        "inventory.CatalogItem",
        on_delete=models.CASCADE,
        related_name="location_overrides",
    )
    par_level = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        help_text=_("Desired on-hand quantity in count units."),
    )
    order_point = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        help_text=_("Trigger point for low stock alerts in count units."),
    )
    count = models.DecimalField(
    max_digits=9,
    decimal_places=2,
    default=0,
    help_text=_("Latest counted quantity for this item at this location.")
)
    frequency = models.CharField(
        max_length=32,
        choices=CountFrequency.choices,
        default=CountFrequency.WEEKLY,
    )
    storage_location = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Where staff can find the item during counts."),
    )
    min_order_qty = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Minimum order quantity in order units (optional)."),
    )
    is_active = models.BooleanField(default=True)
    notes = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text=_("Controls ordering within the mobile views."),
    )
    vendor = models.ForeignKey(
        'inventory.Vendor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Location-specific vendor (overrides global item vendor)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = LocationOverrideQuerySet.as_manager()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Specifies default alphabetical ordering by name and defines the string representation of the object as its name.
    """

    class Meta:
        ordering = ("location", "display_order", "item__name")
        unique_together = ("location", "item")
        verbose_name = _("Location Override")
        verbose_name_plural = _("Location Overrides")

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns a string representation showing the location and associated item.
    """

    def __str__(self) -> str:
        return f"{self.location} · {self.item}"

    # -----------------------------------
    # :: Clean Function
    # -----------------------------------

    """
    Ensures the override's order_point does not exceed par_level and that par_level is positive.
    """

    def clean(self) -> None:
        super().clean()
        if self.order_point > self.par_level:
            raise models.ValidationError(
                {"order_point": _("Order point cannot exceed par level.")}
            )
        if self.par_level <= Decimal("0"):
            raise models.ValidationError(
                {"par_level": _("Par level must be greater than zero.")})

    # -------------------------------------
    # :: Effective Min Oder QTY Function
    # -------------------------------------

    """
    Returns the minimum order quantity for the override, or None if not set.
    """

    @property
    def effective_min_order_qty(self) -> Decimal | None:
        return self.min_order_qty
