from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "User registered successfully"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        profile, _ = Profile.objects.get_or_create(
            user=user
        )

        return Response(
            {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "target_role": profile.target_role,
                "location": profile.location,
            },
            status=status.HTTP_200_OK
        )

    def put(self, request):
        user = request.user

        profile, _ = Profile.objects.get_or_create(
            user=user
        )

        # Update basic user information
        user.first_name = request.data.get(
            "first_name",
            user.first_name
        )

        user.last_name = request.data.get(
            "last_name",
            user.last_name
        )

        # Update email only if provided
        if "email" in request.data:
            email = request.data.get("email", "").strip()

            if not email:
                return Response(
                    {
                        "email": "Email cannot be empty."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.email = email

        # Update career profile information
        profile.target_role = request.data.get(
            "target_role",
            profile.target_role
        )

        profile.location = request.data.get(
            "location",
            profile.location
        )

        user.save()
        profile.save()

        return Response(
            {
                "message": "Profile updated successfully"
            },
            status=status.HTTP_200_OK
        )