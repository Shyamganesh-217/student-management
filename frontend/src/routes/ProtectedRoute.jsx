import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper enforcing authentication and role-based access control.
 *
 * @param {Array<string>} allowedRoles - List of permitted roles (e.g. ['STUDENT'] or ['ADMIN'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    const isTargetingAdmin = location.pathname.startsWith('/admin');
    const redirectPath = isTargetingAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If student tries to access admin routes: redirect to student dashboard with state notification
    if (user.role === 'STUDENT') {
      return (
        <Navigate
          to="/student/dashboard"
          state={{
            unauthorizedError: 'Access denied: You do not possess administrator credentials to view that page.',
          }}
          replace
        />
      );
    }

    // If admin tries to access student routes: redirect to admin dashboard
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
