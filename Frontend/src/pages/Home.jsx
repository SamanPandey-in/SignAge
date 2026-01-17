/**
 * Home Page
 * Main dashboard for authenticated users
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useProgress } from '@hooks/useProgress';
import { DatabaseService, AuthService } from '@services/firebase';
import { getTimeBasedGreeting } from '@utils/helpers';
import { ROUTES } from '@constants/routes';
import {
  IoBook,
  IoCamera,
  IoTrophy,
  IoTime,
  IoStar,
  IoFlame,
  IoBulb,
  IoToday,
} from 'react-icons/io5';
import Button from '@components/common/Button';

const Home = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('User');
  const [streak, setStreak] = useState(0);
  const [todayProgress, setTodayProgress] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const fetchLessons = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const res = await fetch('http://localhost:5001/lessons', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('📚 LESSONS FROM BACKEND:', data);
    } catch (error) {
      console.error('❌ Error fetching lessons:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange(async (currentUser) => {
      if (currentUser) {
        await loadUserData(currentUser);
        await fetchLessons();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (currentUser) => {
    try {
      const userData = await DatabaseService.getUserData(currentUser.uid);
      if (userData.success && userData.data) {
        setUserName(userData.data.displayName || 'User');
        setStreak(userData.data.progress?.streak || 0);
        setTodayProgress(userData.data.progress?.todayProgress || 0);
      }

      const statsResult = await DatabaseService.getUserStats(currentUser.uid);
      if (statsResult.success && statsResult.stats) {
        setLessonsCompleted(statsResult.stats.lessonsCompleted || 0);
        setTotalPracticeTime(statsResult.stats.totalPracticeTime || 0);
        setTotalStars(statsResult.stats.totalStars || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const statCards = [
    { icon: IoTrophy, value: lessonsCompleted, label: 'Lessons Completed', color: 'warning' },
    { icon: IoTime, value: `${totalPracticeTime}m`, label: 'Practice Time', color: 'primary' },
    { icon: IoStar, value: totalStars, label: 'Stars Earned', color: 'success' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getTimeBasedGreeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Ready to continue learning?</p>
        </div>

        {streak > 0 && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-warning-500 to-danger-500 text-white px-4 py-2 rounded-full shadow-medium">
            <IoFlame className="text-2xl" />
            <span className="font-bold text-lg">{streak} day streak!</span>
          </div>
        )}
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <IoToday className="text-2xl text-primary-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Today's Progress</h2>
            <p className="text-gray-600 text-sm">Keep learning to reach your daily goal</p>
          </div>
        </div>

        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-500"
            style={{ width: `${Math.min(todayProgress, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{todayProgress}% Complete</span>
          {todayProgress >= 100 && (
            <span className="text-sm text-success-500 font-medium">🎉 Goal reached!</span>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div
          onClick={() => navigate(ROUTES.LEARN)}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white cursor-pointer hover:shadow-large transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <IoBook className="text-5xl" />
            <span className="text-6xl opacity-20">→</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Learn Sign Language</h2>
          <p className="opacity-90">Start with interactive lessons and tutorials</p>
        </div>

        <div
          onClick={() => navigate(ROUTES.CAMERA)}
          className="bg-gradient-to-br from-success-500 to-success-600 rounded-2xl p-8 text-white cursor-pointer hover:shadow-large transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <IoCamera className="text-5xl" />
            <span className="text-6xl opacity-20">→</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Practice with Camera</h2>
          <p className="opacity-90">Use AI to practice signs with instant feedback</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          {statCards.map(({ icon: Icon, value, label, color }, index) => (
            <div key={index} className="bg-white rounded-xl shadow-soft p-6 text-center">
              <Icon className={`text-4xl text-${color}-500 mx-auto mb-3`} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className="mt-8 bg-gradient-to-r from-warning-50 to-warning-100 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <IoBulb className="text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Practice Tip</h3>
            <p className="text-gray-700">
              Practice for at least 10 minutes daily to build muscle memory and retain what you learn!
              Consistency is key to mastering sign language.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
