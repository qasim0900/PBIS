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
        try:
            user = self.get_object()
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data.copy()

        # Validate role if provided
        if role := data.get("role"):
            valid_roles = [choice[0] for choice in User._meta.get_field("role").choices]
            if role not in valid_roles:
                return Response(
                    {"error": f"Invalid role. Valid roles are: {', '.join(valid_roles)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Validate username if provided
        if username := data.get("username"):
            if not username.strip():
                return Response(
                    {"error": "Username cannot be empty."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for duplicate username
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response(
                    {"error": "A user with this username already exists."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Validate email if provided
        if email := data.get("email"):
            if not email.strip():
                return Response(
                    {"error": "Email cannot be empty."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for duplicate email
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response(
                    {"error": "A user with this email already exists."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            serializer = self.get_serializer(user, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response({
                "message": "User updated successfully.",
                "user": serializer.data,
            }, status=status.HTTP_200_OK)
        
        except serializers.ValidationError as e:
            return Response(
                {"error": str(e.detail) if hasattr(e, 'detail') else str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer(self, *args, **kwargs):
        return super().get_serializer(*args, **kwargs)
