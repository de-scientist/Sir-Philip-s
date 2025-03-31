import axios from 'axios';

const isDevelopment = process.env.NODE_ENV !== 'production';
const BASE_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3000/api' : '/api');

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookies
  timeout: 20000, // 20 seconds timeout for production
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add CSRF token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add CSRF token from cookie if available
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken && config.method !== 'get') {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    if (isDevelopment) {
      console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Store CSRF token from header if present
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      document.cookie = `csrfToken=${csrfToken}; path=/; max-age=86400; samesite=strict${
        !isDevelopment ? '; secure' : ''
      }`;
    }
    
    if (isDevelopment) {
      console.log(`✅ Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    // Connection or timeout errors
    if (!error.response) {
      if (isDevelopment) {
        console.error('❌ Network Error:', error.message);
      }
      return Promise.reject({
        message: 'Network error - please check your connection',
        originalError: error
      });
    }
    
    // Handle authentication errors
    if (error.response.status === 401) {
      window.location.href = '/login';
    }
    
    // Handle forbidden errors
    if (error.response.status === 403) {
      window.location.href = '/unauthorized';
    }
    
    if (isDevelopment) {
      console.error(`❌ Response Error: ${error.response.status}`, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Helper to get CSRF token from cookie
function getCsrfTokenFromCookie() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrfToken='));
  
  return cookie ? cookie.split('=')[1] : null;
}

// Auth methods
export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      // If 401, the interceptor will redirect to login
      return null;
    }
  }
};

export default axiosInstance;
