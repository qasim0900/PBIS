from __future__ import annotations
from django.db import models
from datetime import timedelta
from django.conf import settings
from dataclasses import dataclass
from django.utils import timezone
from reports.models import Report
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from decimal import Decimal, ROUND_HALF_UP, ROUND_CEILING


# -----------------------------------
# :: Count Sheet Sattus Function
# -----------------------------------


"""
Defines status choices for a count sheet with human-readable labels: Draft, Submitted, and Archived.
"""


class CountSheetStatus(models.TextChoices):
    DRAFT = "draft", _("Draft")
    SUBMITTED = "submitted", _("Submitted")
    ARCHIVED = "archived", _("Archived")

# -----------------------------------
# :: Order Calculation Class
# -----------------------------------


"""
Defines an immutable data class to store order calculation results including quantity, order units, and highlight state.
"""


@dataclass(frozen=True)
class OrderCalculation:
    qty_to_order: Decimal
    order_units: Decimal
    highlight_state: str


# -----------------------------------
# :: Count Sheet Class
# -----------------------------------


"""
Defines status choices for a count sheet with human-readable labels: Draft, Submitted, and Archived.
"""


class CountSheet(models.Model):
    location = models.ForeignKey(
        'locations.Location',
        on_delete=models.PROTECT,
        related_name="count_sheets"
    )
    count_date = models.DateField(default=timezone.localdate)
    status = models.CharField(
        max_length=32, choices=CountSheetStatus.choices, default=CountSheetStatus.DRAFT)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="submitted_count_sheets"
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="count_sheets_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="count_sheets_updated"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True,
                             help_text=_("Optional notes"))

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Meta class to define ordering and verbose names for the CountSheet model.
    """

    class Meta:
        ordering = ["-count_date"]
        verbose_name = _("Count Sheet")
        verbose_name_plural = _("Count Sheets")

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns a string representation of the count entry in the format “sheet · item.”
    """

    def __str__(self):
        return f"{self.location} - {self.count_date} ({self.get_status_display()})"

    def submit(self, user):
        if self.status != CountSheetStatus.DRAFT:
            raise ValidationError(_("Only draft sheets can be submitted."))
        self.status = CountSheetStatus.SUBMITTED
        self.submitted_by = user
        self.submitted_at = timezone.now()
        self.save(update_fields=['status', 'submitted_by', 'submitted_at'])
        count_date = self.count_date
        week_day = count_date.weekday()
        week_start = count_date - timedelta(days=week_day)
        report, created = Report.objects.get_or_create(
            location=self.location,
            period_start=week_start,
            defaults={'is_active': True}
        )
        report.count_entries.add(*self.entries.all())


# -----------------------------------
# :: Count Entry Class
# -----------------------------------

"""
This defines a **CountEntry model** representing an inventory count record, linking a **CountSheet** and an **InventoryItem**, storing quantities and order calculations, with a **highlight status** to indicate stock level alerts.
"""


class CountEntry(models.Model):
    HIGHLIGHT_RED = "red"
    HIGHLIGHT_YELLOW = "yellow"
    HIGHLIGHT_GREEN = "green"

    HIGHLIGHT_CHOICES = (
        (HIGHLIGHT_RED, _("Order Needed")),
        (HIGHLIGHT_YELLOW, _("OK")),
        (HIGHLIGHT_GREEN, _("Over Par")),
    )

    sheet = models.ForeignKey(
        CountSheet,
        on_delete=models.CASCADE,
        related_name="entries"
    )

    item = models.ForeignKey(
        'inventory.InventoryItem',
        on_delete=models.PROTECT,
        related_name="count_entries"
    )

    on_hand_quantity = models.DecimalField(
        max_digits=9, decimal_places=2, default=0)
    calculated_qty_to_order = models.DecimalField(
        max_digits=9, decimal_places=2, default=0, editable=False)
    calculated_order_units = models.DecimalField(
        max_digits=9, decimal_places=2, default=0, editable=False)
    highlight_state = models.CharField(
        max_length=8, choices=HIGHLIGHT_CHOICES, editable=False)
    notes = models.TextField(blank=True, null=True, help_text=_(
        "Optional notes for the count entry"))
    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns a string representation of the count entry in the format “sheet · item.”
    """

    def __str__(self) -> str:
        return f"{self.sheet} · {self.item}"

    # -----------------------------------
    # :: Clean Function
    # -----------------------------------

    """
    Validates the count entry, ensuring on-hand quantity is non-negative and that the override matches the item.
    """

    def clean(self) -> None:
        super().clean()
        if self.on_hand_quantity < 0:
            raise ValidationError(
                {"on_hand_quantity": _("Cannot be negative.")})

    # -----------------------------------
    # :: Save Function
    # -----------------------------------

    """
    Overrides the save method to automatically recalculate order quantities and highlight status before saving the count entry.
    """

    def save(self, *args, recalculate: bool = True, **kwargs):
        if recalculate:
            calc = self.perform_calculation()
            self.calculated_qty_to_order = calc.qty_to_order
            self.calculated_order_units = calc.order_units
            self.highlight_state = calc.highlight_state

        super().save(*args, **kwargs)
        if self.sheet.status == CountSheetStatus.SUBMITTED and not self.sheet.submitted_at:
            self.sheet.submitted_at = timezone.now()
            self.sheet.save(update_fields=['submitted_at'])
            count_date = self.sheet.count_date
            week_day = count_date.weekday()
            week_start = count_date - timedelta(days=week_day)
            report, created = Report.objects.get_or_create(
                location=self.sheet.location,
                period_start=week_start,
                defaults={'is_active': True}
            )
            report.count_entries.add(self)

    # -----------------------------------
    # :: Perform Calculation Function
    # -----------------------------------

    """
    Calculates the quantity and units to order for an item based on 
    stock levels, pack size, minimum order, and highlights inventory status.
    """

    def perform_calculation(self):
        par_level = self.item.par_level or Decimal("0")
        order_point = self.item.order_point or Decimal("0")
        on_hand = self.on_hand_quantity or Decimal("0")
        pack_size = self.item.pack_size or Decimal("1")

        if pack_size <= 0:
            raise ValidationError(_("Pack size must be greater than zero."))

        deficit = par_level - on_hand
        if deficit <= 0:
            return OrderCalculation(Decimal("0"), Decimal("0"), self.HIGHLIGHT_GREEN)

        qty_to_order = deficit.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP)
        order_units = (
            qty_to_order / pack_size).quantize(Decimal("1"), rounding=ROUND_CEILING)
        highlight = self.HIGHLIGHT_RED if on_hand <= order_point else self.HIGHLIGHT_YELLOW

        return OrderCalculation(qty_to_order, order_units, highlight)
