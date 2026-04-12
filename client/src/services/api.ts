import axios from 'axios';

/**
 * Single Axios instance used by all service files.
 * - baseURL points at the backend API
 * - withCredentials: true sends the HTTP-only JWT cookie on every request
 * - The response interceptor unwraps the data envelope so callers
 *   get the payload directly instead of { success, data, message }
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwrap the data field from the standard envelope
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalise error messages so components always get a string
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
