from .models import User
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, UserRegisterSerializer
from .permissions import IsAdminOrManager

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated,IsAdminOrManager]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, context={'request': request})
        data = {**serializer.data,
                'is_manager': request.user.is_manager(),
                'is_staff_user': request.user.is_staff_user()}
        return Response(data, status=status.HTTP_200_OK)

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [IsAuthenticated]

class UsersListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data.copy()

        if role := data.get("role"):
            valid_roles = [choice[0] for choice in User._meta.get_field("role").choices]
            if role not in valid_roles:
                return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "User updated successfully.",
            "user": serializer.data,
        }, status=status.HTTP_200_OK)

    def get_serializer(self, *args, **kwargs):
        return super().get_serializer(*args, **kwargs)
