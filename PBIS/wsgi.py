import os
import logging
from django.core.wsgi import get_wsgi_application


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
# :: WSGI Application
# -----------------------------------

"""
Initialize WSGI application for deployment
"""

try:
    application = get_wsgi_application()
except Exception as e:
    import logging
    logging.error(
        f"WSGI application initialization failed: {e} - Initialize WSGI callable for deployment")
