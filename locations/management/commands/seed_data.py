import random
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from datetime import date, timedelta, datetime, time

from inventory.models import CatalogItem, ItemCategory, Vendor
from locations.models import Location, LocationOverride, CountFrequency
from counts.models import CountSheet
from reports.models import ReportArchive, ExportFormat
from users.models import UserRole

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Seeds the database with realistic demo data: locations, vendors, users, "
        "catalog items, location overrides, count sheets, and archived reports."
    )

    def handle(self, *args, **options):
        self.stdout.write("🌱 Starting comprehensive demo data seeding...")

        # ==============================
        # 1. Locations
        # ==============================
        locations = []
        location_data = [
            {"name": "Downtown Store", "code": "DTN",
                "timezone": "America/New_York"},
            {"name": "Uptown Warehouse", "code": "UPT",
                "timezone": "America/Chicago"},
            {"name": "Suburban Outlet", "code": "SUB",
                "timezone": "America/Los_Angeles"},
        ]
        for data in location_data:
            loc, created = Location.objects.get_or_create(
                name=data["name"],
                defaults={
                    "code": data["code"], "timezone": data["timezone"], "is_active": True}
            )
            locations.append(loc)
            status = "created" if created else "already exists"
            self.stdout.write(f"   📍 Location: {loc.name} ({status})")

        if not locations:
            self.stdout.write(self.style.ERROR(
                "❌ No locations created. Aborting."))
            return

        # ==============================
        # 2. Vendors
        # ==============================
        vendor_names = [
            "US Foods",
            "Sysco",
            "Local Farm",
            "Gordon Food Service",
            "Performance Foodservice",
        ]
        vendors = []
        for name in vendor_names:
            vendor, created = Vendor.objects.get_or_create(name=name)
            vendors.append(vendor)
            status = "created" if created else "already exists"
            self.stdout.write(f"   🏪 Vendor: {vendor.name} ({status})")

        # ==============================
        # 3. Users (Managers + Staff)
        # ==============================
        users = []
        manager_data = [
            ("manager1", "Sarah Johnson", "manager1@example.com"),
            ("manager2", "Mike Chen", "manager2@example.com"),
            ("manager3", "Emma Wilson", "manager3@example.com"),
            ("manager4", "David Lee", "manager4@example.com"),
            ("manager5", "Lisa Brown", "manager5@example.com"),
        ]
        for username, full_name, email in manager_data:
            first_name, last_name = full_name.split(" ", 1)
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": UserRole.MANAGER,
                    "is_active": True,
                }
            )
            if created:
                user.set_password("demo123")
                user.save()
            users.append(user)

        staff_data = [
            ("staff1", "Alice Rivera", "staff1@example.com"),
            ("staff2", "Bob Kumar", "staff2@example.com"),
            ("staff3", "Charlie Garcia", "staff3@example.com"),
        ]
        for username, full_name, email in staff_data:
            first_name, last_name = full_name.split(" ", 1)
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": UserRole.STAFF,
                    "is_active": True,
                }
            )
            if created:
                user.set_password("demo123")
                user.save()
            users.append(user)

        # Assign all locations to all users
        for user in users:
            user.assigned_locations.set(locations)

        self.stdout.write(self.style.SUCCESS(
            f"👥 {len(users)} users created/ensured (5 managers + 3 staff)"))

        # ==============================
        # 4. Catalog Items (50 items)
        # ==============================
        categories = [c[0] for c in ItemCategory.choices]
        item_names = [
            "Pineapple Chunks", "Mango Slices", "Strawberries", "Blueberries", "Bananas", "Milk 2%", "Heavy Cream",
            "Cheddar Cheese", "Mozzarella", "Greek Yogurt", "Butter Sticks", "Eggs Large", "Chicken Breast",
            "Ground Beef", "Salmon Fillet", "Basmati Rice", "Pasta Spaghetti", "Tomato Sauce", "Olive Oil",
            "Coconut Flakes", "Almonds", "Peanut Butter", "Honey", "Coffee Beans", "Tea Bags", "Sugar", "Flour",
            "Baking Powder", "Cornflakes", "Oatmeal", "Potatoes", "Carrots", "Lettuce Heads", "Tomatoes",
            "Cucumbers", "Red Onions", "Garlic Bulbs", "Paper Towels", "Trash Bags", "Ziploc Gallon",
            "Aluminum Foil", "Plastic Wrap", "Napkins", "Paper Plates", "Plastic Cups", "Dish Soap",
            "Cleaning Spray", "Laundry Detergent", "Fabric Softener", "Hand Soap",
        ]

        custom_units = ["bags", "tubs", "cartons", "cases",
                        "each", "lb", "pack", "box", "can", "bottle"]
        items = []
        for name in item_names:
            item, _ = CatalogItem.objects.update_or_create(
                name=name,
                defaults={
                    "category": random.choice(categories),
                    "count_unit": random.choice(custom_units),
                    "order_unit": random.choice(custom_units),
                    "pack_size": Decimal(str(round(random.uniform(1.0, 24.0), 2))),
                    "is_active": True,
                    "vendor": random.choice(vendors),
                }
            )
            items.append(item)

        self.stdout.write(self.style.SUCCESS(f"📦 50 catalog items seeded"))

        # ==============================
        # 5. Location Overrides
        # ==============================
        frequencies = list(CountFrequency.values)
        storage_locations = ["Fridge A", "Fridge B",
                             "Freezer", "Dry Shelf", "Front Display", "Back Room"]

        override_count = 0
        for location in locations:
            for item in random.sample(items, k=min(30, len(items))):
                override, created = LocationOverride.objects.update_or_create(
                    location=location,
                    item=item,
                    defaults={
                        "par_level": Decimal(str(random.randint(10, 150))),
                        "order_point": Decimal(str(random.randint(5, 40))),
                        "frequency": random.choice(frequencies),
                        "storage_location": random.choice(storage_locations),
                        "is_active": True,
                        "display_order": random.randint(0, 100),
                        "vendor": random.choice(vendors),
                        "notes": random.choice(["", "Keep refrigerated", "Fragile", "Heavy item"]),
                    }
                )
                if created:
                    override_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"🔗 {override_count} location overrides created"))

        # ==============================
        # 6. Count Sheets + Report Archives (50 reports)
        # ==============================
        staff_notes_options = [
            "All good, no issues.",
            "2 bags of pineapple were open.",
            "Running low on heavy cream.",
            "Freezer temperature was slightly high.",
            "New staff training completed.",
            "",
        ]

        report_count = 0
        for _ in range(50):
            location = random.choice(locations)
            frequency = random.choice(frequencies)
            exported_by = random.choice(users)
            submitted_by = random.choice(
                [u for u in users if u.role == UserRole.STAFF])

            days_back = random.randint(1, 180)
            count_date = date.today() - timedelta(days=days_back)

            # Create or get CountSheet
            sheet = CountSheet.objects.ensure_period_sheet(
                location=location,
                frequency=frequency,
                target_date=count_date,
                created_by=exported_by,
            )

            # Mark as submitted with optional notes
            if not sheet.is_submitted:
                sheet.submitted_by = submitted_by
                sheet.submitted_at = timezone.now()
                sheet.notes = random.choice(staff_notes_options)
                sheet.save()

            # Add realistic counts (including decimals like 12.5)
            entries = list(sheet.entries.all())
            if entries:
                for entry in random.sample(entries, k=min(15, len(entries))):
                    max_qty = float(entry.override.par_level or 100)
                    on_hand = round(random.uniform(0, max_qty),
                                    1)  # One decimal place
                    entry.on_hand_quantity = Decimal(str(on_hand))
                    entry.save(recalculate=True)

            # Create ReportArchive entry
            ReportArchive.objects.create(
                sheet=sheet,
                location=location,
                frequency=frequency,
                count_date=count_date,
                exported_by=exported_by,
                export_format=random.choice(
                    [ExportFormat.PDF, ExportFormat.CSV]),
                export_url=f"https://example.com/reports/{location.code}-{count_date}.pdf",
                payload_snapshot={
                    "total_items": len(entries),
                    "low_stock_count": sum(1 for e in entries if e.highlight_state == "low"),
                    "notes": sheet.notes or "No notes",
                },
                submitted_by=submitted_by,
                submitted_at=sheet.submitted_at,
                export_notes=random.choice(
                    ["Routine count", "Pre-order check", "Manager approved"]),
            )
            report_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"📊 {report_count} count sheets and reports created"))

        # ==============================
        # Final Summary
        # ==============================
        self.stdout.write(self.style.SUCCESS(
            "\n🎉 Demo data seeding completed successfully!"))
        self.stdout.write(f"   📍 Locations: {len(locations)}")
        self.stdout.write(f"   🏪 Vendors: {len(vendors)}")
        self.stdout.write(f"   👥 Users: {len(users)} (password: demo123)")
        self.stdout.write(f"   📦 Catalog Items: {len(items)}")
        self.stdout.write(
            f"   🔗 Overrides: {LocationOverride.objects.count()}")
        self.stdout.write(f"   📊 Reports: {report_count}")

        self.stdout.write("\n🔑 Demo login credentials:")
        for u in users:
            role = "Manager" if u.role == UserRole.MANAGER else "Staff"
            self.stdout.write(
                f"   → {u.username} : demo123 {' ' * (15 - len(u.username))} ({role})")

        self.stdout.write(
            "\n🚀 Your app is now fully populated with realistic demo data – ready for testing!")
