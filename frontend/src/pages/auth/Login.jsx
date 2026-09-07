import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import CareerPilotLogo from "../../components/CareerPilotLogo";


function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


    // ==========================================
    // LOGIN
    // ==========================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");

        const cleanUsername = username.trim();

        if (!cleanUsername || !password) {
            setMessage("Please enter your username and password.");
            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "/accounts/login/",
                {
                    username: cleanUsername,
                    password: password,
                }
            );


            // ======================================
            // VALIDATE JWT RESPONSE
            // ======================================

            const accessToken =
                response.data?.access;

            const refreshToken =
                response.data?.refresh;


            if (!accessToken || !refreshToken) {

                setMessage(
                    "Login failed. Please try again."
                );

                return;
            }


            // ======================================
            // SAVE JWT TOKENS
            // ======================================

            localStorage.setItem(
                "access_token",
                accessToken
            );

            localStorage.setItem(
                "refresh_token",
                refreshToken
            );


            // ======================================
            // SAVE USER INFORMATION
            // ======================================

            localStorage.setItem(
                "username",
                cleanUsername
            );


            // ======================================
            // SUCCESS
            // ======================================

            setMessage(
                "Login successful! Redirecting..."
            );


            setTimeout(() => {
                navigate("/");
            }, 500);


        } catch (error) {

            // ======================================
            // HANDLE API ERRORS
            // ======================================

            if (error.response) {

                const errorData =
                    error.response.data;


                if (errorData?.detail) {

                    setMessage(
                        errorData.detail
                    );

                } else if (
                    Array.isArray(
                        errorData?.non_field_errors
                    ) &&
                    errorData.non_field_errors.length > 0
                ) {

                    setMessage(
                        errorData.non_field_errors[0]
                    );

                } else {

                    setMessage(
                        "Invalid username or password."
                    );
                }

            } else if (error.request) {

                setMessage(
                    "Unable to connect to the server. Please try again."
                );

            } else {

                setMessage(
                    "Something went wrong. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-slate-950 relative overflow-hidden">


            {/* ==========================================
                BACKGROUND DECORATION
            ========================================== */}

            <div className="absolute inset-0 pointer-events-none">

                <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl"></div>

                <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl"></div>

                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-3xl"></div>

            </div>


            {/* ==========================================
                MAIN
            ========================================== */}

            <div className="relative min-h-screen flex items-center justify-center px-4 py-6">

                <div className="w-full max-w-5xl">


                    {/* ==================================
                        AUTH CONTAINER
                    ================================== */}

                    <div className="bg-white rounded-[28px] shadow-2xl shadow-black/30 overflow-hidden grid lg:grid-cols-2">


                        {/* ==================================
                            LEFT BRAND PANEL
                        ================================== */}

                        <div className="hidden lg:flex bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-9 flex-col justify-between min-h-[620px]">

                            <CareerPilotLogo
                                dark={true}
                                showTagline={true}
                            />


                            <div>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-indigo-100 text-xs font-medium mb-5">

                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>

                                    AI-powered career platform

                                </div>


                                <h2 className="text-4xl font-bold text-white leading-tight">

                                    Turn your career

                                    <span className="text-indigo-300">
                                        {" "}potential{" "}
                                    </span>

                                    into progress.

                                </h2>


                                <p className="text-indigo-100/70 mt-4 leading-6 max-w-md">

                                    Analyze your resume, discover suitable
                                    opportunities, identify skill gaps and
                                    prepare for interviews with AI-powered
                                    career intelligence.

                                </p>


                                {/* FEATURES */}

                                <div className="mt-6 space-y-3">

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            ✓
                                        </div>

                                        <span className="text-sm text-indigo-100">
                                            AI Resume Analysis
                                        </span>

                                    </div>


                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            ✓
                                        </div>

                                        <span className="text-sm text-indigo-100">
                                            Intelligent Job Matching
                                        </span>

                                    </div>


                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            ✓
                                        </div>

                                        <span className="text-sm text-indigo-100">
                                            AI Mock Interview
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <p className="text-xs text-indigo-200/50">
                                CareerPilot AI • Intelligent Career Assistant
                            </p>

                        </div>


                        {/* ==================================
                            RIGHT LOGIN PANEL
                        ================================== */}

                        <div className="p-6 sm:p-8 lg:p-9">


                            {/* MOBILE LOGO */}

                            <div className="lg:hidden mb-8">

                                <CareerPilotLogo
                                    dark={false}
                                    showTagline={true}
                                />

                            </div>


                            {/* HEADING */}

                            <div className="mb-6">

                                <p className="text-sm font-semibold text-indigo-600 mb-2">
                                    Welcome back
                                </p>

                                <h1 className="text-3xl font-bold text-slate-900">
                                    Sign in to CareerPilot
                                </h1>

                                <p className="text-sm text-slate-500 mt-2">
                                    Continue your personalized career journey.
                                </p>

                            </div>


                            {/* ==================================
                                FORM
                            ================================== */}

                            <form onSubmit={handleLogin}>


                                {/* USERNAME */}

                                <div className="mb-4">

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Username
                                    </label>

                                    <div className="relative">

                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M20 21a8 8 0 0 0-16 0" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>

                                        </div>


                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                            placeholder="Enter your username"
                                            autoComplete="username"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* PASSWORD */}

                                <div className="mb-5">

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <rect
                                                    x="3"
                                                    y="11"
                                                    width="18"
                                                    height="10"
                                                    rx="2"
                                                />

                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />

                                            </svg>

                                        </div>


                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className="w-full pl-11 pr-16 py-3 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            required
                                        />


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-400 hover:text-indigo-600 transition"
                                        >

                                            {showPassword
                                                ? "Hide"
                                                : "Show"}

                                        </button>

                                    </div>

                                </div>


                                {/* LOGIN BUTTON */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >

                                    {loading ? (

                                        <span className="flex items-center justify-center gap-2">

                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>

                                            Signing in...

                                        </span>

                                    ) : (

                                        "Sign in to CareerPilot"

                                    )}

                                </button>


                            </form>


                            {/* ==================================
                                MESSAGE
                            ================================== */}

                            {message && (

                                <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm text-center font-medium">

                                    {message}

                                </div>

                            )}


                            {/* ==================================
                                REGISTER
                            ================================== */}

                            <div className="mt-6 pt-5 border-t border-slate-100 text-center">

                                <p className="text-sm text-slate-500">

                                    Don't have an account?

                                    <Link
                                        to="/register"
                                        className="ml-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Create your account
                                    </Link>

                                </p>

                            </div>


                            {/* SECURITY NOTE */}

                            <p className="text-center text-xs text-slate-400 mt-5">

                                Your career data is securely connected to your
                                CareerPilot account.

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default Login;