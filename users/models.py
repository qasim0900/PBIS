from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    ADMIN = "admin", _("Administrator")
    MANAGER = "manager", _("Manager")
    STAFF = "staff", _("Staff")

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STAFF,
    )

    def is_manager(self):
        return self.role in {UserRole.ADMIN, UserRole.MANAGER}

    def is_staff_user(self):
        return self.role == UserRole.STAFF

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ["username"]

    def __unicode__(self):
        return u"%s (%s)" % (self.username, self.get_role_display())
