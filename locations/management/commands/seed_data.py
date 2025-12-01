import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from locations.models import Location
from reports.models import ReportArchive, ExportFormat

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds dummy ReportArchive data for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10,
            help="Number of dummy reports to create",
        )

    def handle(self, *args, **options):
        count = options["count"]
        locations = list(Location.objects.all())
        users = list(User.objects.all())

        if not locations:
            self.stdout.write(self.style.ERROR("No locations found in database."))
            return

        if not users:
            self.stdout.write(self.style.ERROR("No users found in database."))
            return

        created_reports = []

        for i in range(count):
            location = random.choice(locations)
            exported_by = random.choice(users)

            report = ReportArchive.objects.create(
                sheet=None,
                location=location,
                frequency=random.choice(["Weekly", "Bi-Weekly", "Monthly"]),
                count_date=date.today() - timedelta(days=random.randint(0, 30)),
                exported_by=exported_by,
                export_format=random.choice([ExportFormat.PDF, ExportFormat.CSV]),
                export_url=f"https://dummy-reports.com/{location.code}-{i+1}.pdf",
                payload_snapshot={"low_stock": random.randint(0, 5), "items_counted": random.randint(5, 15)},
                submitted_by=exported_by,
                submitted_at=date.today(),
                export_notes=f"Dummy report {i+1}",
            )
            created_reports.append(report)

        self.stdout.write(self.style.SUCCESS(f"✅ Created {len(created_reports)} dummy reports"))
        for r in created_reports:
            self.stdout.write(f"- {r.location.name} | {r.frequency} | {r.count_date} | {r.exported_by.username}")
