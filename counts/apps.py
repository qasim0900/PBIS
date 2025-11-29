import logging
from django.apps import AppConfig

# -----------------------------------
# :: CountsConfig
# -----------------------------------

"""
Configuration class for the 'counts' app
"""
try:
    class CountsConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'counts'

        def ready(self):
            from . import signals  # noqa: F401
except Exception as e:
    logging.error(f"CountsConfig initialization failed: {e}")
