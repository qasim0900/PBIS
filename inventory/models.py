from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class InventoryItemQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def by_category(self, category):
        return self.filter(category=category)

    def by_location(self, location):
        return self.filter(location=location)

    def low_stock(self):
        return self.filter(
            models.Q(par_level__lte=models.F('order_point')) |
            models.Q(order_point__isnull=False, par_level__isnull=False)
        )


class InventoryItem(models.Model):
    ItemCategory = models.TextChoices(
        'ItemCategory',
        [
            ('frozen_fruit', 'Frozen Fruit'),
            ('supplements', 'Supplements'),
            ('liquids', 'Liquids'),
            ('fresh_produce', 'Fresh Produce'),
            ('dry_stock', 'Dry Stock'),
            ('cp_juices', 'CP Juices'),
            ('shots', 'Shots'),
            ('packaging', 'Packaging'),
            ('supplies', 'Supplies'),
            ('misc_items', 'Misc. Items'),
            ('other', 'Other'),
        ],
    )

    name = models.CharField(
        max_length=255,
        help_text="Product or item name"
    )
    category = models.CharField(
        max_length=50,
        choices=ItemCategory.choices,
        default='other',
        help_text="Item category for classification"
    )
    count_unit = models.CharField(
        max_length=32,
        blank=True,
        null=True,
        help_text="Unit jab staff ginti karta hai (bag, tub, each, kg...)"
    )
    order_unit = models.CharField(
        max_length=32,
        blank=True,
        null=True,
        help_text="Unit jab order place per karta hai (bag, tub, each, kg...)"
    )
    pack_size = models.PositiveIntegerField(
        default=1,
        help_text="Pack size (how many count units are in one order unit)"
    )
    default_vendor = models.ForeignKey(
        'vendor.Vendor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="default_inventory_items",
        help_text="Default vendor for this item"
    )
    brand = models.ForeignKey(
        'brand.Brand',
        on_delete=models.CASCADE,
        related_name="inventory_items",
        null=True,
        blank=True,
        help_text="Brand of the product"
    )
    vendor = models.ForeignKey(
        'vendor.Vendor',
        on_delete=models.CASCADE,
        related_name="inventory_items",
        null=True,
        blank=True,
        help_text="Preferred vendor for this item"
    )
    location = models.ForeignKey(
        'locations.Location',
        on_delete=models.CASCADE,
        related_name="inventory_items",
        null=True,
        blank=True,
        help_text="Storage location for this item"
    )
    frequency = models.ForeignKey(
        'frequency.Frequency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_items",
        help_text="How often this item is counted"
    )
    par_level = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Preferred stock level"
    )
    order_point = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="When to reorder this item"
    )
    storage_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Specific storage location within the facility"
    )
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes about this item"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this item is currently active"
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Order for displaying items in lists"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = InventoryItemQuerySet.as_manager()

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = "Inventory Item"
        verbose_name_plural = "Inventory Items"

    def __str__(self):
        return self.name

    def get_category_display(self):
        return dict(self.ItemCategory.choices).get(self.category, 'Unknown')

    @property
    def pack_ratio_display(self):
        if self.pack_size and self.order_unit and self.count_unit:
            return f"1 {self.order_unit} = {self.pack_size} {self.count_unit}"
        return "N/A"
