/**
 * Profile Page
 * User profile management and settings
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useProgress } from '@hooks/useProgress';
import { DatabaseService } from '@services/firebase';
import {
  IoPerson,
  IoPencil,
  IoSave,
  IoLogOut,
  IoMail,
  IoCalendar,
  IoTrophy,
  IoFlame,
  IoStar,
  IoSettings,
  IoNotifications,
  IoLanguage,
} from 'react-icons/io5';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';

const Profile = () => {
  const { user, logout } = useAuth();
  const { streak, totalLessonsCompleted, starsEarned, totalPracticeTime } = useProgress();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile data
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [goal, setGoal] = useState('');
  
  // Settings
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await DatabaseService.getUserData(user.uid);
      if (result.success) {
        const data = result.data;
        setDisplayName(data.displayName || user.email?.split('@')[0] || '');
        setBio(data.bio || '');
        setGoal(data.goal || '');
        setNotifications(data.notifications !== false);
        setEmailUpdates(data.emailUpdates || false);
        setLanguage(data.language || 'en');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      await DatabaseService.saveUserData(user.uid, {
        displayName,
        bio,
        goal,
        notifications,
        emailUpdates,
        language,
        updatedAt: new Date().toISOString(),
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const stats = [
    { 
      icon: IoFlame, 
      label: 'Day Streak', 
      value: streak,
      color: 'warning'
    },
    { 
      icon: IoTrophy, 
      label: 'Lessons Completed', 
      value: totalLessonsCompleted,
      color: 'primary'
    },
    { 
      icon: IoStar, 
      label: 'Stars Earned', 
      value: starsEarned,
      color: 'success'
    },
    { 
      icon: IoCalendar, 
      label: 'Practice Time', 
      value: `${totalPracticeTime}m`,
      color: 'danger'
    },
  ];

  if (loading && !displayName) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and track your progress</p>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-success-50 border-2 border-success-200 rounded-xl text-success-700 animate-fade-in">
          Profile updated successfully!
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <Card padding="large">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{displayName || 'User'}</h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <IoMail className="mr-2" />
                    {user?.email}
                  </p>
                </div>
              </div>
              
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="small"
                >
                  <IoPencil className="mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    size="small"
                    loading={loading}
                  >
                    <IoSave className="mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadUserProfile();
                    }}
                    variant="outline"
                    size="small"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                placeholder="Your name"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <Input
                label="Learning Goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={!isEditing}
                placeholder="E.g., Learn basic conversation signs"
              />
            </div>
          </Card>

          {/* Settings */}
          <Card padding="large">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <IoSettings className="mr-2 text-gray-600" />
              Settings
            </h3>

            <div className="space-y-6">
              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <IoNotifications className="text-2xl text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-600">Receive practice reminders</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Email Updates */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <IoMail className="text-2xl text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Email Updates</div>
                    <div className="text-sm text-gray-600">Receive progress reports</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <IoLanguage className="text-2xl text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Language</div>
                    <div className="text-sm text-gray-600">Interface language</div>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              {isEditing && (
                <Button onClick={handleSave} fullWidth loading={loading}>
                  <IoSave className="mr-2" />
                  Save Settings
                </Button>
              )}
            </div>
          </Card>

          {/* Danger Zone */}
          <Card padding="large" className="border-2 border-danger-200">
            <h3 className="text-xl font-bold text-danger-600 mb-4">Danger Zone</h3>
            <p className="text-gray-600 mb-4">
              Once you log out, you'll need to sign in again to access your account.
            </p>
            <Button onClick={handleLogout} variant="danger" fullWidth>
              <IoLogOut className="mr-2" />
              Log Out
            </Button>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card padding="medium">
            <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="space-y-4">
              {stats.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`text-xl text-${color}-500`} />
                    </div>
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Account Info */}
          <Card padding="medium" className="bg-gradient-to-br from-primary-50 to-primary-100">
            <h3 className="font-semibold text-gray-900 mb-3">Account Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">
                  {new Date(user?.metadata?.creationTime).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium text-gray-900">
                  {new Date(user?.metadata?.lastSignInTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
