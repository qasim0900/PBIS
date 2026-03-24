from django.test import TestCase
from decimal import Decimal
from counts.models import CountEntry, CountSheet
from inventory.models import InventoryItem
from locations.models import Location
from frequency.models import Frequency


class CountEntryOrderCalculationTests(TestCase):
    def setUp(self):
        self.frequency = Frequency.objects.create(
            frequency_name="Daily"
        )
        
        self.location = Location.objects.create(
            name="Test Location",
            frequency=self.frequency
        )
        
        self.sheet = CountSheet.objects.create(
            location=self.location,
            status="draft"
        )

    def test_almond_milk_example(self):
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
        
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("6"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_RED)

    def test_two_bags_per_case(self):
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
        
        self.assertEqual(entry.calculated_order_units, Decimal("6"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("12"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_RED)

    def test_at_par_level(self):
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
        
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("12"))
        self.assertEqual(entry.highlight_state, CountEntry.HIGHLIGHT_YELLOW)

    def test_ceiling_rounding(self):
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
        
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        
        entry.on_hand_quantity = Decimal("77")
        entry.save(recalculate=True)
        
        self.assertEqual(entry.calculated_order_units, Decimal("1"))
        self.assertEqual(entry.calculated_qty_to_order, Decimal("24"))
