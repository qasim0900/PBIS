from django.core.management.base import BaseCommand
from inventory.models import Unit


class Command(BaseCommand):
    help = 'Create sample units for the inventory system'

    def handle(self, *args, **options):
        # Define sample units as requested
        sample_units = [
            {
                'name': 'Case',
                'quantity': 12,
                'description': 'Standard case containing 12 cartons'
            },
            {
                'name': 'Carton',
                'quantity': 1,
                'description': 'Individual carton unit'
            },
            {
                'name': 'Tub',
                'quantity': 1,
                'description': 'Individual tub unit'
            },
            {
                'name': 'Bag',
                'quantity': 1,
                'description': 'Individual bag unit'
            },
            {
                'name': 'Box',
                'quantity': 6,
                'description': 'Box containing 6 items'
            },
            {
                'name': 'Pack',
                'quantity': 2,
                'description': 'Pack containing 2 items'
            },
            {
                'name': 'Each',
                'quantity': 1,
                'description': 'Single individual item'
            },
            {
                'name': 'Kilogram',
                'quantity': 1,
                'description': 'Weight measurement in kg'
            },
            {
                'name': 'Liter',
                'quantity': 1,
                'description': 'Volume measurement in liters'
            },
        ]

        created_count = 0
        updated_count = 0

        for unit_data in sample_units:
            unit, created = Unit.objects.get_or_create(
                name=unit_data['name'],
                defaults={
                    'quantity': unit_data['quantity'],
                    'description': unit_data['description']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created unit: {unit.name} ({unit.quantity} items)')
                )
            else:
                # Update existing unit with new data
                unit.quantity = unit_data['quantity']
                unit.description = unit_data['description']
                unit.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated unit: {unit.name} ({unit.quantity} items)')
                )

        total_units = Unit.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary:\n'
                f'Created: {created_count} units\n'
                f'Updated: {updated_count} units\n'
                f'Total units in database: {total_units}'
            )
        )
