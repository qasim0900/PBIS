import logging
from django.apps import AppConfig

# -----------------------------------
# :: InventoryConfig
# -----------------------------------

"""
Configuration class for the 'inventory' app
"""

try:
    class InventoryConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'inventory'
except Exception as e:
    logging.error(f"InventoryConfig initialization failed: {e}")
