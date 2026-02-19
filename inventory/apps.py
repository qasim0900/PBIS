from django.apps import AppConfig

# -----------------------------------
# :: Inventory Config Class
# -----------------------------------

"""
This defines the **Django app configuration** for the `inventory` app, setting its name and using **BigAutoField** as the default primary key type.
"""


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'
