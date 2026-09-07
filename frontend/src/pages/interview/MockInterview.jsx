import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

function CareerPilotLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30 shrink-0">
                <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z"
                    />
                </svg>
            </div>

            <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    CareerPilot
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-400">
                    AI Career Intelligence
                </p>
            </div>
        </div>
    );
}

function MockInterview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const jobIdFromUrl = searchParams.get("job");

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");

    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    const [answer, setAnswer] = useState("");
    const [evaluation, setEvaluation] = useState(null);

    const [loadingJobs, setLoadingJobs] = useState(true);
    const [startingInterview, setStartingInterview] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [interviewSeconds, setInterviewSeconds] = useState(0);

    const [error, setError] = useState("");
    const [completed, setCompleted] = useState(false);

    const recognitionRef = useRef(null);

    /* =========================
       LOAD JOBS
    ========================= */

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoadingJobs(true);
            setError("");

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

            if (jobIdFromUrl) {
                const exists = jobData.some(
                    (job) => String(job.id) === String(jobIdFromUrl)
                );

                if (exists) {
                    setSelectedJob(String(jobIdFromUrl));
                }
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load your saved jobs."
            );
        } finally {
            setLoadingJobs(false);
        }
    };

    /* =========================
       TIMER
    ========================= */

    useEffect(() => {
        if (!session || completed) return;

        const timer = setInterval(() => {
            setInterviewSeconds((previous) => previous + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [session, completed]);

    /* =========================
       CLEANUP
    ========================= */

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();

            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    /* =========================
       HELPERS
    ========================= */

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const targetJob = jobs.find(
        (job) => String(job.id) === String(selectedJob)
    );

    /* =========================
       SPEAK QUESTION
    ========================= */

    const speakQuestion = (questionText) => {
        if (!questionText || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(questionText);

        utterance.lang = "en-IN";
        utterance.rate = 0.95;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    /* =========================
       START INTERVIEW
    ========================= */

    const startInterview = async () => {
        if (!selectedJob) {
            setError("Please select a job first.");
            return;
        }

        try {
            setStartingInterview(true);
            setError("");
            setAnswer("");
            setEvaluation(null);
            setInterviewSeconds(0);
            setCompleted(false);

            const response = await api.post(
                `/jobs/${selectedJob}/mock-interview/start/`
            );

            const newSession = response.data.session;
            const newQuestions = response.data.questions || [];

            setSession(newSession);
            setQuestions(newQuestions);

            if (newQuestions.length > 0) {
                setCurrentQuestion(newQuestions[0]);

                setTimeout(() => {
                    speakQuestion(newQuestions[0].question);
                }, 500);
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Unable to start the mock interview."
            );
        } finally {
            setStartingInterview(false);
        }
    };

    /* =========================
       VOICE INPUT
    ========================= */

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError(
                "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
            );
            return;
        }

        if (isListening) return;

        setError("");

        const recognition = new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;

        let finalTranscript = answer;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const transcript =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript + " ";
                } else {
                    interimTranscript += transcript;
                }
            }

            setAnswer(
                (finalTranscript + interimTranscript).trim()
            );
        };

        recognition.onerror = (event) => {
            setIsListening(false);

            if (event.error === "not-allowed") {
                setError(
                    "Microphone permission was denied. Please allow microphone access."
                );
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        setIsListening(false);
    };

    /* =========================
       SUBMIT ANSWER
    ========================= */

    const submitAnswer = async () => {
        if (!session || !currentQuestion) return;

        if (!answer.trim()) {
            setError("Please give an answer before submitting.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            stopListening();

            window.speechSynthesis?.cancel();
            setIsSpeaking(false);

            const response = await api.post(
                `/jobs/${session.id}/mock-interview/question/${currentQuestion.id}/answer/`,
                {
                    answer: answer.trim(),
                }
            );

            const result =
                response.data.evaluation ||
                response.data.result ||
                response.data;

            setEvaluation(result);

            if (response.data.session) {
                setSession((previous) => ({
                    ...previous,
                    ...response.data.session,
                }));
            }

            const isLastQuestion =
                !response.data.next_question ||
                currentQuestion.question_number >= questions.length;

            if (
                response.data.session?.status === "completed" ||
                isLastQuestion
            ) {
                setQuestions((previous) =>
                    previous.map((question) =>
                        question.id === currentQuestion.id
                            ? {
                                  ...question,
                                  user_answer: answer.trim(),
                                  score: result.score || 0,
                                  feedback: result.feedback || "",
                                  better_answer:
                                      result.better_answer || "",
                              }
                            : question
                    )
                );

                setTimeout(() => {
                    setCompleted(true);
                }, 2500);

                return;
            }

            const nextQuestion = response.data.next_question;

            if (nextQuestion) {
                setTimeout(() => {
                    setQuestions((previous) =>
                        previous.map((question) =>
                            question.id === currentQuestion.id
                                ? {
                                      ...question,
                                      user_answer: answer.trim(),
                                      score: result.score || 0,
                                      feedback:
                                          result.feedback || "",
                                      better_answer:
                                          result.better_answer || "",
                                  }
                                : question
                        )
                    );

                    setCurrentQuestion(nextQuestion);
                    setAnswer("");
                    setEvaluation(null);

                    setTimeout(() => {
                        speakQuestion(nextQuestion.question);
                    }, 300);
                }, 2500);
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Unable to evaluate your answer."
            );
        } finally {
            setSubmitting(false);
        }
    };

    /* =========================
       EXIT
    ========================= */

    const exitInterview = () => {
        stopListening();

        window.speechSynthesis?.cancel();

        setIsSpeaking(false);

        navigate("/interview");
    };

    /* =====================================================
       START SCREEN
    ===================================================== */

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50">
                <header className="h-16 sm:h-20 bg-slate-950 border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
                        <CareerPilotLogo />

                        <button
                            onClick={() => navigate("/interview")}
                            className="text-xs sm:text-sm text-slate-400 hover:text-white transition whitespace-nowrap"
                        >
                            ← <span className="hidden xs:inline">Back to </span>
                            Interview Prep
                        </button>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10 lg:py-12">
                    <div className="grid lg:grid-cols-2 gap-7 sm:gap-9 lg:gap-10 items-center">
                        {/* LEFT */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] sm:text-xs font-semibold mb-4 sm:mb-5">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500" />
                                AI INTERVIEW SIMULATOR
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                                Practice your interview with{" "}
                                <span className="text-indigo-600">
                                    AI.
                                </span>
                            </h1>

                            <p className="mt-4 sm:mt-5 text-slate-500 text-sm sm:text-base lg:text-lg leading-7 lg:leading-8 max-w-xl">
                                Experience a realistic interview based
                                on your resume and target job. Speak
                                naturally and get instant AI feedback.
                            </p>

                            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                                <Feature
                                    icon="🎙️"
                                    title="Voice-based answers"
                                    text="Speak naturally using your microphone."
                                />

                                <Feature
                                    icon="🤖"
                                    title="Gemini AI evaluation"
                                    text="Receive feedback after every answer."
                                />

                                <Feature
                                    icon="📊"
                                    title="Performance score"
                                    text="Understand your interview performance."
                                />
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-6 lg:p-7">
                            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-lg shrink-0">
                                    ✦
                                </div>

                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                        Start Mock Interview
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Choose your target position.
                                    </p>
                                </div>
                            </div>

                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                                Target Job
                            </label>

                            <select
                                value={selectedJob}
                                onChange={(e) =>
                                    setSelectedJob(e.target.value)
                                }
                                disabled={loadingJobs}
                                className="w-full px-3 sm:px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm sm:text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">
                                    {loadingJobs
                                        ? "Loading jobs..."
                                        : "Select a saved job"}
                                </option>

                                {jobs.map((job) => (
                                    <option
                                        key={job.id}
                                        value={job.id}
                                    >
                                        {job.title}
                                        {job.company
                                            ? ` — ${job.company}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {selectedJob && (
                                <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-[10px] sm:text-xs text-indigo-500 font-semibold uppercase tracking-wide">
                                        Interview Target
                                    </p>

                                    <p className="text-sm sm:text-base font-bold text-indigo-900 mt-1">
                                        {targetJob?.title}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100 text-xs sm:text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={startInterview}
                                disabled={
                                    startingInterview ||
                                    !selectedJob
                                }
                                className="w-full mt-5 sm:mt-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {startingInterview
                                    ? "Preparing Interview..."
                                    : "🎤 Start Voice AI Interview →"}
                            </button>

                            <p className="text-[10px] sm:text-xs text-center text-slate-400 mt-3 sm:mt-4">
                                Recommended: use headphones and allow
                                microphone access.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       COMPLETED SCREEN
    ===================================================== */

    if (completed) {
        const finalScore =
            session?.final_score ||
            Math.round(
                questions.reduce(
                    (total, question) =>
                        total + (question.score || 0),
                    0
                ) / Math.max(questions.length, 1)
            );

        const practiceAgain = () => {
            setSession(null);
            setCurrentQuestion(null);
            setQuestions([]);
            setAnswer("");
            setEvaluation(null);
            setCompleted(false);
            setInterviewSeconds(0);
        };

        return (
            <div className="min-h-screen bg-slate-50">
                <header className="h-16 sm:h-20 bg-slate-950 border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                        <CareerPilotLogo />

                        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] sm:text-xs font-semibold">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                            <span className="hidden xs:inline">
                                Interview Completed
                            </span>
                            <span className="xs:hidden">
                                Completed
                            </span>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-7 sm:py-10 lg:py-12">
                    <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto text-3xl sm:text-4xl">
                            🎉
                        </div>

                        <p className="text-xs sm:text-sm text-indigo-600 font-semibold uppercase tracking-wider mt-5 sm:mt-6">
                            Interview Complete
                        </p>

                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                            Great Work!
                        </h1>

                        <p className="text-sm text-slate-500 mt-2 sm:mt-3">
                            Here's your CareerPilot AI performance
                            report.
                        </p>
                    </div>

                    <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="text-center">
                            <p className="text-xs sm:text-sm text-slate-500">
                                Overall Score
                            </p>

                            <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-indigo-600 mt-1">
                                {finalScore}
                            </div>

                            <p className="text-xs sm:text-sm text-slate-400">
                                out of 100
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 sm:mt-8">
                            <ScoreCard
                                value={session?.technical_score || 0}
                                label="Technical"
                            />

                            <ScoreCard
                                value={
                                    session?.communication_score || 0
                                }
                                label="Communication"
                            />

                            <ScoreCard
                                value={
                                    session?.relevance_score || 0
                                }
                                label="Relevance"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <InfoCard
                                label="Questions Answered"
                                value={questions.length}
                            />

                            <InfoCard
                                label="Interview Duration"
                                value={formatTime(interviewSeconds)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                            <button
                                onClick={practiceAgain}
                                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                            >
                                🔄 Practice Again
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/interview")
                                }
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                            >
                                ← Interview Preparation
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       ACTIVE INTERVIEW
    ===================================================== */

    const currentNumber =
        currentQuestion?.question_number ||
        session?.current_question ||
        1;

    const totalQuestions =
        session?.total_questions ||
        questions.length ||
        5;

    const progress = Math.min(
        (currentNumber / totalQuestions) * 100,
        100
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="bg-slate-950 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <CareerPilotLogo />

                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-semibold text-red-400">
                                Interview Live
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
                            <span className="text-sm">⏱</span>
                            <span className="font-mono text-xs sm:text-sm font-semibold">
                                {formatTime(interviewSeconds)}
                            </span>
                        </div>

                        <button
                            onClick={exitInterview}
                            className="text-xs sm:text-sm text-slate-400 hover:text-white transition"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </header>

            {/* PROGRESS */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-600">
                                Question {currentNumber} of{" "}
                                {totalQuestions}
                            </span>

                            <span className="hidden sm:inline text-slate-300">
                                •
                            </span>

                            <span className="hidden sm:inline text-xs text-slate-400">
                                AI Interview
                            </span>
                        </div>

                        <span className="text-[10px] sm:text-xs font-semibold text-indigo-600">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <main className="flex-1">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 lg:py-8">
                    {/* TARGET */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6 gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                Interviewing For
                            </p>

                            <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                                {targetJob?.title || "Target Role"}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <p className="hidden sm:block text-xs text-slate-400">
                                Powered by
                            </p>

                            <p className="text-xs sm:text-sm font-semibold text-slate-700">
                                CareerPilot AI
                            </p>
                        </div>
                    </div>

                    {/* QUESTION + ANSWER */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* QUESTION */}
                        <div className="p-4 sm:p-6 lg:p-7 border-b border-slate-100">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base sm:text-xl shrink-0 shadow-md">
                                    ✦
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600">
                                                AI Interviewer
                                            </p>

                                            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                                                CareerPilot AI
                                            </p>
                                        </div>

                                        {isSpeaking && (
                                            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 text-indigo-600 shrink-0">
                                                <span className="flex items-end gap-0.5 h-4">
                                                    <span className="w-0.5 sm:w-1 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                                    <span className="w-0.5 sm:w-1 h-4 bg-indigo-500 rounded-full animate-pulse" />
                                                    <span className="w-0.5 sm:w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
                                                    <span className="w-0.5 sm:w-1 h-5 bg-indigo-500 rounded-full animate-pulse" />
                                                </span>

                                                <span className="hidden sm:inline text-xs font-medium">
                                                    Speaking
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed mt-4 sm:mt-6">
                                        {currentQuestion?.question}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* ANSWER */}
                        <div className="p-4 sm:p-6 lg:p-7 bg-slate-50/70">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs sm:text-sm font-bold text-slate-700">
                                    Your Response
                                </label>

                                {isListening && (
                                    <div className="flex items-center gap-1.5 text-red-500">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] sm:text-xs font-semibold">
                                            Recording
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`bg-white rounded-xl sm:rounded-2xl border transition-all ${
                                    isListening
                                        ? "border-indigo-400 ring-4 ring-indigo-50"
                                        : "border-slate-200"
                                }`}
                            >
                                <textarea
                                    value={answer}
                                    onChange={(e) =>
                                        setAnswer(e.target.value)
                                    }
                                    rows={6}
                                    placeholder="Speak your answer or type it here..."
                                    className="w-full resize-none rounded-xl sm:rounded-2xl p-4 text-sm text-slate-700 placeholder-slate-400 leading-6 sm:leading-7 outline-none bg-transparent"
                                />

                                <div className="px-4 pb-3 flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs text-slate-400">
                                        {answer.length} characters
                                    </span>

                                    {isListening && (
                                        <div className="flex items-center gap-1 h-5">
                                            <span className="w-1 h-2 bg-red-400 rounded-full animate-pulse" />
                                            <span className="w-1 h-4 bg-red-400 rounded-full animate-pulse" />
                                            <span className="w-1 h-6 bg-red-400 rounded-full animate-pulse" />
                                            <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" />
                                            <span className="w-1 h-5 bg-red-400 rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CONTROLS */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-3 sm:mt-4">
                                {!isListening ? (
                                    <button
                                        onClick={startListening}
                                        disabled={submitting}
                                        className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl border border-indigo-200 bg-white text-indigo-600 font-semibold text-xs sm:text-sm hover:bg-indigo-50 transition disabled:opacity-50"
                                    >
                                        <span className="text-base sm:text-lg">
                                            🎙️
                                        </span>
                                        Start Recording
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopListening}
                                        className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-red-500 text-white font-semibold text-xs sm:text-sm hover:bg-red-600 transition"
                                    >
                                        <span>⏹</span>
                                        Stop Recording
                                    </button>
                                )}

                                <button
                                    onClick={submitAnswer}
                                    disabled={
                                        submitting ||
                                        !answer.trim()
                                    }
                                    className="sm:ml-auto flex items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {submitting
                                        ? "🤖 AI Evaluating..."
                                        : currentNumber ===
                                          totalQuestions
                                        ? "Submit Final Answer →"
                                        : "Submit Answer →"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI FEEDBACK */}
                    {evaluation && (
                        <div className="mt-5 sm:mt-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600">
                                        AI Feedback
                                    </p>

                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                                        Here's how you performed
                                    </h3>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <span className="text-lg sm:text-xl font-bold text-indigo-600">
                                            {evaluation.score || 0}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] sm:text-xs text-slate-400">
                                            Answer Score
                                        </p>

                                        <p className="text-xs sm:text-sm font-semibold text-slate-700">
                                            / 100
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-5">
                                <FeedbackScore
                                    label="Communication"
                                    value={
                                        evaluation.communication_score ||
                                        0
                                    }
                                />

                                <FeedbackScore
                                    label="Technical"
                                    value={
                                        evaluation.technical_score ||
                                        0
                                    }
                                />

                                <FeedbackScore
                                    label="Relevance"
                                    value={
                                        evaluation.relevance_score ||
                                        0
                                    }
                                />
                            </div>

                            {evaluation.feedback && (
                                <div className="mt-4 p-4 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-xs sm:text-sm font-bold text-indigo-900 mb-2">
                                        💡 Feedback
                                    </p>

                                    <p className="text-xs sm:text-sm text-indigo-800 leading-6 sm:leading-7">
                                        {evaluation.feedback}
                                    </p>
                                </div>
                            )}

                            {evaluation.better_answer && (
                                <div className="mt-3 p-4 rounded-xl sm:rounded-2xl bg-green-50 border border-green-100">
                                    <p className="text-xs sm:text-sm font-bold text-green-900 mb-2">
                                        ✨ Better Answer Approach
                                    </p>

                                    <p className="text-xs sm:text-sm text-green-800 leading-6 sm:leading-7">
                                        {evaluation.better_answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ERROR */}
                    {error && (
                        <div className="mt-4 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100 text-xs sm:text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-1.5 sm:gap-0 items-center justify-between">
                    <p className="text-[10px] sm:text-xs text-slate-400">
                        CareerPilot AI • Voice Interview Practice
                    </p>

                    <p className="text-[10px] sm:text-xs text-slate-400">
                        Your answers are evaluated by AI
                    </p>
                </div>
            </footer>
        </div>
    );
}

/* =========================
   SMALL COMPONENTS
========================= */

function Feature({ icon, title, text }) {
    return (
        <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-base sm:text-lg shrink-0">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                    {title}
                </p>

                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {text}
                </p>
            </div>
        </div>
    );
}

function ScoreCard({ value, label }) {
    return (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 text-center">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {value}
            </p>

            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                {label}
            </p>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50">
            <p className="text-[10px] sm:text-xs text-slate-400">
                {label}
            </p>

            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {value}
            </p>
        </div>
    );
}

function FeedbackScore({ label, value }) {
    return (
        <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] sm:text-xs text-slate-400">
                {label}
            </p>

            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {value}
            </p>
        </div>
    );
}

export default MockInterview;