import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CareerPilotLogo from "./CareerPilotLogo";

function Sidebar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        {
            name: "Dashboard",
            path: "/",
            icon: (
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
                        d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"
                    />
                </svg>
            ),
        },
        {
            name: "Resume Analysis",
            path: "/resume",
            icon: (
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
                        d="M19.5 14.25v-8.25A2.25 2.25 0 0017.25 3.75h-10.5A2.25 2.25 0 004.5 6v12A2.25 2.25 0 006.75 20.25h6.75M14.25 17.25h6m-3-3v6"
                    />
                </svg>
            ),
        },
        {
            name: "Job Matching",
            path: "/jobs",
            icon: (
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
                        d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                    />
                </svg>
            ),
        },
        {
            name: "My Jobs",
            path: "/my-jobs",
            icon: (
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
                        d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V14.15m16.5 0-8.25 4.5-8.25-4.5m16.5 0V9.777a2.25 2.25 0 00-1.08-1.93l-7.17-4.25a2.25 2.25 0 00-2.29 0l-7.17 4.25a2.25 2.25 0 00-1.08 1.93v4.373"
                    />
                </svg>
            ),
        },
        {
            name: "Interview Prep",
            path: "/interview",
            icon: (
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
                        d="M12 18.75a6.75 6.75 0 006.75-6.75V8.25a6.75 6.75 0 00-13.5 0V12A6.75 6.75 0 0012 18.75zm0 0v3m-3 0h6M9.75 8.25v3m4.5-3v3"
                    />
                </svg>
            ),
        },
        {
            name: "My Profile",
            path: "/profile",
            icon: (
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
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.8 0-5.44-.608-7.5-1.632z"
                    />
                </svg>
            ),
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("careerpilot_notification_read");

        setIsOpen(false);
        navigate("/login");
    };

    const handleMenuClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* ==========================================
                MOBILE MENU BUTTON
            ========================================== */}

            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition"
                aria-label="Open menu"
                title="Open menu"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>


            {/* ==========================================
                MOBILE OVERLAY
            ========================================== */}

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-[2px] z-40"
                />
            )}


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className={`
                    fixed left-0 top-0 h-screen w-64
                    bg-slate-950 text-white
                    flex flex-col z-50
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >

                {/* ======================================
                    LOGO
                ====================================== */}

                <div className="px-6 py-5 flex items-center justify-between">

                    <CareerPilotLogo
                        dark={true}
                        showTagline={true}
                    />

                    {/* Mobile close button */}

                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition"
                        aria-label="Close menu"
                        title="Close menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                </div>


                {/* ======================================
                    NAVIGATION
                ====================================== */}

                <nav className="flex-1 px-4 py-6 overflow-y-auto">

                    <div className="space-y-1">

                        {menuItems.map((item) => (

                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                onClick={handleMenuClick}
                                className={({ isActive }) =>
                                    `
                                    flex items-center gap-3
                                    px-4 py-3
                                    rounded-xl
                                    text-sm font-medium
                                    transition-all duration-200
                                    ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }
                                    `
                                }
                            >

                                {item.icon}

                                <span>
                                    {item.name}
                                </span>

                            </NavLink>

                        ))}

                    </div>

                </nav>


                {/* ======================================
                    LOGOUT
                ====================================== */}

                <div className="p-4 border-t border-white/5">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition"
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
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-6-3 3m0 0-3-3m3 3H9"
                            />
                        </svg>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>
        </>
    );
}

export default Sidebar;