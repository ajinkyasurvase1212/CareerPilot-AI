import json

from django.conf import settings
from google import genai


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)

MODEL_NAME = "gemini-3.6-flash"


# ============================================================
# HELPER - PARSE GEMINI JSON
# ============================================================

def parse_json_response(response_text):
    """
    Convert Gemini response text into Python JSON.
    """

    try:
        return json.loads(response_text)

    except json.JSONDecodeError:
        return {
            "error": "Gemini returned an invalid JSON response."
        }


# ============================================================
# RESUME ANALYSIS
# ============================================================

def analyze_resume(resume_text):

    prompt = f"""
You are an expert AI career assistant.

Analyze the following resume carefully.

RESUME:
{resume_text}

Return ONLY valid JSON.

Do not use markdown.
Do not use ```json.
Do not add explanations outside the JSON.

Use exactly this structure:

{{
    "resume_score": 0,
    "professional_summary": "",
    "skills": [],
    "strengths": [],
    "skill_gaps": [],
    "improvements": [],
    "suitable_roles": []
}}

Rules:

1. resume_score must be an integer from 0 to 100.
2. professional_summary must be a concise professional summary.
3. skills must contain important technical and relevant soft skills found in the resume.
4. strengths must contain the strongest aspects of the candidate.
5. skill_gaps must contain realistic skills that would improve the candidate's employability.
6. improvements must contain practical resume or career improvements.
7. suitable_roles must contain suitable job roles based on the resume.
8. Do not invent experience, education, projects, or skills that are not supported by the resume.
"""

    try:

        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
        )

        response_text = interaction.output_text.strip()

        return parse_json_response(response_text)

    except Exception:
        return {
            "error": "Unable to analyze the resume using Gemini."
        }


# ============================================================
# JOB MATCHING
# ============================================================

def analyze_job_match(resume_text, job_description):

    prompt = f"""
You are an expert AI career assistant and job matching system.

Compare the candidate's resume with the provided job description.

CANDIDATE RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON.

Do not use markdown.
Do not use ```json.
Do not add explanations outside the JSON.

Use exactly this structure:

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "ats_keywords": [],
    "strengths": [],
    "recommendations": []
}}

Rules:

1. match_score must be an integer from 0 to 100.
2. matched_skills must contain skills that are present in both the resume and job requirements.
3. missing_skills must contain important job requirements that are missing or weak in the resume.
4. ats_keywords must contain important keywords from the job description that the candidate should consider including in their resume if they genuinely have those skills or experience.
5. strengths must explain why the candidate is a good fit.
6. recommendations must provide practical steps to improve the candidate's chances for this specific job.
7. Do not invent skills or experience.
8. Do not assume that a skill exists just because it is related to another skill.
9. Base the analysis only on the provided resume and job description.
"""

    try:

        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
        )

        response_text = interaction.output_text.strip()

        return parse_json_response(response_text)

    except Exception:
        return {
            "error": "Unable to analyze the job match using Gemini."
        }


# ============================================================
# INTERVIEW PREPARATION
# ============================================================

def generate_interview_preparation(
    resume_text,
    job_description
):

    prompt = f"""
You are an expert technical interviewer and career coach.

Create a personalized interview preparation plan for the candidate.

Use BOTH the candidate's resume and the job description.

CANDIDATE RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON.

Do not use markdown.
Do not use ```json.
Do not add explanations outside the JSON.

Use exactly this structure:

{{
    "technical_questions": [],
    "resume_questions": [],
    "behavioral_questions": [],
    "topics_to_revise": [],
    "interview_tips": []
}}

Rules:

1. Generate 8 to 10 technical interview questions.
2. Generate 5 to 7 questions specifically based on the candidate's resume, projects, skills, or education.
3. Generate 5 behavioral interview questions relevant to the job.
4. Include important technical topics the candidate should revise before the interview.
5. Give practical interview tips specifically relevant to this candidate and job.
6. Questions should match the seniority level indicated by the resume.
7. Do not invent projects, skills, experience, or education.
8. Focus on the actual technologies mentioned in the resume and job description.
9. Avoid generic questions when a personalized question can be generated.
"""

    try:

        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
        )

        response_text = interaction.output_text.strip()

        return parse_json_response(response_text)

    except Exception:
        return {
            "error": "Unable to generate interview preparation using Gemini."
        }


# ============================================================
# MOCK INTERVIEW - GENERATE QUESTIONS
# ============================================================

def generate_mock_interview_questions(
    resume_text,
    job_description
):

    prompt = f"""
You are an expert technical interviewer conducting a mock interview.

Create a realistic interview question set based strictly on the candidate's
resume and the target job description.

CANDIDATE RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Generate exactly 5 questions.

Question distribution:

- 3 technical questions
- 1 resume/project-specific question
- 1 behavioral question

For each question return:

- question_number
- question
- category

Categories must be one of:

technical
resume
behavioral

Important rules:

1. Questions must be relevant to the job.
2. Use technologies and skills actually mentioned in the resume or job description.
3. Do not invent candidate experience.
4. Make questions suitable for a fresher/intermediate software developer.
5. Do not include answers.
6. Return ONLY valid JSON.
7. Do not use Markdown or code fences.
8. Generate exactly 5 questions.
9. question_number must be from 1 to 5.

Return exactly this format:

[
    {{
        "question_number": 1,
        "question": "Question text",
        "category": "technical"
    }},
    {{
        "question_number": 2,
        "question": "Question text",
        "category": "technical"
    }},
    {{
        "question_number": 3,
        "question": "Question text",
        "category": "technical"
    }},
    {{
        "question_number": 4,
        "question": "Question text",
        "category": "resume"
    }},
    {{
        "question_number": 5,
        "question": "Question text",
        "category": "behavioral"
    }}
]
"""

    try:

        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
        )

        response_text = interaction.output_text.strip()

        questions = json.loads(response_text)

        if not isinstance(questions, list):
            return {
                "error": "Gemini returned an invalid question format."
            }

        if len(questions) != 5:
            return {
                "error": "Gemini did not return exactly 5 questions."
            }

        return questions

    except json.JSONDecodeError:
        return {
            "error": "Gemini returned invalid JSON."
        }

    except Exception:
        return {
            "error": "Unable to generate mock interview questions."
        }


# ============================================================
# MOCK INTERVIEW - EVALUATE ANSWER
# ============================================================

def evaluate_mock_interview_answer(
    resume_text,
    job_description,
    question,
    user_answer
):

    prompt = f"""
You are an expert technical interviewer and professional career coach.

Evaluate the candidate's answer to an interview question.

Use the candidate's resume and target job description as context.

CANDIDATE RESUME:
{resume_text}

TARGET JOB DESCRIPTION:
{job_description}

INTERVIEW QUESTION:
{question}

CANDIDATE'S ANSWER:
{user_answer}

Evaluate the answer fairly for a fresher/intermediate software developer.

Return ONLY valid JSON.

Do not use markdown.
Do not use ```json.
Do not add explanations outside the JSON.

Use exactly this structure:

{{
    "score": 0,
    "communication_score": 0,
    "technical_score": 0,
    "relevance_score": 0,
    "feedback": "",
    "better_answer": ""
}}

Rules:

1. All scores must be integers from 0 to 100.
2. score is the overall quality of the answer.
3. communication_score evaluates clarity, structure, and ability to explain the answer.
4. technical_score evaluates technical correctness when the question is technical.
5. relevance_score evaluates how directly the answer addresses the question.
6. For behavioral or non-technical questions, evaluate technical_score fairly based on the answer and context.
7. feedback must clearly explain what the candidate did well and what should be improved.
8. better_answer must provide an example of a stronger answer.
9. Do not invent experience, projects, skills, or achievements for the candidate.
10. If the candidate does not know the answer, evaluate the response honestly.
11. Keep the feedback practical and useful for interview preparation.
12. Return ONLY valid JSON.
"""

    try:

        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
        )

        response_text = interaction.output_text.strip()

        result = json.loads(response_text)

        if not isinstance(result, dict):
            return {
                "error": "Gemini returned an invalid evaluation format."
            }

        return result

    except json.JSONDecodeError:
        return {
            "error": "Gemini returned invalid JSON."
        }

    except Exception:
        return {
            "error": "Unable to evaluate the interview answer."
        }