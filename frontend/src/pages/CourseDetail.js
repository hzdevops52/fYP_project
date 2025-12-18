// frontend/src/pages/CourseDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
      setPdfs(response.data.pdfs || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pdfId, fileName) => {
    try {
      const response = await api.get(`/pdfs/download/${pdfId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading course...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="error">Course not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="course-detail">
          <div className="breadcrumb">
            <Link to="/courses">Courses</Link> / {course.name}
          </div>

          <div className="course-header">
            <div className="course-icon-large">📚</div>
            <div>
              <h1>{course.name}</h1>
              <p className="course-category">{course.category}</p>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>📄 {pdfs.length} PDFs available</span>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2>Available PDFs</h2>
            <Link to="/upload" className="btn btn-primary">Upload New PDF</Link>
          </div>

          {pdfs.length === 0 ? (
            <div className="empty-state">
              <p>No PDFs available for this course yet</p>
              <Link to="/upload" className="btn btn-primary">Be the first to upload</Link>
            </div>
          ) : (
            <div className="pdfs-list">
              {pdfs.map(pdf => (
                <div key={pdf._id} className="pdf-card">
                  <div className="pdf-icon">📄</div>
                  <div className="pdf-details">
                    <h3>{pdf.title}</h3>
                    <p>{pdf.description}</p>
                    <div className="pdf-meta">
                      <span>👤 {pdf.uploader?.name}</span>
                      <span>📅 {new Date(pdf.createdAt).toLocaleDateString()}</span>
                      <span>📦 {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      <span>⬇️ {pdf.downloadCount} downloads</span>
                    </div>
                  </div>
                  <div className="pdf-actions">
                    <Link to={`/pdf/${pdf._id}`} className="btn btn-outline">
                      View
                    </Link>
                    <button 
                      onClick={() => handleDownload(pdf._id, pdf.fileName)}
                      className="btn btn-primary"
                    >
                      Download
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

export default CourseDetail;