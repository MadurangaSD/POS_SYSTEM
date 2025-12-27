import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Do not redirect on login failures; allow UI to show error
      const isLoginAttempt = requestUrl.includes('/auth/login');

      if (!isLoginAttempt) {
        // Token expired or invalid for protected routes
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (search = '', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  getLowStock: async (threshold = 10) => {
    const response = await api.get(`/products/low-stock?threshold=${threshold}`);
    return response.data;
  },
  
  getExpiring: async (days = 30) => {
    const response = await api.get(`/products/expiring?days=${days}`);
    return response.data;
  },

  lookupByBarcode: async (barcode) => {
    const response = await api.get(`/products/lookup/${barcode}`);
    return response.data;
  },
};

// Sales API
export const salesAPI = {
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  
  getByDateRange: async (startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`/sales?${params.toString()}`);
    return response.data;
  },
  
  getDailyReport: async (date) => {
    const response = await api.get(`/sales/reports/daily?date=${date}`);
    return response.data;
  },
  
  getTopProducts: async (limit = 5, days = 30) => {
    const response = await api.get(`/sales/reports/top-products?limit=${limit}&days=${days}`);
    return response.data;
  },
};

// Stock API
export const stockAPI = {
  adjust: async (productId, quantity, reason) => {
    const response = await api.post('/stock/adjust', {
      product_id: productId,
      quantity,
      reason,
    });
    return response.data;
  },
  
  recordPurchase: async (supplierName, items) => {
    const response = await api.post('/stock/purchases', {
      supplier_name: supplierName,
      items,
    });
    return response.data;
  },
  
  getLowStock: async (threshold = 10) => {
    const response = await api.get(`/stock/low-stock?threshold=${threshold}`);
    return response.data;
  },
  
  getExpiring: async (days = 30) => {
    const response = await api.get(`/stock/expiring?days=${days}`);
    return response.data;
  },
  
  getOutOfStock: async () => {
    const response = await api.get('/stock/out-of-stock');
    return response.data;
  },
  
  getStockValue: async () => {
    const response = await api.get('/stock/value');
    return response.data;
  },
};

export default api;
