/**
 * SignAge Web App
 * Main application component with React Router
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './navigation/Navigation';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import LessonContentScreen from './screens/LessonContentScreen';
import CameraScreen from './screens/CameraScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProgressScreen from './screens/ProgressScreen';
import { AuthService, isFirebaseReady } from './services/firebase';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing SignAge Web App...');

      const firebaseConfigured = isFirebaseReady();
      if (firebaseConfigured) {
        console.log('✅ Firebase is configured');
      } else {
        console.log('⚠️ Firebase not configured - Using local mock data');
      }

      const result = await AuthService.signInAnonymously();
      
      if (result.success) {
        console.log('✅ User authenticated');
        setIsAuthenticated(true);
      } else {
        console.log('❌ Authentication failed:', result.error);
        setIsAuthenticated(true); // Continue anyway
      }
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      setIsAuthenticated(true); // Continue anyway
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

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
            <Route path="/" element={<HomeScreen />} />
            <Route path="/learn" element={<LearnScreen />} />
            <Route path="/learn/:lessonId" element={<LessonDetailScreen />} />
            <Route path="/lesson/:lessonId" element={<LessonContentScreen />} />
            <Route path="/camera" element={<CameraScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
