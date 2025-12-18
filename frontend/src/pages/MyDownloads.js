import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const MyDownloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await api.get('/user/downloads');
      setDownloads(response.data);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading your downloads...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="my-downloads">
          <div className="page-header">
            <h1>My Downloads</h1>
            <p>Your download history</p>
          </div>

          {downloads.length === 0 ? (
            <div className="empty-state">
              <p>You haven't downloaded any PDFs yet</p>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div className="pdfs-list">
              {downloads.map(download => (
                <div key={download._id} className="pdf-card">
                  <div className="pdf-icon">📄</div>
                  <div className="pdf-details">
                    <h3>{download.pdf?.title}</h3>
                    <div className="pdf-meta">
                      <span>📚 {download.pdf?.course?.name}</span>
                      <span>📅 Downloaded: {new Date(download.downloadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="pdf-actions">
                    <Link to={`/pdf/${download.pdf?._id}`} className="btn btn-primary">
                      View Again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDownloads;