import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const MyUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await api.get('/user/uploads');
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        await api.delete(`/pdfs/${id}`);
        setUploads(uploads.filter(pdf => pdf._id !== id));
        alert('PDF deleted successfully');
      } catch (error) {
        console.error('Error deleting PDF:', error);
        alert('Failed to delete PDF');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading your uploads...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="my-uploads">
          <div className="page-header">
            <h1>My Uploads</h1>
            <p>Manage your uploaded PDFs</p>
          </div>

          {uploads.length === 0 ? (
            <div className="empty-state">
              <p>You haven't uploaded any PDFs yet</p>
              <Link to="/upload" className="btn btn-primary">Upload Your First PDF</Link>
            </div>
          ) : (
            <div className="pdfs-list">
              {uploads.map(pdf => (
                <div key={pdf._id} className="pdf-card">
                  <div className="pdf-icon">📄</div>
                  <div className="pdf-details">
                    <h3>{pdf.title}</h3>
                    <p>{pdf.description}</p>
                    <div className="pdf-meta">
                      <span>📚 {pdf.course?.name}</span>
                      <span>📅 {new Date(pdf.createdAt).toLocaleDateString()}</span>
                      <span>⬇️ {pdf.downloadCount} downloads</span>
                      <span>👁️ {pdf.views} views</span>
                    </div>
                  </div>
                  <div className="pdf-actions">
                    <Link to={`/pdf/${pdf._id}`} className="btn btn-outline">
                      View
                    </Link>
                    <button 
                      onClick={() => handleDelete(pdf._id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
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

export default MyUploads;