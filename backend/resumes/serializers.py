from rest_framework import serializers

from .models import Resume, ResumeAnalysis


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id",
            "title",
            "file",
            "extracted_text",
            "uploaded_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "extracted_text",
            "uploaded_at",
            "updated_at",
        ]


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = [
            "id",
            "resume",
            "resume_score",
            "professional_summary",
            "skills",
            "strengths",
            "skill_gaps",
            "improvements",
            "suitable_roles",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "resume",
            "created_at",
            "updated_at",
        ]