from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CurrentUserView,
    UsersListView,
    RegisterUserView,
    UserDetailView,
    UpdateUserView,
)

urlpatterns = [

    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),

    path("users-list/", UsersListView.as_view(), name="users-list"),
    path("register/", RegisterUserView.as_view(), name="register"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("<int:pk>/update/", UpdateUserView.as_view(), name="user-update"),
]
