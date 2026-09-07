from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    target_role = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    location = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "target_role",
            "location",
        ]

    def create(self, validated_data):
        target_role = validated_data.pop("target_role", "")
        location = validated_data.pop("location", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        Profile.objects.create(
            user=user,
            target_role=target_role,
            location=location,
        )

        return user