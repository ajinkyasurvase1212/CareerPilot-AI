from django.db import models
from django.contrib.auth.models import User

from resumes.models import Resume


class JobDescription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_descriptions"
    )

    title = models.CharField(
        max_length=200
    )

    company = models.CharField(
        max_length=200,
        blank=True
    )

    description = models.TextField()

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="job_matches"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.title} - {self.company}"


class JobMatch(models.Model):
    job = models.OneToOneField(
        JobDescription,
        on_delete=models.CASCADE,
        related_name="match"
    )

    match_score = models.PositiveIntegerField(
        default=0
    )

    matched_skills = models.JSONField(
        default=list
    )

    missing_skills = models.JSONField(
        default=list
    )

    ats_keywords = models.JSONField(
        default=list
    )

    strengths = models.JSONField(
        default=list
    )

    recommendations = models.JSONField(
        default=list
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Match - {self.job.title}"

class InterviewPreparation(models.Model):
    job = models.OneToOneField(
        JobDescription,
        on_delete=models.CASCADE,
        related_name="interview_preparation"
    )

    technical_questions = models.JSONField(
        default=list
    )

    resume_questions = models.JSONField(
        default=list
    )

    behavioral_questions = models.JSONField(
        default=list
    )

    topics_to_revise = models.JSONField(
        default=list
    )

    interview_tips = models.JSONField(
        default=list
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Interview Preparation - {self.job.title}"    


class InterviewSession(models.Model):
    job = models.ForeignKey(
        JobDescription,
        on_delete=models.CASCADE,
        related_name="interview_sessions"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interview_sessions"
    )

    status = models.CharField(
        max_length=20,
        default="in_progress"
    )

    total_questions = models.PositiveIntegerField(
        default=5
    )

    current_question = models.PositiveIntegerField(
        default=1
    )

    final_score = models.PositiveIntegerField(
        default=0
    )

    communication_score = models.PositiveIntegerField(
        default=0
    )

    technical_score = models.PositiveIntegerField(
        default=0
    )

    relevance_score = models.PositiveIntegerField(
        default=0
    )

    feedback = models.JSONField(
        default=list
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


class InterviewQuestion(models.Model):
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    question_number = models.PositiveIntegerField()

    question = models.TextField()

    category = models.CharField(
        max_length=50,
        default="technical"
    )

    user_answer = models.TextField(
        blank=True,
        default=""
    )

    score = models.PositiveIntegerField(
        default=0
    )

    feedback = models.TextField(
        blank=True,
        default=""
    )

    better_answer = models.TextField(
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )    