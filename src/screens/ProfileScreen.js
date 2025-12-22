import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPerson, IoSettings, IoBarChart, IoNotifications, IoHelpCircle, IoInformationCircle, IoChevronForward } from 'react-icons/io5';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="avatar-container">
          <IoPerson size={48} color="#4A90E2" />
        </div>
        <h2>Demo User</h2>
        <p>demo@signage.com</p>
      </div>

      <div className="menu-section">
        <div className="menu-item">
          <IoSettings size={24} />
          <span>Settings</span>
          <IoChevronForward size={20} color="#9CA3AF" />
        </div>

        <div className="menu-item" onClick={() => navigate('/progress')}>
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
