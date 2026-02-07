from django.contrib import admin
from django.conf import settings
from django.views.generic import TemplateView
from django.urls import path, include, re_path


# ------------------------------------
# :: API Pattern URL
# ------------------------------------

""" 
This defines the **API URL routes**, including paths from the `users`, 
`locations`, `frequency`, `vendor`, `inventory`, and `counts` apps.
"""

api_patterns = [
    path("auth/", include("users.urls")),
    path("", include("locations.urls")),
    path("", include("frequency.urls")),
    path("", include("vendor.urls")),
    path("", include("inventory.urls")),
    path("", include("counts.urls")),
    path("", include("reports.urls")),
    path("", include("brand.urls")),
]


# ------------------------------------
# :: Pattern URL
# ------------------------------------

""" 
This sets the project's **main URL routes**, routing `/admin/` to Django Admin and `/api/` to all the app-specific API URLs.
"""

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_patterns, "api"), namespace="api")),
]


# ------------------------------------
# :: Setting Debugging
# ------------------------------------

""" 
This adds a **catch-all route in production** to serve `index.html` for any unmatched URL, typically for a frontend single-page application (SPA).
"""

if not settings.DEBUG:
    urlpatterns.append(
        re_path(r"^.*$", TemplateView.as_view(template_name="index.html")))
