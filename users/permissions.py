from .models import UserRole
from rest_framework.permissions import SAFE_METHODS, BasePermission


# -----------------------------------
# :: Is manager Function
# -----------------------------------
"""
Checks if the user is authenticated and is either a superuser, an admin, or a manager.
"""


def is_manager(user) -> bool:
    if not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    return getattr(user, "role", None) in {UserRole.ADMIN, UserRole.MANAGER}


# -----------------------------------
# :: Is Staff Function
# -----------------------------------
"""
Returns True if the user is authenticated and has the Staff role
"""


def is_staff_user(user) -> bool:
    if not getattr(user, "is_authenticated", False):
        return False
    return getattr(user, "role", None) == UserRole.STAFF


# -----------------------------------
# :: Read Only Unless Manager Class
# -----------------------------------
"""
Allows read access to any authenticated user, but restricts write operations to managers/admins.
"""


class ReadOnlyUnlessManager(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_manager(user)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


# -----------------------------------
# :: Manager Only Class
# -----------------------------------
"""
Restricts all access to managers/admins.
"""


class ManagersOnly(BasePermission):
    def has_permission(self, request, view):
        return is_manager(request.user)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


# -----------------------------------
# :: Staff Can Submitt Counts Class
# -----------------------------------
"""
Allows staff to submit or update counts when they have access to the related location.
"""


class StaffCanSubmitCounts(BasePermission):
    message = "You do not have permission to update counts for this location."

    def has_permission(self, request, view):
        user = request.user
        return getattr(user, "is_authenticated", False)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        if is_manager(user):
            return True
        if not is_staff_user(user):
            return False

        location = None
        if hasattr(obj, "location"):
            location = obj.location
        elif hasattr(obj, "sheet"):
            location = obj.sheet.location
        elif hasattr(obj, "override"):
            location = obj.override.location

        if location is None:
            return False
        return user.assigned_locations.filter(pk=location.pk).exists()
