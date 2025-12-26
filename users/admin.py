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
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
    )

    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("role", "is_staff", "is_superuser",
                   "is_active", "assigned_locations")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff",
         "is_superuser", "groups", "user_permissions")}),
        ("Locations", {"fields": ("assigned_locations",)}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "first_name", "last_name", "role", "password1", "password2", "assigned_locations", "is_staff", "is_active"),
        }),
    )

    ordering = ("username",)
    filter_horizontal = ("groups", "user_permissions", "assigned_locations")
