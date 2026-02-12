import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('🔌 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - Log outgoing requests
apiClient.interceptors.request.use(
  config => {
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and log responses
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status}`, response.data);
    return response;
  },
  error => {
    const { response, message, code } = error;
    
    if (!response) {
      // Network error or timeout
      console.error('❌ Network/Timeout Error:', message);
      if (code === 'ECONNABORTED') {
        console.error('Request timeout - Backend may be slow or unreachable');
      } else {
        console.error('Backend appears to be down on', API_BASE_URL);
      }
    } else {
      // Server responded with error
      console.error(`❌ API Error ${response.status}:`, response.data?.detail || response.statusText);
    }
    
    return Promise.reject(error);
  }
);

// Properties API
export const propertyAPI = {
    getAll: () => apiClient.get('/properties'),
    getById: (id) => apiClient.get(`/properties/${id}`),
    create: (data) => {
        console.log('📍 Creating property:', data);
        return apiClient.post('/properties', data);
    },
    update: (id, data) => apiClient.put(`/properties/${id}`, data),
    delete: (id) => apiClient.delete(`/properties/${id}`),
  uploadPhotos: (id, files) => {
    const fd = new FormData();
    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        fd.append('files', files[i]);
      }
    }
    return apiClient.post(`/properties/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
};

// Tenants API
export const tenantAPI = {
    getAll: () => apiClient.get('/tenants'),
    getById: (id) => apiClient.get(`/tenants/${id}`),
    getByProperty: (propertyId) => apiClient.get(`/properties/${propertyId}/tenants`),
    create: (data) => {
        console.log('👤 Creating tenant:', data);
        return apiClient.post('/tenants', data);
    },
    update: (id, data) => apiClient.put(`/tenants/${id}`, data),
};

// Transactions API
export const transactionAPI = {
    getAll: () => apiClient.get('/transactions'),
    getByTenant: (tenantId) => apiClient.get(`/tenants/${tenantId}/transactions`),
    create: (data) => apiClient.post('/transactions', data),
    confirm: (id, hash) => apiClient.put(`/transactions/${id}/confirm`, { blockchain_hash: hash }),
};

// Maintenance API
export const maintenanceAPI = {
    getAll: () => apiClient.get('/maintenance'),
    create: (data) => apiClient.post('/maintenance', data),
    updateStatus: (id, status) => apiClient.put(`/maintenance/${id}/status`, { new_status: status }),
};

// Risk Assessment API
export const riskAPI = {
    assessTenant: (tenantId) => {
        console.log('⚠️ Assessing tenant risk for ID:', tenantId);
        return apiClient.post('/risk/assess-tenant', { tenant_id: tenantId });
    },
    assessProperty: (propertyId) => apiClient.post('/risk/assess-property', { property_id: propertyId }),
    assessPortfolio: () => apiClient.get('/risk/portfolio'),
};

// Analytics API
export const analyticsAPI = {
    getDashboard: () => apiClient.get('/analytics/dashboard'),
    getPortfolioStats: () => apiClient.get('/analytics/portfolio'),
    getPropertyAnalytics: (propertyId) => apiClient.get(`/analytics/property/${propertyId}`),
};

// Health Check
export const healthCheck = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Backend is healthy:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Backend health check failed');
        return false;
    }
};

export default apiClient;
