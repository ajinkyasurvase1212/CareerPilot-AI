from django.contrib import admin

from .models import Resume, ResumeAnalysis


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "title",
        "uploaded_at",
        "updated_at",
    )

    list_filter = (
        "uploaded_at",
        "updated_at",
    )

    search_fields = (
        "user__username",
        "title",
    )


@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        "resume",
        "resume_score",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "resume_score",
        "created_at",
        "updated_at",
    )