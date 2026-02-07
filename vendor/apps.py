from django.apps import AppConfig

# --------------------------------
# :: VendorConfig Class
# --------------------------------

""" 
Defines the configuration for the Vendor application.
"""


class VendorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vendor'
