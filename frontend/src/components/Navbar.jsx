import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const targetRedirect = isAdmin ? '/admin/login' : '/login';
    logout();
    navigate(targetRedirect, { replace: true });
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark shadow-sm py-3 ${isAdmin ? 'nav-admin' : 'nav-student'}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/student/dashboard') : '/'}>
          <div className="brand-icon-box">
            <i className={isAdmin ? 'bi bi-shield-lock-fill' : 'bi bi-mortarboard-fill'}></i>
          </div>
          <span>
            {isAdmin ? 'Admin Portal' : 'Student Portal'}
            <small className="d-block fw-normal text-white-50" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              ACADEMIC MANAGEMENT
            </small>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                <li className="nav-item me-lg-2">
                  <div className="user-pill d-flex align-items-center gap-2 py-1 px-3 rounded-pill bg-white bg-opacity-10 text-white">
                    <i className="bi bi-person-circle"></i>
                    <span className="fw-semibold small">{user?.name}</span>
                    <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} text-uppercase`} style={{ fontSize: '0.65rem' }}>
                      {user?.role}
                    </span>
                  </div>
                </li>

                {isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link text-white small" to="/admin/dashboard">
                      <i className="bi bi-speedometer2 me-1"></i> Dashboard
                    </Link>
                  </li>
                )}

                {!isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link text-white small" to="/student/dashboard">
                      <i className="bi bi-person-badge me-1"></i> My Profile
                    </Link>
                  </li>
                )}

                <li className="nav-item ms-lg-2">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                    title="Sign out of system"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 hover-white" to="/login">
                    Student Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 hover-white" to="/register">
                    Student Register
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-warning btn-sm rounded-pill px-3 fw-semibold text-dark d-flex align-items-center gap-1" to="/admin/login">
                    <i className="bi bi-shield-lock"></i>
                    <span>Admin Access</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
