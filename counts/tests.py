from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from locations.models import Location, CountFrequency
from counts.models import CountSheet
from counts.utils import (
    calculate_order_quantity,
    calculate_order_units,
    get_inventory_status,
)

User = get_user_model()


# ------------------------------------------
# :: Calculation Utils Test Case Class
# ------------------------------------------

"""
This test case verifies inventory calculation utilities such as order quantity, order units, and inventory status logic.
"""


class CalculationUtilsTestCase(TestCase):

    # ---------------------------------------------
    # :: test calculate order quantity Function
    # ---------------------------------------------

    """
    Par Level - Current Count = Quantity Needed
    """

    def test_calculate_order_quantity(self):
        par = Decimal("100")
        current = Decimal("30")
        result = calculate_order_quantity(par, current)
        self.assertEqual(result, Decimal("70.00"))

    # ------------------------------------------------------------------
    # :: test calculate order quantity zero if overstocked Function
    # ------------------------------------------------------------------

    """
    Should return 0 if current > par
    """

    def test_calculate_order_quantity_zero_if_overstocked(self):
        par = Decimal("50")
        current = Decimal("100")
        result = calculate_order_quantity(par, current)
        self.assertEqual(result, Decimal("0.00"))

    # -----------------------------------------
    # :: test calculate order units Function
    # -----------------------------------------

    """
    Quantity / Pack Size = Order Units (rounded up)
    """

    def test_calculate_order_units(self):
        quantity = Decimal("100")
        pack_size = Decimal("12")
        result = calculate_order_units(quantity, pack_size)
        self.assertEqual(result, Decimal("9"))

    # ------------------------------------------------
    # :: test get inventory status critical Function
    # ------------------------------------------------

    """
    Below order point = critical
    """

    def test_get_inventory_status_critical(self):
        status = get_inventory_status(
            Decimal("5"), Decimal("10"), Decimal("50")
        )
        self.assertEqual(status, "critical")


# ---------------------------------------
# :: Count Sheet Model Test Case Class
# ---------------------------------------


""" 
This test case verifies inventory calculation utilities such as order quantity, order units, and inventory status logic.
"""


class CountSheetModelTestCase(TestCase):

    # -----------------------------------
    # :: SetUp Function
    # -----------------------------------

    """
    Below order point = critical
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.location = Location.objects.create(
            name="Test Location", code="test"
        )

    # -----------------------------------
    # :: test create count sheet Function
    # -----------------------------------

    """
    Should create a count sheet
    """

    def test_create_count_sheet(self):
        sheet = CountSheet.objects.create(
            location=self.location,
            frequency=CountFrequency.WEEKLY,
            created_by=self.user,
        )
        self.assertEqual(sheet.location, self.location)
        self.assertFalse(sheet.is_submitted)

    # -------------------------------------------
    # :: Should submit and lock sheet Function
    # -------------------------------------------

    """
    Should submit and lock sheet
    """

    def test_submit_count_sheet(self):
        sheet = CountSheet.objects.create(
            location=self.location,
            frequency=CountFrequency.WEEKLY,
        )
        sheet.submit(self.user)
        self.assertTrue(sheet.is_submitted)
        self.assertTrue(sheet.locked)
