import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function InterviewPreparation() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const jobIdFromUrl = searchParams.get("job");

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");

    const [preparation, setPreparation] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(true);

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // ==========================================
    // LOAD JOBS
    // ==========================================

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoadingJobs(true);

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

            // Automatically select job passed from My Jobs
            if (jobIdFromUrl) {
                const jobExists = jobData.some(
                    (job) =>
                        String(job.id) === String(jobIdFromUrl)
                );

                if (jobExists) {
                    setSelectedJob(String(jobIdFromUrl));
                }
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setMessage(
                    "Your login session has expired. Please login again."
                );
            } else {
                setMessage(
                    "Unable to load your saved jobs."
                );
            }

            setSuccess(false);
        } finally {
            setLoadingJobs(false);
        }
    };

    // ==========================================
    // GENERATE INTERVIEW PREPARATION
    // ==========================================

    const handleGeneratePreparation = async () => {
        if (!selectedJob) {
            setMessage("Please select a job first.");
            setSuccess(false);
            return;
        }

        setLoading(true);
        setMessage("");
        setSuccess(false);
        setPreparation(null);

        try {
            const response = await api.post(
                `/jobs/${selectedJob}/interview-prep/`
            );

            let result = null;

            if (response.data?.preparation) {
                result = response.data.preparation;
            } else if (response.data?.interview_preparation) {
                result = response.data.interview_preparation;
            } else if (response.data?.result) {
                result = response.data.result;
            } else {
                result = response.data;
            }

            if (!result) {
                setMessage(
                    "Interview preparation was generated but no result was returned."
                );
                setSuccess(false);
                return;
            }

            setPreparation(result);
            setSuccess(true);

            setMessage(
                "Your personalized AI interview preparation is ready!"
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
                        error.response.data?.error ||
                        "Unable to generate interview preparation."
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
    // START MOCK INTERVIEW
    // ==========================================

    const handleStartMockInterview = () => {
        if (!selectedJob) {
            setMessage("Please select a job first.");
            setSuccess(false);
            return;
        }

        navigate(
            `/mock-interview?job=${selectedJob}`
        );
    };

    // ==========================================
    // QUESTION CARD
    // ==========================================

    const QuestionCard = ({ number, question }) => {
        return (
            <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-indigo-200 transition">

                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {number}
                </div>

                <p className="text-sm text-slate-700 leading-5">
                    {question}
                </p>

            </div>
        );
    };

    // ==========================================
    // SELECTED JOB DATA
    // ==========================================

    const selectedJobData = jobs.find(
        (job) =>
            String(job.id) === String(selectedJob)
    );

    // ==========================================
    // UI
    // ==========================================

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

                    <div className="mb-5 sm:mb-6">

                        <p className="text-xs sm:text-sm font-semibold text-indigo-600 tracking-wide mb-1.5">
                            AI INTERVIEW COACH
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Interview Preparation
                        </h1>

                        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-5">
                            Get personalized interview questions and
                            preparation guidance based on your resume
                            and target job.
                        </p>

                    </div>

                    {/* ======================================
                        SELECT JOB CARD
                    ====================================== */}

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">

                        {/* HEADER */}

                        <div className="flex items-center gap-2.5 mb-5">

                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base">
                                🎤
                            </div>

                            <div>

                                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                    Prepare for Your Interview
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                    Select one of your saved jobs.
                                </p>

                            </div>

                        </div>

                        {/* JOB SELECT */}

                        <div className="mb-5">

                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                                Select Job *
                            </label>

                            <select
                                value={selectedJob}
                                onChange={(e) => {
                                    setSelectedJob(
                                        e.target.value
                                    );

                                    setPreparation(null);
                                    setMessage("");
                                    setSuccess(false);
                                }}
                                disabled={loadingJobs}
                                className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-700 text-sm"
                            >

                                <option value="">
                                    {loadingJobs
                                        ? "Loading jobs..."
                                        : "Select a job"
                                    }
                                </option>

                                {jobs.map((job) => (
                                    <option
                                        key={job.id}
                                        value={job.id}
                                    >
                                        {job.title}
                                        {job.company
                                            ? ` — ${job.company}`
                                            : ""
                                        }
                                    </option>
                                ))}

                            </select>

                            {jobs.length === 0 &&
                                !loadingJobs && (
                                    <p className="text-xs text-orange-500 mt-2">
                                        No saved jobs found.
                                        Create a job from
                                        the Job Matching page first.
                                    </p>
                                )}

                        </div>

                        {/* ======================================
                            SELECTED JOB INFORMATION
                        ====================================== */}

                        {selectedJobData && (

                            <div className="mb-5 p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg">

                                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                                    Selected Target Role
                                </p>

                                <p className="text-sm font-bold text-indigo-900">
                                    {selectedJobData.title}
                                </p>

                                <p className="text-xs text-indigo-600 mt-1">
                                    {selectedJobData.company ||
                                        "Company not specified"
                                    }
                                </p>

                            </div>

                        )}

                        {/* ======================================
                            GENERATE BUTTON
                        ====================================== */}

                        <button
                            onClick={handleGeneratePreparation}
                            disabled={
                                loading ||
                                !selectedJob
                            }
                            className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Gemini AI is preparing..."
                                : "✦ Generate Interview Preparation"
                            }
                        </button>

                        {/* ======================================
                            VOICE MOCK INTERVIEW CARD
                        ====================================== */}

                        {selectedJob && (

                            <div className="mt-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 rounded-xl p-4 sm:p-5 text-white shadow-md">

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                    {/* LEFT */}

                                    <div className="flex items-start gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-lg flex-shrink-0">
                                            🎤
                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                                                Voice AI Interview
                                            </p>

                                            <h3 className="text-base sm:text-lg font-bold mt-1">
                                                Ready for a real interview?
                                            </h3>

                                            <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 max-w-xl leading-5">
                                                Practice this role with CareerPilot's
                                                AI interviewer. Answer questions using
                                                your voice and receive personalized
                                                AI feedback.
                                            </p>

                                        </div>

                                    </div>

                                    {/* BUTTON */}

                                    <button
                                        onClick={
                                            handleStartMockInterview
                                        }
                                        className="w-full lg:w-auto whitespace-nowrap px-4 py-2.5 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition"
                                    >
                                        🎤 Start Mock Interview →
                                    </button>

                                </div>

                            </div>

                        )}

                        {/* ======================================
                            MESSAGE
                        ====================================== */}

                        {message && (

                            <div
                                className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                    success
                                        ? "bg-green-50 text-green-700 border border-green-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                }`}
                            >
                                {message}
                            </div>

                        )}

                    </div>

                    {/* ======================================
                        AI RESULTS
                    ====================================== */}

                    {preparation && (

                        <div className="mt-6 space-y-5">

                            {/* ==================================
                                HERO
                            ================================== */}

                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg">

                                <div className="flex items-center gap-2.5 mb-3">

                                    <span className="text-base">
                                        ✦
                                    </span>

                                    <span className="text-xs sm:text-sm font-semibold text-indigo-300 tracking-wide">
                                        GEMINI AI INTERVIEW COACH
                                    </span>

                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold">
                                    You're Ready to Prepare 🚀
                                </h2>

                                <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-5">
                                    These questions and recommendations were
                                    generated specifically from your resume
                                    and the selected job description.
                                </p>

                            </div>

                            {/* ==================================
                                TECHNICAL QUESTIONS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base">
                                        💻
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Technical Questions
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Questions based on the technical
                                            requirements of the job.
                                        </p>

                                    </div>

                                </div>

                                <div className="space-y-2.5">

                                    {preparation.technical_questions?.map(
                                        (question, index) => (
                                            <QuestionCard
                                                key={index}
                                                number={index + 1}
                                                question={question}
                                            />
                                        )
                                    )}

                                </div>

                            </div>

                            {/* ==================================
                                RESUME QUESTIONS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-base">
                                        📄
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Resume-Based Questions
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Questions an interviewer may ask
                                            about your resume and projects.
                                        </p>

                                    </div>

                                </div>

                                <div className="space-y-2.5">

                                    {preparation.resume_questions?.map(
                                        (question, index) => (
                                            <QuestionCard
                                                key={index}
                                                number={index + 1}
                                                question={question}
                                            />
                                        )
                                    )}

                                </div>

                            </div>

                            {/* ==================================
                                BEHAVIORAL QUESTIONS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-base">
                                        🧠
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Behavioral Questions
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Questions designed to assess your
                                            communication and problem-solving.
                                        </p>

                                    </div>

                                </div>

                                <div className="space-y-2.5">

                                    {preparation.behavioral_questions?.map(
                                        (question, index) => (
                                            <QuestionCard
                                                key={index}
                                                number={index + 1}
                                                question={question}
                                            />
                                        )
                                    )}

                                </div>

                            </div>

                            {/* ==================================
                                TOPICS TO REVISE
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-base">
                                        📚
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            Topics to Revise
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Focus your preparation on these
                                            important areas.
                                        </p>

                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                                    {preparation.topics_to_revise?.map(
                                        (topic, index) => (

                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-lg"
                                            >

                                                <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {index + 1}
                                                </div>

                                                <span className="text-sm font-medium text-green-800">
                                                    {topic}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                            {/* ==================================
                                INTERVIEW TIPS
                            ================================== */}

                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

                                <div className="flex items-center gap-2.5 mb-5">

                                    <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center text-base">
                                        💡
                                    </div>

                                    <div>

                                        <h3 className="text-base font-bold text-slate-900">
                                            AI Interview Tips
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Personalized advice for performing
                                            better in your interview.
                                        </p>

                                    </div>

                                </div>

                                <div className="space-y-2.5">

                                    {preparation.interview_tips?.map(
                                        (tip, index) => (

                                            <div
                                                key={index}
                                                className="flex gap-3 p-3.5 bg-yellow-50/60 border border-yellow-100 rounded-lg"
                                            >

                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">
                                                    ✓
                                                </div>

                                                <p className="text-sm text-slate-700 leading-5">
                                                    {tip}
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

export default InterviewPreparation;