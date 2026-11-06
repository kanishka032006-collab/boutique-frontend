import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vedhika_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, async (error) => {
  const original = error.config;
  const refresh = localStorage.getItem('vedhika_refresh');
  if (error.response?.status !== 401 || !original || original._retried || !refresh
      || original.url?.includes('/auth/login') || original.url?.includes('/auth/admin/login')
      || original.url?.includes('/auth/token/refresh')) {
    return Promise.reject(error);
  }
  original._retried = true;
  try {
    const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh`, { refresh });
    localStorage.setItem('vedhika_token', response.data.access);
    original.headers.Authorization = `Bearer ${response.data.access}`;
    return api(original);
  } catch (refreshError) {
    localStorage.removeItem('vedhika_token');
    localStorage.removeItem('vedhika_refresh');
    localStorage.removeItem('vedhika_role');
    localStorage.removeItem('vedhika_user');
    localStorage.removeItem('vedhika_admin');
    return Promise.reject(refreshError);
  }
});

export function getErrorMessage(error) {
  const response = error.response?.data;
  return response?.error || (typeof response?.detail === 'string' ? response.detail : null)
    || error.message || 'Something went wrong. Please try again.';
}

export default api;
