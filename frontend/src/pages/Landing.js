// frontend/src/pages/Landing.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav">
          <h1 className="logo">📚 PDF Notes Platform</h1>
          <div>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Share & Download Course Notes</h1>
          <p>Access thousands of PDF notes or contribute your own study materials</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-large btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-large btn-outline">Login</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Browse Courses</h3>
            <p>Explore notes from various subjects and courses</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⬇️</div>
            <h3>Download PDFs</h3>
            <p>Download study materials for free</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⬆️</div>
            <h3>Upload & Share</h3>
            <p>Contribute your notes to help others</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community</h3>
            <p>Join thousands of students sharing knowledge</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2024 PDF Notes Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;