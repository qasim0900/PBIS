from .models import User
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


# -----------------------------------
# :: Admin User Class
# -----------------------------------

"""
Custom Django admin configuration for the User model, managing display, search, filters, permissions, locations, and user creation fields
"""


@admin.register(User)
class UserAdmin(BaseUserAdmin):

    # -----------------------------
    # :: List Display
    # -----------------------------

    """ 
    This controls which **user fields are shown as columns** in the Django Admin list view.
    """

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
    )

    # -----------------------------
    # :: Search Fields
    # -----------------------------

    """ 
    This enables searching users in Django Admin by **username, email, first name, and last name**.
    """

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    # -----------------------------
    # :: List Filter
    # -----------------------------

    """ 
    This adds sidebar filters in Django Admin to quickly filter users by **role**, **staff status**, **superuser status**, and **active status**.
    """

    list_filter = (
        "role",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    # -----------------------------
    # :: Field Sets
    # -----------------------------

    """ 
    This defines how user fields are **grouped and displayed in sections** on the Django Admin **edit user** page.
    """

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    # -----------------------------
    # :: Add Fieldsets
    # -----------------------------

    """ 
    This configuration defines which fields appear (and how) on the Django Admin “Add User” form, arranging them in a wide layout.
    """

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    # -----------------------------
    # :: Ordering
    # -----------------------------

    """ 
    This line tells Django to sort records by username in ascending order by default.
    """

    ordering = ("username",)

    # -----------------------------
    # :: Filter Horizontal
    # -----------------------------

    """ 
    This line enables a horizontal filter UI in Django Admin for selecting multiple groups and user permissions for a user.
    """

    filter_horizontal = (
        "groups",
        "user_permissions",
    )
