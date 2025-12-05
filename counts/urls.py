from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CountSheetViewSet, CountEntryViewSet

router = DefaultRouter()
router.register(r'sheets', CountSheetViewSet, basename='counts-sheets')
router.register(r'entries', CountEntryViewSet, basename='counts-entries')

urlpatterns = [
    path("", include(router.urls)),
]
