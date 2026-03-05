import logging
from django.apps import AppConfig

try:
    class UsersConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'users'
except Exception as e:
    logging.error(f"UsersConfig initialization failed: {e}")
