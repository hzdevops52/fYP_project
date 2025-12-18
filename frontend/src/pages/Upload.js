// frontend/src/pages/Upload.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Upload = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    tags: '',
    newCourse: '',
    newCourseCategory: '',
    createNew: false
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const categories = ['Engineering', 'Medical', 'Business', 'Arts', 'Science', 'Technology', 'Other'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);

    try {
      let courseId = formData.course;

      // Create new course if needed
      if (formData.createNew) {
        const courseResponse = await api.post('/courses', {
          name: formData.newCourse,
          description: '',
          category: formData.newCourseCategory
        });
        courseId = courseResponse.data._id;
      }

      // Upload PDF
      const uploadFormData = new FormData();
      uploadFormData.append('pdf', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('course', courseId);
      uploadFormData.append('tags', formData.tags);

      await api.post('/pdfs/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('PDF uploaded successfully!');
      navigate('/my-uploads');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="upload-page">
          <div className="page-header">
            <h1>Upload PDF Notes</h1>
            <p>Share your study materials with the community</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label>PDF Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Data Structures Chapter 5 Notes"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description of the content..."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.createNew}
                  onChange={(e) => setFormData({ ...formData, createNew: e.target.checked })}
                />
                Create new course
              </label>
            </div>

            {formData.createNew ? (
              <>
                <div className="form-group">
                  <label>New Course Name *</label>
                  <input
                    type="text"
                    name="newCourse"
                    value={formData.newCourse}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Data Structures and Algorithms"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="newCourseCategory"
                    value={formData.newCourseCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>Select Course *</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., algorithms, sorting, trees"
              />
            </div>

            <div className="form-group">
              <label>Select PDF File *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              {file && (
                <div className="file-info">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              <small>Maximum file size: 10MB</small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;