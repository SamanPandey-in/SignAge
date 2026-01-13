import React, { useState, useEffect } from 'react';
import { IoTrophy, IoFlame, IoCalendar, IoStar, IoTime } from 'react-icons/io5';
import { DatabaseService, AuthService } from '../services/firebase';
import { LESSONS } from '../constants/lessons';
import './ProgressScreen.css';

const ProgressScreen = () => {
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    streak: 0,
    totalStars: 0,
    totalPracticeTime: 0,
    completedLessons: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const statsResult = await DatabaseService.getUserStats(user.uid);
        const lessonsResult = await DatabaseService.getCompletedLessons(user.uid);

        if (statsResult.success) {
          setStats({
            lessonsCompleted: statsResult.stats.lessonsCompleted || 0,
            streak: statsResult.stats.streak || 0,
            totalStars: statsResult.stats.totalStars || 0,
            totalPracticeTime: statsResult.stats.totalPracticeTime || 0,
            completedLessons: lessonsResult.success ? lessonsResult.lessons : [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalLessons = LESSONS.length;
  const progressPercent = totalLessons > 0
    ? Math.round((stats.lessonsCompleted / totalLessons) * 100)
    : 0;

  if (loading) {
    return (
      <div className="progress-screen">
        <h1>My Progress</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="progress-screen">
      <h1>My Progress</h1>

      <div className="stats-container">
        <div className="stat-card">
          <IoTrophy size={40} color="#FFA500" />
          <div className="stat-value">{stats.lessonsCompleted}</div>
          <div className="stat-label">Completed Lessons</div>
        </div>
        <div className="stat-card">
          <IoFlame size={40} color="#EF4444" />
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <IoStar size={40} color="#50C878" />
          <div className="stat-value">{stats.totalStars}</div>
          <div className="stat-label">Stars Earned</div>
        </div>
        <div className="stat-card">
          <IoTime size={40} color="#4A90E2" />
          <div className="stat-value">{stats.totalPracticeTime}m</div>
          <div className="stat-label">Practice Time</div>
        </div>
      </div>

      <div className="section">
        <h2>Learning Progress</h2>
        <div className="progress-item">
          <span>Overall Progress</span>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="progress-text">{progressPercent}%</span>
        </div>
        <p className="progress-detail">
          {stats.lessonsCompleted} of {totalLessons} lessons completed
        </p>
      </div>

      <div className="section">
        <h2>Recent Activity</h2>
        {stats.completedLessons.length > 0 ? (
          <div className="activity-list">
            {stats.completedLessons.slice(-5).reverse().map((lessonId) => {
              const lesson = LESSONS.find(l => l.id === lessonId);
              return (
                <div key={lessonId} className="activity-item">
                  <IoTrophy size={20} color="#10B981" />
                  <span>Completed: {lesson?.title || lessonId}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <IoCalendar size={48} color="#9CA3AF" />
            <p>No activity yet. Start learning to see your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressScreen;
