import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function JobMatching() {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState("");

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [description, setDescription] = useState("");

    const [jobId, setJobId] = useState(null);
    const [matchResult, setMatchResult] = useState(null);

    const [loading, setLoading] = useState(false);
    const [matching, setMatching] = useState(false);

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const resultRef = useRef(null);

    // ==========================================
    // LOAD USER RESUMES
    // ==========================================

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const response = await api.get("/resumes/");

            let resumeData = [];

            if (Array.isArray(response.data)) {
                resumeData = response.data;
            } else if (Array.isArray(response.data.resumes)) {
                resumeData = response.data.resumes;
            } else if (Array.isArray(response.data.results)) {
                resumeData = response.data.results;
            }

            setResumes(resumeData);
        } catch (error) {
            setResumes([]);

            if (error.response?.status === 401) {
                setMessage(
                    "Your login session has expired. Please login again."
                );
            } else {
                setMessage("Unable to load your resumes.");
            }

            setSuccess(false);
        }
    };

    // ==========================================
    // CREATE JOB
    // ==========================================

    const handleCreateJob = async () => {
        if (!selectedResume) {
            setMessage("Please select a resume.");
            setSuccess(false);
            return;
        }

        if (!title.trim()) {
            setMessage("Please enter the job title.");
            setSuccess(false);
            return;
        }

        if (!description.trim()) {
            setMessage("Please enter the job description.");
            setSuccess(false);
            return;
        }

        setLoading(true);
        setMessage("");
        setSuccess(false);
        setMatchResult(null);

        try {
            const response = await api.post(
                "/jobs/create/",
                {
                    title: title.trim(),
                    company: company.trim(),
                    description: description.trim(),
                    resume: Number(selectedResume),
                }
            );

            let createdJobId = null;

            if (response.data?.id) {
                createdJobId = response.data.id;
            } else if (response.data?.job?.id) {
                createdJobId = response.data.job.id;
            } else if (response.data?.job_id) {
                createdJobId = response.data.job_id;
            } else if (response.data?.job?.job_id) {
                createdJobId = response.data.job.job_id;
            }

            if (!createdJobId) {
                setSuccess(false);
                setMessage(
                    "Job was created, but the Job ID was not returned by the server."
                );
                return;
            }

            createdJobId = Number(createdJobId);

            setJobId(createdJobId);
            setSuccess(true);

            setMessage(
                `Job description added successfully. Job ID: ${createdJobId}. You can now analyze the match.`
            );
        } catch (error) {
            setSuccess(false);

            if (error.response) {
                if (error.response.status === 401) {
                    setMessage(
                        "Your login session has expired. Please login again."
                    );
                } else {
                    setMessage(
                        error.response.data?.detail ||
                        "Unable to create job."
                    );
                }
            } else {
                setMessage("Unable to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // ANALYZE JOB MATCH
    // ==========================================

    const handleAnalyzeMatch = async () => {
        if (!jobId) {
            setMessage(
                "Please create the job description first."
            );
            setSuccess(false);
            return;
        }

        setMatching(true);
        setMessage("");
        setSuccess(false);

        try {
            const response = await api.post(
                `/jobs/${jobId}/match/`
            );

            let result = null;

            if (response.data?.match) {
                result = response.data.match;
            } else if (response.data?.result) {
                result = response.data.result;
            } else if (response.data?.job_match) {
                result = response.data.job_match;
            } else {
                result = response.data;
            }

            if (!result) {
                setMessage(
                    "AI analysis completed but no match result was returned."
                );
                setSuccess(false);
                return;
            }

            setMatchResult(result);
            setSuccess(true);

            setMessage(
                "AI job compatibility analysis completed successfully!"
            );

            setTimeout(() => {
                if (resultRef.current) {
                    resultRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 200);
        } catch (error) {
            setSuccess(false);

            if (error.response) {
                if (error.response.status === 401) {
                    setMessage(
                        "Your login session has expired. Please login again."
                    );
                } else {
                    setMessage(
                        error.response.data?.detail ||
                        "AI job matching failed."
                    );
                }
            } else {
                setMessage("Unable to connect to the server.");
            }
        } finally {
            setMatching(false);
        }
    };

    // ==========================================
    // SCORE LABEL
    // ==========================================

    const getScoreLabel = (score) => {
        const numericScore = Number(score) || 0;

        if (numericScore >= 80) {
            return "Excellent Match";
        }

        if (numericScore >= 60) {
            return "Good Match";
        }

        if (numericScore >= 40) {
            return "Moderate Match";
        }

        return "Low Match";
    };

    // ==========================================
    // SCORE MESSAGE
    // ==========================================

    const getScoreMessage = (score) => {
        const numericScore = Number(score) || 0;

        if (numericScore >= 80) {
            return "Your profile aligns strongly with this job.";
        }

        if (numericScore >= 60) {
            return "You have a good foundation for this role.";
        }

        if (numericScore >= 40) {
            return "You partially match this role. Some improvements are recommended.";
        }

        return "There are significant skill gaps for this role.";
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN AREA */}
            <div className="lg:ml-64">

                <Navbar />

                <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

                    {/* ======================================
                        PAGE HEADER
                    ====================================== */}

                    <div className="mb-5 sm:mb-6">

                        <p className="text-xs sm:text-sm font-semibold text-indigo-600 tracking-wide mb-1.5">
                            AI CAREER INTELLIGENCE
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Job Matching
                        </h1>

                        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-5">
                            Compare your resume against a job description
                            and discover how well your profile matches the
                            role using Gemini AI.
                        </p>

                    </div>

                    {/* ======================================
                        JOB INPUT CARD
                    ====================================== */}

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">

                        {/* CARD HEADER */}

                        <div className="flex items-center gap-2.5 mb-5">

                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base">
                                🎯
                            </div>

                            <div>

                                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                    Analyze Job Compatibility
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                    Add a job description and select your resume.
                                </p>

                            </div>

                        </div>

                        {/* ==================================
                            RESUME SELECT
                        ================================== */}

                        <div className="mb-5">

                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                                Select Resume *
                            </label>

                            <select
                                value={selectedResume}
                                onChange={(e) =>
                                    setSelectedResume(e.target.value)
                                }
                                className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm text-slate-700"
                            >

                                <option value="">
                                    Select a resume
                                </option>

                                {Array.isArray(resumes) &&
                                    resumes.map((resume) => (
                                        <option
                                            key={resume.id}
                                            value={resume.id}
                                        >
                                            {resume.file_name ||
                                                resume.name ||
                                                resume.file?.split("/").pop() ||
                                                `Resume #${resume.id}`}
                                        </option>
                                    ))
                                }

                            </select>

                            {resumes.length === 0 && (
                                <p className="text-xs text-orange-500 mt-2">
                                    No resumes found. Upload a resume from
                                    the Resume Analysis page first.
                                </p>
                            )}

                        </div>

                        {/* ==================================
                            JOB TITLE + COMPANY
                        ================================== */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                            <div>

                                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                                    Job Title *
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    placeholder="e.g. Python Developer"
                                    className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />

                            </div>

                            <div>

                                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                                    Company
                                </label>

                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) =>
                                        setCompany(e.target.value)
                                    }
                                    placeholder="e.g. TCS"
                                    className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />

                            </div>

                        </div>

                        {/* ==================================
                            JOB DESCRIPTION
                        ================================== */}

                        <div className="mb-5">

                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                                Job Description *
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                rows="8"
                                placeholder="Paste the complete job description here..."
                                className="w-full px-3 sm:px-4 py-3 border border-slate-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1.5">

                                <p className="text-xs text-slate-400">
                                    Include responsibilities, required skills,
                                    qualifications and technologies.
                                </p>

                                <p className="text-xs text-slate-400 sm:whitespace-nowrap">
                                    {description.length} characters
                                </p>

                            </div>

                        </div>

                        {/* ==================================
                            CREATE JOB BUTTON
                        ================================== */}

                        {!jobId && (

                            <button
                                onClick={handleCreateJob}
                                disabled={loading}
                                className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {loading
                                    ? "Saving Job..."
                                    : "Continue to AI Matching →"
                                }
                            </button>

                        )}

                        {/* ==================================
                            ANALYZE BUTTON
                        ================================== */}

                        {jobId && (

                            <div className="flex flex-col sm:flex-row gap-3">

                                <button
                                    onClick={handleAnalyzeMatch}
                                    disabled={matching}
                                    className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {matching
                                        ? "Gemini AI is analyzing..."
                                        : "✦ Analyze Job Match"
                                    }
                                </button>

                                <button
                                    onClick={() => {
                                        setJobId(null);
                                        setMatchResult(null);
                                        setMessage("");
                                        setSuccess(false);
                                    }}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                                >
                                    Edit Job
                                </button>

                            </div>

                        )}

                        {/* ==================================
                            MESSAGE
                        ================================== */}

                        {message && (

                            <div
                                className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                    success
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                }`}
                            >
                                {message}
                            </div>

                        )}

                    </div>

                    {/* ======================================
                        MATCH RESULTS
                    ====================================== */}

                    {matchResult && (

                        <div
                            ref={resultRef}
                            className="mt-6 space-y-5 scroll-mt-24"
                        >

                            {/* ==================================
                                MATCH SCORE
                            ================================== */}

                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg">

                                <div className="flex flex-col lg:flex-row items-center justify-between gap-5">

                                    {/* LEFT */}

                                    <div className="flex-1 w-full">

                                        <div className="flex items-center gap-2 mb-2">

                                            <span className="text-indigo-400 text-base">
                                                ✦
                                            </span>

                                            <span className="text-xs sm:text-sm font-semibold text-indigo-300 tracking-wide">
                                                GEMINI JOB COMPATIBILITY
                                            </span>

                                        </div>

                                        <h2 className="text-2xl sm:text-3xl font-bold">
                                            Your Job Match
                                        </h2>

                                        <p className="text-sm text-slate-300 mt-2 max-w-xl">
                                            AI-powered comparison between your
                                            resume and this job description.
                                        </p>

                                        <p className="text-xs sm:text-sm text-slate-400 mt-2">
                                            {getScoreMessage(
                                                matchResult.match_score
                                            )}
                                        </p>

                                        <div className="mt-4">

                                            <span className="inline-flex px-3 py-1.5 bg-white/10 rounded-lg text-xs sm:text-sm font-semibold">
                                                {getScoreLabel(
                                                    matchResult.match_score
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    {/* SCORE CIRCLE */}

                                    <div className="flex flex-col items-center">

                                        <div
                                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center"
                                            style={{
                                                background: `conic-gradient(
                                                    rgb(99 102 241) ${(Number(matchResult.match_score) || 0) * 3.6}deg,
                                                    rgba(255,255,255,0.08) 0deg
                                                )`,
                                            }}
                                        >

                                            <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-slate-950 flex flex-col items-center justify-center">

                                                <span className="text-2xl sm:text-3xl font-bold">
                                                    {matchResult.match_score}%
                                                </span>

                                                <span className="text-[10px] sm:text-xs text-slate-400">
                                                    MATCH SCORE
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* ==================================
                                QUICK ACTIONS
                            ================================== */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                <Link
                                    to="/my-jobs"
                                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition"
                                >

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
                                            💼
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <h3 className="text-sm font-bold text-slate-900">
                                                View My Jobs
                                            </h3>

                                            <p className="text-xs text-slate-400 mt-1">
                                                View your saved jobs and AI match results.
                                            </p>

                                        </div>

                                        <span className="text-indigo-600 font-bold">
                                            →
                                        </span>

                                    </div>

                                </Link>

                                <Link
                                    to={`/interview?job=${jobId}`}
                                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition"
                                >

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-base">
                                            🎤
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <h3 className="text-sm font-bold text-slate-900">
                                                Prepare for Interview
                                            </h3>

                                            <p className="text-xs text-slate-400 mt-1">
                                                Generate personalized interview preparation for this job.
                                            </p>

                                        </div>

                                        <span className="text-purple-600 font-bold">
                                            →
                                        </span>

                                    </div>

                                </Link>

                            </div>

                            {/* ==================================
                                MATCHED + MISSING SKILLS
                            ================================== */}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                                {/* MATCHED SKILLS */}

                                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                    <div className="flex items-center justify-between mb-5">

                                        <div className="flex items-center gap-2.5">

                                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-base">
                                                ✓
                                            </div>

                                            <div>

                                                <h3 className="text-base font-bold text-slate-900">
                                                    Matched Skills
                                                </h3>

                                                <p className="text-xs text-slate-400">
                                                    Skills that align with the job
                                                </p>

                                            </div>

                                        </div>

                                        <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold">
                                            {matchResult.matched_skills?.length || 0}
                                        </span>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        {matchResult.matched_skills?.length > 0 ? (

                                            matchResult.matched_skills.map(
                                                (skill, index) => (

                                                    <span
                                                        key={index}
                                                        className="px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs sm:text-sm font-medium"
                                                    >
                                                        ✓ {skill}
                                                    </span>

                                                )
                                            )

                                        ) : (

                                            <p className="text-sm text-slate-400">
                                                No matching skills detected.
                                            </p>

                                        )}

                                    </div>

                                </div>

                                {/* MISSING SKILLS */}

                                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                    <div className="flex items-center justify-between mb-5">

                                        <div className="flex items-center gap-2.5">

                                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-base">
                                                !
                                            </div>

                                            <div>

                                                <h3 className="text-base font-bold text-slate-900">
                                                    Missing Skills
                                                </h3>

                                                <p className="text-xs text-slate-400">
                                                    Skills you may need to develop
                                                </p>

                                            </div>

                                        </div>

                                        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">
                                            {matchResult.missing_skills?.length || 0}
                                        </span>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        {matchResult.missing_skills?.length > 0 ? (

                                            matchResult.missing_skills.map(
                                                (skill, index) => (

                                                    <span
                                                        key={index}
                                                        className="px-2.5 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs sm:text-sm font-medium"
                                                    >
                                                        + {skill}
                                                    </span>

                                                )
                                            )

                                        ) : (

                                            <p className="text-sm text-green-600 font-medium">
                                                Great! No major skill gaps detected.
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* ==================================
                                ATS KEYWORDS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-base">
                                        🔑
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            ATS Keywords
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Important keywords detected from the job description
                                        </p>

                                    </div>

                                </div>

                                <div className="flex flex-wrap gap-2">

                                    {matchResult.ats_keywords?.length > 0 ? (

                                        matchResult.ats_keywords.map(
                                            (keyword, index) => (

                                                <span
                                                    key={index}
                                                    className="px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs sm:text-sm font-medium"
                                                >
                                                    #{keyword}
                                                </span>

                                            )
                                        )

                                    ) : (

                                        <p className="text-sm text-slate-400">
                                            No ATS keywords detected.
                                        </p>

                                    )}

                                </div>

                            </div>

                            {/* ==================================
                                STRENGTHS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base">
                                        💪
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Why You're a Good Fit
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            AI identified strengths relevant to this role
                                        </p>

                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                    {matchResult.strengths?.map(
                                        (strength, index) => (

                                            <div
                                                key={index}
                                                className="flex gap-3 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg"
                                            >

                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    ✓
                                                </div>

                                                <p className="text-sm text-slate-600 leading-5">
                                                    {strength}
                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                            {/* ==================================
                                RECOMMENDATIONS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base">
                                        🚀
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            AI Recommendations
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            What you should do to improve your chances
                                        </p>

                                    </div>

                                </div>

                                <div className="space-y-3">

                                    {matchResult.recommendations?.map(
                                        (recommendation, index) => (

                                            <div
                                                key={index}
                                                className="flex gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-indigo-200 transition"
                                            >

                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>

                                                <p className="text-sm text-slate-600 leading-5">
                                                    {recommendation}
                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    )}

                </main>

            </div>

        </div>
    );
}

export default JobMatching;