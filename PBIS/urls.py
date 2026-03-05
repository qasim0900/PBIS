from django.contrib import admin
from django.conf import settings
from django.views.generic import TemplateView
from django.urls import path, include, re_path

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

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_patterns, "api"), namespace="api")),
]

if not settings.DEBUG:
    urlpatterns.append(
        re_path(r"^.*$", TemplateView.as_view(template_name="index.html")))
