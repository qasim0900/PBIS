from rest_framework import serializers
from .models import User
from locations.models import Location


# -----------------------------------
# :: Location Serializer
# -----------------------------------

"""
Serializer for assigned locations.
"""


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ("id", "name", "code")
        read_only_fields = fields


# -----------------------------------
# :: User Serializer
# -----------------------------------

"""
Serializer for User with role display, flags, and assigned locations.
"""


class UserSerializer(serializers.ModelSerializer):

    role_display = serializers.CharField(
        source="get_role_display", read_only=True)
    assigned_locations = LocationSerializer(many=True, read_only=True)
    is_manager = serializers.SerializerMethodField()
    is_staff_user = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "role_display",
            "is_manager",
            "is_staff_user",
            "assigned_locations",
        )
        read_only_fields = fields

    # ---------------------------------
    # :: Get is Manager Function
    # ---------------------------------

    """
    Return True if user is manager or admin.
    """

    def get_is_manager(self, obj):
        return obj.is_manager()

    # ---------------------------------
    # :: Get is Manager Function
    # ---------------------------------

    """
    Return True if user is staff.
    """

    def get_is_staff_user(self, obj):
        return obj.is_staff_user()


# -----------------------------------
# :: User Registration Serializer
# -----------------------------------

"""
Handles registration of new users with secure password hashing.
"""


class UserRegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
        )

    # ---------------------------------
    # :: Create User Profile Function
    # ---------------------------------

    """
    Create User Profile
    """

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=validated_data.get("role", "staff"),
            password=validated_data["password"],
        )
