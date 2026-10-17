import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const unauthorizedAlert = location.state?.unauthorizedError;

  const fetchStudentProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await studentService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-container py-5">
      <div className="container">
        {unauthorizedAlert && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 shadow-sm mb-4" role="alert">
            <i className="bi bi-shield-slash-fill fs-5"></i>
            <div>{unauthorizedAlert}</div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-gradient-student text-white">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="badge bg-white text-primary px-3 py-1 rounded-pill mb-2 fw-semibold">
                Student Portal
              </div>
              <h1 className="fw-bold mb-2">
                Welcome back, {profile?.name || user?.name || 'Student'}!
              </h1>
              <p className="text-white-50 mb-0">
                Access your academic credentials and verified enrollment profile below.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <button onClick={handleLogout} className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                <i className="bi bi-box-arrow-right me-2"></i> Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-4 shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{error}</div>
            <button onClick={fetchStudentProfile} className="btn btn-sm btn-outline-danger ms-auto">
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge text-primary"></i>
                  Verified Student Profile
                </h5>
                <button
                  onClick={fetchStudentProfile}
                  className="btn btn-sm btn-light border rounded-circle"
                  title="Refresh Profile"
                  disabled={loading}
                >
                  <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                </button>
              </div>

              <div className="card-body p-4">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading profile...</span>
                    </div>
                    <p className="text-muted small mt-2">Loading profile from /api/students/me...</p>
                  </div>
                ) : (
                  <div className="profile-details">
                    <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                      <div className="avatar-box bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-fill fs-1"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold mb-1 text-dark">{profile?.name}</h4>
                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-1">
                          Role: {profile?.role}
                        </span>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-semibold">Student ID</label>
                        <div className="fw-bold text-dark fs-5">#{profile?.id}</div>
                      </div>

                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-semibold">Security Role</label>
                        <div className="fw-bold text-dark">{profile?.role}</div>
                      </div>

                      <div className="col-12">
                        <label className="text-muted small text-uppercase fw-semibold">Email Address</label>
                        <div className="fw-bold text-dark">{profile?.email}</div>
                      </div>

                      <div className="col-12">
                        <label className="text-muted small text-uppercase fw-semibold">Registration Date</label>
                        <div className="text-dark">{formatDate(profile?.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Portal Information */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-success"></i>
                  Account Security Status
                </h5>
              </div>

              <div className="card-body p-4">
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="icon-badge bg-success bg-opacity-10 text-success rounded-3 p-2">
                    <i className="bi bi-key-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">JWT Authenticated Session</h6>
                    <p className="text-muted small mb-0">
                      Your identity is secured by an encrypted JSON Web Token with HMAC-SHA256 signature.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="icon-badge bg-primary bg-opacity-10 text-primary rounded-3 p-2">
                    <i className="bi bi-lock-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">BCrypt Password Protection</h6>
                    <p className="text-muted small mb-0">
                      Your password is cryptographically salted and hashed. Plain-text passwords and hashes are never exposed in API payloads.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="icon-badge bg-warning bg-opacity-10 text-warning rounded-3 p-2">
                    <i className="bi bi-person-x-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Role Isolation</h6>
                    <p className="text-muted small mb-0">
                      Administrative APIs and controls are restricted to the authorized administrator account configured through server environment variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
