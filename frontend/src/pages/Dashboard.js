// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    uploads: 0,
    downloads: 0
  });
  const [recentPDFs, setRecentPDFs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, pdfsRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/pdfs')
      ]);

      setStats(profileRes.data.stats);
      setRecentPDFs(pdfsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Here's what's happening with your notes</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⬆️</div>
              <div className="stat-info">
                <h3>{stats.uploads}</h3>
                <p>Total Uploads</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⬇️</div>
              <div className="stat-info">
                <h3>{stats.downloads}</h3>
                <p>Total Downloads</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{recentPDFs.length}</h3>
                <p>Recent PDFs</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/courses" className="action-card">
                <span className="action-icon">📖</span>
                <h3>Browse Courses</h3>
                <p>Explore available courses</p>
              </Link>

              <Link to="/upload" className="action-card">
                <span className="action-icon">⬆️</span>
                <h3>Upload PDF</h3>
                <p>Share your notes</p>
              </Link>

              <Link to="/my-uploads" className="action-card">
                <span className="action-icon">📄</span>
                <h3>My Uploads</h3>
                <p>Manage your PDFs</p>
              </Link>

              <Link to="/my-downloads" className="action-card">
                <span className="action-icon">💾</span>
                <h3>My Downloads</h3>
                <p>View download history</p>
              </Link>
            </div>
          </div>

          {recentPDFs.length > 0 && (
            <div className="recent-section">
              <h2>Recently Added PDFs</h2>
              <div className="pdf-list">
                {recentPDFs.map(pdf => (
                  <Link 
                    key={pdf._id} 
                    to={`/pdf/${pdf._id}`}
                    className="pdf-item"
                  >
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-info">
                      <h4>{pdf.title}</h4>
                      <p>{pdf.course?.name} • {pdf.uploader?.name}</p>
                    </div>
                    <div className="pdf-stats">
                      <span>⬇️ {pdf.downloadCount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;