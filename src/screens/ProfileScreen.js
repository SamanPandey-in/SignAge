import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPerson,
  IoSettings,
  IoBarChart,
  IoNotifications,
  IoHelpCircle,
  IoInformationCircle,
  IoChevronForward
} from 'react-icons/io5';

import './ProfileScreen.css';
import { AuthService } from '../services/firebase';

const ProfileScreen = () => {
  const navigate = useNavigate();

  // 🔐 Auth state
  const [user, setUser] = useState(null);

  // 🔄 Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔑 Login (temporary demo login)
  const loginDemoUser = async () => {
    try {
      await AuthService.login(
        "testuser@signage.com",
        "password123"
      );
      alert("LOGIN SUCCESSFUL");
    } catch (error) {
      alert(error.message);
    }
  };

  // 🚪 Logout
  const logoutUser = async () => {
    try {
      await AuthService.logout();
      alert("LOGGED OUT");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="profile-screen">
      {/* Header */}
      <div className="profile-header">
        <div className="avatar-container">
          <IoPerson size={48} color="#4A90E2" />
        </div>
        <h2>{user?.email || "User"}</h2>
        <p>{user ? "Logged in" : "Not logged in"}</p>
      </div>

      {/* Login (only when logged out) */}
      {!user && (
        <div className="menu-section">
          <div className="menu-item" onClick={loginDemoUser}>
            <IoPerson size={24} />
            <span>Login</span>
            <IoChevronForward size={20} color="#9CA3AF" />
          </div>
        </div>
      )}

      {/* Logout (only when logged in) */}
      {user && (
        <div className="menu-section">
          <div className="menu-item" onClick={logoutUser}>
            <IoPerson size={24} />
            <span>Logout</span>
            <IoChevronForward size={20} color="#9CA3AF" />
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="menu-section">
        <div className="menu-item">
          <IoSettings size={24} />
          <span>Settings</span>
          <IoChevronForward size={20} color="#9CA3AF" />
        </div>

        <div
          className="menu-item"
          onClick={() => navigate('/progress')}
        >
          <IoBarChart size={24} />
          <span>My Progress</span>
          <IoChevronForward size={20} color="#9CA3AF" />
        </div>

        <div className="menu-item">
          <IoNotifications size={24} />
          <span>Notifications</span>
          <IoChevronForward size={20} color="#9CA3AF" />
        </div>
      </div>

      <div className="menu-section">
        <div className="menu-item">
          <IoHelpCircle size={24} />
          <span>Help & Support</span>
          <IoChevronForward size={20} color="#9CA3AF" />
        </div>

        <div className="menu-item">
          <IoInformationCircle size={24} />
          <span>About</span>
          <IoChevronForward size={20} color="#9CA3AF" />
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
