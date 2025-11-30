import os
import logging
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
# -----------------------------------
# :: Environment Loader
# -----------------------------------

"""
Load environment variables from .env file
"""

load_dotenv()


# -----------------------------------
# :: BASE_DIR
# -----------------------------------

"""
Set project root directory
"""

try:
    BASE_DIR = Path(__file__).resolve().parent.parent
except Exception as e:
    logging.error(f"BASE_DIR initialization failed: {e}")


# -----------------------------------
# :: SECRET_KEY
# -----------------------------------

"""
Set Django secret key for cryptographic signing
"""

try:
    SECRET_KEY = os.getenv(
        "SECRET_KEY", 'django-insecure-ur=%pz20wppiq#nlo=0^gx&qiqns&7zt+itph)e2dh@!9o#e#_')
except Exception as e:
    logging.error(f"SECRET_KEY initialization failed: {e}")


# -----------------------------------
# :: DEBUG
# -----------------------------------

"""
Enable or disable debug mode
"""

try:
    DEBUG = os.getenv("DEBUG", "True") == "True"
except Exception as e:
    logging.error(f"DEBUG initialization failed: {e}")


# -----------------------------------
# :: ALLOWED_HOSTS
# -----------------------------------

"""
Define allowed domains for the project
"""

try:
    ALLOWED_HOSTS = ["*"]

    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5000",
    ]

    CORS_ALLOW_ALL_ORIGINS = True
except Exception as e:
    logging.error(f"ALLOWED_HOSTS initialization failed: {e}")


# -----------------------------------
# :: INSTALLED_APPS
# -----------------------------------

"""
List all enabled Django applications
"""

try:
    INSTALLED_APPS = [
        'locations.apps.LocationsConfig',
        'inventory.apps.InventoryConfig',
        'counts.apps.CountsConfig',
        'reports.apps.ReportsConfig',
        'users.apps.UsersConfig',
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'rest_framework',
        'corsheaders',
    ]
except Exception as e:
    logging.error(f"INSTALLED_APPS initialization failed: {e}")


# -----------------------------------
# :: AUTH_USER_MODEL
# -----------------------------------

"""
This line tells Django to use the User model from the users app as the 
custom user model instead of the default auth.User.
"""

try:
    AUTH_USER_MODEL = 'users.User'
except Exception as e:
    logging.error(f"AUTH_USER_MODEL initialization failed: {e}")


# -----------------------------------
# :: AUTH_USER_MODEL
# -----------------------------------

"""
This code configures Django REST Framework settings for 
authentication, permissions, pagination, and response rendering.
"""

try:
    REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            'rest_framework_simplejwt.authentication.JWTAuthentication',
        ),
        'DEFAULT_PERMISSION_CLASSES': (
            'rest_framework.permissions.IsAuthenticated',
        ),
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
        'PAGE_SIZE': 50,
        'DEFAULT_RENDERER_CLASSES': (
            'rest_framework.renderers.JSONRenderer',
            'rest_framework.renderers.BrowsableAPIRenderer',
        ),
    }
except Exception as e:
    logging.error(f"REST_FRAMEWORK initialization failed: {e}")


# -----------------------------------
# :: MIDDLEWARE
# -----------------------------------

"""
List middleware classes for request/response processing
"""

try:
    MIDDLEWARE = [
        "corsheaders.middleware.CorsMiddleware",
        'django.middleware.security.SecurityMiddleware',
        'whitenoise.middleware.WhiteNoiseMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ]
except Exception as e:
    logging.error(f"MIDDLEWARE initialization failed: {e}")


# -----------------------------------
# :: ROOT_URLCONF
# -----------------------------------

"""
Set the URL configuration module
"""

try:
    ROOT_URLCONF = 'PBIS.urls'
except Exception as e:
    logging.error(f"ROOT_URLCONF initialization failed: {e}")


# -----------------------------------
# :: TEMPLATES
# -----------------------------------

"""
Configure template engines and options
"""

try:
    TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [BASE_DIR / 'frontend' / 'dist'],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },
    ]
except Exception as e:
    logging.error(f"TEMPLATES initialization failed: {e}")


# -----------------------------------
# :: WSGI_APPLICATION
# -----------------------------------

"""
Set WSGI callable for deployment
"""

try:
    WSGI_APPLICATION = 'PBIS.wsgi.application'
except Exception as e:
    logging.error(f"WSGI_APPLICATION initialization failed: {e}")


# -----------------------------------
# :: DATABASES
# -----------------------------------

"""
Configure database connection details
"""

try:
    database_url = os.getenv("DATABASE")
    if database_url:
        DATABASES = {
            'default': dj_database_url.parse(database_url)
        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
except Exception as e:
    logging.error(f"DATABASES initialization failed: {e}")


# -----------------------------------
# :: AUTH_PASSWORD_VALIDATORS
# -----------------------------------

"""
Set password validation rules
"""

try:
    AUTH_PASSWORD_VALIDATORS = [
        {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
        {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
        {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
        {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
    ]
except Exception as e:
    logging.error(f"AUTH_PASSWORD_VALIDATORS initialization failed: {e}")


# -----------------------------------
# :: LANGUAGE_CODE
# -----------------------------------

"""
Set default language code
"""

try:
    LANGUAGE_CODE = 'en-us'
except Exception as e:
    logging.error(f"LANGUAGE_CODE initialization failed: {e}")


# -----------------------------------
# :: TIME_ZONE
# -----------------------------------

"""
Set default time zone
"""

try:
    TIME_ZONE = 'UTC'
except Exception as e:
    logging.error(f"TIME_ZONE initialization failed: {e}")


# -----------------------------------
# :: USE_I18N
# -----------------------------------

"""
Enable internationalization support
"""

try:
    USE_I18N = True
except Exception as e:
    logging.error(f"USE_I18N initialization failed: {e}")


# -----------------------------------
# :: USE_TZ
# -----------------------------------

"""
Enable timezone-aware datetimes
"""

try:
    USE_TZ = True
except Exception as e:
    logging.error(f"USE_TZ initialization failed: {e}")


# -----------------------------------
# :: STATIC_URL
# -----------------------------------

"""
Define URL prefix for static files
"""

try:
    STATIC_URL = '/static/'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    
    frontend_dist = BASE_DIR / 'frontend' / 'dist'
    STATICFILES_DIRS = [frontend_dist] if frontend_dist.exists() else []
    
    if not DEBUG:
        STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
except Exception as e:
    logging.error(f"STATIC_URL initialization failed: {e}")


# -----------------------------------
# :: DEFAULT_AUTO_FIELD
# -----------------------------------

"""
Set default primary key type for models
"""

try:
    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
except Exception as e:
    logging.error(f"DEFAULT_AUTO_FIELD initialization failed: {e}")


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
