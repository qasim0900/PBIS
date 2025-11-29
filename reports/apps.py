import logging
from django.apps import AppConfig

# -----------------------------------
# :: ReportsConfig
# -----------------------------------

"""
Configuration class for the 'reports' app
"""

try:
    class ReportsConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'reports'
except Exception as e:
    logging.error(f"ReportsConfig initialization failed: {e}")
