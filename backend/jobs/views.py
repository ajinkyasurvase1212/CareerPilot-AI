from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.gemini_service import (
    analyze_job_match,
    generate_interview_preparation,
    generate_mock_interview_questions,
    evaluate_mock_interview_answer,
)

from resumes.models import Resume

from .models import (
    JobDescription,
    JobMatch,
    InterviewPreparation,
    InterviewSession,
    InterviewQuestion,
)

from .serializers import (
    JobDescriptionSerializer,
    JobMatchSerializer,
    InterviewPreparationSerializer,
)


# ============================================================
# CREATE JOB DESCRIPTION
# ============================================================

class JobDescriptionCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        resume_id = request.data.get("resume")

        if not resume_id:

            return Response(
                {
                    "error": "Resume ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            resume = Resume.objects.get(
                id=resume_id,
                user=request.user,
            )

        except Resume.DoesNotExist:

            return Response(
                {
                    "error": "Resume not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = JobDescriptionSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        job = serializer.save(
            user=request.user,
            resume=resume,
        )

        return Response(
            {
                "message": "Job description saved successfully",
                "job": JobDescriptionSerializer(job).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# AI JOB MATCHING
# ============================================================

class JobMatchView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):

        try:

            job = JobDescription.objects.get(
                id=job_id,
                user=request.user,
            )

        except JobDescription.DoesNotExist:

            return Response(
                {
                    "error": "Job description not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        resume = job.resume

        if not resume.extracted_text:

            return Response(
                {
                    "error": (
                        "No extracted text found "
                        "for this resume."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            analysis = analyze_job_match(
                resume.extracted_text,
                job.description,
            )

            if "error" in analysis:

                return Response(
                    {
                        "error": (
                            "Unable to analyze the "
                            "job match using AI."
                        )
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            job_match, created = (
                JobMatch.objects.update_or_create(
                    job=job,
                    defaults={
                        "match_score": analysis.get(
                            "match_score",
                            0,
                        ),
                        "matched_skills": analysis.get(
                            "matched_skills",
                            [],
                        ),
                        "missing_skills": analysis.get(
                            "missing_skills",
                            [],
                        ),
                        "ats_keywords": analysis.get(
                            "ats_keywords",
                            [],
                        ),
                        "strengths": analysis.get(
                            "strengths",
                            [],
                        ),
                        "recommendations": analysis.get(
                            "recommendations",
                            [],
                        ),
                    },
                )
            )

            return Response(
                {
                    "message": (
                        "Job match analyzed successfully"
                    ),
                    "match": JobMatchSerializer(
                        job_match
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception:

            return Response(
                {
                    "error": (
                        "Job matching AI is temporarily "
                        "unavailable. Please try again."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )


# ============================================================
# AI INTERVIEW PREPARATION
# ============================================================

class InterviewPreparationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):

        try:

            job = JobDescription.objects.get(
                id=job_id,
                user=request.user,
            )

        except JobDescription.DoesNotExist:

            return Response(
                {
                    "error": "Job description not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        resume = job.resume

        if not resume.extracted_text:

            return Response(
                {
                    "error": (
                        "No extracted text found "
                        "for this resume."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            preparation = generate_interview_preparation(
                resume.extracted_text,
                job.description,
            )

            if "error" in preparation:

                return Response(
                    {
                        "error": (
                            "Unable to generate interview "
                            "preparation using AI."
                        )
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            interview_preparation, created = (
                InterviewPreparation.objects.update_or_create(
                    job=job,
                    defaults={
                        "technical_questions": preparation.get(
                            "technical_questions",
                            [],
                        ),
                        "resume_questions": preparation.get(
                            "resume_questions",
                            [],
                        ),
                        "behavioral_questions": preparation.get(
                            "behavioral_questions",
                            [],
                        ),
                        "topics_to_revise": preparation.get(
                            "topics_to_revise",
                            [],
                        ),
                        "interview_tips": preparation.get(
                            "interview_tips",
                            [],
                        ),
                    },
                )
            )

            return Response(
                {
                    "message": (
                        "Interview preparation "
                        "generated successfully"
                    ),
                    "preparation": InterviewPreparationSerializer(
                        interview_preparation
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception:

            return Response(
                {
                    "error": (
                        "Interview preparation AI is "
                        "temporarily unavailable. "
                        "Please try again."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )


# ============================================================
# JOB LIST
# ============================================================

class JobListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        jobs = JobDescription.objects.filter(
            user=request.user
        ).order_by("-created_at")

        serializer = JobDescriptionSerializer(
            jobs,
            many=True,
        )

        return Response(
            {
                "jobs": serializer.data
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# JOB MATCH DETAIL
# ============================================================

class JobMatchDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):

        try:

            job = JobDescription.objects.get(
                id=job_id,
                user=request.user,
            )

        except JobDescription.DoesNotExist:

            return Response(
                {
                    "error": "Job description not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:

            job_match = JobMatch.objects.get(
                job=job
            )

        except JobMatch.DoesNotExist:

            return Response(
                {
                    "error": (
                        "Job has not been analyzed yet."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = JobMatchSerializer(
            job_match
        )

        return Response(
            {
                "match": serializer.data
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# INTERVIEW PREPARATION DETAIL
# ============================================================

class InterviewPreparationDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):

        try:

            job = JobDescription.objects.get(
                id=job_id,
                user=request.user,
            )

        except JobDescription.DoesNotExist:

            return Response(
                {
                    "error": "Job description not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:

            preparation = InterviewPreparation.objects.get(
                job=job
            )

        except InterviewPreparation.DoesNotExist:

            return Response(
                {
                    "error": (
                        "Interview preparation has "
                        "not been generated yet."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InterviewPreparationSerializer(
            preparation
        )

        return Response(
            {
                "preparation": serializer.data
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# START MOCK INTERVIEW
# ============================================================

class StartMockInterviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):

        # ------------------------------------------
        # GET JOB
        # ------------------------------------------

        try:

            job = JobDescription.objects.get(
                id=job_id,
                user=request.user,
            )

        except JobDescription.DoesNotExist:

            return Response(
                {
                    "error": "Job not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ------------------------------------------
        # GET RESUME
        # ------------------------------------------

        resume = job.resume

        if not resume.extracted_text:

            return Response(
                {
                    "error": "Resume text is not available."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------
        # GENERATE QUESTIONS
        # ------------------------------------------

        try:

            questions = generate_mock_interview_questions(
                resume.extracted_text,
                job.description,
            )

        except Exception:

            return Response(
                {
                    "error": (
                        "Unable to generate mock "
                        "interview questions."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ------------------------------------------
        # CHECK GEMINI RESPONSE
        # ------------------------------------------

        if isinstance(questions, dict) and "error" in questions:

            return Response(
                {
                    "error": (
                        "Unable to generate mock "
                        "interview questions."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not isinstance(questions, list) or not questions:

            return Response(
                {
                    "error": (
                        "Unable to generate interview "
                        "questions."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ------------------------------------------
        # CREATE INTERVIEW SESSION
        # ------------------------------------------

        try:

            session = InterviewSession.objects.create(
                job=job,
                user=request.user,
                status="in_progress",
                total_questions=len(questions),
                current_question=1,
            )

            # ------------------------------------------
            # SAVE QUESTIONS
            # ------------------------------------------

            for index, item in enumerate(
                questions,
                start=1,
            ):

                if not isinstance(item, dict):
                    continue

                question_text = item.get(
                    "question",
                    "",
                ).strip()

                if not question_text:
                    continue

                InterviewQuestion.objects.create(
                    session=session,
                    question_number=item.get(
                        "question_number",
                        index,
                    ),
                    question=question_text,
                    category=item.get(
                        "category",
                        "technical",
                    ),
                )

            saved_questions = session.questions.all()

            if not saved_questions.exists():

                session.delete()

                return Response(
                    {
                        "error": (
                            "Unable to create "
                            "interview questions."
                        )
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": (
                        "Mock interview started "
                        "successfully."
                    ),
                    "session": {
                        "id": session.id,
                        "job": job.id,
                        "status": session.status,
                        "total_questions": (
                            session.total_questions
                        ),
                        "current_question": (
                            session.current_question
                        ),
                    },
                    "questions": [
                        {
                            "id": question.id,
                            "question_number": (
                                question.question_number
                            ),
                            "question": question.question,
                            "category": question.category,
                        }
                        for question in saved_questions
                    ],
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception:

            return Response(
                {
                    "error": (
                        "Unable to start the mock "
                        "interview. Please try again."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============================================================
# SUBMIT MOCK INTERVIEW ANSWER
# ============================================================

class SubmitMockInterviewAnswerView(APIView):

    permission_classes = [IsAuthenticated]

    def post(
        self,
        request,
        session_id,
        question_id,
    ):

        # ------------------------------------------
        # GET SESSION
        # ------------------------------------------

        try:

            session = InterviewSession.objects.get(
                id=session_id,
                user=request.user,
            )

        except InterviewSession.DoesNotExist:

            return Response(
                {
                    "error": "Interview session not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ------------------------------------------
        # GET QUESTION
        # ------------------------------------------

        try:

            question = InterviewQuestion.objects.get(
                id=question_id,
                session=session,
            )

        except InterviewQuestion.DoesNotExist:

            return Response(
                {
                    "error": "Interview question not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ------------------------------------------
        # CHECK ANSWER
        # ------------------------------------------

        user_answer = request.data.get(
            "answer",
            "",
        )

        if not isinstance(user_answer, str):

            return Response(
                {
                    "error": "Answer must be text."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_answer = user_answer.strip()

        if not user_answer:

            return Response(
                {
                    "error": "Please provide an answer."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------
        # GET JOB + RESUME
        # ------------------------------------------

        job = session.job
        resume = job.resume

        if not resume.extracted_text:

            return Response(
                {
                    "error": "Resume text is not available."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------
        # EVALUATE ANSWER
        # ------------------------------------------

        try:

            evaluation = evaluate_mock_interview_answer(
                resume.extracted_text,
                job.description,
                question.question,
                user_answer,
            )

        except Exception:

            return Response(
                {
                    "error": (
                        "Unable to evaluate the answer "
                        "using AI. Please try again."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if (
            isinstance(evaluation, dict)
            and "error" in evaluation
        ):

            return Response(
                {
                    "error": (
                        "Unable to evaluate the answer "
                        "using AI. Please try again."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ------------------------------------------
        # SAVE ANSWER
        # ------------------------------------------

        question.user_answer = user_answer

        question.score = int(
            evaluation.get(
                "score",
                0,
            )
        )

        question.feedback = evaluation.get(
            "feedback",
            "",
        )

        question.better_answer = evaluation.get(
            "better_answer",
            "",
        )

        question.save(
            update_fields=[
                "user_answer",
                "score",
                "feedback",
                "better_answer",
            ]
        )

        # ------------------------------------------
        # UPDATE SESSION SCORES
        # ------------------------------------------

        session.current_question = (
            question.question_number + 1
        )

        session.communication_score = int(
            evaluation.get(
                "communication_score",
                0,
            )
        )

        session.technical_score = int(
            evaluation.get(
                "technical_score",
                0,
            )
        )

        session.relevance_score = int(
            evaluation.get(
                "relevance_score",
                0,
            )
        )

        # ------------------------------------------
        # CHECK COMPLETION
        # ------------------------------------------

        if (
            question.question_number
            >= session.total_questions
        ):

            session.status = "completed"

            answered_questions = (
                session.questions
                .exclude(user_answer="")
            )

            scores = [
                q.score
                for q in answered_questions
            ]

            if scores:

                session.final_score = round(
                    sum(scores) / len(scores)
                )

        session.save()

        # ------------------------------------------
        # FIND NEXT QUESTION
        # ------------------------------------------

        next_question = (
            session.questions
            .filter(
                question_number=(
                    question.question_number + 1
                )
            )
            .first()
        )

        # ------------------------------------------
        # RESPONSE
        # ------------------------------------------

        return Response(
            {
                "message": (
                    "Answer evaluated successfully."
                ),

                "evaluation": {
                    "score": evaluation.get(
                        "score",
                        0,
                    ),
                    "communication_score": evaluation.get(
                        "communication_score",
                        0,
                    ),
                    "technical_score": evaluation.get(
                        "technical_score",
                        0,
                    ),
                    "relevance_score": evaluation.get(
                        "relevance_score",
                        0,
                    ),
                    "feedback": evaluation.get(
                        "feedback",
                        "",
                    ),
                    "better_answer": evaluation.get(
                        "better_answer",
                        "",
                    ),
                },

                "question": {
                    "id": question.id,
                    "question_number": (
                        question.question_number
                    ),
                },

                "next_question": (
                    {
                        "id": next_question.id,
                        "question_number": (
                            next_question.question_number
                        ),
                        "question": next_question.question,
                        "category": next_question.category,
                    }
                    if next_question
                    else None
                ),

                "session": {
                    "id": session.id,
                    "status": session.status,
                    "current_question": (
                        session.current_question
                    ),
                    "total_questions": (
                        session.total_questions
                    ),
                    "final_score": (
                        session.final_score
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )