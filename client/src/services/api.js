import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle 401 session expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: 'Network error or server unreachable. Please try again.',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };

    if (error.response?.data?.message) {
      customError.message = error.response.data.message;
    }

    // Auto logout on token expiration/invalidation if not on public auth route
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      localStorage.removeItem('skillforge_token');
      localStorage.removeItem('skillforge_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(customError);
  }
);

export default api;
