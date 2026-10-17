import axios from 'axios';

/**
 * Centralized Axios client instance.
 * Reads base URL strictly from environment configuration (VITE_API_BASE_URL).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request interceptor to dynamically inject the JWT Bearer token.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle authorization errors globally.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      // HTTP 401 Unauthorized: token expired or invalid
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Preserve target portal path for proper redirect
          if (currentPath.startsWith('/admin')) {
            window.location.href = '/admin/login?sessionExpired=true';
          } else {
            window.location.href = '/login?sessionExpired=true';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
