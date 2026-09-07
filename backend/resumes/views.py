from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

import pymupdf

from ai.gemini_service import analyze_resume

from .models import Resume, ResumeAnalysis
from .serializers import ResumeSerializer, ResumeAnalysisSerializer


# ============================================================
# RESUME UPLOAD
# ============================================================

class ResumeUploadView(APIView):

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):

        serializer = ResumeSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        resume = serializer.save(
            user=request.user
        )

        try:

            document = pymupdf.open(
                resume.file.path
            )

            extracted_text = ""

            for page in document:
                extracted_text += page.get_text()

            document.close()

            # Make sure the PDF actually contains text
            if not extracted_text.strip():

                resume.delete()

                return Response(
                    {
                        "error": (
                            "Could not extract readable text "
                            "from this resume."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            resume.extracted_text = extracted_text

            resume.save(
                update_fields=["extracted_text"]
            )

        except Exception:

            resume.delete()

            return Response(
                {
                    "error": (
                        "Could not process the uploaded "
                        "resume. Please upload a valid PDF."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": (
                    "Resume uploaded and text "
                    "extracted successfully"
                ),
                "resume": ResumeSerializer(
                    resume
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# RESUME ANALYSIS
# ============================================================

class ResumeAnalysisView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, resume_id):

        try:

            resume = Resume.objects.get(
                id=resume_id,
                user=request.user
            )

        except Resume.DoesNotExist:

            return Response(
                {
                    "error": "Resume not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

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

            # Send resume text to Gemini
            analysis = analyze_resume(
                resume.extracted_text
            )

            # Gemini returned an error
            if "error" in analysis:

                return Response(
                    {
                        "error": (
                            "Unable to analyze the "
                            "resume using AI."
                        )
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            # Save or update AI analysis
            resume_analysis, created = (
                ResumeAnalysis.objects.update_or_create(
                    resume=resume,
                    defaults={
                        "resume_score": analysis.get(
                            "resume_score",
                            0
                        ),
                        "professional_summary": analysis.get(
                            "professional_summary",
                            ""
                        ),
                        "skills": analysis.get(
                            "skills",
                            []
                        ),
                        "strengths": analysis.get(
                            "strengths",
                            []
                        ),
                        "skill_gaps": analysis.get(
                            "skill_gaps",
                            []
                        ),
                        "improvements": analysis.get(
                            "improvements",
                            []
                        ),
                        "suitable_roles": analysis.get(
                            "suitable_roles",
                            []
                        ),
                    },
                )
            )

            return Response(
                {
                    "message": (
                        "Resume analyzed successfully"
                    ),
                    "analysis": ResumeAnalysisSerializer(
                        resume_analysis
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception:

            return Response(
                {
                    "error": (
                        "AI analysis is temporarily "
                        "unavailable. Please try again."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )


# ============================================================
# RESUME LIST
# ============================================================

class ResumeListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        resumes = Resume.objects.filter(
            user=request.user
        ).order_by("-uploaded_at")

        serializer = ResumeSerializer(
            resumes,
            many=True
        )

        return Response(
            {
                "resumes": serializer.data
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# RESUME ANALYSIS DETAIL
# ============================================================

class ResumeAnalysisDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):

        try:

            resume = Resume.objects.get(
                id=resume_id,
                user=request.user
            )

        except Resume.DoesNotExist:

            return Response(
                {
                    "error": "Resume not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:

            analysis = ResumeAnalysis.objects.get(
                resume=resume
            )

        except ResumeAnalysis.DoesNotExist:

            return Response(
                {
                    "error": (
                        "Resume has not been "
                        "analyzed yet."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ResumeAnalysisSerializer(
            analysis
        )

        return Response(
            {
                "analysis": serializer.data
            },
            status=status.HTTP_200_OK,
        )