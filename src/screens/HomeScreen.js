/**
 * Home Screen (Web Version)
 * Main landing screen with primary actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBook, IoCamera, IoTrophy, IoTime, IoStar, IoFlame, IoBulb, IoToday } from 'react-icons/io5';
import { getTimeBasedGreeting } from '../utils/helpers';
import { DatabaseService, AuthService } from '../services/firebase';
import './HomeScreen.css';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [streak, setStreak] = useState(0);
  const [todayProgress, setTodayProgress] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const userData = await DatabaseService.getUserData(user.userId || user.uid);
        if (userData.success) {
          setUserName(userData.data.displayName || 'User');
          setStreak(userData.data.progress?.streak || 0);
          setTodayProgress(userData.data.progress?.todayProgress || 0);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <div className="home-screen">
      {/* Header */}
      <div className="home-header">
        <div>
          <div className="greeting">{getTimeBasedGreeting()},</div>
          <div className="user-name">{userName}! 👋</div>
        </div>
        {streak > 0 && (
          <div className="streak-badge">
            <IoFlame size={20} color="#FFA500" />
            <span className="streak-text">{streak}</span>
          </div>
        )}
      </div>

      {/* Progress Card */}
      <div className="progress-card">
        <div className="progress-header">
          <IoToday size={24} color="#4A90E2" />
          <span className="progress-title">Today's Progress</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-background">
            <div 
              className="progress-bar-fill"
              style={{ width: `${Math.min(todayProgress, 100)}%` }}
            />
          </div>
          <span className="progress-text">{todayProgress}%</span>
        </div>
        <div className="progress-subtext">
          {todayProgress >= 100
            ? "Great job! You've completed today's goal! 🎉"
            : 'Keep going! Complete more lessons to reach your daily goal.'}
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards-container">
        <div className="action-card primary-card" onClick={() => navigate('/learn')}>
          <div className="card-gradient">
            <div className="card-icon-container">
              <IoBook size={48} color="#fff" />
            </div>
            <h2 className="card-title">Learn Sign Language</h2>
            <p className="card-description">
              Start learning with interactive lessons and tutorials
            </p>
            <div className="card-arrow">→</div>
          </div>
        </div>

        <div className="action-card secondary-card" onClick={() => navigate('/camera')}>
          <div className="card-gradient">
            <div className="card-icon-container">
              <IoCamera size={48} color="#fff" />
            </div>
            <h2 className="card-title">Practice with Camera</h2>
            <p className="card-description">
              Use AI to practice signs in real-time with instant feedback
            </p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-section">
        <h3 className="section-title">Your Stats</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <IoTrophy size={32} color="#FFA500" />
            <div className="stat-value">0</div>
            <div className="stat-label">Lessons Completed</div>
          </div>
          <div className="stat-card">
            <IoTime size={32} color="#4A90E2" />
            <div className="stat-value">0m</div>
            <div className="stat-label">Total Practice Time</div>
          </div>
          <div className="stat-card">
            <IoStar size={32} color="#50C878" />
            <div className="stat-value">0</div>
            <div className="stat-label">Stars Earned</div>
          </div>
        </div>
      </div>

      {/* Tip Card */}
      <div className="tip-container">
        <div className="tip-card">
          <IoBulb size={24} color="#FFA500" />
          <div className="tip-content">
            <div className="tip-title">Daily Practice Tip</div>
            <div className="tip-text">
              Practice for at least 10 minutes daily to build muscle memory and retain what you learn!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
