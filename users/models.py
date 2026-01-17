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
    # -----------------------------------
    # :: is_manager function
    # -----------------------------------

    """
    Returns True if the user has a managerial role (Admin or Manager).
    """

    def is_manager(self):
        return self.role in {UserRole.ADMIN, UserRole.MANAGER}

    # -----------------------------------
    # :: is_staff_user function
    # -----------------------------------
    """
    Returns True if the user has a standard staff role.
    """

    def is_staff_user(self):
        return self.role == UserRole.STAFF

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ["username"]

    # -----------------------------------
    # :: __unicode__ function
    # -----------------------------------

    """
    Display username and role in admin and logs (Python 2 friendly).
    """

    def __unicode__(self):
        return u"%s (%s)" % (self.username, self.get_role_display())
