from django.urls import path

from .views import (
    ResumeUploadView,
    ResumeAnalysisView,
    ResumeListView,
    ResumeAnalysisDetailView,
)


urlpatterns = [

    path(
        "upload/",
        ResumeUploadView.as_view(),
        name="resume-upload",
    ),

    path(
        "",
        ResumeListView.as_view(),
        name="resume-list",
    ),

    path(
        "<int:resume_id>/analyze/",
        ResumeAnalysisView.as_view(),
        name="resume-analysis",
    ),

    path(
        "<int:resume_id>/analysis/",
        ResumeAnalysisDetailView.as_view(),
        name="resume-analysis-detail",
    ),

]