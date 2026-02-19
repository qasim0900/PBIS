from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CurrentUserView,
    UsersListView,
    RegisterUserView,
    UserDetailView,
    UpdateUserView,
)

# -----------------------------------
# :: API URL Patterns
# -----------------------------------

"""
URL routing for User-related endpoints and JWT authentication.
Provides endpoints for login, token refresh, user CRUD, and current user details.
"""

urlpatterns = [

    # -------------------------
    # :: Authentication
    # -------------------------

    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),

    # -------------------------
    # :: User Management
    # -------------------------

    path("users-list/", UsersListView.as_view(), name="users-list"),
    path("register/", RegisterUserView.as_view(), name="register"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("<int:pk>/update/", UpdateUserView.as_view(), name="user-update"),
]
