from django.contrib import admin
from django.conf import settings
from django.views.generic import TemplateView
from inventory.views import CatalogItemViewSet
from django.urls import include, path, re_path
from reports.views import ReportArchiveViewSet
from rest_framework.routers import DefaultRouter
from counts.views import CountEntryViewSet, CountSheetViewSet
from locations.views import LocationOverrideViewSet, LocationViewSet


# -----------------------------------
# :: URL Patterns
# -----------------------------------

"""
Define URL routing for the project
"""

router = DefaultRouter()
router.register(r'catalog/items', CatalogItemViewSet, basename='catalog-item')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'location-overrides', LocationOverrideViewSet,
                basename='location-override')
router.register(r'counts/sheets', CountSheetViewSet, basename='count-sheet')
router.register(r'counts/entries', CountEntryViewSet, basename='count-entry')
router.register(r'reports/archives', ReportArchiveViewSet,
                basename='report-archive')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include(router.urls)),
    path('api/reports/', include('reports.urls')),
    path("api/counts/", include("counts.urls")),
]

if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]
