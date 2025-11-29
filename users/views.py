from .models import User
from typing import Any, Dict, List
from locations.models import Location
from .permissions import ManagersOnly
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, UserRegisterSerializer

# ----------------------------------------------
# :: Current User VIew Class
# ----------------------------------------------

""" 
API endpoint to retrieve the currently authenticated user's details,
    including flags indicating if the user is a manager or a staff member.
"""


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    # ----------------------------------------------
    # :: Get FUnction
    # ----------------------------------------------

    """ 
    Returns the authenticated user's details along with flags indicating if they are a manager or staff.
    """

    def get(self, request, *args, **kwargs):
        user: User = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = UserSerializer(user, context={"request": request})
        data: Dict[str, Any] = serializer.data
        data.update({
            "is_manager": user.is_manager(),
            "is_staff_user": user.is_staff_user(),
        })

        return Response(data, status=status.HTTP_200_OK)


# ----------------------------------------------
# :: Register User VIew Class
# ----------------------------------------------

""" 
Provides an API endpoint that allows managers to create (register) new users.
"""


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [ManagersOnly]


# ----------------------------------------------
# :: User List View Class
# ----------------------------------------------

""" 
Provides an API endpoint that allows managers to view a list of all users.
"""


class UsersListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [ManagersOnly]


# ----------------------------------------------
# :: User Detail View Class
# ----------------------------------------------


""" 
Provides an API endpoint that allows managers to retrieve, update, or delete a specific user.
"""


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [ManagersOnly]


# ----------------------------------------------
# :: Assign Location View Class
# ----------------------------------------------


""" 
API endpoint that allows managers to assign multiple valid locations to a specific user,
    ensuring all location IDs are valid and returning a detailed success or error response.
"""


class AssignLocationsView(APIView):
    permission_classes = [ManagersOnly]

    # ----------------------------------------------
    # :: Post Function
    # ----------------------------------------------

    """ 
    Assigns a list of valid locations to a specific user, 
    validating both the user and location IDs, and returns a success or error response.
    """

    def post(self, request, pk, *args, **kwargs):
        try:
            user: User = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        location_ids: List[int] = request.data.get("locations", [])

        if not isinstance(location_ids, list):
            return Response(
                {"error": "Invalid format: 'locations' must be a list of IDs."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        valid_locations = Location.objects.filter(pk__in=location_ids)
        invalid_ids = set(location_ids) - \
            set(valid_locations.values_list("id", flat=True))

        if invalid_ids:
            return Response(
                {"error": f"Invalid location IDs: {list(invalid_ids)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.assigned_locations.set(valid_locations)

        return Response(
            {
                "message": "Locations assigned successfully.",
                "assigned_locations": list(valid_locations.values("id", "name", "code")),
            },
            status=status.HTTP_200_OK,
        )


# ----------------------------------------------
# :: Update User View Class
# ----------------------------------------------


""" 
Allows managers to partially update a user’s details, validate roles, and update assigned locations.
"""


class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [ManagersOnly]

    # ----------------------------------------------
    # :: Patch Function
    # ----------------------------------------------

    """
    Partial update of user. Only provided fields will be updated.
    """

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        data: Dict[str, Any] = request.data.copy()
        if "role" in data:
            if data["role"] not in [choice[0] for choice in User._meta.get_field("role").choices]:
                return Response(
                    {"error": "Invalid role."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        location_ids = data.pop("assigned_locations", None)
        serializer = self.get_serializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if location_ids is not None:
            user.assigned_locations.set(location_ids)

        return Response(
            {
                "message": "User updated successfully.",
                "user": UserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
