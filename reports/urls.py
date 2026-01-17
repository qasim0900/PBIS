from django.urls import path
from .views import ReportViewSet

# -----------------------------------
# :: DRF Router Setup
# -----------------------------------

"""
Includes all the registered router URLs in the `urlpatterns`
for the Report module.
"""

urlpatterns = [
    path("reports/", ReportViewSet.as_view({"get": "list"})),
    path("reports/create/", ReportViewSet.as_view({"post": "create"})),
    path(
        "reports/<int:pk>/update/",
        ReportViewSet.as_view({
            "put": "update",
            "patch": "partial_update",
        }),
    ),
]
