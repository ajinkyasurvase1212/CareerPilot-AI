from rest_framework import serializers

from .models import (
    JobDescription,
    JobMatch,
    InterviewPreparation,
)


class JobDescriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobDescription

        fields = [
            "id",
            "title",
            "company",
            "description",
            "resume",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class JobMatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobMatch

        fields = [
            "id",
            "job",
            "match_score",
            "matched_skills",
            "missing_skills",
            "ats_keywords",
            "strengths",
            "recommendations",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "job",
            "created_at",
            "updated_at",
        ]


class InterviewPreparationSerializer(serializers.ModelSerializer):

    class Meta:
        model = InterviewPreparation

        fields = [
            "id",
            "job",
            "technical_questions",
            "resume_questions",
            "behavioral_questions",
            "topics_to_revise",
            "interview_tips",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "job",
            "created_at",
            "updated_at",
        ]