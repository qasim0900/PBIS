from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


# ------------------------------------------
# :: Count Entry Validator Class
# ------------------------------------------

"""
This class provides static methods to validate inventory fields, ensuring quantities, par levels, and pack sizes are positive and consistent.
"""


class CountEntryValidator:

    # ------------------------------------------
    # :: Validate On Hand Quantity Function
    # ------------------------------------------

    """
    Ensure on-hand quantity is non-negative.
    """
    @staticmethod
    def validate_on_hand_quantity(value):
        if value < 0:
            raise ValidationError(_("On-hand quantity cannot be negative."))
        return value

    # ------------------------------------------
    # :: validate par vs order point Function
    # ------------------------------------------

    """
    Ensure order point does not exceed par level
    """

    @staticmethod
    def validate_par_vs_order_point(par_level, order_point):
        if order_point > par_level:
            raise ValidationError(
                {"order_point": _("Order point cannot exceed par level.")}
            )

    # ------------------------------------------
    # :: validate par level positive Function
    # ------------------------------------------

    """
    Ensure par level is positive.
    """

    @staticmethod
    def validate_par_level_positive(value):
        if value <= Decimal("0"):
            raise ValidationError(_("Par level must be greater than zero."))
        return value

    # ------------------------------------------
    # :: validate pack size positive Function
    # ------------------------------------------

    """
    Ensure pack size is greater than zero
    """

    @staticmethod
    def validate_pack_size_positive(value):
        if value <= 0:
            raise ValidationError(_("Pack size must be greater than zero."))
        return value
