from django.apps import AppConfig

# -----------------------------------
# :: Counts Config Class
# -----------------------------------

"""
This defines the **Django app configuration** for the `counts` app, setting its name and using **BigAutoField** as the default primary key type.
"""


class CountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'counts'
