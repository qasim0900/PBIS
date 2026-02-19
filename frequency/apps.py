from django.apps import AppConfig

# --------------------------
# :: FrequencyConfig Class
# --------------------------

""" 
This defines the **Django app configuration** for the `frequency` 
app, setting its name and using **BigAutoField** as the default primary key type.
"""


class FrequencyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'frequency'
