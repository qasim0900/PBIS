from rest_framework.routers import DefaultRouter
from .views import CountSheetViewSet, CountEntryViewSet

router = DefaultRouter()
router.register(r'sheets', CountSheetViewSet, basename='counts-sheets')
router.register(r'entries', CountEntryViewSet, basename='counts-entries')

urlpatterns = router.urls
