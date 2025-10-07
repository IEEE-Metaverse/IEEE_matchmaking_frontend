import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ResearcherRecommendation from './pages/ResearcherRecommendation';
import SessionRecommendation from './pages/SessionRecommendation';
import LoginSignup from './pages/LoginSignup';
import Questionnaire from './pages/Questionnaire';
import ForgotPasswordEmail from './pages/ForgotPasswordEmail';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  // Check localStorage for existing answers
  useEffect(() => {
    const answers = JSON.parse(localStorage.getItem("userAnswers"));
    if (answers && answers.length > 0) setHasCompletedQuestionnaire(true);
  }, []);

  return (
    <Router>
      <Navbar userLoggedIn={userLoggedIn} hasCompletedQuestionnaire={hasCompletedQuestionnaire} />
      <Routes>
        {!userLoggedIn && (
          <>
            {/* Login / Signup */}
            <Route
              path="/"
              element={<LoginSignup onSuccess={() => setUserLoggedIn(true)} />}
            />
            {/* Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
            {/* Reset Password */}
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Redirect unknown paths to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {userLoggedIn && (
          <>
            {/* Redirect root to questionnaire */}
            <Route path="/" element={<Navigate to="/questionnaire" replace />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/researchers" element={<ResearcherRecommendation />} />
            <Route path="/sessions" element={<SessionRecommendation />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
