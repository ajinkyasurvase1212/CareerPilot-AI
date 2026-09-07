from django.contrib import admin

from .models import JobDescription, JobMatch


@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "user",
        "resume",
        "created_at",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "title",
        "company",
        "user__username",
    )


@admin.register(JobMatch)
class JobMatchAdmin(admin.ModelAdmin):
    list_display = (
        "job",
        "match_score",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "match_score",
        "created_at",
    )