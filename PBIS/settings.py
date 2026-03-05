import os
import dj_database_url
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

try:
    load_dotenv()
except Exception as e:
    print(f"[Warning] Could not load .env file: {e}")

try:
    BASE_DIR = Path(__file__).resolve().parent.parent
except Exception as e:
    raise RuntimeError(f"Could not resolve BASE_DIR: {e}")

try:
    SECRET_KEY = os.getenv(
        "SECRET_KEY", "replit-default-secret-key-12345"
    )
except Exception as e:
    raise RuntimeError(f"Could not load SECRET_KEY: {e}")

try:
    DEBUG = os.getenv("DEBUG", "True") == "True"
except Exception as e:
    raise RuntimeError(f"Error DEBUG: {e}")

try:
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
except Exception as e:
    raise RuntimeError(f"Error setting ALLOWED_HOSTS: {e}")

try:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = os.getenv(
        "CORS_ALLOWED_ORIGIN", "http://localhost:5001,http://localhost:3000"
    ).split(",")
except Exception as e:
    raise RuntimeError(f"Error setting CORS_ALLOWED_ORIGINS: {e}")

try:
    INSTALLED_APPS = [
        "corsheaders",
        "whitenoise.runserver_nostatic",
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        "rest_framework",
        "locations",
        "frequency",
        "inventory",
        "counts",
        "reports",
        "vendor",
        "brand",
        "users",
        
    ]
except Exception as e:
    raise RuntimeError(f"Error setting INSTALLED_APPS: {e}")

try:
    AUTH_USER_MODEL = "users.User"
except Exception as e:
    raise RuntimeError(f"Error setting AUTH_USER_MODEL: {e}")

try:
    REST_FRAMEWORK = {
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "rest_framework_simplejwt.authentication.JWTAuthentication",
        ),
        "DEFAULT_PERMISSION_CLASSES": (
            "rest_framework.permissions.IsAuthenticated",
        ),
        "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
        "PAGE_SIZE": 50,
        "DEFAULT_RENDERER_CLASSES": (
            "rest_framework.renderers.JSONRenderer",
        ),
    }
except Exception as e:
    raise RuntimeError(f"Error configuring REST_FRAMEWORK: {e}")

try:
    MIDDLEWARE = [
        "corsheaders.middleware.CorsMiddleware",
        "django.middleware.security.SecurityMiddleware",
        "whitenoise.middleware.WhiteNoiseMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
    ]
except Exception as e:
    raise RuntimeError(f"Error setting MIDDLEWARE: {e}")

try:
    ROOT_URLCONF = "PBIS.urls"
except Exception as e:
    raise RuntimeError(f"Error setting ROOT_URLCONF: {e}")

try:
    TEMPLATES = [
        {
            "BACKEND": "django.template.backends.django.DjangoTemplates",
            "DIRS": [BASE_DIR / "frontend" / "dist"],
            "APP_DIRS": True,
            "OPTIONS": {
                "context_processors": [
                    "django.template.context_processors.request",
                    "django.contrib.auth.context_processors.auth",
                    "django.contrib.messages.context_processors.messages",
                ],
            },
        },
    ]
except Exception as e:
    raise RuntimeError(f"Error configuring TEMPLATES: {e}")

try:
    WSGI_APPLICATION = "PBIS.wsgi.application"
except Exception as e:
    raise RuntimeError(f"Error setting WSGI_APPLICATION: {e}")

try:
    database_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE")
    if database_url:
        DATABASES = {"default": dj_database_url.parse(database_url)}
    else:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / "db.sqlite3",
            }
        }
except Exception as e:
    raise RuntimeError(f"Error configuring DATABASES: {e}")

try:
    AUTH_PASSWORD_VALIDATORS = [
        {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
        {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
        {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
        {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
    ]
except Exception as e:
    raise RuntimeError(f"Error setting AUTH_PASSWORD_VALIDATORS: {e}")

try:
    LANGUAGE_CODE = "en-us"
    TIME_ZONE = "UTC"
    USE_I18N = True
    USE_TZ = True
except Exception as e:
    raise RuntimeError(f"Error setting Internationalization: {e}")

try:
    STATIC_URL = "/static/"
    STATIC_ROOT = BASE_DIR / "staticfiles"
    frontend_dist = BASE_DIR / "frontend" / "dist"
    STATICFILES_DIRS = [frontend_dist] if frontend_dist.exists() else []

    if not DEBUG:
        STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
except Exception as e:
    raise RuntimeError(f"Error configuring static files: {e}")

try:
    DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
except Exception as e:
    raise RuntimeError(f"Error setting DEFAULT_AUTO_FIELD: {e}")

try:
    SIMPLE_JWT = {
        "ACCESS_TOKEN_LIFETIME": timedelta(hours=5),
        "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
        "ROTATE_REFRESH_TOKENS": True,
        "BLACKLIST_AFTER_ROTATION": True,
        "AUTH_HEADER_TYPES": ("Bearer",),
    }
except Exception as e:
    raise RuntimeError(f"Error configuring SIMPLE_JWT: {e}")

try:
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "verbose": {
                "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
                "style": "{",
            },
            "simple": {
                "format": "{levelname} {asctime} {module} {message}",
                "style": "{",
            },
        },
        "handlers": {
            "console": {
                "level": "INFO",
                "class": "logging.StreamHandler",
                "formatter": "simple",
            },
        },
        "loggers": {
            "django": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "django.request": {
                "handlers": ["console"],
                "level": "ERROR",
                "propagate": False,
            },
            "django.server": {
                "handlers": ["console"],
                "level": "WARNING",
                "propagate": False,
            },
        },
    }
except Exception as e:
    raise RuntimeError(f"Error configuring LOGGING: {e}")

try:
    csrf_origins = os.getenv("CSRF_TRUSTED_ORIGINS", "http://localhost:5001,http://localhost:3000").split(",")
    CSRF_TRUSTED_ORIGINS = csrf_origins
    
    # Add Replit domains if available
    replit_domain = os.getenv("REPLIT_DEV_DOMAIN", "")
    if replit_domain:
        CSRF_TRUSTED_ORIGINS.append(f"https://{replit_domain}")
    replit_slug = os.getenv("REPLIT_SLUG", "")
    replit_owner = os.getenv("REPLIT_OWNER", "")
    if replit_slug and replit_owner:
        CSRF_TRUSTED_ORIGINS.append(f"https://{replit_slug}.{replit_owner}.repl.co")
        CSRF_TRUSTED_ORIGINS.append(f"https://{replit_slug}-00-{replit_owner}.repl.co")
except Exception as e:
    CSRF_TRUSTED_ORIGINS = ["http://localhost:5001"]
