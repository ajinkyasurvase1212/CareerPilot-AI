from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resumes"
    )

    title = models.CharField(
        max_length=200,
        default="My Resume"
    )

    file = models.FileField(
        upload_to="resumes/"
    )

    extracted_text = models.TextField(
        blank=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name="analysis"
    )

    resume_score = models.PositiveIntegerField(
        default=0
    )

    professional_summary = models.TextField(
        blank=True
    )

    skills = models.JSONField(
        default=list
    )

    strengths = models.JSONField(
        default=list
    )

    skill_gaps = models.JSONField(
        default=list
    )

    improvements = models.JSONField(
        default=list
    )

    suitable_roles = models.JSONField(
        default=list
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Analysis - {self.resume.title}"