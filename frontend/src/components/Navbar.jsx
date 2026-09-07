import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [notificationRead, setNotificationRead] = useState(() => {
        return (
            localStorage.getItem(
                "careerpilot_notification_read"
            ) === "true"
        );
    });

    const [username, setUsername] = useState("Career User");

    const notificationRef = useRef(null);
    const profileRef = useRef(null);


    // ==========================================
    // PAGE INFORMATION
    // ==========================================

    const pageInfo = {
        "/": {
            title: "Career Dashboard",
            subtitle: "Overview",
        },

        "/resume": {
            title: "Resume Analysis",
            subtitle: "AI Resume Intelligence",
        },

        "/jobs": {
            title: "Job Matching",
            subtitle: "Find Your Best Job Match",
        },

        "/my-jobs": {
            title: "My Jobs",
            subtitle: "Saved Job Opportunities",
        },

        "/interview": {
            title: "Interview Prep",
            subtitle: "Personalized Interview Preparation",
        },

        "/profile": {
            title: "My Profile",
            subtitle: "Account & Career Information",
        },
    };


    const currentPage =
        pageInfo[location.pathname] || pageInfo["/"];


    // ==========================================
    // LOAD USERNAME
    // ==========================================

    useEffect(() => {
        const storedUsername =
            localStorage.getItem("username");

        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);


    // ==========================================
    // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    // ==========================================

    useEffect(() => {
        const handleClickOutside = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {
                setShowNotifications(false);
            }


            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target
                )
            ) {
                setShowProfileMenu(false);
            }
        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    // ==========================================
    // MARK NOTIFICATION AS VIEWED
    // ==========================================

    const handleMarkAsViewed = () => {
        setNotificationRead(true);

        localStorage.setItem(
            "careerpilot_notification_read",
            "true"
        );
    };


    // ==========================================
    // OPEN PROFILE
    // ==========================================

    const handleProfile = () => {
        setShowProfileMenu(false);
        navigate("/profile");
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        localStorage.removeItem(
            "careerpilot_notification_read"
        );

        navigate("/login");
    };


    return (
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">

            {/* ======================================
                LEFT SIDE
            ====================================== */}

            <div className="pl-12 lg:pl-0 min-w-0">

                <p className="text-sm text-slate-500 truncate">
                    {currentPage.title}
                </p>

                <h2 className="text-xl font-bold text-slate-800 truncate">
                    {currentPage.subtitle}
                </h2>

            </div>


            {/* ======================================
                RIGHT SIDE
            ====================================== */}

            <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">

                {/* ==================================
                    NOTIFICATIONS
                ================================== */}

                <div
                    className="relative"
                    ref={notificationRef}
                >

                    <button
                        onClick={() => {
                            setShowNotifications(
                                !showNotifications
                            );

                            setShowProfileMenu(false);
                        }}
                        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        aria-label="Notifications"
                        title="Notifications"
                    >

                        {/* Bell Icon */}

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="w-5 h-5 text-slate-600"
                        >

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.857 17.082a23.848 23.848 0 0 1-5.714 0m5.714 0a3 3 0 0 0 1.286-2.598V11a5.143 5.143 0 0 0-10.286 0v3.484a3 3 0 0 0 1.286 2.598m7.714 0a3 3 0 0 1-5.714 0m5.714 0H6.857"
                            />

                        </svg>


                        {/* Notification Dot */}

                        {!notificationRead && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}

                    </button>


                    {/* ==================================
                        NOTIFICATION DROPDOWN
                    ================================== */}

                    {showNotifications && (

                        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">

                            {/* HEADER */}

                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                                <div>

                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Notifications
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-1">
                                        CareerPilot updates
                                    </p>

                                </div>


                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        notificationRead
                                            ? "bg-slate-100 text-slate-500"
                                            : "bg-blue-50 text-blue-600"
                                    }`}
                                >
                                    {notificationRead ? "0" : "1"}
                                </span>

                            </div>


                            {/* ==================================
                                NOTIFICATION CONTENT
                            ================================== */}

                            {!notificationRead ? (

                                <div className="px-5 py-4 hover:bg-slate-50 transition">

                                    <div className="flex gap-3">

                                        {/* NOTIFICATION ICON */}

                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.8"
                                                stroke="currentColor"
                                                className="w-5 h-5 text-blue-600"
                                            >

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.813 15.904 9 18l-.813-2.096a4.5 4.5 0 0 0-2.49-2.49L3.6 12.6l2.097-.813a4.5 4.5 0 0 0 2.49-2.49l.813-2.097.813 2.097a4.5 4.5 0 0 0 2.49 2.49l2.097.813-2.097.813a4.5 4.5 0 0 0-2.49 2.49Z"
                                                />

                                            </svg>

                                        </div>


                                        {/* NOTIFICATION TEXT */}

                                        <div>

                                            <p className="text-sm font-medium text-slate-800">
                                                AI Career Engine is ready
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1 leading-5">
                                                Analyze your resume and discover your career opportunities.
                                            </p>

                                            <p className="text-[11px] text-slate-400 mt-2">
                                                CareerPilot AI
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            ) : (

                                /* ==================================
                                    ALL CAUGHT UP
                                ================================== */

                                <div className="px-5 py-8 text-center">

                                    <div className="w-10 h-10 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            className="w-5 h-5 text-green-500"
                                        >

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m5 12 4 4L19 6"
                                            />

                                        </svg>

                                    </div>

                                    <p className="text-sm font-semibold text-slate-700">
                                        All caught up
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        You have no new notifications.
                                    </p>

                                </div>

                            )}


                            {/* ==================================
                                MARK AS VIEWED
                            ================================== */}

                            {!notificationRead && (

                                <div className="px-5 py-3 border-t border-slate-100">

                                    <button
                                        onClick={handleMarkAsViewed}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                                    >
                                        Mark as viewed
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* ==================================
                    USER PROFILE
                ================================== */}

                <div
                    className="relative flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l border-slate-200"
                    ref={profileRef}
                >

                    <button
                        onClick={() => {
                            setShowProfileMenu(
                                !showProfileMenu
                            );

                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-2 sm:gap-3 rounded-xl px-1.5 sm:px-2 py-1.5 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        aria-label="User profile"
                        title="Profile"
                    >

                        {/* AVATAR */}

                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">

                            {username
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        {/* USER INFORMATION */}

                        <div className="hidden sm:block text-left">

                            <p className="text-sm font-semibold text-slate-800 max-w-32 truncate">
                                {username}
                            </p>

                            <p className="text-xs text-slate-500">
                                Job Seeker
                            </p>

                        </div>


                        {/* DROPDOWN ARROW */}

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="w-4 h-4 text-slate-400 hidden sm:block"
                        >

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />

                        </svg>

                    </button>


                    {/* ==================================
                        PROFILE DROPDOWN
                    ================================== */}

                    {showProfileMenu && (

                        <div className="absolute right-0 top-12 sm:top-14 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">

                            {/* USER INFO */}

                            <div className="px-4 py-4 border-b border-slate-100">

                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {username}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    Job Seeker
                                </p>

                            </div>


                            {/* MY PROFILE */}

                            <button
                                onClick={handleProfile}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition"
                            >

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.8"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.8 0-5.44-.608-7.5-1.632Z"
                                    />

                                </svg>

                                <span>
                                    My Profile
                                </span>

                            </button>


                            {/* LOGOUT */}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition border-t border-slate-100"
                            >

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.8"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-6-3 3m0 0-3-3m3 3H9"
                                    />

                                </svg>

                                <span>
                                    Logout
                                </span>

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Navbar;