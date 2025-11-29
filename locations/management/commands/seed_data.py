"""
Django management command to seed the database with initial data.
Usage: python manage.py seed_data
"""

from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from locations.models import Location, LocationOverride, CountFrequency
from inventory.models import CatalogItem, ItemCategory
from users.models import UserRole

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with initial locations, catalog items, users, and location overrides'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            LocationOverride.objects.all().delete()
            CatalogItem.objects.all().delete()
            Location.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        # Create Locations
        self.stdout.write('Creating locations...')
        syracuse, _ = Location.objects.get_or_create(
            name='Syracuse',
            defaults={
                'code': 'syracuse',
                'timezone': 'America/New_York',
                'is_active': True,
            }
        )
        weedsport, _ = Location.objects.get_or_create(
            name='Weedsport',
            defaults={
                'code': 'weedsport',
                'timezone': 'America/New_York',
                'is_active': True,
            }
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Created locations: {syracuse.name}, {weedsport.name}'))

        # Create Users
        self.stdout.write('Creating users...')
        
        # Manager user
        manager, created = User.objects.get_or_create(
            username='manager',
            defaults={
                'email': 'manager@purplebanana.com',
                'first_name': 'Manager',
                'last_name': 'User',
                'role': UserRole.MANAGER,
                'is_staff': True,
            }
        )
        if created:
            manager.set_password('manager123')
            manager.save()
            manager.assigned_locations.add(syracuse, weedsport)
            self.stdout.write(self.style.SUCCESS(f'✓ Created manager user: {manager.username} (password: manager123)'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Manager user already exists: {manager.username}'))

        # Staff user for Syracuse
        staff_syr, created = User.objects.get_or_create(
            username='staff_syracuse',
            defaults={
                'email': 'staff.syracuse@purplebanana.com',
                'first_name': 'Syracuse',
                'last_name': 'Staff',
                'role': UserRole.STAFF,
            }
        )
        if created:
            staff_syr.set_password('staff123')
            staff_syr.save()
            staff_syr.assigned_locations.add(syracuse)
            self.stdout.write(self.style.SUCCESS(f'✓ Created staff user: {staff_syr.username} (password: staff123)'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Staff user already exists: {staff_syr.username}'))

        # Staff user for Weedsport
        staff_weed, created = User.objects.get_or_create(
            username='staff_weedsport',
            defaults={
                'email': 'staff.weedsport@purplebanana.com',
                'first_name': 'Weedsport',
                'last_name': 'Staff',
                'role': UserRole.STAFF,
            }
        )
        if created:
            staff_weed.set_password('staff123')
            staff_weed.save()
            staff_weed.assigned_locations.add(weedsport)
            self.stdout.write(self.style.SUCCESS(f'✓ Created staff user: {staff_weed.username} (password: staff123)'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Staff user already exists: {staff_weed.username}'))

        # Create Catalog Items
        self.stdout.write('Creating catalog items...')
        
        catalog_items = [
            {
                'name': 'Banana Purée',
                'category': ItemCategory.FRUIT,
                'count_unit': 'bags',
                'order_unit': 'cases',
                'pack_size': Decimal('6'),
                'helper_text': '1 case = 6 bags',
                'notes': 'Frozen banana purée',
            },
            {
                'name': 'Strawberry Purée',
                'category': ItemCategory.FRUIT,
                'count_unit': 'bags',
                'order_unit': 'cases',
                'pack_size': Decimal('6'),
                'helper_text': '1 case = 6 bags',
                'notes': 'Frozen strawberry purée',
            },
            {
                'name': 'Mango Purée',
                'category': ItemCategory.FRUIT,
                'count_unit': 'bags',
                'order_unit': 'cases',
                'pack_size': Decimal('6'),
                'helper_text': '1 case = 6 bags',
                'notes': 'Frozen mango purée',
            },
            {
                'name': 'Coconut Milk',
                'category': ItemCategory.DAIRY,
                'count_unit': 'cans',
                'order_unit': 'cases',
                'pack_size': Decimal('12'),
                'helper_text': '1 case = 12 cans',
                'notes': 'Canned coconut milk',
            },
            {
                'name': 'Sugar',
                'category': ItemCategory.DRY,
                'count_unit': 'bags',
                'order_unit': 'cases',
                'pack_size': Decimal('10'),
                'helper_text': '1 case = 10 bags',
                'notes': 'Granulated sugar',
            },
            {
                'name': 'Flour',
                'category': ItemCategory.DRY,
                'count_unit': 'bags',
                'order_unit': 'cases',
                'pack_size': Decimal('8'),
                'helper_text': '1 case = 8 bags',
                'notes': 'All-purpose flour',
            },
            {
                'name': 'Plastic Cups',
                'category': ItemCategory.PACKAGING,
                'count_unit': 'pieces',
                'order_unit': 'boxes',
                'pack_size': Decimal('1000'),
                'helper_text': '1 box = 1000 pieces',
                'notes': '16oz plastic cups',
            },
            {
                'name': 'Lids',
                'category': ItemCategory.PACKAGING,
                'count_unit': 'pieces',
                'order_unit': 'boxes',
                'pack_size': Decimal('1000'),
                'helper_text': '1 box = 1000 pieces',
                'notes': 'Cup lids',
            },
        ]

        created_items = []
        for item_data in catalog_items:
            item, created = CatalogItem.objects.get_or_create(
                name=item_data['name'],
                defaults=item_data
            )
            if created:
                created_items.append(item.name)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(created_items)} catalog items: {", ".join(created_items)}'))

        # Create Location Overrides for Syracuse
        self.stdout.write('Creating location overrides for Syracuse...')
        syracuse_overrides = [
            {'item_name': 'Banana Purée', 'par_level': Decimal('24'), 'order_point': Decimal('12'), 'frequency': CountFrequency.MON_WED, 'storage_location': 'Freezer'},
            {'item_name': 'Strawberry Purée', 'par_level': Decimal('18'), 'order_point': Decimal('9'), 'frequency': CountFrequency.WEEKLY, 'storage_location': 'Freezer'},
            {'item_name': 'Mango Purée', 'par_level': Decimal('12'), 'order_point': Decimal('6'), 'frequency': CountFrequency.BIWEEKLY, 'storage_location': 'Freezer'},
            {'item_name': 'Coconut Milk', 'par_level': Decimal('36'), 'order_point': Decimal('18'), 'frequency': CountFrequency.WEEKLY, 'storage_location': 'Dry Storage'},
            {'item_name': 'Sugar', 'par_level': Decimal('30'), 'order_point': Decimal('15'), 'frequency': CountFrequency.MONTHLY, 'storage_location': 'Dry Storage'},
            {'item_name': 'Flour', 'par_level': Decimal('24'), 'order_point': Decimal('12'), 'frequency': CountFrequency.MONTHLY, 'storage_location': 'Dry Storage'},
            {'item_name': 'Plastic Cups', 'par_level': Decimal('5000'), 'order_point': Decimal('2000'), 'frequency': CountFrequency.BIWEEKLY, 'storage_location': 'Packaging Area'},
            {'item_name': 'Lids', 'par_level': Decimal('5000'), 'order_point': Decimal('2000'), 'frequency': CountFrequency.BIWEEKLY, 'storage_location': 'Packaging Area'},
        ]

        for override_data in syracuse_overrides:
            item = CatalogItem.objects.get(name=override_data['item_name'])
            LocationOverride.objects.get_or_create(
                location=syracuse,
                item=item,
                defaults={
                    'par_level': override_data['par_level'],
                    'order_point': override_data['order_point'],
                    'frequency': override_data['frequency'],
                    'storage_location': override_data['storage_location'],
                    'is_active': True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(syracuse_overrides)} location overrides for Syracuse'))

        # Create Location Overrides for Weedsport
        self.stdout.write('Creating location overrides for Weedsport...')
        weedsport_overrides = [
            {'item_name': 'Banana Purée', 'par_level': Decimal('18'), 'order_point': Decimal('9'), 'frequency': CountFrequency.MON_WED, 'storage_location': 'Freezer'},
            {'item_name': 'Strawberry Purée', 'par_level': Decimal('12'), 'order_point': Decimal('6'), 'frequency': CountFrequency.WEEKLY, 'storage_location': 'Freezer'},
            {'item_name': 'Mango Purée', 'par_level': Decimal('6'), 'order_point': Decimal('3'), 'frequency': CountFrequency.BIWEEKLY, 'storage_location': 'Freezer'},
            {'item_name': 'Coconut Milk', 'par_level': Decimal('24'), 'order_point': Decimal('12'), 'frequency': CountFrequency.WEEKLY, 'storage_location': 'Dry Storage'},
            {'item_name': 'Sugar', 'par_level': Decimal('20'), 'order_point': Decimal('10'), 'frequency': CountFrequency.MONTHLY, 'storage_location': 'Dry Storage'},
            {'item_name': 'Flour', 'par_level': Decimal('16'), 'order_point': Decimal('8'), 'frequency': CountFrequency.MONTHLY, 'storage_location': 'Dry Storage'},
            {'item_name': 'Plastic Cups', 'par_level': Decimal('3000'), 'order_point': Decimal('1500'), 'frequency': CountFrequency.BIWEEKLY, 'storage_location': 'Packaging Area'},
            {'item_name': 'Lids', 'par_level': Decimal('3000'), 'order_point': Decimal('1500'), 'frequency': CountFrequency.BIWEEKLY, 'storage_location': 'Packaging Area'},
        ]

        for override_data in weedsport_overrides:
            item = CatalogItem.objects.get(name=override_data['item_name'])
            LocationOverride.objects.get_or_create(
                location=weedsport,
                item=item,
                defaults={
                    'par_level': override_data['par_level'],
                    'order_point': override_data['order_point'],
                    'frequency': override_data['frequency'],
                    'storage_location': override_data['storage_location'],
                    'is_active': True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(weedsport_overrides)} location overrides for Weedsport'))

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('\n📋 Summary:'))
        self.stdout.write(f'  - Locations: {Location.objects.count()}')
        self.stdout.write(f'  - Catalog Items: {CatalogItem.objects.count()}')
        self.stdout.write(f'  - Location Overrides: {LocationOverride.objects.count()}')
        self.stdout.write(f'  - Users: {User.objects.filter(is_superuser=False).count()}')
        self.stdout.write(self.style.SUCCESS('\n🔑 Login Credentials:'))
        self.stdout.write('  Manager: username=manager, password=manager123')
        self.stdout.write('  Staff (Syracuse): username=staff_syracuse, password=staff123')
        self.stdout.write('  Staff (Weedsport): username=staff_weedsport, password=staff123')

