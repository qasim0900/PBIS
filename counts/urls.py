# counts/urls.py
from django.urls import path
from .views import (
    CountSheetViewSet,
    CountEntryViewSet,
)

# ViewSet instances bana rahe hain taaki actions use kar sakein
sheet_list = CountSheetViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

sheet_detail = CountSheetViewSet.as_view({
    'get': 'retrieve',
    'post': 'partial_update',  # agar update allowed ho toh
})

# Custom actions (router se zyada clear)
sheet_actions = CountSheetViewSet.as_view({
    'post': 'ensure_sheet',           # Survey shuru karne ke liye
    'get': 'today',                   # Aaj ka sheet
})

sheet_submit = CountSheetViewSet.as_view({
    'post': 'submit',
})

sheet_bulk_update = CountSheetViewSet.as_view({
    'post': 'bulk_update_counts',
})

sheet_order_report = CountSheetViewSet.as_view({
    'get': 'order_report',
})

sheet_reset = CountSheetViewSet.as_view({
    'post': 'reset',
})

sheet_lock = CountSheetViewSet.as_view({
    'post': 'lock',
})

sheet_unlock = CountSheetViewSet.as_view({
    'post': 'unlock',
})

# CountEntry endpoints
entry_list = CountEntryViewSet.as_view({
    'get': 'list',
})

entry_detail = CountEntryViewSet.as_view({
    'get': 'retrieve',
})

entry_history = CountEntryViewSet.as_view({
    'get': 'history',
})

entry_low_stock = CountEntryViewSet.as_view({
    'get': 'low-stock',
})

# ------------------------------------------
# URL Patterns (sab clear aur alag-alag)
# ------------------------------------------

urlpatterns = [
    # Count Sheets - Basic CRUD
    path('sheets/', sheet_list, name='count-sheet-list'),
    path('sheets/<int:pk>/', sheet_detail, name='count-sheet-detail'),

    # Survey & Today Sheet
    path('sheets/ensure/', sheet_actions, name='count-sheet-ensure'),
    path('sheets/today/', sheet_actions, name='count-sheet-today'),

    # Submit & Bulk Update
    path('sheets/<int:pk>/submit/', sheet_submit, name='count-sheet-submit'),
    path('sheets/<int:pk>/bulk-update/', sheet_bulk_update,
         name='count-sheet-bulk-update'),

    # Reports
    path('sheets/<int:pk>/order-report/', sheet_order_report,
         name='count-sheet-order-report'),

    # Manager Controls (reset, lock, unlock)
    path('sheets/<int:pk>/reset/', sheet_reset, name='count-sheet-reset'),
    path('sheets/<int:pk>/lock/', sheet_lock, name='count-sheet-lock'),
    path('sheets/<int:pk>/unlock/', sheet_unlock, name='count-sheet-unlock'),

    # Count Entries
    path('entries/', entry_list, name='count-entry-list'),
    path('entries/<int:pk>/', entry_detail, name='count-entry-detail'),
    path('entries/<int:pk>/history/', entry_history, name='count-entry-history'),
    path('entries/low-stock/', entry_low_stock, name='count-entry-low-stock'),
]
