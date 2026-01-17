/**
 * Landing Page
 * Public entry point with app introduction
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import Button from '@components/common/Button';
import { IoBook, IoCamera, IoTrophy, IoArrowForward } from 'react-icons/io5';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: IoBook,
      title: 'Interactive Lessons',
      description: 'Learn sign language with structured, easy-to-follow lessons',
    },
    {
      icon: IoCamera,
      title: 'AI-Powered Practice',
      description: 'Practice signs with real-time AI feedback using your camera',
    },
    {
      icon: IoTrophy,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed statistics and streaks',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Sign Language
            <span className="block text-primary-500 mt-2">with AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Master sign language through interactive lessons and AI-powered practice.
            Start your journey to communicate more inclusively today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="large"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="group"
            >
              Get Started
              <IoArrowForward className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="large"
              variant="outline"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="text-3xl text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-medium p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">50+</div>
              <div className="text-gray-600">Lessons</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-500 mb-2">AI</div>
              <div className="text-gray-600">Powered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-warning-500 mb-2">Free</div>
              <div className="text-gray-600">To Start</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
