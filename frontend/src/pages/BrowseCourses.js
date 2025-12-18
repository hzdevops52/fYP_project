// frontend/src/pages/BrowseCourses.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Engineering', 'Medical', 'Business', 'Arts', 'Science', 'Technology', 'Other'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, courses]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="browse-courses">
          <div className="page-header">
            <h1>Browse Courses</h1>
            <p>Explore courses and find study materials</p>
          </div>

          <div className="filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category || (!selectedCategory && category === 'All') ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <p>No courses found</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <Link 
                  key={course._id} 
                  to={`/courses/${course._id}`}
                  className="course-card"
                >
                  <div className="course-icon">📚</div>
                  <h3>{course.name}</h3>
                  <p className="course-category">{course.category}</p>
                  <p className="course-description">{course.description}</p>
                  <div className="course-footer">
                    <span className="pdf-count">📄 {course.pdfCount || 0} PDFs</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseCourses;