from django.urls import path

from .views import (
    JobDescriptionCreateView,
    JobMatchView,
    JobMatchDetailView,
    JobListView,
    InterviewPreparationView,
    InterviewPreparationDetailView,
)
from .views import (
    StartMockInterviewView,
    SubmitMockInterviewAnswerView,
)


urlpatterns = [

    path(
        "create/",
        JobDescriptionCreateView.as_view(),
        name="job-create",
    ),

    path(
        "",
        JobListView.as_view(),
        name="job-list",
    ),

    path(
        "<int:job_id>/match/",
        JobMatchView.as_view(),
        name="job-match",
    ),

    path(
        "<int:job_id>/match-result/",
        JobMatchDetailView.as_view(),
        name="job-match-detail",
    ),

    path(
        "<int:job_id>/interview-prep/",
        InterviewPreparationView.as_view(),
        name="interview-preparation",
    ),

    path(
        "<int:job_id>/interview-prep-result/",
        InterviewPreparationDetailView.as_view(),
        name="interview-preparation-detail",
    ),


    path(
    "<int:job_id>/mock-interview/start/",
    StartMockInterviewView.as_view(),
    ),

    path(
    "<int:session_id>/mock-interview/question/<int:question_id>/answer/",
    SubmitMockInterviewAnswerView.as_view(),
    ),

]