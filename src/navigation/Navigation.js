/**
 * Navigation Component (Web)
 * Top navigation bar with links
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoBook, IoPerson } from 'react-icons/io5';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">SignAge</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
          >
            <IoHome size={20} />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/learn" 
            className={`nav-link ${isActive('/learn') || isActive('/lesson') ? 'active' : ''}`}
          >
            <IoBook size={20} />
            <span>Learn</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') || isActive('/progress') ? 'active' : ''}`}
          >
            <IoPerson size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
