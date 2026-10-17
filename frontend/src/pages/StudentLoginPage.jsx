import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const StudentLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleAuthSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired');

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Email address is required.';
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

      handleAuthSuccess(response);

      // If user is Admin logging into student form, guide them to admin dashboard
      if (response.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response?.data) {
        setServerError(err.response.data.message || 'Authentication failed. Please verify your credentials.');
      } else {
        setServerError('Cannot reach backend server. Please check your network or server status.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card auth-card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-gradient-student text-white p-4 text-center border-0">
                <div className="auth-icon-circle mx-auto mb-3 bg-white text-primary shadow-sm">
                  <i className="bi bi-mortarboard-fill fs-3"></i>
                </div>
                <h3 className="fw-bold mb-1">Student Portal Login</h3>
                <p className="text-white-50 small mb-0">Sign in to access your student records & profile</p>
              </div>

              <div className="card-body p-4 p-sm-5">
                {sessionExpired && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
                    <i className="bi bi-clock-history fs-5 flex-shrink-0"></i>
                    <div className="small">Your session has expired. Please log in again to continue.</div>
                  </div>
                )}

                {serverError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
                    <div className="small">{serverError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="studentEmail">
                      Student Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        id="studentEmail"
                        type="email"
                        className={`form-control border-start-0 ps-0 ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="student@university.edu"
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
                    <label className="form-label fw-semibold text-secondary small" htmlFor="studentPassword">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        id="studentPassword"
                        type="password"
                        className={`form-control border-start-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter password"
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
                    className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mb-4 d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Login as Student</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-3 border-top">
                  <p className="text-muted small mb-2">
                    Need an account?{' '}
                    <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                      Register as New Student
                    </Link>
                  </p>
                  <p className="text-muted small mb-0">
                    Staff & Administration?{' '}
                    <Link to="/admin/login" className="text-warning fw-semibold text-decoration-none">
                      Go to Admin Login
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

export default StudentLoginPage;
