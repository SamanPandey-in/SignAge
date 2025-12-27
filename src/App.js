/**
 * SignAge Web App
 * Main application component with React Router
 */

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navigation from "./navigation/Navigation";
import HomeScreen from "./screens/HomeScreen";
import LearnScreen from "./screens/LearnScreen";
import LessonDetailScreen from "./screens/LessonDetailScreen";
import LessonContentScreen from "./screens/LessonContentScreen";
import CameraScreen from "./screens/CameraScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ProgressScreen from "./screens/ProgressScreen";
import LoginScreen from "./screens/LoginScreen";

import { AuthService } from "./services/firebase";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ⏳ Loading screen
  if (isLoading) {
    return (
      <div className="loading-container">
        <h1 className="app-name">SignAge</h1>
        <p className="tagline">Learn Sign Language with AI</p>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navigation />

        <div className="app-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/profile" />} />

            {/* Protected routes */}
            <Route
              path="/learn"
              element={user ? <LearnScreen /> : <Navigate to="/login" />}
            />
            <Route
              path="/learn/:lessonId"
              element={user ? <LessonDetailScreen /> : <Navigate to="/login" />}
            />
            <Route
              path="/lesson/:lessonId"
              element={user ? <LessonContentScreen /> : <Navigate to="/login" />}
            />
            <Route
              path="/camera"
              element={user ? <CameraScreen /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user ? <ProfileScreen /> : <Navigate to="/login" />}
            />
            <Route
              path="/progress"
              element={user ? <ProgressScreen /> : <Navigate to="/login" />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
