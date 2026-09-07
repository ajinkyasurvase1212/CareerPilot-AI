import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    /* ==============================
       LOAD PROFILE DATA
    ============================== */

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        setLoading(true);

        try {
            /* USER PROFILE */
            const profileResponse =
                await api.get("/accounts/profile/");

            setProfile(profileResponse.data);

            /* RESUMES */
            const resumeResponse =
                await api.get("/resumes/");

            let resumeData = [];

            if (Array.isArray(resumeResponse.data)) {
                resumeData = resumeResponse.data;
            } else if (
                Array.isArray(resumeResponse.data.resumes)
            ) {
                resumeData = resumeResponse.data.resumes;
            } else if (
                Array.isArray(resumeResponse.data.results)
            ) {
                resumeData = resumeResponse.data.results;
            }

            setResumes(resumeData);

            /* JOBS */
            const jobResponse =
                await api.get("/jobs/");

            let jobData = [];

            if (Array.isArray(jobResponse.data)) {
                jobData = jobResponse.data;
            } else if (
                Array.isArray(jobResponse.data.jobs)
            ) {
                jobData = jobResponse.data.jobs;
            } else if (
                Array.isArray(jobResponse.data.results)
            ) {
                jobData = jobResponse.data.results;
            }

            setJobs(jobData);
        } catch (error) {
            const username =
                localStorage.getItem("username");

            const email =
                localStorage.getItem("email");

            if (username || email) {
                setProfile({
                    username: username || "User",
                    email:
                        email ||
                        "Email not available",
                });
            } else {
                setProfile(null);
            }

            if (error.response?.status === 401) {
                setMessage(
                    "Your login session has expired. Please login again."
                );
            } else if (
                error.response?.status !== 404
            ) {
                setMessage(
                    "Some profile information could not be loaded."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /* ==============================
       LOGOUT
    ============================== */

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("notification_read");

        navigate("/login");
    };

    /* ==============================
       USER INFORMATION
    ============================== */

    const username =
        profile?.username ||
        profile?.user?.username ||
        "User";

    const email =
        profile?.email ||
        profile?.user?.email ||
        "Email not available";

    const initial =
        username?.charAt(0)?.toUpperCase() ||
        "U";

    /* ==============================
       UI
    ============================== */

    return (
        <div className="min-h-screen bg-slate-50">
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN */}
            <div className="lg:ml-64">
                <Navbar />

                <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                    {/* PAGE HEADER */}
                    <div className="mb-5 sm:mb-6">
                        <p className="text-[10px] sm:text-xs font-semibold text-indigo-600 tracking-wide mb-1">
                            ACCOUNT
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            My Profile
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Manage your account and career
                            information.
                        </p>
                    </div>

                    {/* LOADING */}
                    {loading ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />

                            <p className="text-sm text-slate-500">
                                Loading profile...
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-5">
                            {/* ==========================
                                PROFILE HERO
                            ========================== */}

                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-4 sm:p-5 text-white shadow-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* USER */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
                                            {initial}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] sm:text-[10px] font-semibold text-indigo-300 tracking-wider mb-0.5">
                                                CAREERPILOT MEMBER
                                            </p>

                                            <h2 className="text-base sm:text-lg font-bold truncate">
                                                {username}
                                            </h2>

                                            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate max-w-[230px] sm:max-w-none">
                                                {email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* STATUS */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg w-fit">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full" />

                                        <span className="text-[10px] sm:text-xs font-semibold">
                                            Account Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ==========================
                                STATISTICS
                            ========================== */}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                {/* RESUMES */}
                                <StatCard
                                    value={resumes.length}
                                    title="Resumes Uploaded"
                                    description="Documents analyzed"
                                    icon="📄"
                                    iconBg="bg-indigo-50"
                                />

                                {/* JOBS */}
                                <StatCard
                                    value={jobs.length}
                                    title="Jobs Analyzed"
                                    description="Opportunities evaluated"
                                    icon="🎯"
                                    iconBg="bg-blue-50"
                                />

                                {/* AI */}
                                <StatCard
                                    value="AI"
                                    title="Career Intelligence"
                                    description="Powered by Gemini"
                                    icon="✦"
                                    iconBg="bg-green-50"
                                />
                            </div>

                            {/* ==========================
                                ACCOUNT + CAREER
                            ========================== */}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                {/* ACCOUNT INFORMATION */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
                                    <SectionHeader
                                        icon="👤"
                                        iconBg="bg-indigo-50"
                                        title="Account Information"
                                        subtitle="Your CareerPilot account details"
                                    />

                                    <div className="space-y-3">
                                        <ProfileField
                                            label="Username"
                                            value={username}
                                        />

                                        <ProfileField
                                            label="Email"
                                            value={email}
                                        />

                                        <ProfileField
                                            label="Platform"
                                            value="CareerPilot AI"
                                        />
                                    </div>
                                </div>

                                {/* CAREER ACTIONS */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
                                    <SectionHeader
                                        icon="🚀"
                                        iconBg="bg-purple-50"
                                        title="Career Actions"
                                        subtitle="Continue building your career profile"
                                    />

                                    <div className="space-y-2.5">
                                        <CareerAction
                                            to="/resume"
                                            icon="📄"
                                            title="Analyze Resume"
                                            description="Improve your resume"
                                        />

                                        <CareerAction
                                            to="/jobs"
                                            icon="🎯"
                                            title="Match a Job"
                                            description="Check job compatibility"
                                        />

                                        <CareerAction
                                            to="/interview"
                                            icon="🎤"
                                            title="Interview Preparation"
                                            description="Practice with AI"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ==========================
                                ACCOUNT SESSION
                            ========================== */}

                            <div className="bg-white border border-red-100 rounded-xl p-4 sm:p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                    <div>
                                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                            Account Session
                                        </h2>

                                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                                            Sign out of your CareerPilot
                                            account on this device.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>

                            {/* MESSAGE */}
                            {message && (
                                <div className="p-3 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs font-medium">
                                    {message}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

/* ==============================
   STAT CARD
============================== */

function StatCard({
    value,
    title,
    description,
    icon,
    iconBg,
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {title}
                    </p>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                        {description}
                    </p>
                </div>

                <div
                    className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center text-base shrink-0`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

/* ==============================
   SECTION HEADER
============================== */

function SectionHeader({
    icon,
    iconBg,
    title,
    subtitle,
}) {
    return (
        <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
            <div
                className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center text-base shrink-0`}
            >
                {icon}
            </div>

            <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {title}
                </h2>

                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

/* ==============================
   PROFILE FIELD
============================== */

function ProfileField({ label, value }) {
    return (
        <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                {label}
            </p>

            <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-700 break-all">
                {value}
            </div>
        </div>
    );
}

/* ==============================
   CAREER ACTION
============================== */

function CareerAction({
    to,
    icon,
    title,
    description,
}) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/40 transition group"
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">
                    {icon}
                </span>

                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">
                        {title}
                    </p>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                        {description}
                    </p>
                </div>
            </div>

            <span className="text-sm text-indigo-600 group-hover:translate-x-1 transition shrink-0">
                →
            </span>
        </Link>
    );
}

export default Profile;