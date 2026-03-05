import logging
from django.apps import AppConfig

try:
    class LocationsConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'locations'
except Exception as e:
    logging.error(f"LocationsConfig initialization failed: {e}")
