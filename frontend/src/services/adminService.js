import api from './api';

/**
 * Service methods for administrator dashboard operations.
 * Strictly protected by backend hasRole('ADMIN') authorization.
 */
export const adminService = {
  /**
   * Fetches all registered students, optionally filtered by name or email.
   * Endpoint: GET /api/admin/students
   */
  async getStudents(searchQuery = '') {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  /**
   * Fetches administrator dashboard metrics.
   * Endpoint: GET /api/admin/stats
   */
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
