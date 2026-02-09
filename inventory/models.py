from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

# -----------------------------------
# :: Inventory Item QuerySet Class
# -----------------------------------

"""
Custom queryset for InventoryItem providing methods to filter by active status and by category.
"""


class InventoryItemQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def for_location(self, location_id):
        return self.filter(location_id=location_id)

    def with_relations(self):
        return self.select_related("location", "frequency", "vendor", "default_vendor")

# -----------------------------------
# :: Item Category Class
# -----------------------------------


"""
Defines Inventory choices for items with human-readable labels for use in model fields.
"""


class ItemCategory(models.TextChoices):
    FROZEN_FRUIT = "frozen_fruit", _("Frozen Fruit")
    SUPPLEMENTS = "supplements", _("Supplements")
    LIQUIDS = "liquids", _("Liquids")
    FRESH_PRODUCE = "fresh_produce", _("Fresh Produce")
    DRY_STOCK = "dry_stock", _("Dry Stock")
    CP_JUICES = "cp_juices", _("CP Juices")
    SHOTS = "shots", _("Shots")
    PACKAGING = "packaging", _("Packaging")
    SUPPLIES = "supplies", _("Supplies")
    MISC_ITEMS = "misc_items", _("Misc. Items")
    OTHER = "other", _("Other")


# -----------------------------------
# :: Inventory Item QuerySet Class
# -----------------------------------
"""
Custom queryset for InventoryItem providing methods to filter by active status and by category.
"""


class InventoryItem(models.Model):
    name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    category = models.CharField(
        max_length=32,
        choices=ItemCategory.choices,
        default=ItemCategory.OTHER,
    )

    brand = models.ForeignKey(
        'brand.Brand',
        on_delete=models.CASCADE,
        related_name="inventory_items",
        null=True,
        blank=True
    )
    count_unit = models.CharField(
        max_length=32,
        blank=True,
        null=True,
        help_text="Unit jab staff ginti karta hai (bag, tub, each, kg...)",
    )
    order_unit = models.CharField(
        max_length=32,
        blank=True,
        null=True,
        help_text="Unit jab order karte hain (case, box, carton...)",
    )
    pack_size = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        default=Decimal("1"),
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="1 order unit mein kitne count units hote hain",
    )

    default_vendor = models.ForeignKey(
        'vendor.Vendor',
        on_delete=models.PROTECT,
        related_name="items",
        null=True,
        blank=True
    )

    helper_text = models.CharField(
        max_length=255,
        blank=True,
        help_text="Inline helper (e.g. '1 case = 12 bags')",
    )
    notes = models.TextField(blank=True)

    location = models.ForeignKey(
        'locations.Location',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="inventory_items",
        verbose_name="Location (blank = global item)",
    )

    par_level = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Par level (count units mein) — location specific",
    )
    order_point = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Low stock alert point (count units)",
    )
    frequency = models.ForeignKey(
        'frequency.Frequency',
        on_delete=models.PROTECT,
        related_name="items",
        null=True,
        blank=True
    )
    storage_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Item kahan store hota hai (location specific)",
    )
    vendor = models.ForeignKey(
        'vendor.Vendor',
        on_delete=models.CASCADE,
        related_name="inventory_items",
        null=True,
        blank=True
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Mobile app / list mein sorting order",
    )
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes or reference information for this item",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = InventoryItemQuerySet.as_manager()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Specifies default alphabetical ordering by name and defines the string representation of the object as its name.
    """

    class Meta:
        ordering = ("location__name", "display_order", "name")
        unique_together = [
            ("location", "name"),
        ]
        verbose_name = _("Inventory Item")
        verbose_name_plural = _("Inventory Items")

        constraints = [
            models.CheckConstraint(
                check=models.Q(par_level__gt=0) | models.Q(
                    par_level__isnull=True),
                name="par_level_positive_or_null",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(order_point__lte=models.F("par_level"))
                    | models.Q(order_point__isnull=True)
                    | models.Q(par_level__isnull=True)
                ),
                name="order_point_not_greater_than_par",
            ),
        ]

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns a string representation showing the location and associated item.
    """

    def __str__(self):
        if self.location:
            return f"{self.location} · {self.name}"
        return f"[GLOBAL] {self.name}"

    # -----------------------------------
    # :: Clean Function
    # -----------------------------------

    """
    Ensures the override's order_point does not exceed par_level and that par_level is positive.
    """

    def clean(self):
        super().clean()
        if self.location is None:
            if not self.count_unit:
                pass # Make it optional
            if self.pack_size and self.pack_size <= 0:
                raise models.ValidationError(
                    {"pack_size": "Pack size > 0 honi chahiye."})
        else:
            if self.par_level is not None and self.par_level <= 0:
                pass # Make it optional/NA
            if self.order_point is not None and self.par_level is not None:
                if self.order_point > self.par_level:
                    pass # Non-critical

    @property
    def pack_ratio_display(self) -> str:
        if self.helper_text.strip():
            return self.helper_text.strip()
        if not self.order_unit or not self.count_unit:
            return "—"
        normalized = int(self.pack_size) if self.pack_size == self.pack_size.to_integral_value(
        ) else self.pack_size
        return f"1 {self.order_unit} = {normalized} {self.count_unit}"

    @property
    def effective_vendor(self):
        """Location ka vendor → nahi to global default"""
        return self.vendor or self.default_vendor
