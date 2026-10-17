import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentLoginPage from './pages/StudentLoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100 bg-app">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          {/* Root redirect based on auth status */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/student/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public Authentication Pages */}
          <Route path="/login" element={<StudentLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Student Portal */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrator Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="footer bg-white border-top py-3 mt-auto">
        <div className="container text-center text-muted small">
          <p className="mb-0">
            Student Management & Authentication System &copy; {new Date().getFullYear()}. Role-based Spring Boot & PostgreSQL Security.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
