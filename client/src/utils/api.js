import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api',
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

// Complaint APIs
export const complaintAPI = {
  create: (formData) => API.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => API.get('/complaints'),
  getById: (id) => API.get(`/complaints/${id}`),
  updateStatus: (id, data) => API.put(`/complaints/${id}/status`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Admin APIs
export const adminAPI = {
  assign: (data) => API.post('/admin/assign', data),
  getUsers: (role) => API.get('/admin/users', { params: { role } }),
  getStats: () => API.get('/admin/stats'),
};

// NGO APIs
export const ngoAPI = {
  getTasks: () => API.get('/ngo/tasks'),
  acceptTask: (complaintId) => API.put(`/ngo/accept/${complaintId}`),
};

// Feedback APIs
export const feedbackAPI = {
  create: (data) => API.post('/feedback', data),
  getByComplaint: (complaintId) => API.get(`/feedback/${complaintId}`),
};

// Donation APIs
export const donationAPI = {
  createOrder: (amount) => API.post('/donate/create-order', { amount }),
  verifyPayment: (data) => API.post('/donate/verify', data),
};

// Upload APIs
export const uploadAPI = {
  uploadImage: (formData) => API.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default API;