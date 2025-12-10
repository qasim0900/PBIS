from __future__ import annotations
from datetime import date
from django.conf import settings
from dataclasses import dataclass
from django.utils import timezone
from typing import Iterable, Optional
from django.db import models, transaction
from django.core.exceptions import ValidationError
from decimal import Decimal, ROUND_HALF_UP, ROUND_UP
from django.utils.translation import gettext_lazy as _
from locations.models import CountFrequency, Location, LocationOverride


# -----------------------------------
# :: Cell Decimal Function
# -----------------------------------

"""
Rounds a Decimal value up to the nearest whole number.
"""


def ceil_decimal(value: Decimal) -> Decimal:
    return value.to_integral_value(rounding=ROUND_UP)


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
# :: Count Sheet Manager Class
# -----------------------------------
"""
Custom manager for CountSheet providing methods to get today's sheet for a location and frequency, 
and to ensure a daily sheet exists, creating and seeding it if necessary.
"""


class CountSheetManager(models.Manager):

    # -----------------------------------
    # :: For Today Function
    # -----------------------------------

    """
    Returns count sheets for a specific location and frequency on a given date, defaulting to today.
    """

    def for_today(self, *, location: Location, frequency: str, target_date: Optional[date] = None):
        target_date = target_date or timezone.localdate()
        return self.get_queryset().filter(
            location=location,
            frequency=frequency,
            count_date=target_date,
        )

    # -----------------------------------
    # :: Ensure Daily Sheet Function
    # -----------------------------------

    """
    Ensures a daily count sheet exists for a given location and frequency, creating and seeding it if necessary.
    """

    def ensure_daily_sheet(
        self,
        *,
        location: Location,
        frequency: str,
        target_date: Optional[date] = None,
        created_by=None,
    ) -> "CountSheet":
        target_date = target_date or timezone.localdate()
        sheet, created = self.get_or_create(
            location=location,
            frequency=frequency,
            count_date=target_date,
            defaults={"created_by": created_by},
        )
        if created:
            sheet.seed_entries_from_overrides()
        sheet._was_created = created
        return sheet


# -----------------------------------
# :: Count Sheet Function
# -----------------------------------

"""
Represents a count sheet for a specific location, frequency, and date, with status management, 
submission, reset, and seeding of entries from active location overrides.
"""


class CountSheet(models.Model):
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="count_sheets")
    frequency = models.CharField(max_length=32, choices=CountFrequency.choices)
    count_date = models.DateField(default=timezone.localdate)
    status = models.CharField(
        max_length=32,
        choices=CountSheetStatus.choices,
        default=CountSheetStatus.DRAFT,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_count_sheets",
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_count_sheets",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    locked = models.BooleanField(
        default=False,
        help_text=_(
            "Once locked, staff can no longer edit counts for this sheet."),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CountSheetManager()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Sets default ordering by newest count date and ensures each location, frequency, and date combination is unique.
    """

    class Meta:
        ordering = ("-count_date", "location__name", "frequency")
        unique_together = ("location", "frequency", "count_date")

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns a string representation of the count sheet showing location, frequency, and count date.
    """

    def __str__(self) -> str:
        return f"{self.location} · {self.frequency} · {self.count_date}"

    # -----------------------------------
    # :: Is Submitted Function
    # -----------------------------------

    """
    Returns True if the count sheet has been submitted, otherwise False.
    """

    @property
    def is_submitted(self) -> bool:
        return self.status == CountSheetStatus.SUBMITTED

    # -----------------------------------
    # :: Submit Function
    # -----------------------------------

    """
    Submits the count sheet, marking it as submitted, locking it, and recording the submitting user and timestamp.
    """

    def submit(self, user):
        if self.locked:
            raise ValidationError(
                _("Sheet is locked and cannot be submitted again."))
        with transaction.atomic():
            self.status = CountSheetStatus.SUBMITTED
            self.locked = True
            self.submitted_by = user
            self.submitted_at = timezone.now()
            self.save(update_fields=["status", "locked",
                      "submitted_by", "submitted_at", "updated_at"])

    # -----------------------------------
    # :: Reset Function
    # -----------------------------------

    """
    Clears existing counts so the next day starts with a blank form.
    """

    def reset(self):
        self.entries.all().update(on_hand_quantity=Decimal("0"), notes="")
        self.status = CountSheetStatus.DRAFT
        self.locked = False
        self.submitted_by = None
        self.submitted_at = None
        self.save(update_fields=["status", "locked",
                  "submitted_by", "submitted_at", "updated_at"])

    # ------------------------------------------
    # :: Send Entries From Overrides Function
    # ------------------------------------------

    """
    Populates the count sheet with entries based on active location overrides, preserving display order and item names.
    """

    def seed_entries_from_overrides(self):
        overrides = (
            LocationOverride.objects.active()
            .for_location(self.location)
            .select_related("item")
            .order_by("display_order", "item__name")
        )
        CountEntry.bulk_create_from_overrides(sheet=self, overrides=overrides)


# -----------------------------------
# :: Count Entry Query Set Class
# -----------------------------------
"""
Custom queryset for CountEntry providing filters by frequency and entries due today based on the day of the week.
"""


class CountEntryQuerySet(models.QuerySet):

    # -----------------------------------
    # :: For Frequency Function
    # -----------------------------------

    """
    Filters CountEntry records to include only those belonging to sheets with the specified frequency.
    """

    def for_frequency(self, frequency: str):
        return self.filter(sheet__frequency=frequency)

    # -----------------------------------
    # :: Category Item Serializer Class
    # -----------------------------------

    """
    Filters entries that are due to be counted based on the day-of-week.Monday is 0.
    """

    def due_today(self, *, current_weekday: int):
        day_map = {
            CountFrequency.MON_WED: {0, 2},
            CountFrequency.WEEKLY: set(range(0, 7)),
            CountFrequency.BIWEEKLY: {0},
            CountFrequency.MONTHLY: {0},
            CountFrequency.SEMIANNUAL: {0},
        }
        return self.filter(
            override__frequency__in=[
                freq
                for freq, days in day_map.items()
                if current_weekday in days
            ]
        )


# -----------------------------------
# :: Count Entry Class
# -----------------------------------

"""
Represents an inventory count record for a specific sheet and item, automatically calculating quantities 
to order, highlight state, and enforcing data integrity with validations.
"""


class CountEntry(models.Model):
    HIGHLIGHT_LOW = "low"
    HIGHLIGHT_NEAR = "near"
    HIGHLIGHT_OK = "ok"

    HIGHLIGHT_CHOICES = (
        (HIGHLIGHT_LOW, _("Low")),
        (HIGHLIGHT_NEAR, _("Near Par")),
        (HIGHLIGHT_OK, _("OK")),
    )

    sheet = models.ForeignKey(
        CountSheet, on_delete=models.CASCADE, related_name="entries")
    override = models.ForeignKey(
        LocationOverride,
        on_delete=models.PROTECT,
        related_name="count_entries",
    )
    item = models.ForeignKey(
        "inventory.CatalogItem",
        on_delete=models.PROTECT,
        related_name="count_entries",
    )
    on_hand_quantity = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        default=Decimal("0"),
        help_text=_("Quantity counted by staff in count units."),
    )
    calculated_qty_to_order = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        default=Decimal("0"),
        editable=False,
    )
    calculated_order_units = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        default=Decimal("0"),
        editable=False,
    )
    highlight_state = models.CharField(
        max_length=8,
        choices=HIGHLIGHT_CHOICES,
        default=HIGHLIGHT_OK,
        editable=False,
    )
    notes = models.CharField(max_length=255, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="count_entries_updated",
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CountEntryQuerySet.as_manager()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Handles validation, automatic calculation of order quantities and highlight states, string representation, 
    and bulk creation of count entries from location overrides.
    """

    class Meta:
        ordering = ("sheet__location__name",
                    "override__display_order", "item__name")
        unique_together = ("sheet", "item")

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
            raise ValidationError({"on_hand_quantity": _(
                "On-hand quantity cannot be negative.")})
        if self.override.item_id != self.item_id:
            raise ValidationError(_("Override does not match item."))

    # -----------------------------------
    # :: Save Function
    # -----------------------------------

    """
    Overrides the save method to automatically recalculate order quantities and highlight status before saving the count entry.
    """

    def save(self, *args, recalculate: bool = True, **kwargs):
        if recalculate:
            calculation = self.perform_calculation()
            self.calculated_qty_to_order = calculation.qty_to_order
            self.calculated_order_units = calculation.order_units
            self.highlight_state = calculation.highlight_state
        super().save(*args, **kwargs)

    # -----------------------------------
    # :: Perform Calculation Function
    # -----------------------------------

    """
    Calculates the quantity and units to order for an item based on 
    stock levels, pack size, minimum order, and highlights inventory status.
    """

    def perform_calculation(self) -> OrderCalculation:
        par = self.override.par_level
        order_point = self.override.order_point
        pack_size = self.item.pack_size
        min_order_qty = self.override.effective_min_order_qty

        on_hand = self.on_hand_quantity
        qty_to_order = par - on_hand
        if qty_to_order < 0:
            qty_to_order = Decimal("0")
        qty_to_order = qty_to_order.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP)

        if pack_size <= 0:
            raise ValidationError(
                _("Pack size must be greater than zero to compute order units."))

        order_units = qty_to_order / pack_size
        order_units = ceil_decimal(order_units)

        if min_order_qty:
            order_units = max(order_units, ceil_decimal(min_order_qty))

        if on_hand <= order_point:
            highlight = self.HIGHLIGHT_LOW
        elif on_hand <= par:
            highlight = self.HIGHLIGHT_NEAR
        else:
            highlight = self.HIGHLIGHT_OK

        return OrderCalculation(
            qty_to_order=qty_to_order,
            order_units=order_units,
            highlight_state=highlight,
        )

    # -----------------------------------------
    # :: Bulk Create From Over Rides Function
    # -----------------------------------------

    """
    Creates multiple inventory entries from overrides, calculating order quantities and highlights for each, and inserts them in bulk.
    """

    @classmethod
    def bulk_create_from_overrides(cls, *, sheet: CountSheet, overrides: Iterable[LocationOverride]):
        entries = []
        for override in overrides:
            entry = cls(
                sheet=sheet,
                override=override,
                item=override.item,
            )
            calculation = entry.perform_calculation()
            entry.calculated_qty_to_order = calculation.qty_to_order
            entry.calculated_order_units = calculation.order_units
            entry.highlight_state = calculation.highlight_state
            entries.append(entry)
        cls.objects.bulk_create(entries)


# -----------------------------------
# :: Count Entry Audit Class
# -----------------------------------


"""
Defines an audit log for CountEntry that tracks changes to on-hand quantities, who made the change, when, and optional notes.
"""


class CountEntryAudit(models.Model):
    entry = models.ForeignKey(
        CountEntry, on_delete=models.CASCADE, related_name="audit_log")
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="count_entry_audit_events",
    )
    previous_on_hand = models.DecimalField(max_digits=9, decimal_places=2)
    new_on_hand = models.DecimalField(max_digits=9, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, blank=True)

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Sets audit records to be ordered by change time and defines their string representation showing the entry and timestamp.
    """

    class Meta:
        ordering = ("-changed_at",)

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns a string representation of the audit showing the related entry and the timestamp of the change.
    """

    def __str__(self) -> str:
        return f"{self.entry} audit @ {self.changed_at}"
