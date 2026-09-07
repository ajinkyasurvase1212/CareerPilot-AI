import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import CareerPilotLogo from "../../components/CareerPilotLogo";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    // ==========================================
    // REGISTER
    // ==========================================

    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");
        setSuccess(false);


        // ======================================
        // BASIC VALIDATION
        // ======================================

        if (!username.trim()) {

            setMessage(
                "Please enter a username."
            );

            return;
        }


        if (!email.trim()) {

            setMessage(
                "Please enter your email."
            );

            return;
        }


        if (password.length < 6) {

            setMessage(
                "Password must be at least 6 characters long."
            );

            return;
        }


        if (password !== password2) {

            setMessage(
                "Passwords do not match."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await api.post(
                "/accounts/register/",
                {
                    username: username.trim(),
                    email: email.trim(),
                    password: password,
                }
            );


            console.log(
                "Registration response:",
                response.data
            );


            // ======================================
            // SUCCESS
            // ======================================

            setSuccess(true);

            setMessage(
                "Account created successfully! Redirecting to login..."
            );


            // Clear form

            setUsername("");
            setEmail("");
            setPassword("");
            setPassword2("");


            // ======================================
            // REDIRECT TO LOGIN
            // ======================================

            setTimeout(() => {

                navigate("/login");

            }, 1200);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            // ======================================
            // HANDLE ERRORS
            // ======================================

            if (error.response) {

                console.log(
                    "Registration error response:",
                    error.response.data
                );


                const data = error.response.data;


                if (data.username) {

                    setMessage(
                        Array.isArray(data.username)
                            ? data.username[0]
                            : data.username
                    );

                }

                else if (data.email) {

                    setMessage(
                        Array.isArray(data.email)
                            ? data.email[0]
                            : data.email
                    );

                }

                else if (data.password) {

                    setMessage(
                        Array.isArray(data.password)
                            ? data.password[0]
                            : data.password
                    );

                }

                else if (data.detail) {

                    setMessage(
                        data.detail
                    );

                }

                else {

                    setMessage(
                        "Registration failed. Please check your details."
                    );
                }

            } else {

                setMessage(
                    "Unable to connect to server."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-slate-950 relative overflow-hidden">


            {/* ==========================================
                BACKGROUND
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

                                    Start your career journey

                                </div>


                                <h2 className="text-4xl font-bold text-white leading-tight">

                                    Build a smarter
                                    <span className="text-indigo-300">
                                        {" "}career{" "}
                                    </span>
                                    with AI.

                                </h2>


                                <p className="text-indigo-100/70 mt-4 leading-6 max-w-md">

                                    Create your CareerPilot account and
                                    unlock personalized resume insights,
                                    job matching and AI-powered interview
                                    preparation.

                                </p>


                                {/* FEATURES */}

                                <div className="mt-6 space-y-3">

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            ✦
                                        </div>

                                        <span className="text-sm text-indigo-100">
                                            Understand your resume better
                                        </span>

                                    </div>


                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            ✦
                                        </div>

                                        <span className="text-sm text-indigo-100">
                                            Discover your best-fit roles
                                        </span>

                                    </div>


                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            ✦
                                        </div>

                                        <span className="text-sm text-indigo-100">
                                            Practice with an AI interviewer
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <p className="text-xs text-indigo-200/50">
                                CareerPilot AI • Intelligent Career Assistant
                            </p>

                        </div>


                        {/* ==================================
                            RIGHT REGISTER PANEL
                        ================================== */}

                        <div className="p-6 sm:p-8 lg:p-9">


                            {/* MOBILE LOGO */}

                            <div className="lg:hidden mb-7">

                                <CareerPilotLogo
                                    dark={false}
                                    showTagline={true}
                                />

                            </div>


                            {/* HEADING */}

                            <div className="mb-5">

                                <p className="text-sm font-semibold text-indigo-600 mb-2">
                                    Get started
                                </p>

                                <h1 className="text-3xl font-bold text-slate-900">
                                    Create your account
                                </h1>

                                <p className="text-sm text-slate-500 mt-2">
                                    Build your personalized AI career profile.
                                </p>

                            </div>


                            {/* ==================================
                                FORM
                            ================================== */}

                            <form onSubmit={handleRegister}>


                                {/* USERNAME */}

                                <div className="mb-3">

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
                                            placeholder="Choose a username"
                                            autoComplete="username"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* EMAIL */}

                                <div className="mb-3">

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email address
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
                                                    y="5"
                                                    width="18"
                                                    height="14"
                                                    rx="2"
                                                />

                                                <path d="m3 7 9 6 9-6" />

                                            </svg>

                                        </div>

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* PASSWORD */}

                                <div className="mb-3">

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
                                            placeholder="Create a password"
                                            autoComplete="new-password"
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


                                    <p className="text-xs text-slate-400 mt-1.5">
                                        Use at least 6 characters.
                                    </p>

                                </div>


                                {/* CONFIRM PASSWORD */}

                                <div className="mb-4">

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Confirm password
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
                                                showPassword2
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password2}
                                            onChange={(e) =>
                                                setPassword2(e.target.value)
                                            }
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            className="w-full pl-11 pr-16 py-3 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            required
                                        />


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword2(!showPassword2)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-400 hover:text-indigo-600 transition"
                                        >

                                            {showPassword2
                                                ? "Hide"
                                                : "Show"}

                                        </button>

                                    </div>

                                </div>


                                {/* REGISTER BUTTON */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >

                                    {loading ? (

                                        <span className="flex items-center justify-center gap-2">

                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>

                                            Creating account...

                                        </span>

                                    ) : (

                                        "Create your CareerPilot account"

                                    )}

                                </button>


                            </form>


                            {/* ==================================
                                MESSAGE
                            ================================== */}

                            {message && (

                                <div
                                    className={`mt-4 p-3 rounded-xl text-sm text-center font-medium border ${
                                        success
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-red-50 text-red-700 border-red-100"
                                    }`}
                                >

                                    {message}

                                </div>

                            )}


                            {/* ==================================
                                LOGIN LINK
                            ================================== */}

                            <div className="mt-5 pt-5 border-t border-slate-100 text-center">

                                <p className="text-sm text-slate-500">

                                    Already have an account?

                                    <Link
                                        to="/login"
                                        className="ml-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Sign in
                                    </Link>

                                </p>

                            </div>


                            {/* FOOTER NOTE */}

                            <p className="text-center text-xs text-slate-400 mt-4">

                                Join CareerPilot and start building
                                your career with AI.

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;