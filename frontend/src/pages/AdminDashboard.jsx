import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const [studentsData, statsData] = await Promise.all([
        adminService.getStudents(searchQuery),
        adminService.getStats(),
      ]);
      setStudents(studentsData);
      setStats(statsData);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Forbidden: Your account does not have administrator privileges to access this data.');
      } else {
        setError(err.response?.data?.message || 'Failed to retrieve administrative data from server.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-container py-5 bg-light min-vh-100">
      <div className="container">
        {/* Welcome Header */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-gradient-admin text-white">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                <i className="bi bi-shield-check me-1"></i> Root Administration
              </div>
              <h1 className="fw-bold mb-2">Administrator Dashboard</h1>
              <p className="text-white-50 mb-0">
                Welcome, {user?.name || 'Administrator'} ({user?.email}). Full access to manage registered student records.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0 d-flex gap-2 justify-content-lg-end">
              <button
                onClick={() => fetchDashboardData(true)}
                className="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1"
                disabled={refreshing || loading}
              >
                <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`}></i>
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-warning rounded-pill px-3 py-2 fw-bold text-dark d-flex align-items-center gap-1 shadow-sm"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-4 shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{error}</div>
            <button onClick={() => fetchDashboardData(true)} className="btn btn-sm btn-outline-danger ms-auto">
              Retry
            </button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 p-xl-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">Total Registered Students</p>
                  <h2 className="fw-bolder mb-0 text-primary">
                    {stats ? stats.totalStudents : (loading ? '...' : students.length)}
                  </h2>
                </div>
                <div className="stat-icon-box bg-primary bg-opacity-10 text-primary rounded-4 p-3">
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 p-xl-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">System Administrators</p>
                  <h2 className="fw-bolder mb-0 text-warning">
                    {stats ? stats.totalAdmins : '1'}
                  </h2>
                </div>
                <div className="stat-icon-box bg-warning bg-opacity-10 text-warning rounded-4 p-3">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 p-xl-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">PostgreSQL Database</p>
                  <h5 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                    <span className="live-indicator"></span>
                    <span>student_db Connected</span>
                  </h5>
                </div>
                <div className="stat-icon-box bg-success bg-opacity-10 text-success rounded-4 p-3">
                  <i className="bi bi-database-check fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Records Table Section */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-person-lines-fill text-primary"></i>
                  Student Directory
                </h5>
                <p className="text-muted small mb-0">
                  Fetched directly from <code className="bg-light px-2 py-1 rounded text-primary">GET /api/admin/students</code>
                </p>
              </div>

              {/* Search Bar */}
              <div className="col-md-6">
                <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by student name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="btn btn-outline-secondary border-start-0"
                        title="Clear search"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary px-3 fw-semibold">
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading students...</span>
                </div>
                <p className="text-muted small mt-2">Retrieving student records from PostgreSQL database...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-5 px-3">
                <div className="mb-3 text-muted">
                  <i className="bi bi-inbox fs-1"></i>
                </div>
                <h6 className="fw-bold text-dark">No Student Records Found</h6>
                <p className="text-muted small mb-3">
                  {searchQuery ? `No students matched the query "${searchQuery}".` : 'No students have registered yet.'}
                </p>
                {searchQuery && (
                  <button onClick={handleClearSearch} className="btn btn-sm btn-outline-primary">
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small text-muted">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="ps-4 fw-bold text-secondary">#{student.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-circle-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="fw-semibold text-dark">{student.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{student.email}</span>
                        </td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1">
                            {student.role}
                          </span>
                        </td>
                        <td>
                          <span className="small text-muted">{formatDate(student.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center text-muted small">
            <div>
              Showing <span className="fw-bold text-dark">{students.length}</span> registered student(s)
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-shield-check text-success"></i>
              <span>Role-Based Security: Backend Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
