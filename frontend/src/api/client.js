import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT if saved in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kslu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred.';

    // If unauthorized, token might be invalid or expired
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Don't auto-redirect if checking /auth/me on initial load
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('kslu_token');
        localStorage.removeItem('kslu_user');
      }
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      errors: error.response?.data?.errors,
      original: error
    });
  }
);

export default api;
