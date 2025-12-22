import React from 'react';
import { IoTrophy, IoFlame, IoCalendar } from 'react-icons/io5';
import './ProgressScreen.css';

const ProgressScreen = () => {
  return (
    <div className="progress-screen">
      <h1>My Progress</h1>

      <div className="stats-container">
        <div className="stat-card">
          <IoTrophy size={40} color="#FFA500" />
          <div className="stat-value">0</div>
          <div className="stat-label">Completed Lessons</div>
        </div>
        <div className="stat-card">
          <IoFlame size={40} color="#EF4444" />
          <div className="stat-value">0</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      <div className="section">
        <h2>Learning Progress</h2>
        <div className="progress-item">
          <span>Overall Progress</span>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '0%' }} />
          </div>
          <span className="progress-text">0%</span>
        </div>
      </div>

      <div className="section">
        <h2>Recent Activity</h2>
        <div className="empty-state">
          <IoCalendar size={48} color="#9CA3AF" />
          <p>No activity yet</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
