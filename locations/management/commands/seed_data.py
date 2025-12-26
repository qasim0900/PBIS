import random
from decimal import Decimal
from django.utils import timezone
from counts.models import CountSheet
from users.models import User, UserRole
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from datetime import date, timedelta, datetime, time
from reports.models import ReportArchive, ExportFormat
from inventory.models import CatalogItem, ItemCategory
from locations.models import Location, LocationOverride, CountFrequency


# ----------------------------------
# :: User Variable
# ----------------------------------

""" 
This line retrieves the currently active User model in the Django project,
whether it's the default `auth.User` or a custom user model.
"""


User = get_user_model()


# ----------------------------------
# :: Command Class
# ----------------------------------

""" 
This Django management command seeds the database with demo data including locations, managers, staff users, catalog items, 
location overrides, and report archives with realistic inventory entries.
"""


class Command(BaseCommand):
    help = "Seeds the database with: 3 locations, 5 managers, 3 staff users, 50 catalog items, realistic overrides, and 50 ReportArchive records"

    # ----------------------------------
    # :: Habdle Function
    # ----------------------------------

    """ 
    This Django management command detects all non-Django apps with models and runs makemigrations for them automatically.
    """

    def handle(self, *args, **options):
        self.stdout.write("🌱 Starting comprehensive seeding...")
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
            self.stdout.write(f"   📍 Location '{loc.name}' {status}")

        if not locations:
            self.stdout.write(self.style.ERROR(
                "❌ No locations created. Aborting."))
            return
        users = []
        manager_data = [
            ("manager1", "Manager One", "manager1@example.com"),
            ("manager2", "Manager Two", "manager2@example.com"),
            ("manager3", "Manager Three", "manager3@example.com"),
            ("manager4", "Manager Four", "manager4@example.com"),
            ("manager5", "Manager Five", "manager5@example.com"),
        ]
        for username, full_name, email in manager_data:
            first, last = full_name.split(
                " ", 1) if " " in full_name else (full_name, "")
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first,
                    "last_name": last,
                    "role": UserRole.MANAGER,
                    "is_active": True,
                }
            )
            if created:
                user.set_password("demo123")
                user.save()
            users.append(user)
        staff_data = [
            ("staff1", "Staff Alice", "staff1@example.com"),
            ("staff2", "Staff Bob", "staff2@example.com"),
            ("staff3", "Staff Charlie", "staff3@example.com"),
        ]
        for username, full_name, email in staff_data:
            first, last = full_name.split(
                " ", 1) if " " in full_name else (full_name, "")
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first,
                    "last_name": last,
                    "role": UserRole.STAFF,
                    "is_active": True,
                }
            )
            if created:
                user.set_password("demo123")
                user.save()
            users.append(user)
        for user in users:
            user.assigned_locations.set(locations)

        self.stdout.write(self.style.SUCCESS(
            f"👥 Created/ensured {len(users)} users (5 managers + 3 staff)"))
        categories = [choice[0] for choice in ItemCategory.choices]
        item_names = [
            "Apples", "Bananas", "Oranges", "Milk 2%", "Cheese Cheddar", "Yogurt Greek",
            "Bread White", "Rice Basmati", "Pasta Spaghetti", "Tomato Sauce", "Olive Oil",
            "Chicken Breast", "Ground Beef", "Salmon Fillet", "Eggs Large", "Butter",
            "Coffee Beans", "Tea Bags", "Sugar White", "Flour All-Purpose", "Baking Soda",
            "Cereal Cornflakes", "Oatmeal", "Peanut Butter", "Jam Strawberry", "Honey",
            "Potatoes", "Carrots", "Lettuce", "Tomatoes", "Cucumbers", "Onions", "Garlic",
            "Soap Bar", "Shampoo", "Toothpaste", "Paper Towels", "Trash Bags", "Aluminum Foil",
            "Plastic Wrap", "Ziploc Bags", "Napkins", "Plates Paper", "Cups Plastic",
            "Forks Plastic", "Spoons Plastic", "Knives Plastic", "Cleaning Spray", "Dish Soap",
            "Laundry Detergent", "Fabric Softener",
        ]
        created_items = 0
        items = []
        for name in item_names:
            category = random.choice(categories)
            pack_size = Decimal(str(round(random.uniform(1.0, 24.0), 2)))
            item, created = CatalogItem.objects.get_or_create(
                name=name,
                defaults={
                    "category": category,
                    "count_unit": random.choice(["each", "bag", "box", "case", "lb", "pack"]),
                    "order_unit": random.choice(["case", "box", "pack", "lb"]),
                    "pack_size": pack_size,
                    "is_active": True,
                    "helper_text": f"1 order unit = {pack_size} count units",
                }
            )
            if created:
                created_items += 1
            items.append(item)

        self.stdout.write(self.style.SUCCESS(
            f"📦 Created/ensured 50 catalog items ({created_items} new)"))
        frequencies = list(CountFrequency.values)
        created_overrides = 0
        for location in locations:
            for item in items:
                override, created = LocationOverride.objects.get_or_create(
                    location=location,
                    item=item,
                    defaults={
                        "par_level": Decimal(str(random.randint(20, 200))),
                        "order_point": Decimal(str(random.randint(5, 50))),
                        "frequency": random.choice(frequencies),
                        "storage_location": random.choice(["Shelf A", "Fridge", "Freezer", "Back Room", "Front Display"]),
                        "min_order_qty": random.choice([None, Decimal(str(random.randint(1, 10)))]),
                        "is_active": True,
                        "display_order": random.randint(0, 100),
                    }
                )
                if created:
                    created_overrides += 1

        self.stdout.write(self.style.SUCCESS(
            f"🔗 Created/ensured {created_overrides} new LocationOverrides"))
        export_formats = [ExportFormat.PDF, ExportFormat.CSV]
        created_reports = 0
        days_back = 180

        for _ in range(50):
            location = random.choice(locations)
            frequency = random.choice(frequencies)
            exported_by = random.choice(users)
            submitted_by = random.choice(users)
            random_days = random.randint(0, days_back)
            count_date = date.today() - timedelta(days=random_days)

            sheet = CountSheet.objects.ensure_daily_sheet(
                location=location,
                frequency=frequency,
                target_date=count_date,
                created_by=exported_by,
            )

            if not sheet.is_submitted:
                sheet.status = "submitted"
                sheet.locked = True
                sheet.submitted_by = submitted_by
                sheet.submitted_at = timezone.make_aware(
                    datetime.combine(count_date, time(12, 0)))
                sheet.save()

            entries = list(sheet.entries.all())
            if entries:
                sample_entries = random.sample(entries, k=min(
                    len(entries), random.randint(10, 30)))
                for entry in sample_entries:
                    max_qty = float(entry.override.par_level) * 1.5
                    on_hand = Decimal(
                        str(round(random.uniform(0, max_qty), 2)))
                    entry.on_hand_quantity = on_hand
                    entry.updated_by = submitted_by
                    entry.save(recalculate=True)

            total_items = len(entries)
            low_stock = sum(1 for e in entries if e.highlight_state == "low")
            near_par = sum(1 for e in entries if e.highlight_state == "near")

            ReportArchive.objects.create(
                sheet=sheet,
                location=location,
                frequency=frequency,
                count_date=count_date,
                exported_by=exported_by,
                export_format=random.choice(export_formats),
                export_url=f"https://storage.example.com/reports/{location.code.lower()}-{count_date.isoformat()}.pdf",
                payload_snapshot={
                    "report_title": f"{location.name} - {sheet.get_frequency_display()} Inventory Report",
                    "count_date": str(count_date),
                    "total_items": total_items,
                    "low_stock_count": low_stock,
                    "near_par_count": near_par,
                    "generated_by": exported_by.get_full_name() or exported_by.username,
                    "generated_at": str(count_date),
                },
                submitted_by=submitted_by,
                submitted_at=sheet.submitted_at,
                export_notes=random.choice([
                    "Routine inventory completed successfully",
                    "Low stock items flagged for reorder",
                    "Manager review and approval",
                    "Pre-holiday stock check",
                    "Auto-generated after submission",
                    "",
                ]),
            )
            created_reports += 1

        self.stdout.write(self.style.SUCCESS(
            f"📊 Successfully created {created_reports} ReportArchive records!"))

        self.stdout.write(self.style.SUCCESS(
            "\n🎉 Full seeding completed successfully!"))
        self.stdout.write(f"   • {len(locations)} Locations")
        self.stdout.write(f"   • {len(users)} Users (5 managers + 3 staff)")
        self.stdout.write(f"   • 50 Catalog Items")
        self.stdout.write(
            f"   • {LocationOverride.objects.count()} Location Overrides")
        self.stdout.write(
            f"   • {created_reports} Report Archives with proper sheets & entries")

        self.stdout.write("\n🔑 Demo credentials (password: demo123 for all):")
        for u in users:
            role = "Manager" if u.role == UserRole.MANAGER else "Staff"
            self.stdout.write(f"   - {u.username} ({role})")

        self.stdout.write(
            "\n🚀 Your demo database is now fully populated and ready for testing!")
