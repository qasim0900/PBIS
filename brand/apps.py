from django.apps import AppConfig

# -----------------------------------
# :: Brand Config Class
# -----------------------------------

"""
This defines the **Django app configuration** for the `brand` app, setting its name and using **BigAutoField** as the default primary key type.
"""

class BrandConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'brand'
