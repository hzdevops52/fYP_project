// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          📚 PDF Notes
        </Link>
        
        <ul className="navbar-menu">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/courses">Browse Courses</Link></li>
          <li><Link to="/upload">Upload</Link></li>
          <li><Link to="/my-uploads">My Uploads</Link></li>
          <li><Link to="/my-downloads">Downloads</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>

        <div className="navbar-user">
          <span>Hello, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;