import os
import logging
from django.core.asgi import get_asgi_application

try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PBIS.settings')
except Exception as e:
    logging.error(
        f"DJANGO_SETTINGS_MODULE setup failed: {e} - Set default settings module for Django")

try:
    application = get_asgi_application()
except Exception as e:
    logging.error(
        f"ASGI application initialization failed: {e} - Initialize ASGI callable for deployment")
