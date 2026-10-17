import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific validation error on input
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format (e.g., student@university.edu).';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage('Registration successful! Redirecting to your Student Dashboard...');
      handleAuthSuccess(response);

      setTimeout(() => {
        navigate('/student/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.validationErrors) {
          setValidationErrors(errorData.validationErrors);
        }
        setServerError(errorData.message || 'Registration failed. Please check your information and try again.');
      } else {
        setServerError('Cannot reach backend server. Please verify the Spring Boot service is running.');
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
                  <i className="bi bi-person-plus-fill fs-3"></i>
                </div>
                <h3 className="fw-bold mb-1">Create Student Account</h3>
                <p className="text-white-50 small mb-0">Join the Student Academic Management Portal</p>
              </div>

              <div className="card-body p-4 p-sm-5">
                {serverError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
                    <div className="small">{serverError}</div>
                  </div>
                )}

                {successMessage && (
                  <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
                    <i className="bi bi-check-circle-fill fs-5 flex-shrink-0"></i>
                    <div className="small">{successMessage}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="name">
                      Full Legal Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        className={`form-control border-start-0 ps-0 ${validationErrors.name ? 'is-invalid' : ''}`}
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback d-block">{validationErrors.name}</div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="email">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className={`form-control border-start-0 ps-0 ${validationErrors.email ? 'is-invalid' : ''}`}
                        placeholder="student@university.edu"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback d-block">{validationErrors.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="password">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-shield-lock"></i>
                      </span>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        className={`form-control border-start-0 ps-0 ${validationErrors.password ? 'is-invalid' : ''}`}
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback d-block">{validationErrors.password}</div>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary small" htmlFor="confirmPassword">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-check2-circle"></i>
                      </span>
                      <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        className={`form-control border-start-0 ps-0 ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Re-type password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {validationErrors.confirmPassword && (
                        <div className="invalid-feedback d-block">{validationErrors.confirmPassword}</div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Registering Account...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right-circle"></i>
                        <span>Register as Student</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 border-top">
                  <p className="text-muted small mb-2">
                    Already registered?{' '}
                    <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                      Sign In to Student Portal
                    </Link>
                  </p>
                  <p className="text-muted small mb-0">
                    Administrator?{' '}
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

export default RegisterPage;
