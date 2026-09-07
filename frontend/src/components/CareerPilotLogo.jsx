function CareerPilotLogo({ dark = true, showTagline = true }) {
    return (
        <div className="flex items-center gap-3">
            
            {/* LOGO ICON */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                
                <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Main sparkle */}
                    <path
                        d="M12 2.5L14.1 8.9L20.5 11L14.1 13.1L12 19.5L9.9 13.1L3.5 11L9.9 8.9L12 2.5Z"
                        fill="white"
                    />

                    {/* Small sparkle */}
                    <path
                        d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z"
                        fill="white"
                    />
                </svg>

            </div>


            {/* BRAND TEXT */}
            <div>
                
                <h1
                    className={`text-xl font-bold tracking-tight ${
                        dark ? "text-white" : "text-slate-900"
                    }`}
                >
                    CareerPilot
                </h1>

                {showTagline && (
                    <p
                        className={`text-xs ${
                            dark
                                ? "text-slate-400"
                                : "text-slate-500"
                        }`}
                    >
                        AI Career Intelligence
                    </p>
                )}

            </div>

        </div>
    );
}

export default CareerPilotLogo;