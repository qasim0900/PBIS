from .models import User, UserRole
from rest_framework import serializers

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

    def get_is_manager(self, obj):
        return obj.is_manager()

    def get_is_staff_user(self, obj):
        return obj.is_staff_user()

class UserRegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text="Password must be at least 8 characters."
    )

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

        extra_kwargs = {
            "is_active": {"default": True},
            "role": {"default": UserRole.STAFF},
            "email": {"required": True},
            "username": {"required": True},
        }

    def validate_username(self, value):
        """Validate username"""
        if not value or not value.strip():
            raise serializers.ValidationError("Username cannot be empty.")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        
        if len(value) > 150:
            raise serializers.ValidationError("Username must be 150 characters or less.")
        
        # Check if username already exists (for create)
        if not self.instance and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        return value.strip()

    def validate_email(self, value):
        """Validate email"""
        if not value or not value.strip():
            raise serializers.ValidationError("Email cannot be empty.")
        
        # Check if email already exists (for create)
        if not self.instance and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return value.strip().lower()

    def validate_password(self, value):
        """Validate password"""
        if not value:
            raise serializers.ValidationError("Password is required.")
        
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if len(value) > 128:
            raise serializers.ValidationError("Password must be 128 characters or less.")
        
        return value

    def create(self, validated_data):
        try:
            password = validated_data.pop("password")
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError({
                "detail": f"Account creation failed. Please ensure all details are correct or contact support if the issue persists."
            })

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance