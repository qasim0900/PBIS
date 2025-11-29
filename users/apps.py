import logging
from django.apps import AppConfig

# -----------------------------------
# :: UsersConfig
# -----------------------------------

"""
Configuration class for the 'users' app
"""

try:
    class UsersConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'users'
except Exception as e:
    logging.error(f"UsersConfig initialization failed: {e}")
