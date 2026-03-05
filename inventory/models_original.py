from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

class Unit(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unit name (e.g., case, carton, tub, bag)"
    )
    quantity = models.PositiveIntegerField(
        help_text="Number of items in this unit"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Optional description of the unit"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Unit")
        verbose_name_plural = _("Units")

    def __str__(self):
        return f"{self.name} ({self.quantity} items)"

    @property
    def display_name(self):
Custom queryset for InventoryItem providing methods to filter by active status and by category.
Defines Inventory choices for items with human-readable labels for use in model fields.
Custom queryset for InventoryItem providing methods to filter by active status and by category.
    Specifies default alphabetical ordering by name and defines the string representation of the object as its name.
    Returns a string representation showing the location and associated item.
    Ensures the override's order_point does not exceed par_level and that par_level is positive.
        return self.vendor or self.default_vendor
