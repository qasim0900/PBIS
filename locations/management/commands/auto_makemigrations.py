from django.apps import apps
from django.core.management.base import BaseCommand
from django.core.management import call_command

# ----------------------------------
# :: Command Class
# ----------------------------------

""" 
This Django management command detects all non-Django apps with models and runs makemigrations for them automatically.
"""


class Command(BaseCommand):
    help = "Detect apps with models and run makemigrations for them"

    # ----------------------------------
    # :: Handle Function
    # ----------------------------------

    """ 
    This method finds all non-Django apps with models and runs `makemigrations` 
    for them, printing detected apps or a message if none are found.
    """

    def handle(self, *args, **options):
        apps_with_models = [
            app.label
            for app in apps.get_app_configs()
            if app.models_module is not None and not app.name.startswith("django.")
        ]
        if apps_with_models:
            self.stdout.write(f"Detected apps: {apps_with_models}")
            call_command("makemigrations", *apps_with_models)
        else:
            self.stdout.write("No apps with models detected.")
