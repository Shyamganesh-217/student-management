import api from './api';

/**
 * Service methods for authentication (login and registration).
 */
export const authService = {
  /**
   * Registers a new student.
   * Automatically assigned the STUDENT role on the backend.
   */
  async register(registrationData) {
    const response = await api.post('/register', registrationData);
    return response.data;
  },

  /**
   * Authenticates user (Student or Admin).
   * Returns JWT and user details.
   */
  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },
};
