from django.test import TestCase
from decimal import Decimal
from counts.models import CountEntry, CountSheet
from inventory.models import InventoryItem
from locations.models import Location
from frequency.models import Frequency


class CountEntryOrderCalculationTests(TestCase):
    """Test the order calculation logic for CountEntry"""

    def setUp(self):
        """Set up test data"""
        # Create a frequency
        self.frequency = Frequency.objects.create(
            frequency_name="Daily"
        )
        
        # Create a location
        self.location = Location.objects.create(
            name="Test Location",
            frequency=self.frequency
        )
        
        # Create a count sheet
        self.sheet = CountSheet.objects.create(
            location=self.location,
            status="draft"
        )

    def test_almond_milk_example(self):
        """
        Test: Almond Milk - 6 cartons = 1 case
        Par: 10 cartons, Order Point: 5 cartons, On Hand: 4 cartons
        Expected: Order 1 case (6 cartons) to reach 10 cartons
        """
        item = InventoryItem.objects.create(
            name="Almond Milk",
            count_unit="cartons",
            order_unit="cases",
            pack_size=Decimal("6"),
            par_level=Decimal("10"),
            order_point=Decimal("5"),
            location=self.location,
            frequency=self.frequency
        )
        
        entry = CountEntry.objects.create(
            sheet=self.sheet,
            item=item,
            on_hand_quantity=Decimal("4")
        )
        
        # Deficit: 10 - 4 = 6 cartons
        # Order units: ceil(6 / 6) = 1 case
        # Count units to order: 1 * 6 = 6 cartons
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("6"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_RED)

    def test_two_bags_per_case(self):
        """
        Test: 2 bags = 1 case
        Par: 20 bags, Order Point: 10 bags, On Hand: 9 bags
        Expected: Order 6 cases (12 bags) to reach 21 bags (exceeds par)
        """
        item = InventoryItem.objects.create(
            name="Test Item",
            count_unit="bags",
            order_unit="cases",
            pack_size=Decimal("2"),
            par_level=Decimal("20"),
            order_point=Decimal("10"),
            location=self.location,
            frequency=self.frequency
        )
        
        entry = CountEntry.objects.create(
            sheet=self.sheet,
            item=item,
            on_hand_quantity=Decimal("9")
        )
        
        # Deficit: 20 - 9 = 11 bags
        # Order units: ceil(11 / 2) = 6 cases
        # Count units to order: 6 * 2 = 12 bags
        # New total: 9 + 12 = 21 bags (exceeds par of 20)
        self.assertEqual(entry.calculated_order_units, Decimal("6"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("12"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_RED)

    def test_at_par_level(self):
        """
        Test: When on_hand equals par_level, no order needed
        """
        item = InventoryItem.objects.create(
            name="Test Item",
            count_unit="units",
            order_unit="cases",
            pack_size=Decimal("12"),
            par_level=Decimal("24"),
            order_point=Decimal("12"),
            location=self.location,
            frequency=self.frequency
        )
        
        entry = CountEntry.objects.create(
            sheet=self.sheet,
            item=item,
            on_hand_quantity=Decimal("24")
        )
        
        self.assertEqual(entry.calculated_order_units, Decimal("0"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("0"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_GREEN)

    def test_above_par_level(self):
        """
        Test: When on_hand exceeds par_level, no order needed
        """
        item = InventoryItem.objects.create(
            name="Test Item",
            count_unit="units",
            order_unit="cases",
            pack_size=Decimal("12"),
            par_level=Decimal("24"),
            order_point=Decimal("12"),
            location=self.location,
            frequency=self.frequency
        )
        
        entry = CountEntry.objects.create(
            sheet=self.sheet,
            item=item,
            on_hand_quantity=Decimal("30")
        )
        
        self.assertEqual(entry.calculated_order_units, Decimal("0"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("0"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_GREEN)

    def test_below_par_above_order_point(self):
        """
        Test: When on_hand is below par but above order_point
        Should show yellow (OK) status
        """
        item = InventoryItem.objects.create(
            name="Test Item",
            count_unit="units",
            order_unit="cases",
            pack_size=Decimal("12"),
            par_level=Decimal("24"),
            order_point=Decimal("12"),
            location=self.location,
            frequency=self.frequency
        )
        
        entry = CountEntry.objects.create(
            sheet=self.sheet,
            item=item,
            on_hand_quantity=Decimal("15")
        )
        
        # Deficit: 24 - 15 = 9 units
        # Order units: ceil(9 / 12) = 1 case
        # Count units to order: 1 * 12 = 12 units
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("12"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_YELLOW)

    def test_ceiling_rounding(self):
        """
        Test: Verify ceiling rounding always rounds UP
        """
        item = InventoryItem.objects.create(
            name="Test Item",
            count_unit="bottles",
            order_unit="cases",
            pack_size=Decimal("24"),
            par_level=Decimal("100"),
            order_point=Decimal("50"),
            location=self.location,
            frequency=self.frequency
        )
        
        entry = CountEntry.objects.create(
            sheet=self.sheet,
            item=item,
            on_hand_quantity=Decimal("76")
        )
        
        # Deficit: 100 - 76 = 24 bottles
        # Order units: ceil(24 / 24) = 1 case (exactly)
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        
        # Now test with 77 on hand
        entry.on_hand_quantity = Decimal("77")
        entry.save(recalculate=True)
        
        # Deficit: 100 - 77 = 23 bottles
        # Order units: ceil(23 / 24) = 1 case (rounds up from 0.958)
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("24"))
