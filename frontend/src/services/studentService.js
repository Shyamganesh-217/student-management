import api from './api';

/**
 * Service methods for authenticated student operations.
 */
export const studentService = {
  /**
   * Fetches profile details of currently logged-in student.
   * Endpoint: GET /api/students/me
   */
  async getProfile() {
    const response = await api.get('/students/me');
    return response.data;
  },
};
