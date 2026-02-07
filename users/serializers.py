from .models import User, UserRole
from rest_framework import serializers

# -----------------------------------
# :: User Serializer
# -----------------------------------

"""
Serializer for User with role display, flags, and assigned locations.
"""


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    role_display = serializers.CharField(
        source="get_role_display",
        read_only=True,
        help_text="Human-readable role of the user."
    )
    is_manager = serializers.SerializerMethodField(
        help_text="Boolean flag indicating if the user is a manager (Admin or Manager)."
    )
    is_staff_user = serializers.SerializerMethodField(
        help_text="Boolean flag indicating if the user is a standard staff user."
    )
    username = serializers.CharField(required=False)
    # -----------------------------
    # :: Meta Class
    # -----------------------------

    """ 
    Meta class for User Registration Serializer
    """

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "is_active",
            "is_manager",
            "is_staff_user",
            "password",
        )
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

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text="Password must be at least 8 characters."
    )

    # -----------------------------
    # :: Meta Class
    # -----------------------------

    """ 
    Meta class for User Registration Serializer
    """

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
            "is_active",
        )

        # -----------------------------
        # :: Extra Keyword Arguments
        # -----------------------------

        """ 
        Extra keyword arguments for fields
        """

        extra_kwargs = {
            "is_active": {"default": True},
            "role": {"default": UserRole.STAFF},
            "email": {"required": True},
            "username": {"required": True},
        }

    # ---------------------------------
    # :: Create User Profile Function
    # ---------------------------------

    """
    Create User Profile
    """

    def create(self, validated_data):
        try:
            password = validated_data.pop("password")
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError({
                "non_field_errors": [f"User creation failed: {str(e)}"]
            })
            
            
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance