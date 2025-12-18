import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetail from './pages/CourseDetail';
import PDFViewer from './pages/PDFViewer';
import Upload from './pages/Upload';
import MyUploads from './pages/MyUploads';
import MyDownloads from './pages/MyDownloads';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/courses" element={
              <ProtectedRoute>
                <BrowseCourses />
              </ProtectedRoute>
            } />
            
            <Route path="/courses/:id" element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/pdf/:id" element={
              <ProtectedRoute>
                <PDFViewer />
              </ProtectedRoute>
            } />
            
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            
            <Route path="/my-uploads" element={
              <ProtectedRoute>
                <MyUploads />
              </ProtectedRoute>
            } />
            
            <Route path="/my-downloads" element={
              <ProtectedRoute>
                <MyDownloads />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;