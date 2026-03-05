from django.core.management.base import BaseCommand
from inventory.models import Unit

class Command(BaseCommand):
    help = 'Create example units for the inventory system'

    def handle(self, *args, **options):
        Unit.objects.all().delete()
        
        units_data = [
            {
                'name': 'Case',
                'quantity': 12,
                'description': 'Standard case containing 12 cartons'
            },
            {
                'name': 'Carton',
                'quantity': 12,
                'description': 'Carton containing 12 bags'
            },
            {
                'name': 'Tub',
                'quantity': 6,
                'description': 'Large tub containing 6 units'
            },
            {
                'name': 'Bag',
                'quantity': 1,
                'description': 'Single bag unit'
            },
            {
                'name': 'Box',
                'quantity': 24,
                'description': 'Box containing 24 items'
            },
            {
                'name': 'Pack',
                'quantity': 6,
                'description': 'Pack of 6 items'
            },
            {
                'name': 'Bottle',
                'quantity': 1,
                'description': 'Single bottle'
            },
            {
                'name': 'Liter',
                'quantity': 1,
                'description': 'Liter measurement'
            },
            {
                'name': 'Kilogram',
                'quantity': 1,
                'description': 'Kilogram weight measurement'
            },
            {
                'name': 'Each',
                'quantity': 1,
                'description': 'Individual item'
            },
        ]

        created_units = []
        for unit_data in units_data:
            unit = Unit.objects.create(**unit_data)
            created_units.append(unit)
            self.stdout.write(
                self.style.SUCCESS(f'Created unit: {unit.name} ({unit.quantity} items)')
            )

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {len(created_units)} example units!')
        )
