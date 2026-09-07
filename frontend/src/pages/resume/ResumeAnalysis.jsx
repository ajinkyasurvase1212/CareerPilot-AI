import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function ResumeAnalysis() {
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const [resumeId, setResumeId] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    // Resume History
    const [resumeHistory, setResumeHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [viewingResumeId, setViewingResumeId] = useState(null);


    // ==========================================
    // LOAD RESUME HISTORY
    // ==========================================

    const loadResumeHistory = async () => {
        try {
            setHistoryLoading(true);

            const response = await api.get("/resumes/");

            let resumes = [];

            if (Array.isArray(response.data)) {
                resumes = response.data;
            } else if (Array.isArray(response.data?.results)) {
                resumes = response.data.results;
            } else if (Array.isArray(response.data?.resumes)) {
                resumes = response.data.resumes;
            }

            const historyWithAnalysis = await Promise.all(
                resumes.map(async (resume) => {
                    try {
                        const analysisResponse = await api.get(
                            `/resumes/${resume.id}/analysis/`
                        );

                        const resumeAnalysis =
                            analysisResponse.data?.analysis ||
                            analysisResponse.data;

                        return {
                            ...resume,
                            analysis: resumeAnalysis,
                        };
                    } catch (error) {
                        return {
                            ...resume,
                            analysis: null,
                        };
                    }
                })
            );

            setResumeHistory(historyWithAnalysis);

        } catch (error) {
            console.error(
                "Resume history error:",
                error
            );

            setResumeHistory([]);

        } finally {
            setHistoryLoading(false);
        }
    };


    // ==========================================
    // LOAD HISTORY WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {
        loadResumeHistory();
    }, []);


    // ==========================================
    // SELECT RESUME
    // ==========================================

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            setMessage("Please select a PDF file.");
            setSuccess(false);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setMessage("");
        setSuccess(false);
        setAnalysis(null);
        setResumeId(null);
    };


    // ==========================================
    // UPLOAD RESUME
    // ==========================================

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage("Please select a resume first.");
            setSuccess(false);
            return;
        }

        const formData = new FormData();

        formData.append("file", selectedFile);

        setLoading(true);
        setMessage("");
        setSuccess(false);

        try {
            const response = await api.post(
                "/resumes/upload/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const uploadedResumeId =
                response.data.resume.id;

            setResumeId(uploadedResumeId);

            setSuccess(true);

            setMessage(
                `Resume uploaded successfully! Resume ID: ${uploadedResumeId}`
            );

            await loadResumeHistory();

        } catch (error) {
            console.error(
                "Upload error:",
                error
            );

            setSuccess(false);

            if (error.response) {

                if (error.response.status === 401) {
                    setMessage(
                        "Your login session has expired. Please login again."
                    );
                } else {
                    setMessage(
                        JSON.stringify(
                            error.response.data
                        )
                    );
                }

            } else {
                setMessage(
                    "Unable to connect to the server."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // ANALYZE RESUME WITH GEMINI
    // ==========================================

    const handleAnalyze = async () => {
        if (!resumeId) {
            setMessage(
                "Please upload a resume first."
            );

            setSuccess(false);

            return;
        }

        setAnalyzing(true);
        setMessage("");
        setSuccess(false);

        try {
            const response = await api.post(
                `/resumes/${resumeId}/analyze/`
            );

            setAnalysis(
                response.data.analysis
            );

            setSuccess(true);

            setMessage(
                "AI resume analysis completed successfully!"
            );

            await loadResumeHistory();

        } catch (error) {
            console.error(
                "Analysis error:",
                error
            );

            setSuccess(false);

            if (error.response) {

                if (error.response.status === 401) {
                    setMessage(
                        "Your login session has expired. Please login again."
                    );
                } else {
                    setMessage(
                        error.response.data?.detail ||
                        "AI resume analysis failed."
                    );
                }

            } else {
                setMessage(
                    "Unable to connect to the server."
                );
            }

        } finally {
            setAnalyzing(false);
        }
    };


    // ==========================================
    // VIEW PREVIOUS RESUME ANALYSIS
    // ==========================================

    const handleViewAnalysis = async (id) => {
        try {
            setViewingResumeId(id);
            setMessage("");

            const response = await api.get(
                `/resumes/${id}/analysis/`
            );

            const resumeAnalysis =
                response.data?.analysis ||
                response.data;

            if (!resumeAnalysis) {
                setSuccess(false);

                setMessage(
                    "This resume has not been analyzed yet."
                );

                return;
            }

            setResumeId(id);
            setAnalysis(resumeAnalysis);

            setSuccess(true);

            setMessage(
                "Previous resume analysis loaded successfully."
            );

            setTimeout(() => {
                const analysisSection =
                    document.getElementById(
                        "resume-analysis-results"
                    );

                if (analysisSection) {
                    analysisSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 100);

        } catch (error) {
            console.error(
                "View analysis error:",
                error
            );

            setSuccess(false);

            if (error.response?.status === 404) {
                setMessage(
                    "This resume has not been analyzed yet."
                );
            } else if (
                error.response?.status === 401
            ) {
                setMessage(
                    "Your login session has expired. Please login again."
                );
            } else {
                setMessage(
                    "Unable to load this resume analysis."
                );
            }

        } finally {
            setViewingResumeId(null);
        }
    };


    // ==========================================
    // GET RESUME FILE NAME
    // ==========================================

    const getResumeName = (resume) => {
        if (resume.file) {

            if (
                typeof resume.file === "string"
            ) {
                const parts =
                    resume.file.split("/");

                return parts[parts.length - 1];
            }

            if (resume.file.name) {
                return resume.file.name;
            }
        }

        if (resume.filename) {
            return resume.filename;
        }

        if (resume.name) {
            return resume.name;
        }

        return `Resume #${resume.id}`;
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Date unavailable";
        }

        try {
            return new Date(
                dateValue
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {
            return "Date unavailable";
        }
    };


    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <Sidebar />


            {/* ==========================================
                MAIN AREA
            ========================================== */}

            <div className="lg:ml-64">

                <Navbar />


                <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

                    {/* ======================================
                        PAGE HEADER
                    ====================================== */}

                    <div className="mb-6">

                        <p className="text-xs font-semibold text-blue-600 mb-1.5 tracking-wide">
                            AI RESUME INTELLIGENCE
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Resume Analysis
                        </h1>

                        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-6">
                            Upload your resume and let Gemini AI analyze
                            your skills, strengths, weaknesses and career
                            opportunities.
                        </p>

                    </div>


                    {/* ======================================
                        UPLOAD CARD
                    ====================================== */}

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">

                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-10 text-center hover:border-blue-400 transition">

                            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4">
                                📄
                            </div>

                            <h2 className="text-lg font-bold text-slate-800">
                                Upload your resume
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Select your latest resume in PDF format.
                            </p>


                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />


                            <label
                                htmlFor="resume-upload"
                                className="inline-block mt-5 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-slate-200 transition"
                            >
                                Choose Resume
                            </label>


                            {selectedFile && (

                                <div className="mt-5">

                                    <p className="text-xs font-medium text-slate-700">
                                        Selected file:
                                    </p>

                                    <p className="text-sm text-blue-600 mt-1 break-all">
                                        {selectedFile.name}
                                    </p>

                                </div>

                            )}


                            {selectedFile && (

                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="mt-5 block mx-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading
                                        ? "Uploading..."
                                        : "Upload Resume"
                                    }
                                </button>

                            )}


                            {resumeId && (

                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="mt-4 block mx-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {analyzing
                                        ? "AI is analyzing..."
                                        : "✦ Analyze with AI"
                                    }
                                </button>

                            )}


                            <p className="text-xs text-slate-400 mt-5">
                                Supported format: PDF
                            </p>


                            {message && (

                                <div
                                    className={`mt-5 p-3 rounded-xl text-xs sm:text-sm font-medium ${
                                        success
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {message}
                                </div>

                            )}

                        </div>

                    </div>


                    {/* ======================================
                        RESUME HISTORY
                    ====================================== */}

                    <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">

                        {/* Header */}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base">
                                    🗂️
                                </div>

                                <div>

                                    <h2 className="text-base font-bold text-slate-900">
                                        Resume History
                                    </h2>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Your previously uploaded resumes
                                    </p>

                                </div>

                            </div>


                            <div className="px-3 py-1.5 bg-slate-50 rounded-lg self-start sm:self-auto">

                                <span className="text-xl font-bold text-slate-700">
                                    {resumeHistory.length}
                                </span>

                                <span className="text-xs text-slate-500 ml-2 font-medium">
                                    Resumes
                                </span>

                            </div>

                        </div>


                        {/* Loading */}

                        {historyLoading && (

                            <div className="py-8 text-center">

                                <div className="w-7 h-7 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                                <p className="text-sm text-slate-500 mt-3">
                                    Loading resume history...
                                </p>

                            </div>

                        )}


                        {/* Empty State */}

                        {!historyLoading &&
                            resumeHistory.length === 0 && (

                                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">

                                    <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 flex items-center justify-center text-xl mb-3">
                                        📄
                                    </div>

                                    <h3 className="text-sm font-semibold text-slate-700">
                                        No resume history yet
                                    </h3>

                                    <p className="text-xs sm:text-sm text-slate-400 mt-2 px-4">
                                        Upload your first resume to start building your career profile.
                                    </p>

                                </div>

                            )}


                        {/* Resume List */}

                        {!historyLoading &&
                            resumeHistory.length > 0 && (

                                <div className="space-y-3">

                                    {resumeHistory.map(
                                        (resume, index) => {

                                            const resumeAnalysis =
                                                resume.analysis;

                                            const score =
                                                resumeAnalysis?.resume_score;

                                            const uploadedDate =
                                                resume.uploaded_at ||
                                                resume.created_at;

                                            const isCurrent =
                                                resume.id === resumeId;

                                            return (

                                                <div
                                                    key={resume.id}
                                                    className={`group border rounded-xl p-4 transition ${
                                                        isCurrent
                                                            ? "border-blue-200 bg-blue-50/40"
                                                            : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                                                    }`}
                                                >

                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                                        {/* Resume Information */}

                                                        <div className="flex items-center gap-3 min-w-0">

                                                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">

                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth="1.7"
                                                                    stroke="currentColor"
                                                                    className="w-4 h-4 text-blue-600"
                                                                >

                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M19.5 14.25v-8.25a2.25 2.25 0 0 0-2.25-2.25h-6.879a2.25 2.25 0 0 0-1.591.659l-3.621 3.621a2.25 2.25 0 0 0-.659 1.591v9.129a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-4.5"
                                                                    />

                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M9 7.5v3h-3"
                                                                    />

                                                                </svg>

                                                            </div>


                                                            <div className="min-w-0">

                                                                <div className="flex items-center gap-2 flex-wrap">

                                                                    <h3 className="text-sm font-semibold text-slate-800 truncate max-w-md">
                                                                        {getResumeName(
                                                                            resume
                                                                        )}
                                                                    </h3>


                                                                    {index === 0 && (

                                                                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                                            Latest
                                                                        </span>

                                                                    )}


                                                                    {isCurrent && (

                                                                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                                                                            Selected
                                                                        </span>

                                                                    )}

                                                                </div>


                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    Uploaded on{" "}
                                                                    {formatDate(
                                                                        uploadedDate
                                                                    )}
                                                                </p>


                                                                <p className="text-[11px] text-slate-400 mt-1">
                                                                    Resume ID:{" "}
                                                                    {resume.id}
                                                                </p>

                                                            </div>

                                                        </div>


                                                        {/* Score + Action */}

                                                        <div className="flex items-center justify-between sm:justify-end gap-3">

                                                            {/* Score */}

                                                            {score !== undefined &&
                                                            score !== null ? (

                                                                <div className="text-left sm:text-right">

                                                                    <p className="text-xs text-slate-400">
                                                                        AI Score
                                                                    </p>

                                                                    <p className="text-lg font-bold text-blue-600">
                                                                        {score}

                                                                        <span className="text-xs text-slate-400 font-medium">
                                                                            /100
                                                                        </span>

                                                                    </p>

                                                                </div>

                                                            ) : (

                                                                <div className="text-left sm:text-right">

                                                                    <p className="text-xs text-slate-400">
                                                                        Status
                                                                    </p>

                                                                    <p className="text-sm font-semibold text-orange-500">
                                                                        Not analyzed
                                                                    </p>

                                                                </div>

                                                            )}


                                                            {/* View Analysis */}

                                                            <button
                                                                onClick={() =>
                                                                    handleViewAnalysis(
                                                                        resume.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    viewingResumeId ===
                                                                    resume.id
                                                                }
                                                                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition disabled:opacity-50 whitespace-nowrap"
                                                            >
                                                                {viewingResumeId ===
                                                                resume.id
                                                                    ? "Loading..."
                                                                    : resumeAnalysis
                                                                    ? "View Analysis"
                                                                    : "Analyze Resume"}
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>

                            )}

                    </div>


                    {/* ======================================
                        AI ANALYSIS RESULTS
                    ====================================== */}

                    {analysis && (

                        <div
                            id="resume-analysis-results"
                            className="mt-6 space-y-5"
                        >


                            {/* ==================================
                                AI SCORE CARD
                            ================================== */}

                            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-5 sm:p-6 shadow-xl text-white">

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                    <div className="flex-1">

                                        <div className="flex items-center gap-2 mb-3">

                                            <span className="text-blue-400 text-lg">
                                                ✦
                                            </span>

                                            <p className="text-xs sm:text-sm font-semibold text-blue-300 tracking-wide">
                                                GEMINI AI ANALYSIS
                                            </p>

                                        </div>


                                        <h2 className="text-2xl sm:text-3xl font-bold">
                                            Your Resume Intelligence
                                        </h2>


                                        <p className="text-sm text-slate-300 mt-3 max-w-xl leading-6">
                                            AI-powered insights into your resume
                                            quality, technical skills and career
                                            readiness.
                                        </p>


                                        <div className="mt-6 max-w-xl">

                                            <div className="flex justify-between mb-2">

                                                <span className="text-xs sm:text-sm text-slate-300">
                                                    Resume Health
                                                </span>

                                                <span className="text-xs sm:text-sm font-bold">
                                                    {analysis.resume_score}/100
                                                </span>

                                            </div>


                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">

                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-1000"
                                                    style={{
                                                        width: `${analysis.resume_score}%`,
                                                    }}
                                                ></div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* SCORE CIRCLE */}

                                    <div className="flex flex-col items-center">

                                        <div
                                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center"
                                            style={{
                                                background: `conic-gradient(
                                                    rgb(59 130 246) ${analysis.resume_score * 3.6}deg,
                                                    rgba(255,255,255,0.08) 0deg
                                                )`,
                                            }}
                                        >

                                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950 flex flex-col items-center justify-center">

                                                <span className="text-3xl font-bold">
                                                    {analysis.resume_score}
                                                </span>

                                                <span className="text-[10px] text-slate-400">
                                                    OUT OF 100
                                                </span>

                                            </div>

                                        </div>


                                        <p className="mt-3 text-xs sm:text-sm font-semibold text-blue-300">

                                            {analysis.resume_score >= 80
                                                ? "Excellent Resume"
                                                : analysis.resume_score >= 60
                                                    ? "Good Foundation"
                                                    : "Needs Improvement"}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                PROFESSIONAL SUMMARY
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                <div className="flex items-center gap-3">

                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base">
                                        📝
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Professional Summary
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            AI-generated profile overview
                                        </p>

                                    </div>

                                </div>


                                <p className="text-sm text-slate-600 mt-4 leading-6">
                                    {analysis.professional_summary}
                                </p>

                            </div>


                            {/* ==================================
                                SKILLS SECTION
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base">
                                            🛠️
                                        </div>

                                        <div>

                                            <h3 className="text-base font-bold text-slate-900">
                                                Skills Detected
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Technical and professional skills found in your resume
                                            </p>

                                        </div>

                                    </div>


                                    <div className="px-3 py-1.5 bg-blue-50 rounded-lg self-start sm:self-auto">

                                        <span className="text-xl font-bold text-blue-600">
                                            {analysis.skills?.length || 0}
                                        </span>

                                        <span className="text-xs text-blue-500 ml-2 font-medium">
                                            Skills
                                        </span>

                                    </div>

                                </div>


                                {/* Skills Grid */}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                                    {analysis.skills?.map(
                                        (skill, index) => (

                                            <div
                                                key={index}
                                                className="group flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition"
                                            >

                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition">

                                                    {index + 1}

                                                </div>

                                                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition">
                                                    {skill}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* ==================================
                                STRENGTHS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                <div className="flex items-center gap-3 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-base">
                                        💪
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Key Strengths
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            What you're doing well
                                        </p>

                                    </div>

                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                    {analysis.strengths?.map(
                                        (strength, index) => (

                                            <div
                                                key={index}
                                                className="flex gap-3 p-4 bg-green-50/50 border border-green-100 rounded-xl"
                                            >

                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold">
                                                    ✓
                                                </div>

                                                <p className="text-xs sm:text-sm text-slate-600 leading-5 sm:leading-6">
                                                    {strength}
                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* ==================================
                                SKILL GAPS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-base">
                                            🎯
                                        </div>

                                        <div>

                                            <h3 className="text-base font-bold text-slate-900">
                                                Skill Gaps
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Areas that can improve your career readiness
                                            </p>

                                        </div>

                                    </div>


                                    <div className="px-3 py-1.5 bg-orange-50 rounded-lg self-start sm:self-auto">

                                        <span className="text-xl font-bold text-orange-600">
                                            {analysis.skill_gaps?.length || 0}
                                        </span>

                                        <span className="text-xs text-orange-500 ml-2 font-medium">
                                            Areas
                                        </span>

                                    </div>

                                </div>


                                {/* Skill Gap Cards */}

                                <div className="space-y-3">

                                    {analysis.skill_gaps?.map(
                                        (gap, index) => (

                                            <div
                                                key={index}
                                                className="group p-4 border border-slate-200 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition"
                                            >

                                                <div className="flex gap-3">

                                                    {/* Number */}

                                                    <div className="flex-shrink-0">

                                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold">
                                                            {index + 1}
                                                        </div>

                                                    </div>


                                                    {/* Content */}

                                                    <div className="flex-1 min-w-0">

                                                        <div className="flex flex-wrap items-center justify-between gap-2">

                                                            <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                                                Improvement Area
                                                            </p>

                                                            <span className="text-[11px] font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                                                                Recommended
                                                            </span>

                                                        </div>


                                                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-5 sm:leading-6">
                                                            {gap}
                                                        </p>


                                                        {/* Progress indicator */}

                                                        <div className="mt-4">

                                                            <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 mb-1">

                                                                <span>
                                                                    Development Priority
                                                                </span>

                                                                <span>
                                                                    {index === 0
                                                                        ? "High"
                                                                        : index === 1
                                                                            ? "Medium"
                                                                            : "Normal"}
                                                                </span>

                                                            </div>


                                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                                                                <div
                                                                    className="h-full bg-orange-400 rounded-full"
                                                                    style={{
                                                                        width:
                                                                            index === 0
                                                                                ? "90%"
                                                                                : index === 1
                                                                                    ? "70%"
                                                                                    : "50%",
                                                                    }}
                                                                ></div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* ==================================
                                SUITABLE ROLES
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                <div className="flex items-center gap-3 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base">
                                        💼
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Suitable Roles
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Career paths recommended by Gemini AI
                                        </p>

                                    </div>

                                </div>


                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                                    {analysis.suitable_roles?.map(
                                        (role, index) => (

                                            <div
                                                key={index}
                                                className="group p-4 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition"
                                            >

                                                <div className="flex items-center justify-between">

                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition">

                                                        {index + 1}

                                                    </div>

                                                    <span className="text-[11px] text-indigo-500 font-semibold">
                                                        MATCH
                                                    </span>

                                                </div>


                                                <h4 className="text-sm font-semibold text-slate-800 mt-3">
                                                    {role}
                                                </h4>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    Recommended career path
                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* ==================================
                                RECOMMENDED IMPROVEMENTS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                <div className="flex items-center gap-3 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base">
                                        🚀
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Recommended Improvements
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            AI-generated recommendations for your resume
                                        </p>

                                    </div>

                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                    {analysis.improvements?.map(
                                        (improvement, index) => (

                                            <div
                                                key={index}
                                                className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition"
                                            >

                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>

                                                <p className="text-xs sm:text-sm text-slate-600 leading-5 sm:leading-6">
                                                    {improvement}
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

export default ResumeAnalysis;