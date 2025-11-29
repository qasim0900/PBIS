from .views import *
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


# -----------------------------------
# :: URL Patterns
# -----------------------------------

"""
Define URL routing for the project
"""

urlpatterns = [


    # ----------------------- AUTH ------------------------ #

    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),


    # ------------------- USERS MANAGEMENT ----------------- #

    path("users-list/", UsersListView.as_view(), name="users-list"),
    path("register/", RegisterUserView.as_view(), name="register"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("<int:pk>/update/", UpdateUserView.as_view(), name="user-update"),

    # ----------------- LOCATION ASSIGNMENT ---------------- #

    path("<int:pk>/assign-locations/",
         AssignLocationsView.as_view(), name="assign-locations"),
]
