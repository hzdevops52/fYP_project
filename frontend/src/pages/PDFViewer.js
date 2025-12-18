import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPDF();
  }, [id]);

  const fetchPDF = async () => {
    try {
      const response = await api.get(`/pdfs/${id}`);
      setPdf(response.data);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/pdfs/download/${id}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', pdf.fileName);
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
          <div className="loading">Loading PDF...</div>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="error">PDF not found</div>
        </div>
      </div>
    );
  }

  const pdfUrl = `http://localhost:5000/${pdf.filePath}`;

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="pdf-viewer">
          <div className="pdf-header">
            <div>
              <h1>{pdf.title}</h1>
              <p>{pdf.description}</p>
              <div className="pdf-meta">
                <span>📚 {pdf.course?.name}</span>
                <span>👤 {pdf.uploader?.name}</span>
                <span>📅 {new Date(pdf.createdAt).toLocaleDateString()}</span>
                <span>⬇️ {pdf.downloadCount} downloads</span>
              </div>
            </div>
            <div className="pdf-actions">
              <button onClick={handleDownload} className="btn btn-primary">
                Download PDF
              </button>
              <button onClick={() => navigate(-1)} className="btn btn-outline">
                Back
              </button>
            </div>
          </div>

          <div className="pdf-preview">
            <iframe
              src={pdfUrl}
              width="100%"
              height="800px"
              title={pdf.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;