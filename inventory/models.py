from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _


# -----------------------------------
# :: Item Category Class
# -----------------------------------

"""
Defines category choices for items with human-readable labels for use in model fields.
"""


class ItemCategory(models.TextChoices):
    FRUIT = "fruit", _("Fruit")
    DAIRY = "dairy", _("Dairy")
    DRY = "dry", _("Dry Goods")
    PACKAGING = "packaging", _("Packaging")
    OTHER = "other", _("Other")


# -----------------------------------
# :: Catalog Item QuerySet Class
# -----------------------------------


"""
Custom queryset for CatalogItem providing methods to filter by active status and by category.
"""


class CatalogItemQuerySet(models.QuerySet):

    # -----------------------------------
    # :: Active Class
    # -----------------------------------

    """
    Filters the queryset to include only active CatalogItem records.
    """

    def active(self):
        return self.filter(is_active=True)

    # -----------------------------------
    # :: By Category Class
    # -----------------------------------

    """
    Filters the queryset to include only CatalogItem records matching the given category.
    """

    def by_category(self, category: str):
        return self.filter(category=category)


class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

# -----------------------------------
# :: Catalog Item Class
# -----------------------------------


"""
Single source of truth for inventory items shared across locations.
"""


class CatalogItem(models.Model):

    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(
        max_length=32,
        choices=ItemCategory.choices,
        default=ItemCategory.OTHER,
    )
    count_unit = models.CharField(
        max_length=32,
        help_text=_(
            "Unit used when staff count the item (e.g., bag, tub, each)."),
    )
    order_unit = models.CharField(
        max_length=32,
        help_text=_("Unit used when ordering from vendors (e.g., case, box)."),
    )
    pack_size = models.DecimalField(
        max_digits=9,
        decimal_places=2,
        default=Decimal("1"),
        help_text=_(
            "How many count units are in one order unit. Must be greater than 0."),
    )
    is_active = models.BooleanField(default=True)
    helper_text = models.CharField(
        max_length=255,
        blank=True,
        help_text=_(
            "Inline helper text shown to staff (e.g., '1 case = 10 bags')."),
    )
    notes = models.TextField(blank=True)
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='items',
        help_text="Primary vendor for ordering this item"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CatalogItemQuerySet.as_manager()

    # -----------------------------------
    # :: Meta Class
    # -----------------------------------

    """
    Sets default alphabetical ordering and defines singular and plural verbose names for the CatalogItem model.
    """

    class Meta:
        ordering = ("name",)
        verbose_name = _("Catalog Item")
        verbose_name_plural = _("Catalog Items")

    # -----------------------------------
    # :: __str__ Function
    # -----------------------------------

    """
    Returns the name of the CatalogItem as its string representation.
    """

    def __str__(self) -> str:
        return self.name

    # -----------------------------------
    # :: Clean Function
    # -----------------------------------

    """
    Validates that pack_size is greater than zero before saving the CatalogItem.
    """

    def clean(self) -> None:
        super().clean()
        if self.pack_size <= 0:
            raise models.ValidationError(
                {"pack_size": _("Pack size must be greater than zero.")})

    # -----------------------------------
    # :: Pack Ration Display Function
    # -----------------------------------

    """
    Returns a human-readable pack ratio, using helper_text if provided, or 
    calculating it from pack_size, order_unit, and count_unit.
    """

    @property
    def pack_ratio_display(self) -> str:
        helper_text = self.helper_text.strip()
        if helper_text:
            return helper_text
        normalized_pack_size = (
            int(self.pack_size) if self.pack_size == self.pack_size.to_integral_value(
            ) else self.pack_size
        )
        return f"1 {self.order_unit} = {normalized_pack_size} {self.count_unit}"
