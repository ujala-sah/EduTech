import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  const apiBase = import.meta.env.VITE_API_URL || '/api';
  if (apiBase.startsWith('http')) {
    try {
      const origin = new URL(apiBase).origin;
      return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
    } catch {
      return path;
    }
  }
  return path;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edutrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
