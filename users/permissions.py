from .models import UserRole
from rest_framework.permissions import SAFE_METHODS, BasePermission


# -----------------------------------
# :: IsAdminOrManager Class
# -----------------------------------

"""
Allows full access to Admin and Manager. Read-only access to Staff.
"""


class IsAdminOrManager(BasePermission):

    # -----------------------------------
    # :: has_permission Function
    # -----------------------------------

    """
    This code allows anyone authenticated to read data, but only superusers or 
    users with admin or manager roles can perform write operations.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        return (
            request.method in SAFE_METHODS or
            user.is_superuser or
            getattr(user, "role", None) in {UserRole.ADMIN, UserRole.MANAGER}
        )
