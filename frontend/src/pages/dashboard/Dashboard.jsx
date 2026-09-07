import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";


function Dashboard() {
    const [resumeAnalysis, setResumeAnalysis] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);


    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    useEffect(() => {
        loadDashboardData();
    }, []);


    const loadDashboardData = async () => {
        setLoading(true);

        try {

            // -------------------------------
            // LOAD RESUMES
            // -------------------------------

            const resumeResponse = await api.get("/resumes/");

            let resumeData = [];

            if (Array.isArray(resumeResponse.data)) {
                resumeData = resumeResponse.data;
            } else if (Array.isArray(resumeResponse.data.resumes)) {
                resumeData = resumeResponse.data.resumes;
            } else if (Array.isArray(resumeResponse.data.results)) {
                resumeData = resumeResponse.data.results;
            }

            setResumes(resumeData);


            // -------------------------------
            // GET LATEST RESUME ANALYSIS
            // -------------------------------

            if (resumeData.length > 0) {

                const latestResume = resumeData[0];

                try {

                    const analysisResponse = await api.get(
                        `/resumes/${latestResume.id}/analysis/`
                    );

                    let analysis = null;

                    if (analysisResponse.data?.analysis) {
                        analysis = analysisResponse.data.analysis;
                    } else {
                        analysis = analysisResponse.data;
                    }

                    setResumeAnalysis(analysis);

                } catch (analysisError) {

                    console.log(
                        "No resume analysis found:",
                        analysisError
                    );

                    setResumeAnalysis(null);
                }
            }


            // -------------------------------
            // LOAD JOBS
            // -------------------------------

            const jobResponse = await api.get("/jobs/");

            let jobData = [];

            if (Array.isArray(jobResponse.data)) {
                jobData = jobResponse.data;
            } else if (Array.isArray(jobResponse.data.jobs)) {
                jobData = jobResponse.data.jobs;
            } else if (Array.isArray(jobResponse.data.results)) {
                jobData = jobResponse.data.results;
            }

            setJobs(jobData);

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // CALCULATED DATA
    // ==========================================

    const resumeScore =
        Number(resumeAnalysis?.resume_score) || 0;

    const totalSkills =
        resumeAnalysis?.skills?.length || 0;

    const totalSkillGaps =
        resumeAnalysis?.skill_gaps?.length || 0;

    const totalJobs = jobs.length;


    // ==========================================
    // SCORE LABEL
    // ==========================================

    const getScoreLabel = (score) => {

        if (score >= 80) return "Excellent";

        if (score >= 60) return "Good";

        if (score >= 40) return "Needs Improvement";

        if (score > 0) return "Needs Work";

        return "Not Analyzed";
    };


    // ==========================================
    // STAT CARD
    // ==========================================

    const StatCard = ({
        icon,
        iconBg,
        label,
        value,
        title,
        description,
    }) => {

        return (

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">

                <div className="flex items-center justify-between">

                    <div
                        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-lg`}
                    >
                        {icon}
                    </div>

                    <span className="text-[11px] font-bold tracking-wider text-slate-400">
                        {label}
                    </span>

                </div>


                <div className="mt-4">

                    <p className="text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1">
                        {title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                        {description}
                    </p>

                </div>

            </div>
        );
    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="min-h-screen bg-slate-50">

            {/* SIDEBAR */}

            <Sidebar />


            {/* MAIN AREA */}

            <div className="lg:ml-64">

                {/* NAVBAR */}

                <Navbar />


                <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

                    {/* ==================================
                        WELCOME HEADER
                    ================================== */}

                    <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">

                        <div className="min-w-0">

                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.15em]">
                                CareerPilot AI
                            </p>

                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                                Career Dashboard
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Your AI-powered career intelligence at a glance.
                            </p>

                        </div>


                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                            <Link
                                to="/resume"
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition text-center"
                            >
                                Analyze Resume
                            </Link>


                            <Link
                                to="/jobs"
                                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm text-center"
                            >
                                Match a Job
                            </Link>

                        </div>

                    </section>


                    {/* ==================================
                        LOADING
                    ================================== */}

                    {loading ? (

                        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                            <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>

                            <p className="text-sm text-slate-500">
                                Loading your career intelligence...
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* ==================================
                                STAT CARDS
                            ================================== */}

                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                                <StatCard
                                    icon="📄"
                                    iconBg="bg-indigo-50"
                                    label="RESUME"
                                    value={
                                        resumeScore > 0
                                            ? `${resumeScore}%`
                                            : "--"
                                    }
                                    title={getScoreLabel(resumeScore)}
                                    description="AI Resume Score"
                                />


                                <StatCard
                                    icon="🎯"
                                    iconBg="bg-blue-50"
                                    label="JOBS"
                                    value={totalJobs}
                                    title="Job Matches"
                                    description="Jobs added to CareerPilot"
                                />


                                <StatCard
                                    icon="💡"
                                    iconBg="bg-emerald-50"
                                    label="SKILLS"
                                    value={totalSkills}
                                    title="Skills Identified"
                                    description="Detected by Gemini AI"
                                />


                                <StatCard
                                    icon="⚠️"
                                    iconBg="bg-orange-50"
                                    label="GAPS"
                                    value={totalSkillGaps}
                                    title="Skill Gaps"
                                    description="Areas to improve"
                                />

                            </section>


                            {/* ==================================
                                MAIN CONTENT GRID
                            ================================== */}

                            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">


                                {/* ==================================
                                    RESUME INTELLIGENCE
                                ================================== */}

                                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">

                                    <div className="flex items-center justify-between mb-5">

                                        <div className="min-w-0">

                                            <h2 className="text-lg font-bold text-slate-900">
                                                Resume Intelligence
                                            </h2>

                                            <p className="text-xs text-slate-400 mt-1">
                                                Latest AI-powered resume analysis
                                            </p>

                                        </div>


                                        <Link
                                            to="/resume"
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                                        >
                                            View Analysis →
                                        </Link>

                                    </div>


                                    {resumeAnalysis ? (

                                        <div>


                                            {/* SCORE + SUMMARY */}

                                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 mb-5">

                                                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">

                                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-indigo-100 flex-shrink-0">

                                                        <span className="text-lg font-bold text-indigo-600">
                                                            {resumeScore}%
                                                        </span>

                                                    </div>


                                                    <div>

                                                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                                                            Resume Score
                                                        </p>

                                                        <p className="text-sm font-bold text-slate-800 mt-1">
                                                            {getScoreLabel(resumeScore)}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="p-4 bg-slate-50 rounded-xl">

                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        Professional Summary
                                                    </p>

                                                    <p className="text-sm text-slate-600 leading-6 line-clamp-3">
                                                        {resumeAnalysis.professional_summary ||
                                                            "No professional summary available."}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* SKILLS */}

                                            <div className="mb-5">

                                                <div className="flex items-center justify-between mb-3">

                                                    <p className="text-sm font-bold text-slate-800">
                                                        Top Skills
                                                    </p>

                                                    <span className="text-xs text-slate-400">
                                                        {totalSkills} identified
                                                    </span>

                                                </div>


                                                <div className="flex flex-wrap gap-2">

                                                    {resumeAnalysis.skills
                                                        ?.slice(0, 10)
                                                        .map((skill, index) => (

                                                            <span
                                                                key={index}
                                                                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold"
                                                            >
                                                                {skill}
                                                            </span>

                                                        ))}

                                                </div>

                                            </div>


                                            {/* STRENGTHS */}

                                            <div>

                                                <p className="text-sm font-bold text-slate-800 mb-3">
                                                    Key Strengths
                                                </p>


                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                                                    {resumeAnalysis.strengths
                                                        ?.slice(0, 4)
                                                        .map((strength, index) => (

                                                            <div
                                                                key={index}
                                                                className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg"
                                                            >

                                                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                    ✓
                                                                </span>

                                                                <p className="text-xs text-slate-600 leading-5">
                                                                    {strength}
                                                                </p>

                                                            </div>

                                                        ))}

                                                </div>

                                            </div>

                                        </div>

                                    ) : (

                                        <div className="py-8 text-center">

                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mx-auto mb-3">
                                                📄
                                            </div>

                                            <h3 className="font-bold text-slate-800">
                                                Analyze your resume
                                            </h3>

                                            <p className="text-xs text-slate-400 mt-1 mb-4">
                                                Unlock AI-powered career insights from your resume.
                                            </p>

                                            <Link
                                                to="/resume"
                                                className="inline-flex px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                                            >
                                                Analyze Resume
                                            </Link>

                                        </div>

                                    )}

                                </div>


                                {/* ==================================
                                    AI CAREER STATUS
                                ================================== */}

                                <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm">

                                    <div className="flex items-center gap-3 mb-5">

                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg">
                                            ✦
                                        </div>

                                        <div>

                                            <h2 className="font-bold text-sm">
                                                AI Career Status
                                            </h2>

                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Powered by Gemini AI
                                            </p>

                                        </div>

                                    </div>


                                    {/* ONLINE STATUS */}

                                    <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl mb-5">

                                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>

                                        <div>

                                            <p className="text-xs font-semibold">
                                                AI Engine Online
                                            </p>

                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Career intelligence active
                                            </p>

                                        </div>

                                    </div>


                                    {/* RESUME READINESS */}

                                    <div className="mb-5">

                                        <div className="flex justify-between text-xs mb-2">

                                            <span className="text-slate-400">
                                                Resume Readiness
                                            </span>

                                            <span className="font-semibold">
                                                {resumeScore}%
                                            </span>

                                        </div>


                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        resumeScore,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>

                                        </div>

                                    </div>


                                    {/* SKILLS */}

                                    <div className="mb-5">

                                        <div className="flex justify-between text-xs mb-2">

                                            <span className="text-slate-400">
                                                Skills Identified
                                            </span>

                                            <span className="font-semibold">
                                                {totalSkills}
                                            </span>

                                        </div>


                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

                                            <div
                                                className="h-full bg-emerald-400 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        totalSkills * 8,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>

                                        </div>

                                    </div>


                                    {/* SKILL GAPS */}

                                    <div className="mb-6">

                                        <div className="flex justify-between text-xs mb-2">

                                            <span className="text-slate-400">
                                                Skill Gaps
                                            </span>

                                            <span className="font-semibold">
                                                {totalSkillGaps}
                                            </span>

                                        </div>


                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

                                            <div
                                                className="h-full bg-orange-400 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        totalSkillGaps * 10,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>

                                        </div>

                                    </div>


                                    <Link
                                        to="/interview"
                                        className="block text-center px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                                    >
                                        Prepare for Interview →
                                    </Link>

                                </div>

                            </section>


                            {/* ==================================
                                RECENT JOBS
                            ================================== */}

                            <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">

                                <div className="flex items-center justify-between mb-4">

                                    <div className="min-w-0">

                                        <h2 className="text-lg font-bold text-slate-900">
                                            Recent Jobs
                                        </h2>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Jobs you've added for AI matching
                                        </p>

                                    </div>


                                    <Link
                                        to="/my-jobs"
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                                    >
                                        View All Jobs →
                                    </Link>

                                </div>


                                {jobs.length > 0 ? (

                                    <div className="space-y-2">

                                        {jobs.slice(0, 5).map((job) => (

                                            <div
                                                key={job.id}
                                                className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition"
                                            >

                                                <div className="flex items-center gap-3 min-w-0">

                                                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                        {job.title
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "J"}
                                                    </div>


                                                    <div className="min-w-0">

                                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                                            {job.title ||
                                                                "Untitled Job"}
                                                        </p>

                                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                            {job.company ||
                                                                "Company not specified"}
                                                        </p>

                                                    </div>

                                                </div>


                                                <span className="text-[11px] font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 flex-shrink-0">
                                                    Job #{job.id}
                                                </span>

                                            </div>

                                        ))}

                                    </div>

                                ) : (

                                    <div className="py-6 text-center">

                                        <p className="text-xs text-slate-400 mb-3">
                                            You haven't added any jobs yet.
                                        </p>

                                        <Link
                                            to="/jobs"
                                            className="inline-flex px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                                        >
                                            Add Your First Job
                                        </Link>

                                    </div>

                                )}

                            </section>


                            {/* ==================================
                                QUICK ACTIONS
                            ================================== */}

                            <section>

                                <div className="flex items-center justify-between mb-4">

                                    <div>

                                        <h2 className="text-lg font-bold text-slate-900">
                                            Quick Actions
                                        </h2>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Continue building your career profile
                                        </p>

                                    </div>

                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* RESUME */}

                                    <Link
                                        to="/resume"
                                        className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">
                                                📄
                                            </div>

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Analyze Resume
                                                </h3>

                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Score, strengths & gaps
                                                </p>

                                            </div>

                                        </div>


                                        <p className="text-xs font-bold text-indigo-600 mt-4 group-hover:translate-x-1 transition">
                                            Start Analysis →
                                        </p>

                                    </Link>


                                    {/* JOB */}

                                    <Link
                                        to="/jobs"
                                        className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                                                🎯
                                            </div>

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Match a Job
                                                </h3>

                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Compare resume with a job
                                                </p>

                                            </div>

                                        </div>


                                        <p className="text-xs font-bold text-indigo-600 mt-4 group-hover:translate-x-1 transition">
                                            Find Your Match →
                                        </p>

                                    </Link>


                                    {/* INTERVIEW */}

                                    <Link
                                        to="/interview"
                                        className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">
                                                🎤
                                            </div>

                                            <div>

                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Interview Prep
                                                </h3>

                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    AI technical & HR questions
                                                </p>

                                            </div>

                                        </div>


                                        <p className="text-xs font-bold text-indigo-600 mt-4 group-hover:translate-x-1 transition">
                                            Start Preparing →
                                        </p>

                                    </Link>

                                </div>

                            </section>

                        </>

                    )}

                </main>

            </div>

        </div>
    );
}

export default Dashboard;