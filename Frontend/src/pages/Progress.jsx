/**
 * Progress Page
 * Detailed statistics and progress tracking
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '@hooks/useProgress';
import { useLessons } from '@hooks/useLessons';
import { ROUTES } from '@constants/routes';
import {
  IoTrophy,
  IoFlame,
  IoStar,
  IoTime,
  IoCalendar,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoBook,
} from 'react-icons/io5';
import Card from '@components/common/Card';
import ProgressBar from '@components/common/ProgressBar';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { LESSONS } from '@constants/lessons';

const Progress = () => {
  const navigate = useNavigate();
  const { 
    streak, 
    todayProgress, 
    totalLessonsCompleted, 
    totalPracticeTime, 
    starsEarned,
    loadProgress 
  } = useProgress();
  const { completedLessons } = useLessons();
  
  const [loading, setLoading] = useState(true);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await loadProgress();
    generateWeeklyActivity();
    setLoading(false);
  };

  const generateWeeklyActivity = () => {
    // Generate mock weekly activity data (in production, fetch from backend)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activity = days.map((day, index) => ({
      day,
      completed: Math.floor(Math.random() * 5),
      practiceTime: Math.floor(Math.random() * 60),
    }));
    setWeeklyActivity(activity);
  };

  const totalLessons = LESSONS.length;
  const completionRate = totalLessons > 0 
    ? Math.round((totalLessonsCompleted / totalLessons) * 100) 
    : 0;

  const stats = [
    {
      icon: IoFlame,
      label: 'Current Streak',
      value: `${streak} days`,
      color: 'warning',
      bgColor: 'from-warning-500 to-warning-600',
    },
    {
      icon: IoTrophy,
      label: 'Lessons Completed',
      value: totalLessonsCompleted,
      color: 'primary',
      bgColor: 'from-primary-500 to-primary-600',
    },
    {
      icon: IoStar,
      label: 'Stars Earned',
      value: starsEarned,
      color: 'success',
      bgColor: 'from-success-500 to-success-600',
    },
    {
      icon: IoTime,
      label: 'Total Practice',
      value: `${totalPracticeTime}m`,
      color: 'danger',
      bgColor: 'from-danger-500 to-danger-600',
    },
  ];

  const achievements = [
    { id: 1, title: 'First Step', description: 'Complete your first lesson', unlocked: totalLessonsCompleted >= 1 },
    { id: 2, title: 'Dedicated Learner', description: '7 day streak', unlocked: streak >= 7 },
    { id: 3, title: 'Rising Star', description: 'Earn 50 stars', unlocked: starsEarned >= 50 },
    { id: 4, title: 'Practice Master', description: '10 lessons completed', unlocked: totalLessonsCompleted >= 10 },
    { id: 5, title: 'Time Traveler', description: 'Practice for 1 hour total', unlocked: totalPracticeTime >= 60 },
    { id: 6, title: 'Commitment', description: '30 day streak', unlocked: streak >= 30 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, bgColor }) => (
          <Card key={label} padding="medium" className={`bg-gradient-to-br ${bgColor} text-white`}>
            <Icon className="text-3xl mb-2 opacity-90" />
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-sm opacity-90">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Progress */}
        <div className="lg:col-span-2">
          <Card padding="large">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
              <div className="flex space-x-2">
                {['week', 'month', 'all'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Rate */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Course Completion</span>
                <span className="text-2xl font-bold text-primary-500">{completionRate}%</span>
              </div>
              <ProgressBar value={completionRate} max={100} showLabel={false} />
              <p className="text-sm text-gray-600 mt-2">
                {totalLessonsCompleted} of {totalLessons} lessons completed
              </p>
            </div>

            {/* Weekly Activity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Weekly Activity</h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyActivity.map(({ day, completed, practiceTime }) => (
                  <div key={day} className="text-center">
                    <div
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center mb-2 transition-colors ${
                        completed > 0
                          ? 'bg-success-100 border-2 border-success-500'
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        completed > 0 ? 'text-success-600' : 'text-gray-400'
                      }`}>
                        {completed}
                      </div>
                      {completed > 0 && (
                        <IoCheckmarkCircle className="text-success-500 text-sm" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{day}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card padding="medium">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <IoTrendingUp className="mr-2 text-primary-500" />
              Today's Progress
            </h3>
            <div className="mb-4">
              <ProgressBar value={todayProgress} max={100} color="success" />
            </div>
            <p className="text-sm text-gray-600">
              {todayProgress >= 100
                ? '🎉 Goal reached! Great job!'
                : `${100 - todayProgress}% remaining to reach today's goal`}
            </p>
          </Card>

          <Card padding="medium" className="bg-gradient-to-br from-primary-50 to-primary-100">
            <h3 className="font-semibold text-gray-900 mb-4">Keep Going!</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <IoCalendar className="text-primary-500" />
                <span className="text-gray-700">Practice daily to maintain your streak</span>
              </div>
              <div className="flex items-center space-x-2">
                <IoBook className="text-primary-500" />
                <span className="text-gray-700">Complete {3 - (totalLessonsCompleted % 3)} more lessons for a bonus</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Achievements */}
      <Card padding="large">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-warning-50 to-warning-100 border-warning-300'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  achievement.unlocked
                    ? 'bg-warning-500'
                    : 'bg-gray-300'
                }`}>
                  <IoTrophy className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="flex items-center space-x-1 text-success-600 text-xs mt-2">
                      <IoCheckmarkCircle />
                      <span>Unlocked</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Progress;
