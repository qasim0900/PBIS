from django.urls import path
from .views import InventoryItemViewSet, UnitViewSet

urlpatterns = [
    path(
        "units/",
        UnitViewSet.as_view({"get": "list"}),
        name="unit-list",
    ),
    path(
        "units/create/",
        UnitViewSet.as_view({"post": "create"}),
        name="unit-create",
    ),
    path(
        "units/<int:pk>/",
        UnitViewSet.as_view({"get": "retrieve"}),
        name="unit-retrieve",
    ),
    path(
        "units/<int:pk>/update/",
        UnitViewSet.as_view(
            {"put": "update", "patch": "partial_update"}),
        name="unit-update",
    ),
    path(
        "units/<int:pk>/delete/",
        UnitViewSet.as_view({"delete": "destroy"}),
        name="unit-delete",
    ),
    
    path(
        "inventory-items/",
        InventoryItemViewSet.as_view({"get": "list"}),
        name="inventoryitem-list",
    ),
    path(
        "inventory-items/create/",
        InventoryItemViewSet.as_view({"post": "create"}),
        name="inventoryitem-create",
    ),
    path(
        "inventory-items/<int:pk>/",
        InventoryItemViewSet.as_view({"get": "retrieve"}),
        name="inventoryitem-retrieve",
    ),
    path(
        "inventory-items/<int:pk>/update/",
        InventoryItemViewSet.as_view(
            {"put": "update", "patch": "partial_update"}),
        name="inventoryitem-update",
    ),
    path(
        "inventory-items/<int:pk>/delete/",
        InventoryItemViewSet.as_view({"delete": "destroy"}),
        name="inventoryitem-delete",
    ),
]
