import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const children = {
  getAll: () => api.get('/children'),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
};

export const guardians = {
  getAll: () => api.get('/guardians'),
  getById: (id) => api.get(`/guardians/${id}`),
  create: (data) => api.post('/guardians', data),
  update: (id, data) => api.put(`/guardians/${id}`, data),
  delete: (id) => api.delete(`/guardians/${id}`),
};

export const donors = {
  getAll: () => api.get('/donors'),
  getById: (id) => api.get(`/donors/${id}`),
  create: (data) => api.post('/donors', data),
  update: (id, data) => api.put(`/donors/${id}`, data),
  delete: (id) => api.delete(`/donors/${id}`),
};

export const donations = {
  getAll: () => api.get('/donations'),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
};

export const staff = {
  getAll: () => api.get('/staff'),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const agencies = {
  getAll: () => api.get('/agencies'),
  getById: (id) => api.get(`/agencies/${id}`),
  create: (data) => api.post('/agencies', data),
  update: (id, data) => api.put(`/agencies/${id}`, data),
  delete: (id) => api.delete(`/agencies/${id}`),
  getPublic: () => axios.get(`${API_BASE_URL}/agencies/list`),
};

export const childRecords = {
  getAll: () => api.get('/child_records'),
  getById: (id) => api.get(`/child_records/${id}`),
  create: (data) => api.post('/child_records', data),
  update: (id, data) => api.put(`/child_records/${id}`, data),
};

export const stats = {
  get: () => api.get('/stats'),
};

export const auditLogs = {
  getAll: (page = 1, limit = 20) => api.get(`/audit-logs?page=${page}&limit=${limit}`),
};

export const reports = {
  getDonations: () => api.get('/reports/donations'),
  getChildren: () => api.get('/reports/children'),
};

export const upload = {
  photo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  document: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  receipt: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;