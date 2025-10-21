import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import HomePage from "./components/auth/pages/HomePage";
import SignupPage from "./components/auth/pages/SignupPage";
import LoginPage from "./components/auth/pages/LoginPage";
import Dashboard from "./components/auth/pages/Dashboard";
import NotFound from "./components/auth/pages/NotFound";
import LandingPage from "./components/auth/pages/LandingPage";
import JoinAndCreateSession from "./components/auth/pages/joinAndCreateSession/JoinAndCreateSession";
import JoinPage from "./components/auth/pages/joinAndCreateSession/joinPage/JoinPage";
import Session from './components/auth/pages/videoSession/Session';
import HostSessionPage from './components/auth/pages/joinAndCreateSession/hostSessionPage/HostSessionPage';
import SessionsOverview from './components/auth/pages/SessionsOverview';
import PrivacySettings from './components/settings/PrivacySettings';
import Forbidden from './components/auth/pages/Forbidden';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/createSession" element={<JoinAndCreateSession />} />            
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/:token" element={<JoinPage />} />
        <Route path="/host" element={<HostSessionPage />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/sessions" 
          element={user ? <SessionsOverview /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings/privacy" 
          element={user ? <PrivacySettings /> : <Navigate to="/login" />} 
        />
        <Route path="/session/:sessionId" element={<Session />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/403" element={<Forbidden />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};

export default App;
