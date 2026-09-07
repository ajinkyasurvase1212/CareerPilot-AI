import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function MyJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [selectedJob, setSelectedJob] = useState(null);
    const [matchResult, setMatchResult] = useState(null);

    const [loadingMatch, setLoadingMatch] = useState(false);

    // ==========================================
    // LOAD JOBS
    // ==========================================

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);

            const response = await api.get("/jobs/");

            let jobData = [];

            if (Array.isArray(response.data)) {
                jobData = response.data;
            } else if (Array.isArray(response.data.jobs)) {
                jobData = response.data.jobs;
            } else if (Array.isArray(response.data.results)) {
                jobData = response.data.results;
            }

            setJobs(jobData);
        } catch (error) {
            setMessage("Unable to load your saved jobs.");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // VIEW MATCH RESULT
    // ==========================================

    const handleViewMatch = async (job) => {
        setSelectedJob(job);
        setMatchResult(null);
        setLoadingMatch(true);
        setMessage("");

        try {
            const response = await api.get(
                `/jobs/${job.id}/match-result/`
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

            setMatchResult(result);
        } catch (error) {
            if (error.response?.status === 404) {
                setMessage(
                    "This job has not been analyzed yet."
                );
            } else {
                setMessage(
                    "Unable to load match result."
                );
            }
        } finally {
            setLoadingMatch(false);
        }
    };

    // ==========================================
    // CLOSE RESULT
    // ==========================================

    const closeResult = () => {
        setSelectedJob(null);
        setMatchResult(null);
        setMessage("");
    };

    // ==========================================
    // SCORE LABEL
    // ==========================================

    const getScoreLabel = (score) => {
        const value = Number(score) || 0;

        if (value >= 80) {
            return "Excellent Match";
        }

        if (value >= 60) {
            return "Good Match";
        }

        if (value >= 40) {
            return "Moderate Match";
        }

        return "Low Match";
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN */}
            <div className="lg:ml-64">

                <Navbar />

                <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

                    {/* ======================================
                        HEADER
                    ====================================== */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 sm:mb-6">

                        <div>

                            <p className="text-xs sm:text-sm font-semibold text-indigo-600 tracking-wide mb-1.5">
                                CAREER INTELLIGENCE
                            </p>

                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                My Jobs
                            </h1>

                            <p className="text-sm text-slate-500 mt-1.5">
                                View the jobs you've added and your AI
                                compatibility results.
                            </p>

                        </div>

                        <Link
                            to="/jobs"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                            + Add New Job
                        </Link>

                    </div>

                    {/* ======================================
                        LOADING
                    ====================================== */}

                    {loading ? (

                        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 text-center">

                            <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>

                            <p className="text-sm text-slate-500">
                                Loading your jobs...
                            </p>

                        </div>

                    ) : jobs.length === 0 ? (

                        /* ==================================
                           EMPTY STATE
                        ================================== */

                        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 text-center">

                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                                🎯
                            </div>

                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                No jobs yet
                            </h2>

                            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                                Add a job description and let Gemini AI
                                analyze how well your resume matches it.
                            </p>

                            <Link
                                to="/jobs"
                                className="inline-block mt-5 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                            >
                                Analyze Your First Job
                            </Link>

                        </div>

                    ) : (

                        /* ==================================
                           JOB LIST
                        ================================== */

                        <div className="space-y-3">

                            {jobs.map((job) => (

                                <div
                                    key={job.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                                        {/* JOB INFO */}

                                        <div className="flex items-start gap-3 min-w-0">

                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-bold flex-shrink-0">
                                                {job.title
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "J"
                                                }
                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-base font-bold text-slate-900 truncate">
                                                    {job.title ||
                                                        "Untitled Job"
                                                    }
                                                </h2>

                                                <p className="text-sm text-slate-500 mt-1 truncate">
                                                    {job.company ||
                                                        "Company not specified"
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1.5">
                                                    Job ID: #{job.id}
                                                </p>

                                            </div>

                                        </div>

                                        {/* ACTION */}

                                        <button
                                            onClick={() =>
                                                handleViewMatch(job)
                                            }
                                            className="w-full lg:w-auto px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition"
                                        >
                                            View AI Match →
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                    {/* ======================================
                        ERROR MESSAGE
                    ====================================== */}

                    {message && (

                        <div className="mt-4 p-3 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-sm font-medium">
                            {message}
                        </div>

                    )}

                    {/* ======================================
                        MATCH RESULT MODAL
                    ====================================== */}

                    {selectedJob && (

                        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">

                            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

                                {/* MODAL HEADER */}

                                <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 sm:px-5 py-4 flex items-center justify-between">

                                    <div className="min-w-0">

                                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                                            AI Job Analysis
                                        </p>

                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">
                                            {selectedJob.title}
                                        </h2>

                                        <p className="text-xs sm:text-sm text-slate-400 truncate">
                                            {selectedJob.company ||
                                                "Company not specified"
                                            }
                                        </p>

                                    </div>

                                    <button
                                        onClick={closeResult}
                                        className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition flex-shrink-0 ml-3"
                                    >
                                        ✕
                                    </button>

                                </div>

                                {/* MODAL CONTENT */}

                                <div className="p-4 sm:p-5">

                                    {loadingMatch ? (

                                        <div className="py-14 text-center">

                                            <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>

                                            <p className="text-sm text-slate-500">
                                                Loading AI match result...
                                            </p>

                                        </div>

                                    ) : matchResult ? (

                                        <div className="space-y-5">

                                            {/* SCORE */}

                                            <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white">

                                                <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wide">
                                                    Match Score
                                                </p>

                                                <div className="flex items-center justify-between mt-2">

                                                    <div>

                                                        <p className="text-3xl sm:text-4xl font-bold">
                                                            {matchResult.match_score}%
                                                        </p>

                                                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                                            {getScoreLabel(
                                                                matchResult.match_score
                                                            )}
                                                        </p>

                                                    </div>

                                                    <div className="text-3xl sm:text-4xl">
                                                        🎯
                                                    </div>

                                                </div>

                                            </div>

                                            {/* MATCHED SKILLS */}

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900 mb-3">
                                                    ✓ Matched Skills
                                                </h3>

                                                <div className="flex flex-wrap gap-2">

                                                    {matchResult.matched_skills?.length > 0 ? (

                                                        matchResult.matched_skills.map(
                                                            (skill, index) => (

                                                                <span
                                                                    key={index}
                                                                    className="px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs sm:text-sm font-medium"
                                                                >
                                                                    {skill}
                                                                </span>

                                                            )
                                                        )

                                                    ) : (

                                                        <p className="text-sm text-slate-400">
                                                            No matched skills found.
                                                        </p>

                                                    )}

                                                </div>

                                            </div>

                                            {/* MISSING SKILLS */}

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900 mb-3">
                                                    ⚠ Missing Skills
                                                </h3>

                                                <div className="flex flex-wrap gap-2">

                                                    {matchResult.missing_skills?.length > 0 ? (

                                                        matchResult.missing_skills.map(
                                                            (skill, index) => (

                                                                <span
                                                                    key={index}
                                                                    className="px-2.5 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs sm:text-sm font-medium"
                                                                >
                                                                    {skill}
                                                                </span>

                                                            )
                                                        )

                                                    ) : (

                                                        <p className="text-sm text-green-600">
                                                            No major skill gaps detected.
                                                        </p>

                                                    )}

                                                </div>

                                            </div>

                                            {/* ATS KEYWORDS */}

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900 mb-3">
                                                    🔑 ATS Keywords
                                                </h3>

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
                                                            No ATS keywords found.
                                                        </p>

                                                    )}

                                                </div>

                                            </div>

                                            {/* STRENGTHS */}

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900 mb-3">
                                                    💪 Strengths
                                                </h3>

                                                <div className="space-y-2">

                                                    {matchResult.strengths?.map(
                                                        (strength, index) => (

                                                            <div
                                                                key={index}
                                                                className="p-3.5 bg-blue-50 border border-blue-100 rounded-lg text-sm text-slate-700 leading-5"
                                                            >
                                                                {strength}
                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                            {/* RECOMMENDATIONS */}

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900 mb-3">
                                                    🚀 Recommendations
                                                </h3>

                                                <div className="space-y-2">

                                                    {matchResult.recommendations?.map(
                                                        (recommendation, index) => (

                                                            <div
                                                                key={index}
                                                                className="flex gap-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg"
                                                            >

                                                                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                    {index + 1}
                                                                </span>

                                                                <p className="text-sm text-slate-700 leading-5">
                                                                    {recommendation}
                                                                </p>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                            {/* INTERVIEW BUTTON */}

                                            <Link
                                                to="/interview"
                                                onClick={closeResult}
                                                className="block text-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                                            >
                                                Prepare for This Interview →
                                            </Link>

                                        </div>

                                    ) : (

                                        <div className="py-10 text-center">

                                            <div className="text-3xl mb-3">
                                                🎯
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-900">
                                                No AI match available
                                            </h3>

                                            <p className="text-sm text-slate-400 mt-2">
                                                Analyze this job from the Job
                                                Matching page first.
                                            </p>

                                            <Link
                                                to="/jobs"
                                                onClick={closeResult}
                                                className="inline-block mt-5 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
                                            >
                                                Analyze Job
                                            </Link>

                                        </div>

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

export default MyJobs;