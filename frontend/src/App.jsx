import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import ResumeAnalysis from "./pages/resume/ResumeAnalysis";
import JobMatching from "./pages/jobs/JobMatching";
import InterviewPreparation from "./pages/interview/InterviewPreparation";
import Profile from "./pages/profile/Profile";

import ProtectedRoute from "./utils/ProtectedRoute";

import MyJobs from "./pages/jobs/MyJobs";

import MockInterview from "./pages/interview/MockInterview";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ======================================
                    PUBLIC ROUTES
                ====================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ======================================
                    PROTECTED ROUTES
                ====================================== */}

                <Route
                    element={<ProtectedRoute />}
                >

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/resume"
                        element={<ResumeAnalysis />}
                    />

                    <Route
                        path="/jobs"
                        element={<JobMatching />}
                    />

                    <Route
                        path="/interview"
                        element={<InterviewPreparation />}
                    />

                    <Route
                        path="/mock-interview"
                        element={<MockInterview />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />


                    <Route
                        path="/my-jobs"
                        element={<MyJobs />}
                    />

                </Route>


            </Routes>

        </BrowserRouter>
    );
}

export default App;