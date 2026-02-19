from .models import User
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, UserRegisterSerializer
from .permissions import IsAdminOrManager
# ----------------------------------------------
# :: Current User VIew Class
# ----------------------------------------------

""" 
API endpoint to retrieve the currently authenticated user's details,
    including flags indicating if the user is a manager or a staff member.
"""


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated,IsAdminOrManager]

    # ----------------------------------------------
    # :: Get FUnction
    # ----------------------------------------------

    """ 
    Returns the authenticated user's details along with flags indicating if they are a manager or staff.
    """

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, context={'request': request})
        data = {**serializer.data,
                'is_manager': request.user.is_manager(),
                'is_staff_user': request.user.is_staff_user()}
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
    permission_classes = [IsAuthenticated]


# ----------------------------------------------
# :: User List View Class
# ----------------------------------------------

""" 
Provides an API endpoint that allows managers to view a list of all users.
"""


class UsersListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# ----------------------------------------------
# :: User Detail View Class
# ----------------------------------------------


""" 
Provides an API endpoint that allows managers to retrieve, update, or delete a specific user.
"""


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# ----------------------------------------------
# :: Update User View Class
# ----------------------------------------------

""" 
Allows managers to partially update a user's details, validate roles, and update assigned locations.
"""


class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    # ----------------------------------------------
    # :: Patch Function
    # ----------------------------------------------

    """
    Partial update of user. Only provided fields will be updated.
    """

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data.copy()

        if role := data.get("role"):
            valid_roles = [choice[0] for choice in User._meta.get_field("role").choices]
            if role not in valid_roles:
                return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)

        # Partial update
        serializer = self.get_serializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "User updated successfully.",
            "user": serializer.data,
        }, status=status.HTTP_200_OK)

    # ----------------------------------------------
    # :: Get Serializer Function
    # ----------------------------------------------

    """
    This line returns the serializer for the view, automatically setting it to allow partial 
    updates so you can update only some fields instead of requiring all fields.
    """

    def get_serializer(self, *args, **kwargs):
        return super().get_serializer(*args, **kwargs)
