import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleAuthSuccess, logout } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Admin email is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email format.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password: password,
      });

      // Strict role verification: If someone with STUDENT role attempts to log in via Admin Portal
      if (response.role !== 'ADMIN') {
        logout(); // Disallow access and flush token
        setServerError('Access Denied: This account has STUDENT privileges and cannot access the Administrator Portal.');
        setIsSubmitting(false);
        return;
      }

      handleAuthSuccess(response);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data) {
        setServerError(err.response.data.message || 'Authentication failed. Please verify administrator credentials.');
      } else {
        setServerError('Cannot reach backend server. Please verify the Spring Boot service is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper admin-theme-wrapper py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card auth-card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="card-header bg-gradient-admin text-white p-4 text-center border-0">
                <div className="auth-icon-circle mx-auto mb-3 bg-dark text-warning border border-warning shadow-sm">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <div className="badge bg-warning text-dark px-3 py-1 mb-2 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                  Restricted Access
                </div>
                <h3 className="fw-bold mb-1">Administrator Portal</h3>
                <p className="text-white-50 small mb-0">Authorized University Staff & Administration Only</p>
              </div>

              <div className="card-body p-4 p-sm-5">
                <div className="alert alert-secondary py-2 px-3 small text-muted d-flex align-items-center gap-2 mb-4 border-0 bg-light">
                  <i className="bi bi-info-circle-fill text-warning flex-shrink-0"></i>
                  <span>Credentials are authorized via backend environment variables.</span>
                </div>

                {serverError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
                    <i className="bi bi-shield-x fs-5 flex-shrink-0"></i>
                    <div className="small fw-semibold">{serverError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Admin Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="adminEmail">
                      Authorized Admin Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-envelope-at"></i>
                      </span>
                      <input
                        id="adminEmail"
                        type="email"
                        className={`form-control border-start-0 ps-0 ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        disabled={isSubmitting}
                      />
                      {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="adminPassword">
                      Administrator Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-key-fill"></i>
                      </span>
                      <input
                        id="adminPassword"
                        type="password"
                        className={`form-control border-start-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        disabled={isSubmitting}
                      />
                      {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-warning w-100 py-2 rounded-3 fw-bold shadow-sm mb-4 d-flex align-items-center justify-content-center gap-2 text-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Verifying Security Clearance...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-unlock-fill"></i>
                        <span>Authenticate as Admin</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-3 border-top">
                  <p className="text-muted small mb-0">
                    Not an administrator?{' '}
                    <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                      Return to Student Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
