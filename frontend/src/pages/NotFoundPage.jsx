import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const homeLink = isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/student/dashboard') : '/';

  return (
    <div className="container py-5 text-center my-auto">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="py-5">
            <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
            <h3 className="fw-bold mb-3">Page Not Found</h3>
            <p className="text-muted mb-4">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link to={homeLink} className="btn btn-primary rounded-pill px-4 py-2">
              <i className="bi bi-house-door-fill me-2"></i> Return to Safety
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
