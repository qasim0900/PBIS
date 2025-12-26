from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# -----------------------------------
# :: User Role
# -----------------------------------

"""
Defines user role options (Admin, Manager, Staff) using Django's
TextChoices for consistent role selection.
"""


class UserRole(models.TextChoices):
    ADMIN = "admin", _("Administrator")
    MANAGER = "manager", _("Manager")
    STAFF = "staff", _("Staff")


# -----------------------------------
# :: Users Class
# -----------------------------------
"""
Custom user model that supports role-based access control and location assignments.
"""


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STAFF,
    )
    assigned_locations = models.ManyToManyField(
        "locations.Location",
        related_name="assigned_users",
        blank=True,
        help_text=_("Locations this user can operate in."),
    )

    def is_manager(self) -> bool:
        return self.role in {UserRole.ADMIN, UserRole.MANAGER}

    def is_staff_user(self) -> bool:
        return self.role == UserRole.STAFF


__all__ = ["User", "UserRole"]
