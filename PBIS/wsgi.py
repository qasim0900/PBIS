import os
import logging
from django.core.wsgi import get_wsgi_application

try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PBIS.settings')
except Exception as e:
    logging.error(
        f"DJANGO_SETTINGS_MODULE setup failed: {e} - Set default settings module for Django")

try:
    application = get_wsgi_application()
except Exception as e:
    import logging
    logging.error(
        f"WSGI application initialization failed: {e} - Initialize WSGI callable for deployment")
