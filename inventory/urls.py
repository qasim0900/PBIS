from django.urls import path
from .views import CatalogItemViewSet
from rest_framework.urlpatterns import format_suffix_patterns

# -----------------------------------
# :: URL Patterns
# -----------------------------------

"""
Define URL routing for the inventory app
"""

catalog_item_list = CatalogItemViewSet.as_view({
    "get": "list",
})

catalog_item_detail = CatalogItemViewSet.as_view({
    "get": "retrieve",
})

urlpatterns = [
    # ------------------- CATALOG ITEMS ----------------- #
    path("catalog-items/", catalog_item_list, name="catalog-item-list"),
    path("catalog-items/<int:pk>/", catalog_item_detail,
         name="catalog-item-detail"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
