import os
import logging
from django.core.asgi import get_asgi_application


# -----------------------------------
# :: DJANGO_SETTINGS_MODULE
# -----------------------------------

"""
    Set the default Django settings module
"""
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PBIS.settings')
except Exception as e:
    logging.error(
        f"DJANGO_SETTINGS_MODULE setup failed: {e} - Set default settings module for Django")


# -----------------------------------
# :: ASGI Application
# -----------------------------------

"""
Initialize ASGI application for deployment
"""

try:
    application = get_asgi_application()
except Exception as e:
    logging.error(
        f"ASGI application initialization failed: {e} - Initialize ASGI callable for deployment")
